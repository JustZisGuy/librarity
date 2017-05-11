const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        libraryTarget: 'commonjs',
        filename: 'dist/index.js'
    },
    target: 'node',
    plugins: [
        new webpack.BannerPlugin({banner: '#!/usr/bin/env node', raw: true})
    ]
};
