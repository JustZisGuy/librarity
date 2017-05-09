/* eslint-disable no-console, global-require */

const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const clearRequire = require('clear-require');
const util = require('util');
const argv = process.argv;

// the following variables provides control of the cli program flow
let writeFileContents;
let writeFileFail;
let consoleError;

function StubException(message) {
    this.message = message;
    this.name = 'StubException';
}

function resetFlowVariables() {
    writeFileContents = '';
    writeFileFail = false;
    consoleError = '';
}

test.beforeEach(() => {
    resetFlowVariables();
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
    clearRequire('../src/index.js');
    clearRequire('../src/config.js');
    clearRequire('../src/processor.js');
    process.argv = argv;
    fs.writeFileSync.restore();
});

test('Default config without a existing README.librarity.md fails', (t) => {
    process.argv = [
        'node',
        './dist/index.js'
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
        'test/files/failing.config.js'
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
        if (ex.message.indexOf('ENOENT: no such file or directory, open') === 0) {
            t.pass();
        } else {
            t.fail(ex);
        }
    }
});

test('The config with a proper config file but with a write error', (t) => {
    process.argv = [
        'node',
        './dist/index.js',
        'test/files/successful.config.js'
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
        'test/files/successful.config.js'
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
