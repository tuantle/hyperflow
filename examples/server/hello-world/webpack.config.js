/* eslint quotes: 0 */
/* eslint no-var: 0 */
/* eslint no-process-env: 0 */

const path = require('path');

const NodemonPlugin = require('nodemon-webpack-plugin');

const NodeExternal = require('webpack-node-externals');

require('./env');

const rules = [{
    test: /\.(js|jsx)$/,
    include: [
        path.resolve(__dirname, './src'),
        path.resolve(__dirname, './node_modules/hyperflow')
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
                        modules: false,
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
}];

const serverConfig = {
    /* gives you sourcemaps without slowing down rebundling */
    devtool: 'eval-source-map',
    mode: process.env.NODE_ENV,
    target: 'node',
    watch: process.env.NODE_ENV === 'development',
    watchOptions: {
        poll: process.env.NODE_ENV === 'development',
        ignored: [
            'node_modules/'
        ]
    },
    module: {
        rules
    },
    plugins: [
        new NodemonPlugin({
            verbose: true,
            args: [
                '--exec',
                'babel-node'
            ]
        })
    ],
    node: {
        __dirname: false
    },
    devServer: {
        contentBase: path.resolve(__dirname, "./dist"),
        compress: true,
        watchContentBase: true,
        progress: true
    },
    externals: [ NodeExternal() ],
    entry: {
        server: path.resolve(__dirname, 'index.server.js')
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    }
};

const clientConfig = {
    /* gives you sourcemaps without slowing down rebundling */
    devtool: 'eval-source-map',
    mode: process.env.NODE_ENV,
    watch: process.env.NODE_ENV === 'development',
    watchOptions: {
        poll: process.env.NODE_ENV === 'development',
        ignored: [
            'node_modules/'
        ]
    },
    target: 'web',
    module: {
        rules
    },
    entry: {
        client: path.resolve(__dirname, 'index.client.js')
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js'
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    }
};

module.exports = [ serverConfig, clientConfig ];
