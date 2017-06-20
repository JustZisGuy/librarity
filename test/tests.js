/* eslint-disable no-console, global-require */

const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const clearRequire = require('clear-require');
const util = require('util');
const readline = require('readline');

const argv = process.argv;

// the following variables provides control of the cli program flow
let writeFileContents;
let writeFileFail;
let consoleError;
let readlineAnswer;

function StubException(message) {
  this.message = message;
  this.name = 'StubException';
}

function resetFlowVariables() {
  writeFileContents = '';
  writeFileFail = false;
  consoleError = '';
  readlineAnswer = 'n';
}

function createInterface() {
  return {
    question: (message, callback) => {
      callback(readlineAnswer);
    },
    close: () => {},
  };
}

test.beforeEach(() => {
  resetFlowVariables();
  sinon.stub(readline, 'createInterface').callsFake(createInterface);
  sinon.stub(console, 'error').callsFake((...args) => {
    consoleError += `${util.format.apply(null, args)}\n`;
  });
  sinon.stub(fs, 'writeFileSync').callsFake((outFile, output) => {
    if (writeFileFail) {
      throw new StubException('writeFileSync Failed');
    }
    if (outFile) {
      writeFileContents = output;
    }
  });
});

test.afterEach(() => {
  console.error.restore();
  readline.createInterface.restore();
  clearRequire('../src/index.js');
  clearRequire('../src/config.js');
  clearRequire('../src/processor.js');
  process.argv = argv;
  fs.writeFileSync.restore();
});

test('Default config without a existing README.librarity.md fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.pass(ex.message);
  }
});

test('The config with a non-existant inputFile fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/no_input_file.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'ERROR! inputFile is missing or not readable\n');
  }
});

test('The config with a non-writable outputFile fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/non_writable_outputfile.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'ERROR! outputFile is not writable\n');
  }
});

test('The config with a invalid replacePattern fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/invalid_replace_pattern.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'ERROR! replacePatterns contains a invalid pattern ' +
            '"[0, invalid replace pattern]"\n');
  }
});

test('The config with a invalid extension fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/invalid_extension.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'ERROR! Extensions contains invalid code ".invalid: -12"\n');
  }
});

test('The config with a invalid setting fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/invalid_setting.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'ERROR! Invalid configuration key "invalid"\n');
  }
});

test('The config with a bad config key fails', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/bad_config_key.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(
            consoleError,
            'ERROR! Configuration key "replacePatterns" can only be a ' +
                '"array" value, "string" found\n',
        );
  }
});

test('The config with a proper config file but with a write error', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/successful.config.js',
  ];
  writeFileFail = true;
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.pass(ex);
  }
});

test('The config with a proper config file and write permission', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/successful.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.is(fs.readFileSync('test/files/README.successful.out.md', 'utf8'), writeFileContents);
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test(
    `
        The config with a proper config file and write permission but
        without matching replacePatterns
    `, (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/non_matching_replace.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.is(
            fs.readFileSync('test/files/README.non_matching_replace.out.md', 'utf8'),
            writeFileContents,
        );
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test('running with --help prints help message', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    '--help',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.is(consoleError, 'Usage: librarity [path to config]\n');
  }
});

test('Confirm overwrite writes file if Y is chosen', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/confirm_overwrite.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  readlineAnswer = 'Y';
  try {
    require('../src/index.js');
    process.exit.restore();
    if (writeFileContents !== '') {
      t.pass();
    } else {
      t.fail();
    }
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test('Confirm overwrite does not write file if n is chosen', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/confirm_overwrite.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.is('', writeFileContents);
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test(
    'File with unsupported extension is included correctly and unfound block ' +
        'simply passed along', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/block.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.is(fs.readFileSync('test/files/README.block.out.md', 'utf8'), writeFileContents);
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test('File without {{...}} blocks are returned as is', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/unchanging.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.is(fs.readFileSync('test/files/README.successful.out.md', 'utf8'), writeFileContents);
  } catch (ex) {
    process.exit.restore();
    t.fail(ex);
  }
});

test('A broken config throws an error', (t) => {
  process.argv = [
    'node',
    './dist/index.js',
    'test/files/broken.config.js',
  ];
  sinon.stub(process, 'exit').callsFake((code) => {
    throw new StubException(code);
  });
  try {
    require('../src/index.js');
    process.exit.restore();
    t.fail();
  } catch (ex) {
    process.exit.restore();
    t.pass(ex);
  }
});
