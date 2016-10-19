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
 * @module AppFactory
 * @description - An app factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Composer */
import Composer from '../composer';

/* load CommonElement */
import CommonElement from '../elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/* factory Ids */
import {
    DOMAIN_FACTORY_CODE
} from './factory-code';

/**
 * @description - An app factory module.
 *
 * @module AppFactory
 */
export default Composer({
    state: {
        name: {
            value: `unnamed`,
            stronglyTyped: true,
            required: true
        }
    },
    AppFactory: function AppFactory () {
        /* ----- Private Variables ------------- */
        let _renderer;
        let _domain;
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize app before running.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `AppFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Render app top level component to the target env.
         *
         * @method renderToTarget
         * @return {void|string}
         */
        this.renderToTarget = function renderToTarget () {
            Hf.log(`warn0`, `AppFactory.renderToTarget - Method is not implemented by default.`);
        };
        /**
         * @description - Get app renderer.
         *
         * @method getRenderer
         * @return {object}
         */
        this.getRenderer = function getRenderer () {
            const app = this;
            if (!Hf.isObject(_renderer)) {
                Hf.log(`error`, `AppFactory.getRenderer - App:${app.name} is not registered with a component renderer.`);
            } else {
                return _renderer;
            }
        };
        /**
         * @description - Get the composed app top interface component from top level domain.
         *
         * @method getTopComponent
         * @return {object|function}
         */
        this.getTopComponent = function getTopComponent () {
            Hf.log(`warn0`, `AppFactory.getTopComponent - Method is not implemented by default.`);
        };
        /**
         * @description - Get app top level domain.
         *
         * @method getTopDomain
         * @return {object}
         */
        this.getTopDomain = function getTopDomain () {
            const app = this;
            if (!Hf.isObject(_domain)) {
                Hf.log(`error`, `AppFactory.getTopDomain - App:${app.name} is not registered with a domain.`);
            } else {
                return _domain;
            }
        };
        /**
         * @description - Register app domain, renderer, and app environment target.
         *
         * @method register
         * @param {object} definition - App registration definition for domain, renderer, and target.
         * @return void
         */
        this.register = function register (definition) {
            const app = this;
            if (!Hf.isSchema({
                domain: `object`,
                component: {
                    library: `object`,
                    renderer: `object`
                }
            }).of(definition)) {
                Hf.log(`error`, `AppFactory.register - Input definition is invalid.`);
            } else {
                const {
                    domain,
                    component
                } = definition;
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    hasStarted: `function`,
                    getInterface: `function`,
                    start: `function`,
                    restart: `function`
                }).of(domain) || domain.fId.substr(0, DOMAIN_FACTORY_CODE.length) !== DOMAIN_FACTORY_CODE) {
                    Hf.log(`error`, `AppFactory.register - Input domain is invalid.`);
                } else if (Hf.isObject(_domain)) {
                    Hf.log(`warn1`, `AppFactory.register - App:${app.name} registered domain:${domain.name}.`);
                } else {
                    _domain = domain;
                    _renderer = component.renderer;

                    const intf = domain.getInterface();
                    if (!Hf.isSchema({
                        registerComponentLib: `function`
                    }).of(intf)) {
                        Hf.log(`error`, `AppFactory.register - App top domain:${domain.name} interface is invalid.`);
                    } else {
                        intf.registerComponentLib(component.library);
                    }

                    Hf.log(`info`, `App:${app.name} registered domain:${domain.name}.`);
                }
            }
        };
        /**
         * @description - Run the app.
         *
         * @method run
         * @param {object} option
         * @return void
         */
        this.run = function run (option = {}) {
            const app = this;

            // TODO: Implement use case for app run option.
            option = Hf.isObject(option) ? option : {};

            if (!Hf.isObject(_domain)) {
                Hf.log(`error`, `AppFactory.run - App:${app.name} is not registered with a domain.`);
            } else {
                if (!_domain.hasStarted()) {
                    _domain.start(option, () => {
                        app.renderToTarget();
                        Hf.log(`info`, `Domain:${_domain.name} has started.`);
                        Hf.log(`info`, `Running app:${app.name}...`);
                    });
                } else {
                    _domain.restart(option, () => {
                        app.renderToTarget();
                        Hf.log(`info`, `Domain:${_domain.name} has restarted.`);
                        Hf.log(`warn1`, `AppFactory.run - App:${app.name} is already running. Restarting...`);
                    });
                }
            }
        };
    }
});
