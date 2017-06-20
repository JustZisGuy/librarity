module.exports = {
  outputFile: 'test/files/README.successful.out.md',
  inputFile: 'test/files/README.successful.md',
  confirmOverwrite: true,
  extensions: {
    '.valid': 'valid_extension',
    '.invalid': -12,
  },
};
