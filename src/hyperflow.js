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
 * @module Hyperflow (Hf) - A state flow and mutation management toolkit & library for developing universal app.
 * @description - Hf namespace setup. Initialize Hf, adding core modules, and apply settings.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com) 
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CommonElement */
const CommonElement = require(`./core/elements/common-element`).default;

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
    target = `client-web`,
    enableProductionMode = false,
    enableInfoLog = true,
    enableWarn0Log = false,
    enableWarn1Log = true
} = {}) {
    if (Hf === null) {
        Hf = CommonElement({
            enableProductionMode,
            enableInfoLog,
            enableWarn0Log,
            enableWarn1Log
        });

        /* Hyperflow core element libraries */
        const HfCoreProperty = {
            VERSION: `0.1.0-rc3`,
            TARGET: target === `server` || target === `client-native` || target === `client-web` ? target : `client-web`,
            ENV: target === `server` || target === `client-native` ? process.env.NODE_ENV : `development`, // eslint-disable-line
            /* load Composer & set composer factory namespace */
            Composer: require(`./core/composer`).default,
            /* load DataElement & set data element namespaces */
            Data: require(`./core/elements/data-element`).default,
            /* load CompositeElement & set composite element namespaces */
            Composite: require(`./core/elements/composite-element`).default
        };

        Hf = Hf.mix(Hf).with(HfCoreProperty);

        /* Hyperflow core factory libraries */
        const HfCoreFactoryProperty = {
            /* set store, interface, domain, and service factory namespaces */
            Domain: require(`./core/factories/domain-factory`).default,
            Store: require(`./core/factories/store-factory`).default,
            Interface: require(`./core/factories/interface-factory`).default,
            Service: require(`./core/factories/service-factory`).default,
            /* load test AgentFactory & set app factory namespace */
            App: require(`./core/factories/app-factory`).default,
            /* set factory event stream id map creator */
            Event: require(`./core/factories/factory-event`).default
        };

        Hf = Hf.mix(Hf).with(HfCoreFactoryProperty);

        /* Hyperflow core factory composite libraries */
        const HfCoreCompositeProperty = {
            /* load state composites library & set state composite factory namespace */
            State: {
                MutationComposite: require(`./core/factories/composites/state-mutation-composite`).default,
                TimeTraversalComposite: require(`./core/factories/composites/state-time-traversal-composite`).default
            }
            /* load test FixtureFactory and AgentFactory & set test agent & fixtures factory namespace */
            // Agent: require(`./core/factories/agent-factory`).default,
            // Fixture: require(`./core/factories/fixture-factory`).default,
            /* load & set test fixtures composites namespace */
            // Test: {
            //     TapeRunnerComposite: require(`./core/factories/composites/tape-test-runner-composite`).default,
            //     DomainFixtureComposite: require(`./core/factories/composites/test-fixtures/domain-test-fixture-composite`).default,
            //     StoreFixtureComposite: require(`./core/factories/composites/test-fixtures/store-test-fixture-composite`).default,
            //     InterfaceFixtureComposite: require(`./core/factories/composites/test-fixtures/interface-test-fixture-composite`).default,
            //     ServiceFixtureComposite: require(`./core/factories/composites/test-fixtures/service-test-fixture-composite`).default
            // }
        };

        Hf = Hf.mix(Hf).with(HfCoreCompositeProperty);

        /* Hyperflow vendor factory composite libraries */
        const HfCompositeProperty = {
            /* load React composites library & set composite library namespace */
            React: {
                ComponentComposite: require(`./composites/interfaces/react-component-composite`).default,
                AppComponentComposite: (() => {
                    switch (target) { // eslint-disable-line
                    case `client-native`:
                        return require(`./composites/apps/client-native/react-app-component-composite`).default;
                    case `client-web`:
                        return require(`./composites/apps/client-web/react-app-component-composite`).default;
                    case `server`:
                        return require(`./composites/apps/server/react-app-component-composite`).default;
                    default:
                        Hf.log(`error`, `Hf.Init - Invalid target:${target}.`);
                    }
                })(),
                AppRendererComposite: (() => {
                    switch (target) { // eslint-disable-line
                    case `client-native`:
                        return require(`./composites/apps/client-native/react-app-renderer-composite`).default;
                    case `client-web`:
                        return require(`./composites/apps/client-web/react-app-renderer-composite`).default;
                    case `server`:
                        return require(`./composites/apps/server/react-app-renderer-composite`).default;
                    default:
                        Hf.log(`error`, `Hf.Init - Invalid target:${target}.`);
                    }
                })()
            },
            /* load service library & set composite library namespace  */
            Storage: (() => {
                switch (target) { // eslint-disable-line
                case `client-native`:
                    return {
                        ASyncStorageComposite: require(`./composites/services/client-native/async-storage-composite`).default
                    };
                case `client-web`:
                    return {
                        WebStorageComposite: require(`./composites/services/client-web/web-storage-composite`).default
                    };
                case `server`:
                    return {
                        PGComposite: require(`./composites/services/server/pg-composite`).default
                    };
                default:
                    Hf.log(`error`, `Hf.Init - Invalid target:${target}.`);
                }
            })()
        };

        Hf = Hf.mix(Hf).with(HfCompositeProperty);

        /* create an initialized Hf object */
        Hf = Object.freeze(Hf);
    }
    return Hf;
};

export {
    Hf,
    init
};
