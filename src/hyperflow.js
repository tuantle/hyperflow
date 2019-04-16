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
 * @module Hyperflow (Hf)
 * @description - A javascript state flow and mutation management toolkit & library for developing universal app.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from './core/elements/common-element';

import Composer from './core/composer';
import Data from './core/elements/data-element';
import Composite from './core/elements/composite-element';

import Domain from './core/factories/domain-factory';
import Store from './core/factories/store-factory';
import Interface from './core/factories/interface-factory';
import Service from './core/factories/service-factory';
import App from './core/factories/app-factory';
import Event from './core/factories/factory-event';
// import Agent from './core/factories/agent-factory';
// import Fixture from './core/factories/fixture-factory';

import MutationComposite from './core/factories/composites/state-mutation-composite';
import TimeTraversalComposite from './core/factories/composites/state-time-traversal-composite';

// import TapeTestRunnerComposite from './composites/test-runners/tape-test-runner--composite';
// import DomainTestFixtureComposite from './core/factories/composites/test-fixtures/domain-test-fixture-composite';
// import StoreTestFixtureComposite from './core/factories/composites/test-fixtures/store-test-fixture-composite';
// import InterfaceTestFixtureComposite from './core/factories/composites/test-fixtures/interface-test-fixture-composite';
// import ServiceTestFixtureComposite from './core/factories/composites/test-fixtures/service-test-fixture-composite';

import ComponentComposite from './composites/interfaces/react-component-composite';

let TARGET = `server`;

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
    Composer,
    Data,
    Composite
};

Hf = Hf.mix(Hf).with(HfCoreProperty);

const HfCoreFactoryProperty = {
    Domain,
    Store,
    Interface,
    Service,
    App,
    Event
    // Agent,
    // Fixture,
};

Hf = Hf.mix(Hf).with(HfCoreFactoryProperty);

const HfCoreCompositeProperty = {
    State: {
        MutationComposite,
        TimeTraversalComposite
    }
    // TestFixture: {
    //     DomainTestFixtureComposite,
    //     StoreTestFixtureComposite,
    //     InterTestfaceFixtureComposite,
    //     ServiceTestFixtureComposite
    // }
};

Hf = Hf.mix(Hf).with(HfCoreCompositeProperty);

const HfCompositeProperty = {
    // TestRunner: {
    //     TapeTestRunnerComposite
    // },
    React: {
        ComponentComposite,
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
