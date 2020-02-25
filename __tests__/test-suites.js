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

/* eslint quotes: 0 */

require('./env');

require('@babel/register');

const commonUtilSpec = require('./util-specs/common-util-spec');
//
// const composerAndCompositeSpec = require('./composer-and-composite-spec');
//
// const immutableDataSpecs = require('./data-specs/immutable-data-spec');
//
// const eventStreamCompositeSpec = require('./composite-specs/event-stream-composite-spec');
//
// const storeFactorySpec = require('./factory-specs/store-factory-spec');
//
// const tAgentFactoriesSpec = require('./factory-specs/test-agent-factories-spec');

// const appFactorySpec = require('./app-specs/react-web-app-specs');

// #########################

commonUtilSpec.runTests();

// composerAndCompositeSpec.runTests();

// immutableDataSpecs.runTests();

// eventStreamCompositeSpec.runTests();

// storeFactorySpec.runTests();

// tAgentFactoriesSpec.runTests();

// appFactorySpec.runTests();
