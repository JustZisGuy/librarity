/* eslint-disable no-console, global-require */

const test = require('ava');
const sinon = require('sinon');
const fs = require('fs');
const clearRequire = require('clear-require');
const util = require('util');
const argv = process.argv;

// the following variables provides control of the cli program flow
// let writeFileContents;
let writeFileFail;
let consoleError;

function StubException(message) {
    this.message = message;
    this.name = 'StubException';
}

function resetFlowVariables() {
    // writeFileContents = '';
    writeFileFail = false;
    consoleError = '';
    console.warn(consoleError);
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
            console.warn(output);
            // writeFileContents = output;
        }
    });
});

test.afterEach(() => {
    console.error.restore();
    clearRequire('../src/index.js');
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

/* test('Error is shown when inputFile does not exist', (t) => {
    process.argv = [
        'node',
        './dist/index.js',
        'test/readme_files/NO.README.template.md',
        'outFile'
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

test('Error is shown when writeFileSync fails', (t) => {
    process.argv = [
        'node',
        './dist/index.js',
        'test/readme_files/README.template.md',
        'outFile'
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

test('pattern matching works', (t) => {
    const targetContents = fs.readFileSync('test/readme_files/README.md', 'utf8');

    process.argv = [
        'node',
        './dist/index.js',
        'test/readme_files/README.template.md',
        'outFile'
    ];
    sinon.stub(process, 'exit').callsFake((code) => {
        throw new StubException(code);
    });
    try {
        require('../src/index.js');
        process.exit.restore();
        t.is(targetContents, writeFileContents);
    } catch (ex) {
        process.exit.restore();
        t.fail(ex);
    }
});*/
