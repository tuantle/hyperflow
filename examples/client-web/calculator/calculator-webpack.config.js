'use strict'; //eslint-disable-line
/* eslint quotes: 0 */
/* eslint no-var: 0 */

var path = require('path');

module.exports = {

    /* gives you sourcemaps without slowing down rebundling */
    devtool: 'eval-source-map',
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, "./dist"),
        compress: true,
        watchContentBase: true,
        progress: true
    },
    entry: {
        index: path.join(__dirname, './index.js')
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    },
    module: {
        rules: [{
            test: /\.m?js$/,
            include: [
                path.resolve(__dirname, './src'),
                path.resolve(__dirname, './node_modules/hyperflow')
            ],
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    // modules: true,
                    presets: [
                        '@babel/react',
                        [
                            '@babel/preset-env',
                            {
                                targets: {
                                    node: 'current'
                                }
                            }
                        ]
                    ],
                    plugins: [
                        '@babel/plugin-syntax-dynamic-import',
                        '@babel/plugin-transform-strict-mode',
                        '@babel/plugin-proposal-object-rest-spread',
                        '@babel/plugin-proposal-class-properties'
                    ]
                }
            }
        }, {
            test: /\.css$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: true
                    }
                }
            ]
        }, {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        }]
    }
};
