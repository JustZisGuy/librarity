/* eslint-disable no-console */
const fs = require('fs');

const config = {
    outputFile: 'README.md',
    inputFile: 'README.librarity.md',
    replacePatterns: [],
    confirmOverwrite: true
};

function getTypeOf(value) {
    let keyType = typeof value;

    if (keyType === 'object' && Array.isArray(value)) {
        keyType = 'array';
    }
    return keyType;
}

function exitOnMismatch(key, fileConfig) {
    let expectedKeyType = getTypeOf(config[key]);
    let actualKeyType = getTypeOf(fileConfig[key]);

    if (expectedKeyType !== actualKeyType) {
        console.error(
            `ERROR! Configuration key "${key}"
            can only be a "${expectedKeyType}" value,
            "${actualKeyType}" found`
        );
        process.exit(-1);
    }
}

const validators = {
    outputFile: (fileConfig) => {
        try {
            fs.accessSync(fileConfig.outputFile, fs.constants.W_OK);
        } catch (ex) {
            console.error('ERROR! outputFile is not writable');
            process.exit(-1);
        }
    },
    inputFile: (fileConfig) => {
        try {
            fs.accessSync(fileConfig.inputFile, fs.constants.R_OK);
        } catch (ex) {
            console.error('ERROR! inputFile is missing or not readable');
            process.exit(-1);
        }
    },
    replacePatterns: (fileConfig) => {
        fileConfig.replacePatterns.forEach((replacePattern) => {
            let validPattern = true;

            // pattern must be a array
            validPattern = validPattern && getTypeOf(replacePattern) !== 'array';
            // pattern array must have 2 parts
            validPattern = validPattern && replacePattern.length !== 2;
            // patterns first part must be either a regexp or a string
            validPattern = validPattern &&
                (
                    replacePattern[0] instanceof RegExp ||
                    typeof replacePattern[0] !== 'string'
                );
            // patterns second part must be a string
            validPattern = validPattern && typeof replacePattern[1] !== 'string';
            if (!validPattern) {
                console.error(
                    `ERROR! replacePatterns contains a invalid pattern
                    "${JSON.toString([replacePattern[0], replacePattern[1]])}"`
                );
                process.exit(-1);
            }
        });
    },
    // this has already been validated
    confirmOverwrite: () => {}
};

function readConfigFile(configFile) {
    let fileConfig;

    try {
        fileConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (ex) {
        console.error(`ERROR! Configuration file "${configFile}" could not be parsed`);
        process.exit(-1);
    }
    const fileConfigKeys = Object.keys(fileConfig);

    fileConfigKeys.forEach((key) => {
        exitOnMismatch(key, fileConfig);
        let hasValidator = validators.hasOwnProperty(key);

        if (hasValidator) {
            validators[key](configFile);
        } else {
            console.error(
                `ERROR! Invalid configuration key "${key}",
                valid keys are ${fileConfigKeys.join(', ')}`
            );
            process.exit(-1);
        }
        config[key] = fileConfig[key];
    });
}

module.exports = (configFile) => {
    try {
        fs.accessSync(configFile, fs.constants.R_OK);
        readConfigFile(configFile);
    } catch (ex) {
        console.warn('Warning! Configuration file not found, using defaults.');
    }
    return config;
};
