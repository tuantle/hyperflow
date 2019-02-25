/**
 *
 * Tests Suites.
 *
 * @description - Test suites runner for unit testings.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

require('./env');
/* load babel */
/* eslint quotes: 0 */
require('@babel/register')({
    comments: false,
    sourceMaps: 'inline',
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
        '@babel/plugin-transform-strict-mode',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties'
    ]
});

/* load test specs for Hf modules */
var commonElementSpecs = require('./suites/elements/common-element-specs'); // eslint-disable-line
var dataElementSpecs = require('./suites/elements/data-element-specs'); // eslint-disable-line
var composerSpecs = require('./suites/composer-specs'); // eslint-disable-line
var eventStreamCompositeSpecs = require('./suites/factories/composites/event-stream-composite-specs'); // eslint-disable-line
var storeFactorySpecs = require('./suites/factories/store-factory-specs'); // eslint-disable-line
var appFactorySpecs = require('./suites/factories/app-factory-specs'); // eslint-disable-line

// commonElementSpecs.runTests();
// dataElementSpecs.runTests();
// composerSpecs.runTests();
// eventStreamCompositeSpecs.runTests();
// storeFactorySpecs.runTests();
appFactorySpecs.runTests();
