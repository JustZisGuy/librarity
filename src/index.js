#!/usr/bin/env node
/* eslint-disable no-console */

const helpParameter = process.argv[2] && process.argv[2] === '--help';

function printHelp() {
    console.error('Usage: librarity [path]');
}

if (helpParameter) {
    printHelp();
    process.exit(2);
}
const configFile = process.argv[2] ?
    `${process.cwd()}/${process.argv[2]}` :
    './librarity.config.js';
const config = require('./config.js')(configFile);

require('./processor.js')(config);
