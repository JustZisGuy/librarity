module.exports = {
    outputFile: 'test/files/README.successful.out.md',
    inputFile: 'test/files/README.successful.md',
    confirmOverwrite: false,
    replacePatterns: [
        [
            /\/\* eslint-disable no-console \*\/\n/g,
            ''
        ],
        [
            /'\.\.\/src'/g,
            '\'wildling\''
        ]
    ]
};
