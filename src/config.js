/* eslint-disable no-console */
const fs = require('fs');
const vm = require('vm');
const config = require('./default_config.js');

function getTypeOf(value) {
    let keyType = typeof value;

    if (keyType === 'object' && Array.isArray(value)) {
        keyType = 'array';
    }
    if (keyType === 'object' && value.constructor.name === 'RegExp') {
        keyType = 'regex';
    }
    return keyType;
}

function exitOnMismatch(key, fileConfig) {
    let expectedKeyType = getTypeOf(config[key]);
    let actualKeyType = getTypeOf(fileConfig[key]);

    if (expectedKeyType === 'undefined') {
        return;
    }

    if (expectedKeyType !== actualKeyType) {
        console.error(
            `ERROR! Configuration key "${key}" ` +
            `can only be a "${expectedKeyType}" value, ` +
            `"${actualKeyType}" found`
        );
        process.exit(1);
    }
}

const validators = {
    outputFile: (fileConfig) => {
        try {
            fs.accessSync(fileConfig.outputFile, fs.constants.W_OK);
        } catch (ex) {
            console.error('ERROR! outputFile is not writable');
            process.exit(1);
        }
    },
    inputFile: (fileConfig) => {
        try {
            fs.accessSync(fileConfig.inputFile, fs.constants.R_OK);
        } catch (ex) {
            console.error('ERROR! inputFile is missing or not readable');
            process.exit(1);
        }
    },
    replacePatterns: (fileConfig) => {
        fileConfig.replacePatterns.forEach((replacePattern) => {
            let validPattern = true;

            // pattern must be a array
            validPattern = validPattern && getTypeOf(replacePattern) === 'array';
            // pattern array must have 2 parts
            validPattern = validPattern && replacePattern.length === 2;
            // patterns first part must be a string or a regex
            validPattern = validPattern && (
                typeof replacePattern[0] === 'string' ||
                getTypeOf(replacePattern[0]) === 'regex'
            );

            // patterns second part must be a string
            validPattern = validPattern && typeof replacePattern[1] === 'string';
            if (!validPattern) {
                console.error(
                    'ERROR! replacePatterns contains a invalid pattern ' +
                    `"[${replacePattern[0]}, ${replacePattern[1]}]"`
                );
                process.exit(-1);
            }
        });
    },
    extensions: (fileConfig) => {
        let extensions = Object.keys(fileConfig.extensions);

        extensions.forEach((extension) => {
            let code = fileConfig.extensions[extension];

            if (typeof code !== 'string') {
                console.error(
                    `ERROR! Extensions contains invalid code "${extension}: ${code}"`
                );
                process.exit(1);
            }
        });
    },
    // this has already been validated
    confirmOverwrite: () => {}
};

function readConfigFile(configFile) {
    let fileConfig;

    try {
        let code = fs.readFileSync(configFile, 'utf8');
        let sandbox = vm.createContext({
            module: {
                exports: 0
            }
        });

        vm.runInContext(code, sandbox);
        fileConfig = Object.assign({}, sandbox.module.exports);
    } catch (ex) {
        console.error(`ERROR! Configuration file "${configFile}" could not be parsed`);
        process.exit(1);
    }
    const fileConfigKeys = Object.keys(fileConfig);

    fileConfigKeys.forEach((key) => {
        exitOnMismatch(key, fileConfig);
        let hasValidator = validators.hasOwnProperty(key);

        if (hasValidator) {
            validators[key](fileConfig);
        } else {
            console.error(
                `ERROR! Invalid configuration key "${key}"`
            );
            process.exit(1);
        }
        config[key] = fileConfig[key];
    });
}

module.exports = (configFile) => {
    if (fs.existsSync(configFile, fs.constants.R_OK)) {
        readConfigFile(configFile);
    } else {
        console.error('WARNING! Configuration file not found, using defaults.');
    }
    return config;
};
