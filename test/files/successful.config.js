module.exports = {
    outputFile: 'README.successful.out.md',
    inputFile: 'README.successful.md',
    confirmOverwrite: true,
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
