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
 * @module Hyperflow (Hflow) (A toolkit & library for developing universal app)
 * @description - Hflow namespace setup. Initialize Hflow, adding core modules, and apply settings.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
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
import ReactClientWebRendererComposite from './composites/apps/client-web/react-renderer-composite';
import ReactClientNativeRendererComposite from './composites/apps/client-native/react-renderer-composite';
import ReactServerRendererComposite from './composites/apps/server/react-renderer-composite';

/* load service library */
import WebStorageComposite from './composites/services/client-web/web-storage-composite';
import ASyncStorageComposite from './composites/services/client-native/async-storage-composite';
import PGComposite from './composites/services/server/pg-composite';

let Hflow = null;

/**
 * @description - Setup and initialize modules & dependencies for Hflow`s namespaces.
 *
 * @function init
 * @param {object} setting - Hflow's global settings.
 * @returns {object}
 */
const init = function init ({
    TARGET = `client-web`,
    DEVELOPMENT = true,
    ENABLE_INFO_MESSAGE = true,
    ENABLE_WARN_LVL0_MESSAGE = false,
    ENABLE_WARN_LVL1_MESSAGE = true
} = {}) {
    if (Hflow === null) {
        const common = CommonElement({
            devleopment: DEVELOPMENT,
            enableInfoMessage: ENABLE_INFO_MESSAGE,
            enableWarn0Message: ENABLE_WARN_LVL0_MESSAGE,
            enableWarn1Message: ENABLE_WARN_LVL1_MESSAGE
        });
        const HflowProperty = {
            VERSION: `0.1.0-beta2`,
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
                 * @function create
                 * @param {object} eventIdObj - Event Id contructor object
                 * @returns {object}
                 */
                create: function create (sourceEventMap) {
                    if (!common.isSchema({
                        as: `array|undefined`,
                        on: `array|undefined`,
                        do: `array|undefined`,
                        request: `array|undefined`
                    }).of(sourceEventMap)) {
                        common.log(`error`, `Event.create - Input event map is invalid.`);
                    } else {
                        /* helper function to convert camel case to dash */
                        const camelcaseToDash = function camelcaseToDash (str) {
                            return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => {
                                return `-${word.toLowerCase()}`;
                            }).replace(/^_/, ``);
                        };
                        const targetEventMap = common.merge(sourceEventMap).with({
                            as: [
                                `stateMutated`
                            ],
                            on: [
                                `componentWillMount`,
                                `componentDidMount`,
                                `componentWillUpdate`,
                                `componentDidUpdate`,
                                `componentWillUnmount`
                            ]
                        });
                        return Object.keys(targetEventMap).reduce((outputEventMap, key) => {
                            if (key === `as`) {
                                if (targetEventMap[key].every((_key) => common.isString(_key))) {
                                    outputEventMap[key] = targetEventMap[key].reduce((asEventMap, _key) => {
                                        asEventMap[_key] = `as-${camelcaseToDash(_key)}`;
                                        return asEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'as' event keys are invalid.`);
                                }
                            }
                            if (key === `on`) {
                                if (targetEventMap[key].every((_key) => common.isString(_key))) {
                                    outputEventMap[key] = targetEventMap[key].reduce((onEventMap, _key) => {
                                        onEventMap[_key] = `on-${camelcaseToDash(_key)}`;
                                        return onEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'on' event keys are invalid.`);
                                }
                            }
                            if (key === `do`) {
                                if (targetEventMap[key].every((_key) => common.isString(_key))) {
                                    outputEventMap[key] = targetEventMap[key].reduce((doEventMap, _key) => {
                                        doEventMap[_key] = `do-${camelcaseToDash(_key)}`;
                                        return doEventMap;
                                    }, {});
                                } else {
                                    common.log(`error`, `Event.create - Input 'do' event keys are invalid.`);
                                }
                            }
                            if (key === `request`) {
                                if (targetEventMap[key].every((_key) => common.isString(_key))) {
                                    outputEventMap[key] = targetEventMap[key].reduce((requestForEventMap, _key) => {
                                        requestForEventMap[_key] = `request-for-${camelcaseToDash(_key)}`;
                                        return requestForEventMap;
                                    }, {});
                                    outputEventMap[`response`] = {
                                        with: targetEventMap[key].reduce((responseToEventMap, _key) => {
                                            responseToEventMap[_key] = `response-with-${camelcaseToDash(_key)}`;
                                            return responseToEventMap;
                                        }, {}),
                                        to: targetEventMap[key].reduce((responseToEventMap, _key) => {
                                            responseToEventMap[_key] = {
                                                ok: `response-to-${camelcaseToDash(_key)}-ok`,
                                                error: `response-to-${camelcaseToDash(_key)}-error`
                                            };
                                            return responseToEventMap;
                                        }, {})
                                    };
                                } else {
                                    common.log(`error`, `Event.create - Input 'request-for' event keys are invalid.`);
                                }
                            }
                            return outputEventMap;
                        }, {});
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
                RendererComposite: (() => {
                    switch (TARGET) { // eslint-disable-line
                    case `client-native`:
                        return ReactClientNativeRendererComposite;
                    case `client-web`:
                        return ReactClientWebRendererComposite;
                    case `server`:
                        return ReactServerRendererComposite;
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

        /* create an initialized Hflow object */
        Hflow = Object.freeze(common.mix(common, {
            exclusion: {
                /* hide reveal method, reveal is for internal use only */
                keys: [
                    `reveal`
                ]
            }
        }).with(HflowProperty));
    }
    return Hflow;
};

export {
    Hflow,
    init
};
