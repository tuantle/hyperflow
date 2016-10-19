/**
 * Copyright 2015-present Tuan Le.
 *
 * Licensed under the MIT License.
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/mit-license.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *------------------------------------------------------------------------
 *
 * @module Hyperflow (Hf) (A toolkit & library for developing universal app)
 * @description - Hf namespace setup. Initialize Hf, adding core modules, and apply settings.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from './core/elements/common-element';

/* load DataElement */
import DataElement from './core/elements/data-element';

/* load CompositeElement */
import CompositeElement from './core/elements/composite-element';

/* load Composer */
import Composer from './core/composer';

/* load StoreFactory */
import StoreFactory from './core/factories/store-factory';

/* load DomainFactory */
import DomainFactory from './core/factories/domain-factory';

/* load InterfaceFactory */
import InterfaceFactory from './core/factories/interface-factory';

/* load ServiceFactory */
import ServiceFactory from './core/factories/service-factory';

/* load AppFactory */
import AppFactory from './core/factories/app-factory';

/* load test AgentFactory */
import AgentFactory from './core/factories/agent-factory';

/* load test FixtureFactory and composites */
// import FixtureFactory from './core/factories/fixture-factory';
// import DomainTestFixtureComposite from './core/factories/composites/test-fixtures/domain-test-fixture-composite';
// import ServiceTestFixtureComposite from './core/factories/composites/test-fixtures/service-test-fixture-composite';
// import StoreTestFixtureComposite from './core/factories/composites/test-fixtures/store-test-fixture-composite';
// import InterfaceTestFixtureComposite from './core/factories/composites/test-fixtures/interface-test-fixture-composite';

/* load test runner composites library */
// import TapeTestRunnerComposite from './core/factories/composites/tape-test-runner-composite';

/* load state composites library */
import StateReducerComposite from './core/factories/composites/state-reducer-composite';
import StateTimeTraversalComposite from './core/factories/composites/state-time-traversal-composite';

/* load React composites library */
import ReactComponentComposite from './composites/interfaces/react-component-composite';
import ReactClientNativeAppComponentComposite from './composites/apps/client-native/react-app-component-composite';
import ReactClientWebAppComponentComposite from './composites/apps/client-web/react-app-component-composite';
import ReactServerAppComponentComposite from './composites/apps/server/react-app-component-composite';
import ReactClientWebAppRendererComposite from './composites/apps/client-web/react-app-renderer-composite';
import ReactClientNativeAppRendererComposite from './composites/apps/client-native/react-app-renderer-composite';
import ReactServerAppRendererComposite from './composites/apps/server/react-app-renderer-composite';

/* load service library */
import WebStorageComposite from './composites/services/client-web/web-storage-composite';
import ASyncStorageComposite from './composites/services/client-native/async-storage-composite';
import PGComposite from './composites/services/server/pg-composite';

/* hyperflow global object */
let Hf = null;

/**
 * @description - Setup and initialize modules & dependencies for Hf`s namespaces.
 *
 * @function init
 * @param {object} setting - Hf's global settings.
 * @returns {object}
 */
