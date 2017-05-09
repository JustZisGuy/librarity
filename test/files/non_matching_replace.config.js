module.exports = {
    outputFile: 'test/files/README.successful.out.md',
    inputFile: 'test/files/README.successful.md',
    confirmOverwrite: false,
    replacePatterns: [
        [
            /'662febf0-cc84-400a-ae58-2a248affe16e'/g,
            '\'non existant\''
        ]
    ]
};
