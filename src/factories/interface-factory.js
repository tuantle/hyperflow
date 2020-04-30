/**
 * Copyright 2018-present Tuan Le.
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
 * @module InterfaceFactory
 * @description - An interface (container) component factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isFunction,
    isObject,
    isArray,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    collect,
    mix,
    log
} from '../../libs/utils/common-util';

import Composer from '../composer';

import EventStreamComposite from '../../libs/composites/event-stream-composite';

export default Composer({
    composites: [
        EventStreamComposite
    ],
    static: {
        type: `interface`
    },
    InterfaceFactory () {
        let _stateless = true;
        let _component; // eslint-disable-line
        let _childIntfCache = {};
        // let _peerIntfCache = {};
        let _initialState;

        /**
         * @description - Initialize interface.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            log(`warn0`, `InterfaceFactory.$init - Method is not implemented by default.`);
        };

        /**
         * @description - Setup interface event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `InterfaceFactory.setup - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Teardown interface event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `InterfaceFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Check if interface has a registered component.
         *
         * @method hasComponent
         * @return {object}
         */
        this.hasComponent = function () {
            return isFunction(_component) || isObject(_component);
        };

        /**
         * @description - Check if interfaced component is available.
         *
         * @method hasInterfacedComponent
         * @return {object}
         */
        this.hasInterfacedComponent = function () {
            log(`error`, `InterfaceFactory.hasInterfacedComponent - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Check if interface has a registered child interface.
         *
         * @method hasChildInterface
         * @param {string} intfName
         * @return {object}
         */
        this.hasChildInterface = function (intfName) {
            if (ENV.DEVELOPMENT) {
                if (!isString(intfName)) {
                    log(`error`, `InterfaceFactory.hasChildInterface - Input interface name is invalid.`);
                }
            }

            return Object.prototype.hasOwnProperty.call(_childIntfCache, intfName);
        };

        /**
         * @description - Check if interface stateless.
         *
         * @method isStateless
         * @return {boolean}
         */
        this.isStateless = function () {
            return _stateless;
        };

        /**
         * @description - Get inital state value.
         *
         * @method getInitialState
         * @return {object}
         */
        this.getInitialState = function () {
            const intf = this;

            if (ENV.DEVELOPMENT) {
                if (!intf.hasComponent()) {
                    log(`warn0`, `InterfaceFactory.getInitialState - Interface:${intf.name} is not registered with a component.`);
                }
                if (intf.isStateless()) {
                    log(`warn1`, `InterfaceFactory.getInitialState - Interface:${intf.name} is stateless.`);
                }
            }

            return _initialState;
        };

        /**
         * @description - Get the registered component.
         *
         * @method getComponent
         * @return {function}
         */
        this.getComponent = function () { // eslint-disable-line
            const intf = this;

            if (ENV.DEVELOPMENT) {
                if (!intf.hasComponent()) {
                    log(`warn0`, `InterfaceFactory.getComponent - Interface:${intf.name} is not registered with a component.`);
                }
            }

            return _component;
        };

        /**
         * @description - Get the interfaced component.
         *
         * @method getInterfacedComponent
         * @param {object} option
         * @return {function}
         */
        this.getInterfacedComponent = function (option = {}) { // eslint-disable-line
            log(`error`, `InterfaceFactory.getInterfacedComponent - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Render interface component to the target env.
         *
         * @method renderToTarget
         * @param {string} targetId
         * @param {object} option
         * @return {void|string}
         */
        this.renderToTarget = function (targetId, option = {}) { // eslint-disable-line
            log(`error`, `InterfaceFactory.renderToTarget - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Get interface component of child interfaces.
         *
         * @method getChildInterfacedComponents
         * @param {array} intfNames
         * @return {array}
         */
        this.getChildInterfacedComponents = function (...intfNames) {
            let interfacedComponents = [];
            if (!isEmpty(_childIntfCache)) {
                if (isNonEmptyArray(intfNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!intfNames.every((name) => isString(name))) {
                            log(`error`, `InterfaceFactory.getChildInterfacedComponents - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => {
                            if (Object.prototype.hasOwnProperty.call(_childIntfCache, name)) {
                                return true;
                            }
                            log(`warn1`, `InterfaceFactory.getChildInterfacedComponents - Composite component:${name} was not composed to component cache.`);
                            return false;
                        })) {
                            log(`error`, `InterfaceFactory.getChildInterfacedComponents - Component is not found.`);
                        }
                    }

                    interfacedComponents = Object.values(_childIntfCache)
                        .filter((childIntf) => intfNames.some((intfName) => childIntf.name === intfName))
                        .map((childIntf) => childIntf.getInterfacedComponent());
                } else {
                    interfacedComponents = Object.values(_childIntfCache).map((childIntf) => childIntf.getInterfacedComponent());
                }
            }
            return interfacedComponents;
        };

        /**
         * @description - Get child interfaces.
         *
         * @method getChildInterfaces
         * @param {array} intfNames
         * @return {array}
         */
        this.getChildInterfaces = function (...intfNames) {
            let childIntfs = [];
            if (!isEmpty(_childIntfCache)) {
                if (isNonEmptyArray(intfNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!intfNames.every((name) => isString(name))) {
                            log(`error`, `InterfaceFactory.getChildInterfaces - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => Object.prototype.hasOwnProperty.call(_childIntfCache, name))) {
                            log(`error`, `InterfaceFactory.getChildInterfaces - Child interface is not found.`);
                        }
                    }
                    childIntfs = collect(...intfNames.map((name) => `${name}.intf`)).from(_childIntfCache);
                } else {
                    childIntfs = Object.values(_childIntfCache).map((childIntf) => childIntf.intf);
                }
            }
            return childIntfs;
        };

        /**
         * @description - Register child/peers domains, services, store and interface.
         *
         * @method register
         * @param {object} definition - Domain registration definition for interface (required), child domains, and store.
         * @return {object}
         */
        this.register = function (definition) {
            const intf = this;

            if (ENV.DEVELOPMENT) {
                // if (intf.isInitialized()) {
                //     log(`error`, `InterfaceFactory.register - Interface:${intf.name} registration cannot be call after initialization.`);
                // }
                if (intf.isStreamActivated()) {
                    log(`error`, `InterfaceFactory.register - Interface:${intf.name} registration cannot be call after event stream activation.`);
                }
                if (!isSchema({
                    store: `object|undefined`,
                    component: `object|function|undefined`,
                    childInterfaces: `array|undefined`
                }).of(definition)) {
                    log(`error`, `InterfaceFactory.register - Input definition is invalid.`);
                }
            }

            const {
                store,
                component,
                childInterfaces: childIntfs
            } = definition;

            if (isObject(store)) {
                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        name: `string`,
                        type: `string`,
                        getStateAsObject: `function`
                    }).of(store) || store.type !== `store`) {
                        log(`error`, `InterfaceFactory.register - Input store is invalid.`);
                    }
                    if (isObject(_initialState) && !_stateless) {
                        log(`error`, `InterfaceFactory.register - Interface:${intf.name} already registered with a store.`);
                    }
                }

                _initialState = Object.freeze(mix(store.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `type`
                        ]
                    }
                }).with({}));

                _stateless = false;
                log(`info1`, `Interface:${intf.name} is reflecting state of store:${store.name}.`);
            }

            if (isObject(component) || isFunction(component)) {
                _component = component;
                log(`info1`, `Interface:${intf.name} interfaced with a component.`);
            }

            if (isArray(childIntfs)) {
                if (ENV.DEVELOPMENT) {
                    if (!childIntfs.every((childIntf) => isSchema({
                        name: `string`,
                        type: `string`,
                        getComponent: `function`
                    }).of(childIntf) && childIntf.type === `interface`)) {
                        log(`error`, `InterfaceFactory.register - Input child domains are invalid.`);
                    }
                }

                _childIntfCache = childIntfs.reduce((__childIntfCache, childIntf) => {
                    if (intf.name === childIntf.name) {
                        log(`warn1`, `InterfaceFactory.register - Cannot register interface:${intf.name} as a child of itself.`);
                    } else if (Object.prototype.hasOwnProperty.call(__childIntfCache, childIntf.name)) {
                        log(`warn1`, `InterfaceFactory.register - Interface:${intf.name} already has child interface:${childIntf.name} registered.`);
                    } else {
                        __childIntfCache[childIntf.name] = childIntf;
                        log(`info1`, `Interface:${intf.name} registered child interface:${childIntf.name}.`);
                    }
                    return __childIntfCache;
                }, _childIntfCache);
            }

            return intf;
        };
    }
});
