#!/usr/bin/env node
(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable no-console */
const fs = __webpack_require__(0);
const vm = __webpack_require__(7);
const config = __webpack_require__(3);

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable no-console */
const fs = __webpack_require__(0);
const path = __webpack_require__(5);
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

    try {
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
    } catch (ex) {
        console.warn(`WARNING! Match {{${includedFile}}} did not have a ` +
            'corresponding file');
    }
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
    const readline = __webpack_require__(6);

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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = {
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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable no-console */

const helpParameter = process.argv[2] && process.argv[2] === '--help';

function printHelp() {
    console.error('Usage: librarity [path to config]');
}

if (helpParameter) {
    printHelp();
    process.exit(2);
}
const configFile = process.argv[2] ?
    `${process.cwd()}/${process.argv[2]}` :
    './librarity.config.js';
const config = __webpack_require__(1)(configFile);

__webpack_require__(2)(config);


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("readline");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("vm");

/***/ })
/******/ ])));