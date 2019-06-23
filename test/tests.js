/* eslint-disable no-console, global-require */

const assert = require('assert');
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
    close: () => { },
  };
}

describe('Librarity tests', () => {
  beforeEach(() => {
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

  afterEach(() => {
    console.error.restore();
    readline.createInterface.restore();
    clearRequire('../src/index.js');
    clearRequire('../src/config.js');
    clearRequire('../src/processor.js');
    process.argv = argv;
    fs.writeFileSync.restore();
    if (process.exit.restore) {
      process.exit.restore();
    }
  });

  it('Default config without a existing README.librarity.md fails', (done) => {
    process.argv = [
      'node',
      './dist/index.js',
    ];
    sinon.stub(process, 'exit').callsFake((code) => {
      throw new StubException(code);
    });
    try {
      require('../src/index.js');
      assert.error();
    } catch (ex) {
      assert.ok(ex.message);
    }
    done();
  });

  it('The config with a non-existant inputFile fails', (done) => {
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
      assert.error();
    } catch (ex) {
      assert.equal(consoleError, 'ERROR! inputFile is missing or not readable\n');
    }
    done();
  });

  it('The config with a non-writable outputFile fails', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(consoleError, 'ERROR! outputFile is not writable\n');
    }
    done();
  });

  it('The config with a invalid replacePattern fails', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(consoleError, 'ERROR! replacePatterns contains a invalid pattern ' +
        '"[0, invalid replace pattern]"\n');
    }
    done();
  });

  it('The config with a invalid extension fails', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(consoleError, 'ERROR! Extensions contains invalid code ".invalid: -12"\n');
    }
    done();
  });

  it('The config with a invalid setting fails', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(consoleError, 'ERROR! Invalid configuration key "invalid"\n');
    }
    done();
  });

  it('The config with a bad config key fails', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(
        consoleError,
        'ERROR! Configuration key "replacePatterns" can only be a ' +
        '"array" value, "string" found\n',
      );
    }
    done();
  });

  it('The config with a proper config file but with a write error', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.ok(ex);
    }
    done();
  });

  it('The config with a proper config file and write permission', (done) => {
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
      assert.equal(fs.readFileSync('test/files/README.successful.out.md', 'utf8'), writeFileContents);
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it(
    `
          The config with a proper config file and write permission but
          without matching replacePatterns
      `, (done) => {
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
      assert.equal(
          fs.readFileSync('test/files/README.non_matching_replace.out.md', 'utf8'),
          writeFileContents,
        );
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it('running with --help prints help message', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.equal(consoleError, 'Usage: librarity [path to config]\n');
    }
    done();
  });

  it('Confirm overwrite writes file if Y is chosen', (done) => {
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
      if (writeFileContents !== '') {
        assert.ok('passed');
      } else {
        assert.fail();
      }
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it('Confirm overwrite does not write file if n is chosen', (done) => {
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
      assert.equal('', writeFileContents);
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it(
    'File with unsupported extension is included correctly and unfound block ' +
    'simply passed along', (done) => {
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
      assert.equal(fs.readFileSync('test/files/README.block.out.md', 'utf8'), writeFileContents);
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it('File without {{...}} blocks are returned as is', (done) => {
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
      assert.equal(fs.readFileSync('test/files/README.successful.out.md', 'utf8'), writeFileContents);
    } catch (ex) {
      assert.fail(ex);
    }
    done();
  });

  it('A broken config throws an error', (done) => {
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
      assert.fail();
    } catch (ex) {
      assert.ok(ex);
    }
    done();
  });
});
