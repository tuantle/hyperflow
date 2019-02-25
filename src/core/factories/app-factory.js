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
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import CommonElement from '../elements/common-element';

/* load Composer */
import Composer from '../composer';

/* factory Ids */
import {
    APP_FACTORY_CODE,
    DOMAIN_FACTORY_CODE
} from './factory-code';

const Hf = CommonElement();

export default Composer({
    state: {
        name: {
            value: `unnamed`,
            required: true
        },
        fId: {
            computable: {
                contexts: [
                    `name`
                ],
                compute () {
                    return `${APP_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    AppFactory () {
        /* ----- Private Variables ------------- */
        let _componentLib;
        let _componentRenderer;
        let _domain;
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize app before running.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            Hf.log(`warn0`, `AppFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Check if app has started.
         *
         * @method hasStarted
         * @return {boolean}
         */
        this.hasStarted = function () {
            const app = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_domain)) {
                    Hf.log(`error`, `AppFactory.hasStarted - App:${app.name} is not registered with a domain.`);
                }
            }

            return _domain.hasStarted();
        };
        /**
         * @description - Render app top level component to the target env.
         *
         * @method renderToTarget
         * @return {void|string}
         */
        this.renderToTarget = function () {
            Hf.log(`warn0`, `AppFactory.renderToTarget - Method is not implemented by default.`);
        };
        /**
         * @description - Get app component renderer.
         *
         * @method getComponentRenderer
         * @return {object}
         */
        this.getComponentRenderer = function () {
            const app = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_componentRenderer)) {
                    Hf.log(`error`, `AppFactory.getComponentRenderer - App:${app.name} is not registered with a component renderer.`);
                }
            }

            return _componentRenderer;
        };
        /**
         * @description - Get app component library.
         *
         * @method getComponentLib
         * @return {object}
         */
        this.getComponentLib = function () {
            const app = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_componentLib)) {
                    Hf.log(`error`, `AppFactory.getComponentLib - App:${app.name} is not registered with a component library.`);
                }
            }

            return _componentLib;
        };
        /**
         * @description - Get the composed app top interface component from top level domain.
         *
         * @method getTopComponent
         * @param {object} option
         * @return {object|function}
         */
        this.getTopComponent = function (option = {}) { // eslint-disable-line
            Hf.log(`warn0`, `AppFactory.getTopComponent - Method is not implemented by default.`);
        };
        /**
         * @description - Get app top level domain.
         *
         * @method getTopDomain
         * @return {object}
         */
        this.getTopDomain = function () {
            const app = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_domain)) {
                    Hf.log(`error`, `AppFactory.getTopDomain - App:${app.name} is not registered with a domain.`);
                }
            }

            return _domain;
        };
        /**
         * @description - Register app domain, renderer, and app environment target.
         *
         * @method register
         * @param {object} definition - App registration definition for domain, renderer, and target.
         * @return {object}
         */
        this.register = function (definition) {
            const app = this;
            // TODO: Throw error if called outside of $init.

            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    domain: `object`,
                    component: {
                        lib: `object`,
                        renderer: `object`
                    }
                }).of(definition)) {
                    Hf.log(`error`, `AppFactory.register - Input definition is invalid.`);
                }
            }

            const {
                domain,
                component
            } = definition;

            if (Hf.DEVELOPMENT) {
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
                    Hf.log(`warn1`, `AppFactory.register - App:${app.name} already registered domain:${_domain.name}.`);
                }
            }

            _domain = domain;
            _componentLib = component.lib;
            _componentRenderer = component.renderer;

            const intf = domain.getInterface();

            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    registerComponentLib: `function`
                }).of(intf)) {
                    Hf.log(`error`, `AppFactory.register - App top domain:${domain.name} interface is invalid.`);
                }
            }

            intf.registerComponentLib(component.lib);

            Hf.log(`info1`, `App:${app.name} registered domain:${domain.name}.`);

            return app;
        };
        /**
         * @description - Start app.
         *
         * @method start
         * @param {object} option
         * @return void
         */
        this.start = function (option = {
            doRenderToTarget: true
        }) {
            const app = this;
            const {
                doRenderToTarget
            } = Hf.fallback({
                doRenderToTarget: true
            }).of(option);

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_domain)) {
                    Hf.log(`error`, `AppFactory.start - App:${app.name} is not registered with a domain.`);
                }
            }

            if (_domain.hasStarted()) {
                Hf.log(`warn1`, `AppFactory.start - App:${app.name} is already running. Restarting...`);
                _domain.restart(() => {
                    if (doRenderToTarget) {
                        app.renderToTarget();
                    }
                    Hf.log(`info1`, `App:${app.name} has started.`);
                }, option);
            } else {
                Hf.log(`info1`, `Starting app:${app.name}...`);
                _domain.start(() => {
                    if (doRenderToTarget) {
                        app.renderToTarget();
                    }
                    Hf.log(`info1`, `App:${app.name} has started.`);
                }, option);
            }
        };
        /**
         * @description - Stop app.
         *
         * @method stop
         * @param {object} option
         * @return void
         */
        this.stop = function (option = {}) {
            const app = this;

            option = Hf.isObject(option) ? option : {};

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_domain)) {
                    Hf.log(`error`, `AppFactory.stop - App:${app.name} is not registered with a domain.`);
                }
            }

            if (_domain.hasStarted()) {
                Hf.log(`info1`, `Stopping app:${app.name}...`);
                _domain.stop(() => {
                    Hf.log(`info1`, `App:${app.name} has stopped.`);
                }, option);
            }
        };
        /**
         * @description - Restart app.
         *
         * @method restart
         * @param {object} option,
         * @return void
         */
        this.restart = function (option = {
            doRenderToTarget: true
        }) {
            const app = this;
            const {
                doRenderToTarget
            } = Hf.fallback({
                doRenderToTarget: true
            }).of(option);

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_domain)) {
                    Hf.log(`error`, `AppFactory.restart - App:${app.name} is not registered with a domain.`);
                }
            }

            if (_domain.hasStarted()) {
                Hf.log(`info1`, `Restarting app:${app.name}...`);
                _domain.restart(() => {
                    if (doRenderToTarget) {
                        app.renderToTarget();
                    }
                    Hf.log(`info1`, `App:${app.name} has restarted.`);
                }, option);
            } else {
                app.start(option);
            }
        };
    }
});
