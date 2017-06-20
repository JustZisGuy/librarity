/* eslint-disable no-console,global-require */
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
  const extension = path.extname(includedFile);

  try {
    fs.accessSync(includedFile, fs.constants.R_OK);

    if (config.extensions[extension]) {
      language = config.extensions[extension];
    }
    let includedContents = fs.readFileSync(includedFile, 'utf8');

    includedContents = replacePatterns(config, includedContents);
    output = output.replace(
            `{{${includedFile}}}`,
            `\`\`\`${language}\n${includedContents}\n\`\`\``,
        );
  } catch (ex) {
    console.warn(`WARNING! Match {{${includedFile}}} did not have a ` +
            'corresponding file');
  }
  return output;
}

function replaceMatches(config, input) {
  let output = input;
  const regexResult = output
        .match(templateRegex);

  if (regexResult === null) {
    return output;
  }
  const matches = regexResult.map(pathPattern => pathPattern.replace(/\{\{|\}\}/g, ''));

  for (let matchIndex = 0; matchIndex < matches.length; matchIndex += 1) {
    const includedFile = matches[matchIndex];

    output = replaceMatch(output, includedFile, config);
  }
  return output;
}

function confirmOverwrite(config, output) {
  const readline = require('readline');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
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
