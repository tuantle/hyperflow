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
 * @module InterfaceFactory
 * @description - An interface (container) component factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import CommonElement from '../elements/common-element';

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* factory Ids */
import {
    STORE_FACTORY_CODE,
    INTERFACE_FACTORY_CODE
} from './factory-code';

const Hf = CommonElement();

export default Composer({
    composites: [
        EventStreamComposite
    ],
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
                    return `${INTERFACE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    InterfaceFactory () {
        /* ----- Private Variables ------------- */
        let _stateless = true;
        let _componentLib;
        let _compositeIntfCache = {};
        let _initialReflectedState = {};
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize interface.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            Hf.log(`warn0`, `InterfaceFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup interface event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function (done) { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `InterfaceFactory.setup - Input done function is invalid.`);
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
        this.teardown = function (done) { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `InterfaceFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
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
         * @description - Get inital reflected state value.
         *
         * @method getInitialReflectedState
         * @return {object}
         */
        this.getInitialReflectedState = function () {
            const intf = this;

            if (Hf.DEVELOPMENT) {
                if (_stateless) {
                    Hf.log(`warn1`, `InterfaceFactory.getInitialReflectedState - Interface:${intf.name} is stateless with no state reflected to a store.`);
                }
            }

            return _initialReflectedState;
        };
        /**
         * @description - Convert interface to a component.
         *
         * @method toComponent
         * @param {object} option
         * @return {object}
         */
        this.toComponent = function (option = {}) { // eslint-disable-line
            Hf.log(`error`, `InterfaceFactory.toComponent - Method is not implemented by default. Implementation required.`);
        };
        /**
         * @description - Get the registered component toolkit or library.
         *
         * @method getComponentLib
         * @returns {object}
         */
        this.getComponentLib = function () {
            const intf = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_componentLib)) {
                    Hf.log(`error`, `InterfaceFactory.getComponentLib - Interface:${intf.name} component library is not registered.`);
                }
            }
            return _componentLib;
        };
        /**
         * @description - Get interface component composite set.
         *
         * @method getComponentComposites
         * @param {array} intfNames
         * @return {array}
         */
        this.getComponentComposites = function (...intfNames) {
            let components = [];
            if (!Hf.isEmpty(_compositeIntfCache)) {
                if (Hf.isNonEmptyArray(intfNames)) {
                    if (Hf.DEVELOPMENT) {
                        if (!intfNames.every((name) => Hf.isString(name))) {
                            Hf.log(`error`, `InterfaceFactory.getComponentComposites - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => {
                            if (_compositeIntfCache.hasOwnProperty(name)) {
                                return true;
                            }
                            Hf.log(`warn1`, `InterfaceFactory.getComponentComposites - Composite component:${name} was not composed to component cache.`);
                            return false;
                        })) {
                            Hf.log(`error`, `InterfaceFactory.getComponentComposites - Component is not found.`);
                        }
                    }

                    components = Hf.collect(...intfNames.map((name) => `${name}.component`)).from(_compositeIntfCache);
                } else {
                    components = Object.values(_compositeIntfCache).map((composite) => composite.component);
                }
            }
            return components;
        };
        /**
         * @description - Get interface composite set.
         *
         * @method getInterfaceComposites
         * @param {array} intfNames
         * @return {array}
         */
        this.getInterfaceComposites = function (...intfNames) {
            let intfs = [];
            if (!Hf.isEmpty(_compositeIntfCache)) {
                if (Hf.isNonEmptyArray(intfNames)) {
                    if (Hf.DEVELOPMENT) {
                        if (!intfNames.every((name) => Hf.isString(name))) {
                            Hf.log(`error`, `InterfaceFactory.getInterfaceComposites - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => _compositeIntfCache.hasOwnProperty(name))) {
                            Hf.log(`error`, `InterfaceFactory.getInterfaceComposites - Composite is not found.`);
                        }
                    }
                    intfs = Hf.collect(...intfNames.map((name) => `${name}.intf`)).from(_compositeIntfCache);
                } else {
                    intfs = Object.values(_compositeIntfCache).map((composite) => composite.intf);
                }
            }
            return intfs;
        };
        /**
         * @description - Register a component toolkit or library for interface.
         *
         * @method registerComponentLib
         * @param {object} componentLib
         * @returns void
         */
        this.registerComponentLib = function (componentLib) {
            // TODO: Throw error if called outside of $init.
            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(componentLib)) {
                    Hf.log(`error`, `InterfaceFactory.registerComponentLib - Input component library is invalid.`);
                }
            }

            _componentLib = componentLib;
            if (!Hf.isEmpty(_compositeIntfCache)) {
                _compositeIntfCache = Hf.collect(...Object.keys(_compositeIntfCache).map((name) => {
                    return `${name}.intf`;
                })).from(_compositeIntfCache).reduce((compositeBundle, compositeIntf) => {
                    compositeIntf.registerComponentLib(componentLib);
                    if (Hf.isSchema({
                        render: `function`
                    }).of(compositeIntf)) {
                        const component = compositeIntf.toComponent({
                            alwaysUpdateAsParent: true
                        });
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isFunction(component)) {
                                Hf.log(`error`, `InterfaceFactory.registerComponentLib - Component is invalid.`);
                            }
                        }

                        compositeBundle[compositeIntf.name].component = component;
                    }
                    return compositeBundle;
                }, _compositeIntfCache);
            }
        };
        /**
         * @description - Set the composite interfaces that this interface is composed of.
         *
         * @method composedOf
         * @param {array} compositeIntfs
         * @return {object}
         */
        this.composedOf = function (...compositeIntfs) {
            const intf = this;
            // TODO: Throw error if called outside of $init.
            // TODO: Allows composition of component also.
            // TODO: If possible, rename method to compose and return a newly created interface instead.
            if (Hf.DEVELOPMENT) {
                if (!Hf.isNonEmptyArray(compositeIntfs)) {
                    Hf.log(`warn0`, `InterfaceFactory.composedOf - Input composite interface array is empty.`);
                } else if (!compositeIntfs.every((compositeIntf) => Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    toComponent: `function`,
                    registerComponentLib: `function`
                }).of(compositeIntf) && compositeIntf.fId.substr(0, INTERFACE_FACTORY_CODE.length) === INTERFACE_FACTORY_CODE)) {
                    Hf.log(`error`, `InterfaceFactory.composedOf - Input composite interfaces are invalid.`);
                } else if (compositeIntfs.some((compositeIntf) => intf.name === compositeIntf.name)) {
                    Hf.log(`error`, `InterfaceFactory.composedOf - Cannot compose interface:${intf.name} as a composite of itself.`);
                } else {
                    compositeIntfs.forEach((compositeIntf) => {
                        if (Object.keys(_compositeIntfCache).includes(compositeIntf.name)) {
                            Hf.log(`warn1`, `InterfaceFactory.composedOf - Interface:${intf.name} is already composed of composite interface:${compositeIntf.name}.`);
                        }
                    });
                }
            }

            _compositeIntfCache = compositeIntfs.map((compositeIntf) => {
                intf.observe(compositeIntf);
                Hf.log(`info1`, `Interface:${intf.name} is composed of composite interface:${compositeIntf.name}.`);
                return compositeIntf;
            }).reduce((compositeBundle, compositeIntf) => {
                compositeBundle[compositeIntf.name] = {
                    intf: compositeIntf,
                    component: null
                };
                return compositeBundle;
            }, _compositeIntfCache);
            return intf;
        };
        /**
         * @description - Set state connection/reflection to a store.
         *
         * @method reflectStateOf
         * @param {object} store
         * @return {object}
         */
        this.reflectStateOf = function (store) {
            const intf = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    getStateAsObject: `function`
                }).of(store) || store.fId.substr(0, STORE_FACTORY_CODE.length) !== STORE_FACTORY_CODE) {
                    Hf.log(`error`, `InterfaceFactory.reflectStateOf - Input store is invalid.`);
                } else if (!_stateless) {
                    Hf.log(`error`, `InterfaceFactory.reflectStateOf - Interface:${intf.name} is already has its state mirrored with a store.`);
                }
            }

            _initialReflectedState = Hf.mix(store.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});

            // intf.incoming(`do-sync-reflected-state`).handle((reflectedState) => {
            //     /* update initial reflected state snapshot as state from store mutated */
            //     _initialReflectedState = reflectedState;
            // });

            _stateless = false;
            Hf.log(`info1`, `Interface:${intf.name} is reflecting state of store:${store.name}.`);

            return intf;
        };
    }
});
