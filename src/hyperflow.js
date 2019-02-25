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
 * @description - Hf namespace setup. Initialize Hf, adding core modules, and apply option.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

let TARGET = `server`;

/* load CommonElement */
const CommonElement = require(`./core/elements/common-element`).default;

if (typeof window === `object` && window.hasOwnProperty(`TARGET`)) {
    TARGET = window.TARGET === `server` ||
             window.TARGET === `client-native` ||
             window.TARGET === `client-web` ? window.TARGET : `client-web`;
} else if (typeof process === `object` && process.hasOwnProperty(`env`)) {
    if (typeof process.env === `object` && process.env.hasOwnProperty(`TARGET`)) { // eslint-disable-line
        TARGET = process.env.TARGET === `server` || // eslint-disable-line
                 process.env.TARGET === `client-native` || // eslint-disable-line
                 process.env.TARGET === `client-web` ? process.env.TARGET : `client-web`; // eslint-disable-line
    }
}

let Hf = Object.assign({
    VERSION: `0.2.1`,
    TARGET
}, CommonElement());

/* Hyperflow core element libraries */
const HfCoreProperty = {
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
    /* load app factory namespace */
    App: require(`./core/factories/app-factory`).default,
    /* set factory event stream id map creator */
    Event: require(`./core/factories/factory-event`).default
    /* load test agent & fixtures factory namespaces */
    // Agent: require(`./core/factories/agent-factory`).default,
    // Fixture: require(`./core/factories/fixture-factory`).default,
};

Hf = Hf.mix(Hf).with(HfCoreFactoryProperty);

/* Hyperflow core factory composite libraries */
const HfCoreCompositeProperty = {
    /* load state composites library & set state composite factory namespace */
    State: {
        MutationComposite: require(`./core/factories/composites/state-mutation-composite`).default,
        TimeTraversalComposite: require(`./core/factories/composites/state-time-traversal-composite`).default
    }
    /* load test fixtures composites namespace */
    // TestFixture: {
    //     DomainFixtureComposite: require(`./core/factories/composites/test-fixtures/domain-test-fixture-composite`).default,
    //     StoreFixtureComposite: require(`./core/factories/composites/test-fixtures/store-test-fixture-composite`).default,
    //     InterfaceFixtureComposite: require(`./core/factories/composites/test-fixtures/interface-test-fixture-composite`).default,
    //     ServiceFixtureComposite: require(`./core/factories/composites/test-fixtures/service-test-fixture-composite`).default
    // }
};

Hf = Hf.mix(Hf).with(HfCoreCompositeProperty);

/* Hyperflow vendor factory composite libraries */
const HfCompositeProperty = {
    /* load test runner composites namespace */
    // TestRunner: {
    //     TapeTestRunnerComposite: require(`./composites/test-runners/tape-test-runner--composite`).default
    // },
    /* load React composites library & set composite library namespace */
    React: {
        ComponentComposite: require(`./composites/interfaces/react-component-composite`).default,
        AppComponentComposite: (() => {
            switch (TARGET) { // eslint-disable-line
            case `client-native`:
                return require(`./composites/apps/client-native/react-app-component-composite`).default;
            case `client-web`:
                return require(`./composites/apps/client-web/react-app-component-composite`).default;
            case `server`:
                return require(`./composites/apps/server/react-app-component-composite`).default;
            default:
                Hf.log(`error`, `Hf - Invalid target:${TARGET}.`);
            }
        })(),
        AppRendererComposite: (() => {
            switch (TARGET) { // eslint-disable-line
            case `client-native`:
                return require(`./composites/apps/client-native/react-app-renderer-composite`).default;
            case `client-web`:
                return require(`./composites/apps/client-web/react-app-renderer-composite`).default;
            case `server`:
                return require(`./composites/apps/server/react-app-renderer-composite`).default;
            default:
                Hf.log(`error`, `Hf - Invalid target:${TARGET}.`);
            }
        })()
    },
    /* load service library & set composite library namespace  */
    Storage: (() => {
        switch (TARGET) { // eslint-disable-line
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
            Hf.log(`error`, `Hf - Invalid target:${TARGET}.`);
        }
    })()
};

Hf = Hf.mix(Hf).with(HfCompositeProperty);

/* create an initialized Hf object */
Hf = Object.freeze(Hf);

export {
    Hf
};