const init = function init ({
    TARGET = `client-web`,
    DEVELOPMENT = true,
    ENABLE_INFO_MESSAGE = true,
    ENABLE_WARN_LVL0_MESSAGE = false,
    ENABLE_WARN_LVL1_MESSAGE = true
} = {}) {
    if (Hf === null) {
        const common = CommonElement({
            devleopment: DEVELOPMENT,
            enableInfoMessage: ENABLE_INFO_MESSAGE,
            enableWarn0Message: ENABLE_WARN_LVL0_MESSAGE,
            enableWarn1Message: ENABLE_WARN_LVL1_MESSAGE
        });
        const HfProperty = {
            VERSION: `0.1.0-beta12`,
            ENV: TARGET === `server` ? process.env : {}, // eslint-disable-line
            TARGET,
            DEVELOPMENT,
            /* set composer factory namespace */
            Composer,
            /* set data and composite element namespaces */
            Data: DataElement,
            Composite: CompositeElement,
            /* set factory event stream Ids creator */
            Event: {
                /**
                 * @description - Function to contruct an event Id structure for factory event stream.
                 *
                 * @function eventIdCreate
                 * @param {object} eventIdObj - Event Id contructor object
                 * @returns {object}
                 */
                create: function create (sourceEventMap) {
                    if (!common.isSchema({
                        asEvents: `array|undefined`,
                        onEvents: `array|undefined`,
                        doEvents: `array|undefined`,
                        requestEvents: `array|undefined`,
                        broadcastEvents: `array|undefined`
                    }).of(sourceEventMap)) {
                        common.log(`error`, `Event.create - Input event map is invalid.`);
                    } else {
                        /* helper function to convert dash to uppercase underscore */
                        const dashToUpperCaseUnderscore = function dashToUpperCaseUnderscore (str) {
                            return str.replace(/-([a-z])/g, (match, word) => {
                                return `_${word}`;
                            }).toUpperCase();
                        };

                        const outputEventMap = Object.keys(sourceEventMap).reduce((_outputEventMap, key) => {
                            if (key === `asEvents`) {
                                if (sourceEventMap[key].every((_key) => common.isString(_key))) {
                                    _outputEventMap[`AS`] = sourceEventMap[key].reduce((asEventMap, _key) => {
                                        asEventMap[
                                            dashToUpperCaseUnderscore(_key)
                                        ] = `as-${_key}`;
                                        return asEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'as' event keys are invalid.`);
                                }
                            }
                            if (key === `onEvents`) {
                                if (sourceEventMap[key].every((_key) => common.isString(_key))) {
                                    _outputEventMap[`ON`] = sourceEventMap[key].reduce((onEventMap, _key) => {
                                        onEventMap[
                                            dashToUpperCaseUnderscore(_key)
                                        ] = `on-${_key}`;
                                        return onEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'on' event keys are invalid.`);
                                }
                            }
                            if (key === `doEvents`) {
                                if (sourceEventMap[key].every((_key) => common.isString(_key))) {
                                    _outputEventMap[`DO`] = sourceEventMap[key].reduce((doEventMap, _key) => {
                                        doEventMap[
                                            dashToUpperCaseUnderscore(_key)
                                        ] = `do-${_key}`;
                                        return doEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'do' event keys are invalid.`);
                                }
                            }
                            if (key === `broadcastEvents`) {
                                if (sourceEventMap[key].every((_key) => common.isString(_key))) {
                                    _outputEventMap[`BROADCAST`] = sourceEventMap[key].reduce((broadcastEventMap, _key) => {
                                        broadcastEventMap[
                                            dashToUpperCaseUnderscore(_key)
                                        ] = `broadcast-${_key}`;
                                        return broadcastEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'broadcast' event keys are invalid.`);
                                }
                            }
                            if (key === `requestEvents`) {
                                if (sourceEventMap[key].every((_key) => common.isString(_key))) {
                                    _outputEventMap[`REQUEST`] = sourceEventMap[key].reduce((requestForEventMap, _key) => {
                                        requestForEventMap[
                                            dashToUpperCaseUnderscore(_key)
                                        ] = `request-for-${_key}`;
                                        return requestForEventMap;
                                    }, {});
                                    _outputEventMap[`RESPONSE`] = {
                                        WITH: sourceEventMap[key].reduce((responseToEventMap, _key) => {
                                            responseToEventMap[
                                                dashToUpperCaseUnderscore(_key)
                                            ] = `response-with-${_key}`;
                                            return responseToEventMap;
                                        }, {}),
                                        TO: sourceEventMap[key].reduce((responseToEventMap, _key) => {
                                            responseToEventMap[
                                                dashToUpperCaseUnderscore(_key)
                                            ] = {
                                                OK: `response-to-${_key}-ok`,
                                                ERROR: `response-to-${_key}-error`,
                                                CONFLICT: `response-to-${_key}-conflict`,
                                                NOT_FOUND: `response-to-${_key}-not-found`,
                                                NOT_MODIFIED: `response-to-${_key}-not-modified`,
                                                UNAUTHORIZED: `response-to-${_key}-unauthorized`
                                            };
                                            return responseToEventMap;
                                        }, {})
                                    };
                                } else {
                                    common.log(`error`, `Event.create - Input 'request-for' event keys are invalid.`);
                                }
                            }
                            return _outputEventMap;
                        }, {});
                        // return Object.freeze(outputEventMap);
                        return outputEventMap;
                    }
                }
            },
            /* set store, interface, domain, and service factory namespaces */
            Domain: DomainFactory,
            Store: StoreFactory,
            Interface: InterfaceFactory,
            Service: ServiceFactory,
            /* set app factory namespace */
            App: AppFactory,
            /* set test agent & fixtures factory namespace */
            Agent: AgentFactory,
            // Fixture: FixtureFactory,
            /* set state composite factory namespace */
            State: {
                ReducerComposite: StateReducerComposite,
                TimeTraversalComposite: StateTimeTraversalComposite
            },
            /* set test fixtures composites namespace */
            // Test: {
            //     TapeRunnerComposite: TapeTestRunnerComposite,
            //     DomainFixtureComposite: DomainTestFixtureComposite,
            //     StoreFixtureComposite: StoreTestFixtureComposite,
            //     InterfaceFixtureComposite: InterfaceTestFixtureComposite,
            //     ServiceFixtureComposite: ServiceTestFixtureComposite
            // },
            /* set composite library namespace */
            React: {
                ComponentComposite: ReactComponentComposite,
                AppComponentComposite: (() => {
                    switch (TARGET) { // eslint-disable-line
                    case `client-native`:
                        return ReactClientNativeAppComponentComposite;
                    case `client-web`:
                        return ReactClientWebAppComponentComposite;
                    case `server`:
                        return ReactServerAppComponentComposite;
                    }
                })(),
                AppRendererComposite: (() => {
                    switch (TARGET) { // eslint-disable-line
                    case `client-native`:
                        return ReactClientNativeAppRendererComposite;
                    case `client-web`:
                        return ReactClientWebAppRendererComposite;
                    case `server`:
                        return ReactServerAppRendererComposite;
                    }
                })()
            },
            Storage: (() => {
                switch (TARGET) { // eslint-disable-line
                case `client-native`:
                    return {
                        ASyncStorageComposite
                    };
                case `client-web`:
                    return {
                        WebStorageComposite
                    };
                case `server`:
                    return {
                        PGComposite
                    };
                }
            })()
        };

        /* create an initialized Hf object */
        Hf = Object.freeze(common.mix(common, {
            exclusion: {
                /* hide reveal method, reveal is for internal use only */
                keys: [
                    `reveal`
                ]
            }
        }).with(HfProperty));
    }
    return Hf;
};

export {
    Hf,
    init
};
