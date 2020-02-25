/* eslint quotes: 0 */
/* eslint no-var: 0 */

var path = require('path');

require('./env');

module.exports = {

    /* gives you sourcemaps without slowing down rebundling */
    devtool: 'eval-source-map',
    mode: 'development',
    watch: true,
    watchOptions: {
        poll: true,
        ignored: [
            'node_modules/'
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, './dist'),
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
            test: /\.(js|jsx)$/,
            include: [
                path.resolve(__dirname, './src/'),
                path.resolve(__dirname, './node_modules/hyperflow/')
            ],
            // exclude: [
            //     path.resolve(__dirname, './node_modules/')
            // ],
            use: {
                loader: 'babel-loader',
                options: {
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
                        '@babel/plugin-proposal-class-properties',
                        '@babel/plugin-proposal-optional-chaining',
                        '@babel/plugin-proposal-nullish-coalescing-operator'
                    ]
                }
            }
        }, {
            test: /\.(css|scss)$/,
            use: [
                {
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: false
                    }
                }, {
                    loader: 'postcss-loader'
                }, {
                    loader: 'sass-loader'
                }
            ]
        }, {
            test: /\.less$/,
            use: [
                {
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader',
                    options: {
                        modules: false
                    }
                }, {
                    loader: 'less-loader',
                    options: {
                        javascriptEnabled: true
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
