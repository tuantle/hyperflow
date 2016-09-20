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
 */
'use strict'; // eslint-disable-line

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* load Hflow */
import { Hflow } from 'hyperflow';

/* factory Ids */
import {
    STORE_FACTORY_CODE,
    INTERFACE_FACTORY_CODE
} from './factory-code';

/* delay data stream from composite interface by 10ms as default */
const DEBOUNCE_COMPOSITE_INTERFACE_IN_MS = 10;

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
            stronglyTyped: true,
            required: true
        },
        style: {
            value: null,
            stronglyTyped: false,
            required: false
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
            Hflow.log(`warn0`, `InterfaceFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup interface event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `InterfaceFactory.setup - Input done function is invalid.`);
            } else {
                done();
                Hflow.log(`warn0`, `InterfaceFactory.setup - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Teardown interface event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `InterfaceFactory.teardown - Input done function is invalid.`);
            } else {
                done();
                Hflow.log(`warn0`, `InterfaceFactory.teardown - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component premounting stage.
         *
         * @method preMountStage
         * @param {function} handler
         * @return void
         */
        this.preMountStage = function preMountStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.preMountStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.preMountStage - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component postmounting stage.
         *
         * @method postMountStage
         * @param {function} handler
         * @return void
         */
        this.postMountStage = function postMountStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.postMountStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.postMountStage - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component predismounting stage.
         *
         * @method preDismountStage
         * @param {function} handler
         * @return void
         */
        this.preDismountStage = function preDismountStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.preDismountStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.preDismountStage - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component postdismounting stage.
         *
         * @method postDismountStage
         * @param {function} handler
         * @return void
         */
        this.postDismountStage = function postDismountStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.postDismountStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.postDismountStage - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component prepare to update stage.
         *
         * @method preUpdateStage
         * @param {function} handler
         * @return void
         */
        this.preUpdateStage = function preUpdateStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.preUpdateStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.preUpdateStage - Method is not implemented by default.`);
            }
        };
        /**
         * @description - Handle logic at component after updating stage.
         *
         * @method postUpdateStage
         * @param {function} handler
         * @return void
         */
        this.postUpdateStage = function postUpdateStage (handler) {
            if (!Hflow.isFunction(handler)) {
                Hflow.log(`error`, `InterfaceFactory.postUpdateStage - Input handler function is invalid.`);
            } else {
                Hflow.log(`warn0`, `InterfaceFactory.postUpdateStage - Method is not implemented by default.`);
            }
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
            if (_stateless) {
                Hflow.log(`warn1`, `InterfaceFactory.getInitialReflectedState - Interface:${intf.name} is pure with no state reflected to a store.`);
            }
            return _initialReflectedState;
        };
        /**
         * @description - Convert interface to a component.
         *
         * @method toComponent
         * @return {object}
         */
        this.toComponent = function toComponent () {
            Hflow.log(`error`, `InterfaceFactory.toComponent - Method is not implemented by default. Implementation required.`);
        };
        /**
         * @description - Get the registered component toolkit or library.
         *
         * @method getComponentLib
         * @returns {object}
         */
        this.getComponentLib = function getComponentLib () {
            const intf = this;
            if (!Hflow.isObject(_componentLib)) {
                Hflow.log(`error`, `InterfaceFactory.getComponentLib - Interface:${intf.name} component library is not registered.`);
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
            if (!Hflow.isString(key)) {
                Hflow.log(`error`, `InterfaceFactory.assignComponentRef - Input component reference key is invalid.`);
            } else {
                /* helper function to set component ref */
                const setComponentRef = function setComponentRef (componentRef) {
                    _compositeRefCache[key] = Hflow.isDefined(componentRef) ? componentRef : null;
                    Hflow.log(`warn0`, `InterfaceFactory.assignComponentRef - Assigning null to component reference at key:${key}.`);
                };
                return setComponentRef;
            }
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
            if (!Hflow.isEmpty(_compositeRefCache)) {
                if (!Hflow.isEmpty(keys)) {
                    if (!keys.every((key) => Hflow.isString(key))) {
                        Hflow.log(`error`, `InterfaceFactory.lookupComponentRefs - Input component reference key is invalid.`);
                    } else if (!keys.every((key) => _compositeRefCache.hasOwnProperty(key))) {
                        Hflow.log(`error`, `InterfaceFactory.lookupComponentRefs - Component reference is not found.`);
                    } else {
                        componentRefs = Hflow.collect(_compositeRefCache, ...keys);
                    }
                } else {
                    componentRefs = Object.keys(_compositeRefCache).map((name) => _compositeRefCache[name]);
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
            if (!Hflow.isEmpty(_compositeCache)) {
                // TODO: Allows getting composite component of composite component.
                if (!Hflow.isEmpty(intfNames)) {
                    if (!intfNames.every((name) => Hflow.isString(name))) {
                        Hflow.log(`error`, `InterfaceFactory.getComponentComposites - Input interface name is invalid.`);
                    } else if (!intfNames.every((name) => {
                        if (_compositeCache.hasOwnProperty(name)) {
                            return true;
                        }
                        Hflow.log(`warn1`, `InterfaceFactory.getComponentComposites - Composite component:${name} was not composed to component cache.`);
                        return false;
                    })) {
                        Hflow.log(`error`, `InterfaceFactory.getComponentComposites - Component is not found.`);
                    } else {
                        components = Hflow.collect(_compositeCache, ...intfNames.map((name) => `${name}.component`));
                    }
                } else {
                    components = Object.keys(_compositeCache).map((name) => _compositeCache[name].component);
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
            if (!Hflow.isEmpty(_compositeCache)) {
                // TODO: Remove this method if find no use case.
                // TODO: Allows getting composite interface of composite interface.
                if (!Hflow.isEmpty(intfNames)) {
                    if (!intfNames.every((name) => Hflow.isString(name))) {
                        Hflow.log(`error`, `InterfaceFactory.getInterfaceComposites - Input interface name is invalid.`);
                    } else if (!intfNames.every((name) => _compositeCache.hasOwnProperty(name))) {
                        Hflow.log(`error`, `InterfaceFactory.getInterfaceComposites - Composite is not found.`);
                    } else {
                        intfs = Hflow.collect(_compositeCache, ...intfNames.map((name) => `${name}.intf`));
                    }
                } else {
                    intfs = Object.keys(_compositeCache).map((name) => _compositeCache[name].intf);
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
        this.registerComponentLib = function registerComponentLib (componentLib) {
            if (!Hflow.isObject(componentLib)) {
                Hflow.log(`error`, `InterfaceFactory.registerComponentLib - Input component library is invalid.`);
            } else {
                _componentLib = componentLib;
                if (!Hflow.isEmpty(_compositeCache)) {
                    _compositeCache = Hflow.collect(_compositeCache, ...Object.keys(_compositeCache).map((name) => {
                        return `${name}.intf`;
                    })).reduce((compositeBundle, compositeIntf) => {
                        compositeIntf.registerComponentLib(_componentLib);

                        const component = compositeIntf.toComponent();
                        if (!Hflow.isFunction(component)) {
                            Hflow.log(`error`, `InterfaceFactory.registerComponentLib - Component is invalid.`);
                        } else {
                            compositeBundle[compositeIntf.name].component = component;
                        }
                        return compositeBundle;
                    }, _compositeCache);
                }
            }
        };
        /**
         * @description - Set the composite interfaces that this interface is composed of.
         *
         * @method composedOf
         * @param {array} compositeIntfs
         * @return void
         */
        this.composedOf = function composedOf (...compositeIntfs) {
            const intf = this;
            // TODO: If possible, rename method to compose and return a newly created interface instead.
            if (Hflow.isEmpty(compositeIntfs)) {
                Hflow.log(`warn0`, `InterfaceFactory.composedOf - Input composite interface array is empty.`);
            } else {
                if (!compositeIntfs.every((compositeIntf) => {
                    return Hflow.isSchema({
                        fId: `string`,
                        name: `string`,
                        toComponent: `function`,
                        registerComponentLib: `function`
                    }).of(compositeIntf) && compositeIntf.fId.substr(0, INTERFACE_FACTORY_CODE.length) === INTERFACE_FACTORY_CODE;
                })) {
                    Hflow.log(`error`, `InterfaceFactory.composedOf - Input composite interfaces are invalid.`);
                } else if (compositeIntfs.some((compositeIntf) => intf.name === compositeIntf.name)) {
                    Hflow.log(`error`, `InterfaceFactory.composedOf - Cannot compose interface:${intf.name} as a composite of itself.`);
                } else {
                    const newCompositeInterfaces = compositeIntfs.filter((compositeIntf) => {
                        if (Object.keys(_compositeCache).some((name) => name === compositeIntf.name)) {
                            Hflow.log(`warn1`, `InterfaceFactory.composedOf - Interface:${intf.name} is already composed of composite interface:${compositeIntf.name}.`);
                            return false;
                        }
                        return true;
                    });
                    _compositeCache = newCompositeInterfaces.map((compositeIntf) => {
                        intf.observe(compositeIntf).debounce(DEBOUNCE_COMPOSITE_INTERFACE_IN_MS);
                        Hflow.log(`info`, `Interface:${intf.name} is composed of composite interface:${compositeIntf.name}.`);
                        return compositeIntf;
                    }).reduce((compositeBundle, compositeIntf) => {
                        compositeBundle[compositeIntf.name] = {
                            intf: compositeIntf,
                            component: null
                        };
                        return compositeBundle;
                    }, _compositeCache);
                    return intf;
                }
            }
        };
        this.reflectStateOf = function reflectStateOf (store) {
            if (!Hflow.isSchema({
                fId: `string`,
                name: `string`,
                getStateAsObject: `function`
            }).of(store) || store.fId.substr(0, STORE_FACTORY_CODE.length) !== STORE_FACTORY_CODE) {
                Hflow.log(`error`, `InterfaceFactory.reflectStateOf - Input store is invalid.`);
            } else {
                const intf = this;
                if (_stateless) {
                    _initialReflectedState = Hflow.mix(store.getStateAsObject(), {
                        exclusion: {
                            keys: [
                                `name`,
                                `fId`
                            ]
                        }
                    }).with({});
                    intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                        /* update initial reflected state snapshot as state from store mutated */
                        _initialReflectedState = reflectedState;
                    });
                    _stateless = false;
                    Hflow.log(`info`, `Interface:${intf.name} is reflecting state of store:${store.name}.`);
                } else {
                    Hflow.log(`warn1`, `InterfaceFactory.reflectStateOf - Interface:${intf.name} is already has its state mirrored with a store.`);
                }
            }
        };
    }
});
