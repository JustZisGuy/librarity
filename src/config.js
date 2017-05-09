/* eslint-disable no-console */
const fs = require('fs');

const config = {
    outputFile: 'README.md',
    inputFile: 'README.librarity.md',
    replacePatterns: [],
    confirmOverwrite: true,
    extensions: {
        '.md': 'markdown',
        '.rb': 'ruby',
        '.php': 'php',
        '.phtml': 'php',
        '.php3': 'php',
        '.php4': 'php',
        '.php5': 'php',
        '.php7': 'php',
        '.phps': 'php',
        '.pl': 'perl',
        '.pm': 'perl',
        '.t': 'perl',
        '.pod': 'perl',
        '.py': 'python',
        '.pyw': 'python',
        '.xml': 'xml',
        '.html': 'xml',
        '.htmls': 'xml',
        '.htm': 'xml',
        '.css': 'css',
        '.less': 'css',
        '.json': 'json',
        '.js': 'javascript',
        '.coffee': 'coffeescript',
        '.litcoffee': 'coffeescript',
        '.sql': 'sql',
        '.java': 'java',
        '.pas': 'delphi',
        '.pp': 'delphi',
        '.p': 'delphi',
        '.scpt': 'applescript',
        '.scptd': 'applescript',
        '.applescript': 'applescript',
        '.c': 'cpp',
        '.h': 'cpp',
        '.cpp': 'cpp',
        '.objc': 'objectivec',
        '.ini': 'ini',
        '.cs': 'cs',
        '.vala': 'vala',
        '.d': 'd',
        '.diff': 'diff',
        '.bat': 'dos',
        '.sh': 'bash',
        '.bash': 'bash',
        '.asm': 'avrasm',
        '.vhdl': 'vhdl',
        '.tex': 'tex',
        '.latex': 'tex',
        '.hk': 'haskell'
    }
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
                replacePattern[0] instanceof RegExp
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
        fileConfig = require(configFile);
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
