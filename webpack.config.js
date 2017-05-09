var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        libraryTarget: 'umd',
        filename: 'dist/index.js'
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                loader: 'node-loader',
                exclude: /node_modules/
            }
        ]
    },
};
