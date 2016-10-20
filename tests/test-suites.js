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
const Hflow = require('../src/hyperflow');

Hflow.init({
    TARGET: `client-web`,
    DEVELOPMENT: true,
    ENABLE_INFO_MESSAGE: true,
    ENABLE_WARN_0_MESSAGE: true,
    ENABLE_WARN_1_MESSAGE: true
});

/* load test specs for Hflow modules */
// var commonElementSpecs = require('./suites/elements/common-element-specs'); // eslint-disable-line
var dataElementSpecs = require('./suites/elements/data-element-specs'); // eslint-disable-line
// var composerSpecs = require('./suites/composer-specs'); // eslint-disable-line
// var eventStreamCompositeSpecs = require('./suites/factories/composites/event-stream-composite-specs'); // eslint-disable-line

// commonElementSpecs.runTests();
dataElementSpecs.runTests();
// composerSpecs.runTests();
// eventStreamCompositeSpecs.runTests();
