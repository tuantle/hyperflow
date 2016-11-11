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

/* load babel */
/* eslint quotes: 0 */
require('babel-core/register')({
    only: [
        './src',
        './tests'
    ],
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
});

/* load and initialize hyperflow */
const Hf = require('../src/hyperflow');

Hf.init({
    TARGET: `client-web`,
    enableInfoLog: true,
    enableWarn0Log: false,
    enableWarn1Log: true
});

/* load test specs for Hf modules */
// var commonElementSpecs = require('./suites/elements/common-element-specs'); // eslint-disable-line
// var dataElementSpecs = require('./suites/elements/data-element-specs'); // eslint-disable-line
// var composerSpecs = require('./suites/composer-specs'); // eslint-disable-line
// var eventStreamCompositeSpecs = require('./suites/factories/composites/event-stream-composite-specs'); // eslint-disable-line
var storeFactorySpecs = require('./suites/factories/store-factory-specs'); // eslint-disable-line

// commonElementSpecs.runTests();
// dataElementSpecs.runTests();
// composerSpecs.runTests();
// eventStreamCompositeSpecs.runTests();
storeFactorySpecs.runTests();
