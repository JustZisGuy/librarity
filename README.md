# librarity
Tool to create README.md from template and include external files as code blocks

[![Build Status](https://travis-ci.org/JustZisGuy/librarity.svg?branch=master)](https://travis-ci.org/JustZisGuy/librarity)
[![Coverage Status](https://coveralls.io/repos/github/JustZisGuy/librarity/badge.svg)](https://coveralls.io/github/JustZisGuy/librarity)
[![NPM](https://nodei.co/npm/librarity.png)](https://npmjs.org/package/librarity)

## Introduction
This tool helps you import external files into a markdown(.md) file

## Usage
The default configuration looks for a README.librarity.md and writes a README.md
if it is found. Before it writes the resulting file it asks you for permission.
```
node_modules/.bin/librarity
```
or if librarity was installed globally
```
librarity
```

### librarity markdown extension
It looks for patterns like these {{file to be included}} and tries to replace
them with code blocks containing the file contents.
The file extension is used to detect the language to let github do some code
highlighting.

## Installation
via npm
```
npm install librarity
```
or globally
```
npm install -g librarity
```

## Why?
There was a need for test coverage for the usage examples in README.md in the
Wildling library but there were no good tools for the job so this cli was
written.

## Tests
librarity is using Ava for testing and nyc for test coverage.
To test run:
```
npm test
```
## Configuration
If librarity is provided with the path to a configuration file by argument
```
librarity myconfig.js
```
or if librarity.config.js exists in the current directory it tries to use the
provided configuration file in addition to the defaults. If one or more of the
configuration keys(inputFile, outputFile, confirmOverwrite, replacePatterns and
extensions) does not exist then the default value for it is used.

#### Example of configuration file
```javascript
module.exports = {
  outputFile: 'README.md',
  inputFile: 'README.template.md',
  replacePatterns: [],
  confirmOverwrite: false,
  extensions: {
    '.js': 'javascript',
  },
};

```

### Input file
The path to the librarity markdown template is given by the key "inputFile" with
the default value "README.librarity.md"

### Output file
The path to the resulting markdown file is given by the key "outputFile" with
the default value "README.md"

### Confirm overwrite
The default setting for the key "confirmOverwrite" is "true" so that the user of
librarity doesn't overwrite the existing README.md by mistake.

### Replace patterns
The key "replacePatterns" provides a list of patterns to replace texts in
included files. each pattern is using the syntax:
```
[<regex or string>, 'string to put where the regex or string matches']
```

### Extensions
The key "extensions" provides a dictionary of extensions and what language the
code block should use if the extension matches. The user can provide their own
list if the desire.

## Complete default configuration file
```javascript
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
    '.hk': 'haskell',
  },
};

```

## License
MIT, see LICENSE file
