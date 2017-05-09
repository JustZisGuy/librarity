/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const templateRegex = /\{\{.*?\}\}/g;

function replacePatterns(config, input) {
    let output = input;

    config.replacePatterns.forEach((pattern) => {
        output = output.replace(pattern[0], pattern[1]);
    });
    return output;
}

function replaceMatch(input, includedFile, config) {
    let language = '';
    let output = input;
    let extension = path.extname(includedFile);

    fs.accessSync(includedFile, fs.constants.R_OK);

    if (config.extensions.hasOwnProperty(extension)) {
        language = config.extensions[extension];
    }
    let includedContents = fs.readFileSync(includedFile, 'utf8');

    includedContents = replacePatterns(config, includedContents);
    output = output.replace(
        `{{${includedFile}}}`,
        `\`\`\`${language}\n${includedContents}\n\`\`\``
    );
    return output;
}

function replaceMatches(config, input) {
    let output = input;
    let regexResult = output
        .match(templateRegex);

    if (regexResult === null) {
        return output;
    }
    let matches = regexResult.map((pathPattern) => pathPattern.replace(/\{\{|\}\}/g, ''));

    for (let matchIndex = 0; matchIndex < matches.length; matchIndex++) {
        let includedFile = matches[matchIndex];

        output = replaceMatch(output, includedFile, config);
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

    try {
        output = fs.readFileSync(config.inputFile, 'utf8');
    } catch (ex) {
        console.error(`ERROR! Configuration file "${config.inputFile}" could not be read`);
        process.exit(1);
    }
    output = replaceMatches(config, output);

    if (config.confirmOverwrite) {
        confirmOverwrite(config, output);
    } else {
        fs.writeFileSync(config.outputFile, output, 'utf8');
    }
}

module.exports = processor;
