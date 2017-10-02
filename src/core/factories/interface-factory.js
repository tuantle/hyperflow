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
 * @description - An interface component factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* factory Ids */
import {
    STORE_FACTORY_CODE,
    INTERFACE_FACTORY_CODE
} from './factory-code';

/**
 * @description - An interface component factory.
 *
 * @module InterfaceFactory
 */
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
    InterfaceFactory: function InterfaceFactory () {
        /* ----- Private Variables ------------- */
        let _stateless = true;
        let _componentLib;
        let _compositeCache = {};
        let _compositeRefCache = {};
        let _initialReflectedState = {};
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize interface.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `InterfaceFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup interface event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
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
        this.teardown = function teardown (done) { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `InterfaceFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };
        /**
         * @description - Handle logic at component premounting stage.
         *
         * @method preMountStage
         * @param {function} handler
         * @return void
         */
        this.preMountStage = function preMountStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.preMountStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.preMountStage - Method is not implemented by default.`);
        };
        /**
         * @description - Handle logic at component postmounting stage.
         *
         * @method postMountStage
         * @param {function} handler
         * @return void
         */
        this.postMountStage = function postMountStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.postMountStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.postMountStage - Method is not implemented by default.`);
        };
        /**
         * @description - Handle logic at component predismounting stage.
         *
         * @method preDismountStage
         * @param {function} handler
         * @return void
         */
        this.preDismountStage = function preDismountStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.preDismountStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.preDismountStage - Method is not implemented by default.`);
        };
        /**
         * @description - Handle logic at component postdismounting stage.
         *
         * @method postDismountStage
         * @param {function} handler
         * @return void
         */
        this.postDismountStage = function postDismountStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.postDismountStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.postDismountStage - Method is not implemented by default.`);
        };
        /**
         * @description - Handle logic at component prepare to update stage.
         *
         * @method preUpdateStage
         * @param {function} handler
         * @return void
         */
        this.preUpdateStage = function preUpdateStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.preUpdateStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.preUpdateStage - Method is not implemented by default.`);
        };
        /**
         * @description - Handle logic at component after updating stage.
         *
         * @method postUpdateStage
         * @param {function} handler
         * @return void
         */
        this.postUpdateStage = function postUpdateStage (handler) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `InterfaceFactory.postUpdateStage - Input handler function is invalid.`);
                }
            }

            Hf.log(`warn0`, `InterfaceFactory.postUpdateStage - Method is not implemented by default.`);
        };
        /**
         * @description - Check if interface is pure or stateless.
         *
         * @method isStateless
         * @return {boolean}
         */
        this.isStateless = function isStateless () {
            return _stateless;
        };
        /**
         * @description - Get inital reflected state value.
         *
         * @method getInitialReflectedState
         * @return {object}
         */
        this.getInitialReflectedState = function getInitialReflectedState () {
            const intf = this;

            if (Hf.DEVELOPMENT) {
                if (_stateless) {
                    Hf.log(`warn1`, `InterfaceFactory.getInitialReflectedState - Interface:${intf.name} is pure with no state reflected to a store.`);
                }
            }

            return _initialReflectedState;
        };
        /**
         * @description - Convert interface to a component.
         *
         * @method toComponent
         * @return {object}
         */
        this.toPureComponent = function toPureComponent () {
            Hf.log(`error`, `InterfaceFactory.toPureComponent - Method is not implemented by default. Implementation required.`);
        };
        /**
         * @description - Convert interface to a component.
         *
         * @method toComponent
         * @param {object} applet
         * @param {object} option
         * @return {object}
         */
        this.toComponent = function toComponent (applet = null, option = {}) {
            Hf.log(`error`, `InterfaceFactory.toComponent - Method is not implemented by default. Implementation required.`);
        };
        /**
         * @description - Get the registered component toolkit or library.
         *
         * @method getComponentLib
         * @returns {object}
         */
        this.getComponentLib = function getComponentLib () {
            const intf = this;

            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(_componentLib)) {
                    Hf.log(`error`, `InterfaceFactory.getComponentLib - Interface:${intf.name} component library is not registered.`);
                }
            }
            return _componentLib;
        };
        /**
         * @description - Assign the registered component's reference object.
         *
         * @method assignComponentRef
         * @param {string} key
         * @returns function
         */
        this.assignComponentRef = function assignComponentRef (key) {
            if (Hf.DEVELOPMENT) {
                if (!Hf.isString(key)) {
                    Hf.log(`error`, `InterfaceFactory.assignComponentRef - Input component reference key is invalid.`);
                }
            }

            /* helper function to set component ref */
            const setComponentRef = function setComponentRef (componentRef) {
                _compositeRefCache[key] = Hf.isDefined(componentRef) ? componentRef : null;
                Hf.log(`warn0`, `InterfaceFactory.assignComponentRef - Assigning null to component reference at key:${key}.`);
            };
            return setComponentRef;
        };
        /**
         * @description - Lookup the registered component's reference object.
         *
         * @method lookupComponentRefs
         * @param {array} keys
         * @returns {array}
         */
        this.lookupComponentRefs = function lookupComponentRefs (...keys) {
            let componentRefs = [];
            if (!Hf.isEmpty(_compositeRefCache)) {
                if (!Hf.isEmpty(keys)) {
                    if (Hf.DEVELOPMENT) {
                        if (!keys.every((key) => Hf.isString(key))) {
                            Hf.log(`error`, `InterfaceFactory.lookupComponentRefs - Input component reference key is invalid.`);
                        } else if (!keys.every((key) => _compositeRefCache.hasOwnProperty(key))) {
                            Hf.log(`error`, `InterfaceFactory.lookupComponentRefs - Component reference is not found.`);
                        }
                    }

                    componentRefs = Hf.collect(...keys).from(_compositeRefCache);
                } else {
                    componentRefs = Object.values(_compositeRefCache);
                }
            }
            return componentRefs;
        };
        /**
         * @description - Get interface component composite set.
         *
         * @method getComponentComposites
         * @param {array} intfNames
         * @return {array}
         */
        this.getComponentComposites = function getComponentComposites (...intfNames) {
            let components = [];
            if (!Hf.isEmpty(_compositeCache)) {
                if (!Hf.isEmpty(intfNames)) {
                    if (Hf.DEVELOPMENT) {
                        if (!intfNames.every((name) => Hf.isString(name))) {
                            Hf.log(`error`, `InterfaceFactory.getComponentComposites - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => {
                            if (_compositeCache.hasOwnProperty(name)) {
                                return true;
                            }
                            Hf.log(`warn1`, `InterfaceFactory.getComponentComposites - Composite component:${name} was not composed to component cache.`);
                            return false;
                        })) {
                            Hf.log(`error`, `InterfaceFactory.getComponentComposites - Component is not found.`);
                        }
                    }

                    components = Hf.collect(...intfNames.map((name) => `${name}.component`)).from(_compositeCache);
                } else {
                    components = Object.values(_compositeCache).map((composite) => composite.component);
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
        this.getInterfaceComposites = function getInterfaceComposites (...intfNames) {
            let intfs = [];
            if (!Hf.isEmpty(_compositeCache)) {
                if (!Hf.isEmpty(intfNames)) {
                    if (Hf.DEVELOPMENT) {
                        if (!intfNames.every((name) => Hf.isString(name))) {
                            Hf.log(`error`, `InterfaceFactory.getInterfaceComposites - Input interface name is invalid.`);
                        } else if (!intfNames.every((name) => _compositeCache.hasOwnProperty(name))) {
                            Hf.log(`error`, `InterfaceFactory.getInterfaceComposites - Composite is not found.`);
                        }
                    }
                    intfs = Hf.collect(...intfNames.map((name) => `${name}.intf`)).from(_compositeCache);
                } else {
                    intfs = Object.values(_compositeCache).map((composite) => composite.intf);
                }
            }
            return intfs;
        };
        /**
         * @description - Register a component toolkit or library for interface.
         *
         * @method registerComponentLib
         * @param {object} componentLib
         * @returns {object}
         */
        this.registerComponentLib = function registerComponentLib (componentLib) {
            const intf = this;
            // TODO: Throw error if called outside of $init.
            if (Hf.DEVELOPMENT) {
                if (!Hf.isObject(componentLib)) {
                    Hf.log(`error`, `InterfaceFactory.registerComponentLib - Input component library is invalid.`);
                }
            }

            _componentLib = componentLib;
            if (!Hf.isEmpty(_compositeCache)) {
                _compositeCache = Hf.collect(...Object.keys(_compositeCache).map((name) => {
                    return `${name}.intf`;
                })).from(_compositeCache).reduce((compositeBundle, compositeIntf) => {
                    compositeIntf.registerComponentLib(_componentLib);
                    if (Hf.isSchema({
                        render: `function`
                    }).of(compositeIntf)) {
                        const component = compositeIntf.toComponent(null, {
                            alwaysUpdateAsParent: true
                        });
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isFunction(component)) {
                                Hf.log(`error`, `InterfaceFactory.registerComponentLib - Component is invalid.`);
                            }
                        }

                        compositeBundle[compositeIntf.name].component = component;
                    } else if (Hf.isSchema({
                        pureRender: `function`
                    })) {
                        const pureComponent = compositeIntf.toPureComponent();

                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isFunction(pureComponent)) {
                                Hf.log(`error`, `InterfaceFactory.registerComponentLib - Pure component is invalid.`);
                            }
                        }

                        compositeBundle[compositeIntf.name].component = pureComponent;
                    }
                    return compositeBundle;
                }, _compositeCache);
            }
            return intf;
        };
        /**
         * @description - Set the composite interfaces that this interface is composed of.
         *
         * @method composedOf
         * @param {array} compositeIntfs
         * @return {object}
         */
        this.composedOf = function composedOf (...compositeIntfs) {
            const intf = this;
            // TODO: Throw error if called outside of $init.
            // TODO: Allows composition of component also.
            // TODO: If possible, rename method to compose and return a newly created interface instead.
            if (Hf.DEVELOPMENT) {
                if (Hf.isEmpty(compositeIntfs)) {
                    Hf.log(`warn0`, `InterfaceFactory.composedOf - Input composite interface array is empty.`);
                } else if (!compositeIntfs.every((compositeIntf) => Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    toComponent: `function`,
                    toPureComponent: `function`,
                    registerComponentLib: `function`
                }).of(compositeIntf) && compositeIntf.fId.substr(0, INTERFACE_FACTORY_CODE.length) === INTERFACE_FACTORY_CODE)) {
                    Hf.log(`error`, `InterfaceFactory.composedOf - Input composite interfaces are invalid.`);
                } else if (compositeIntfs.some((compositeIntf) => intf.name === compositeIntf.name)) {
                    Hf.log(`error`, `InterfaceFactory.composedOf - Cannot compose interface:${intf.name} as a composite of itself.`);
                } else {
                    compositeIntfs.forEach((compositeIntf) => {
                        if (Object.keys(_compositeCache).includes(compositeIntf.name)) {
                            Hf.log(`warn1`, `InterfaceFactory.composedOf - Interface:${intf.name} is already composed of composite interface:${compositeIntf.name}.`);
                        }
                    });
                }
            }

            _compositeCache = compositeIntfs.map((compositeIntf) => {
                intf.observe(compositeIntf);
                Hf.log(`info1`, `Interface:${intf.name} is composed of composite interface:${compositeIntf.name}.`);
                return compositeIntf;
            }).reduce((compositeBundle, compositeIntf) => {
                compositeBundle[compositeIntf.name] = {
                    intf: compositeIntf,
                    component: null
                };
                return compositeBundle;
            }, _compositeCache);
            return intf;
        };
        /**
         * @description - Set state connection/reflection to a store.
         *
         * @method reflectStateOf
         * @param {object} store
         * @return {object}
         */
        this.reflectStateOf = function reflectStateOf (store) {
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
            intf.incoming(`do-sync-reflected-state`).handle((reflectedState) => {
                /* update initial reflected state snapshot as state from store mutated */
                _initialReflectedState = reflectedState;
            });
            _stateless = false;
            Hf.log(`info1`, `Interface:${intf.name} is reflecting state of store:${store.name}.`);

            return intf;
        };
    }
});
