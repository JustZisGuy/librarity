/* eslint-disable no-console */
const fs = require('fs');
const templateRegex = /\{\{.*?\}\}/g;

function replacePatterns(config, input) {
    let output = input;

    config.replacePatterns.forEach((pattern) => {
        output = output.replace(pattern[0], pattern[1]);
    });
    return output;
}

function replaceMatches(config, input) {
    let output = input;
    let matches = output
        .match(templateRegex)
        .map((pathPattern) => pathPattern.replace(/\{\{|\}\}/g, ''));

    for (let matchIndex = 0; matchIndex < matches.length; matchIndex++) {
        let includedFile = matches[matchIndex];

        fs.accessSync(includedFile, fs.constants.R_OK);

        output = output.replace(
            `{{${includedFile}}}`,
            `\`\`\`js\n${fs.readFileSync(includedFile, 'utf8')}\n\`\`\``
        );
    }
    return output;
}

function confirmOverwrite(config, output) {
    const readline = require('readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(
        `WARNING! Continuing will overwrite any preexistant
            file at ${config.outputFile}.\nProceed? [Y/n]`,
        (answer) => {
            if (answer === 'Y' || answer === 'y') {
                fs.writeFileSync(config.outputFile, output, 'utf8');
            }
        });
    rl.close();
}

function processor(config) {
    let output;

    output = fs.readFileSync(config.inputFile, 'utf8');
    output = replaceMatches(config, output);
    output = replacePatterns(config, output);

    if (config.confirmOverwrite) {
        confirmOverwrite(config, output);
    } else {
        fs.writeFileSync(config.outputFile, output, 'utf8');
    }
}

module.exports = processor;
