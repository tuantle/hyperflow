/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app webpack build config.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; //eslint-disable-line
/* eslint quotes: 0 */
/* eslint no-var: 0 */

var path = require('path');

module.exports = {

    /* gives you sourcemaps without slowing down rebundling */
    devtool: 'eval-source-map',
    entry: path.join(__dirname, './counter/main.js'),
    output: {
        path: path.resolve(__dirname, 'counter/build'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: [ '', '.js', '.jsx' ]
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: [
                        'es2015',
                        'stage-0',
                        'stage-1',
                        'stage-2',
                        'stage-3',
                        'react'
                    ],
                    plugins: [
                        'transform-strict-mode'
                    ]
                }
            }
        ]
    }
};
