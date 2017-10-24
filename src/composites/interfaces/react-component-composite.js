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
 * @module ReactComponentComposite
 * @description - A React component interface factory composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

const WILL_MOUNT_STAGE = 0;
const DID_MOUNT_STAGE = 1;
const WILL_UNMOUNT_STAGE = 2;

const DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS = [
    /* interface reserved method prefixes */
    `on`,
    `do`,
    `get`,
    `set`,
    `handle`,
    `render`
];

const DEFAULT_COMPONENT_FN_AND_PROPERTY_INCLUSIONS = [
    /* react reserved methods and properties */
    `propTypes`,
    `defaultProps`,
    `setNativeProps`,
    `setState`,
    `getDefaultProps`,
    `getInitialState`,
    `forceUpdate`,
    `componentWillMount`,
    `componentDidMount`,
    `componentWillReceiveProps`,
    `shouldComponentUpdate`,
    `componentWillUpdate`,
    `componentDidUpdate`,
    `componentWillUnmount`,
    `shouldComponentUpdate`,
    /* interface reserved methods and properties */
    `refCache`,
    `outgoing`,
    `assignComponentRef`,
    `lookupComponentRefs`,
    `getComponentComposites`
];

/**
 * @description - A React component factory composite module.
 *
 * @module ReactComponentComposite
 * @return {object}
 */
export default Hf.Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactComponentComposite
         * @return void
         */
        $initReactComponentComposite: function $initReactComponentComposite () {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    name: `string`,
                    isStateless: `function`,
                    incoming: `function`,
                    outgoing: `function`,
                    reduceState: `function`,
                    getStateCursor: `function`,
                    getStateAsObject: `function`,
                    getComponentLib: `function`,
                    getInitialReflectedState: `function`
                }).of(intf)) {
                    Hf.log(`error`, `ReactComponentComposite.$init - Interface is invalid. Cannot apply composite.`);
                } else {
                    if (Hf.isSchema({
                        getDefaultProps: `function|undefined`,
                        getInitialState: `function|undefined`,
                        componentWillMount: `function`,
                        componentDidMount: `function`,
                        componentWillReceiveProps: `function`,
                        componentWillUpdate: `function`,
                        componentDidUpdate: `function`,
                        componentWillUnmount: `function`,
                        shouldComponentUpdate: `function`
                    }).of(intf)) {
                        Hf.log(`warn1`, `ReactComponentComposite.$init - Interface:${intf.name} should not have internally reverved React lifecyle methods defined.`);
                    }
                }
            }
        },
        /**
         * @description - Handle logic at component postmounting stage.
         *
         * @method postMountStage
         * @param {function} handler
         * @return void
         */
        postMountStage: function postMountStage (handler) {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `ReactComponentComposite.postMountStage - Input handler function is invalid.`);
                }
            }
            intf.incoming(`on-component-${intf.name}-${intf.fId}-did-mount`).handle((component) => handler(component));
        },
        /**
         * @description - Handle logic at component prepare to receive property stage.
         *
         * @method preReceivingPropertyStage
         * @param {function} handler
         * @return void
         */
        preReceivingPropertyStage: function preReceivingPropertyStage (handler) {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `ReactComponentComposite.preReceivingPropertyStage - Input handler function is invalid.`);
                }
            }
            intf.incoming(`on-component-${intf.name}-${intf.fId}-will-receive-property`).handle((component) => handler(component));
        },
        /**
         * @description - Handle logic at component prepare to update stage.
         *
         * @method preUpdateStage
         * @param {function} handler
         * @return void
         */
        preUpdateStage: function preUpdateStage (handler) {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `ReactComponentComposite.preUpdateStage - Input handler function is invalid.`);
                }
            }
            intf.incoming(`on-component-${intf.name}-${intf.fId}-will-update`).handle((component) => handler(component));
        },
        /**
         * @description - Handle logic at component after updating stage.
         *
         * @method postUpdateStage
         * @param {function} handler
         * @return void
         */
        postUpdateStage: function postUpdateStage (handler) {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `ReactComponentComposite.postUpdateStage - Input handler function is invalid.`);
                }
            }
            intf.incoming(`on-component-${intf.name}-${intf.fId}-did-update`).handle((component) => handler(component));
        }
    },
    enclosure: {
        ReactComponentComposite: function ReactComponentComposite () {
            /* ----- Private Variables ------------- */
            let _mounted = false;
            /* ----- Public Functions -------------- */
            /**
             * @description - Check if interface has a component that is mounted
             *
             * @method isMounted
             * @return {boolean}
             */
            this.isMounted = function isMounted () {
                return _mounted;
            };
            /**
             * @description - Handle logic at component premounting stage.
             *
             * @method preMountStage
             * @param {function} handler
             * @return void
             */
            this.preMountStage = function preMountStage (handler) {
                const intf = this;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(handler)) {
                        Hf.log(`error`, `ReactComponentComposite.preMountStage - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-${intf.fId}-will-mount`).handle((component) => {
                    _mounted = true;
                    handler(component);
                });
            };
            /**
             * @description - Handle logic at component predismounting stage.
             *
             * @method preDismountStage
             * @param {function} handler
             * @return void
             */
            this.preDismountStage = function preDismountStage (handler) {
                const intf = this;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(handler)) {
                        Hf.log(`error`, `ReactComponentComposite.preDismountStage - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-${intf.fId}-will-unmount`).handle((component) => {
                    _mounted = false;
                    handler(component);
                });
            };
            /**
             * @description - Convert composite to a renderable component.
             *
             * @method toComponent
             * @param {object} option
             * @returns {object}
             */
            this.toComponent = function toComponent (option = {
                alwaysUpdateAsParent: true,
                fnPrefixInclusions: [],
                fnAndPropertyInclusions: []
            }) {
                const intf = this;
                const {
                    PropTypes,
                    CreateReactClass
                } = intf.getComponentLib();
                const {
                    alwaysUpdateAsParent,
                    fnPrefixInclusions,
                    fnAndPropertyInclusions
                } = Hf.fallback({
                    alwaysUpdateAsParent: true,
                    fnPrefixInclusions: [],
                    fnAndPropertyInclusions: []
                }).of(option);
                const reactPropTypeAlias = {
                    boolean: PropTypes.bool,
                    array: PropTypes.array,
                    object: PropTypes.object,
                    function: PropTypes.func,
                    string: PropTypes.string,
                    number: PropTypes.number
                };
                let Component;

                if (intf.isMounted()) {
                    Hf.log(`error`, `ReactComponentComposite.toComponent - Interface:${intf.name} already have a mounted component.`);
                }

                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(CreateReactClass)) {
                        Hf.log(`error`, `ReactComponentComposite.toComponent - React create class function is invalid.`);
                    } else if (!Hf.isSchema({
                        bool: `function`,
                        array: `function`,
                        object: `function`,
                        func: `function`,
                        string: `function`,
                        number: `function`,
                        oneOf: `function`,
                        oneOfType: `function`
                    }).of(PropTypes)) {
                        Hf.log(`error`, `ReactComponentComposite.toComponent - React prop-types library is invalid.`);
                    }
                }

                const IntfComponentWrapper = (Hf.Composite({
                    exclusion: {
                        keys: [ `*` ],
                        exception: {
                            prefixes: DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS.concat(fnPrefixInclusions),
                            keys: DEFAULT_COMPONENT_FN_AND_PROPERTY_INCLUSIONS.concat(fnAndPropertyInclusions)
                        }
                    },
                    enclosure: {
                        ReactDefinition: function ReactDefinition () {
                            /* ----- Public Statics -------------- */
                            this.refCache = {};
                            this.mountStage = WILL_MOUNT_STAGE;
                            this.mutationOccurred = false;
                            this.propTypes = (() => {
                                let propTypes = Object.keys(intf.getStateAsObject()).reduce((propType, key) => {
                                    if (intf.getStateCursor().isItemStronglyTyped(key)) {
                                        const propertyTypeAliasKey = Hf.typeOf(intf.getStateAsObject()[key]);
                                        if (reactPropTypeAlias.hasOwnProperty(propertyTypeAliasKey)) {
                                            if (intf.getStateCursor().isItemRequired(key)) {
                                                propType[key] = reactPropTypeAlias[propertyTypeAliasKey].isRequired;
                                            } else {
                                                propType[key] = reactPropTypeAlias[propertyTypeAliasKey];
                                            }
                                        }
                                    }
                                    return propType;
                                }, {});

                                return Object.keys(intf.getStateAsObject()).reduce((propType, key) => {
                                    if (intf.getStateCursor().isItemOneOfValues(key)) {
                                        const {
                                            condition: values
                                        } = intf.getStateCursor().getItemDescription(key).ofConstrainable().getConstraint(`oneOf`);
                                        propType[key] = PropTypes.oneOf(values);
                                    }
                                    if (intf.getStateCursor().isItemOneOfTypes(key)) {
                                        const {
                                            condition: types
                                        } = intf.getStateCursor().getItemDescription(key).ofConstrainable().getConstraint(`oneTypeOf`);
                                        propType[key] = PropTypes.oneOfType(types.map((typeAliasKey) => {
                                            return reactPropTypeAlias[typeAliasKey];
                                        }));
                                    }
                                    return propType;
                                }, propTypes);
                            })();
                            /* ----- Public Functions -------------- */
                            /**
                             * @description - React method for getting the default prop values.
                             *
                             * @method getDefaultProps
                             * @returns {object}
                             */
                            this.getDefaultProps = function getDefaultProps () {
                                return {
                                    ...intf.getStateAsObject(),
                                    intf
                                };
                            };
                            /**
                             * @description - React method for getting the initial state values.
                             *
                             * @method getInitialState
                             * @returns {object}
                             */
                            this.getInitialState = function getInitialState () {
                                if (!intf.isStateless()) {
                                    return intf.getInitialReflectedState();
                                } else { // eslint-disable-line
                                    return null;
                                }
                            };
                            /**
                             * @description - Assign the registered component's reference object.
                             *
                             * @method assignComponentRef
                             * @param {string} refName
                             * @returns function
                             */
                            this.assignComponentRef = function assignComponentRef (refName) {
                                const component = this;

                                if (Hf.DEVELOPMENT) {
                                    if (!Hf.isString(refName)) {
                                        Hf.log(`error`, `ReactComponentComposite.assignComponentRef - Input component reference name is invalid.`);
                                    }
                                }

                                /* helper function to set component ref */
                                const setComponentRef = function setComponentRef (componentRef) {
                                    component.refCache[refName] = Hf.isDefined(componentRef) ? componentRef : null;
                                };
                                return setComponentRef;
                            };
                            /**
                             * @description - Lookup the registered component's reference object.
                             *
                             * @method lookupComponentRefs
                             * @param {array} refNames
                             * @returns {array}
                             */
                            this.lookupComponentRefs = function lookupComponentRefs (...refNames) {
                                const component = this;
                                let componentRefs = [];

                                if (!Hf.isEmpty(refNames)) {
                                    if (Hf.DEVELOPMENT) {
                                        if (!refNames.every((refName) => Hf.isString(refName))) {
                                            Hf.log(`error`, `ReactComponentComposite.lookupComponentRefs - Input component reference name is invalid.`);
                                        } else if (!refNames.every((refName) => component.refCache.hasOwnProperty(refName))) {
                                            Hf.log(`error`, `ReactComponentComposite.lookupComponentRefs - Component reference is not found.`);
                                        }
                                    }

                                    componentRefs = Hf.collect(...refNames).from(component.refCache);
                                } else {
                                    Hf.log(`error`, `ReactComponentComposite.lookupComponentRefs - Input component reference name array is empty.`);
                                }

                                return componentRefs;
                            };
                            /**
                             * @description - React method for setting up component before mounting.
                             *
                             * @method componentWillMount
                             * @returns void
                             */
                            this.componentWillMount = function componentWillMount () {
                                const component = this;

                                component.mountStage = WILL_MOUNT_STAGE;

                                if (!component.props.intf.isStateless()) {
                                    /* this event is call ONLY when the state did mutate in store */
                                    component.props.intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                                        if (Hf.isObject(reflectedState) && (component.mountStage === WILL_MOUNT_STAGE || component.mountStage === DID_MOUNT_STAGE)) {
                                            component.mutationOccurred = true;
                                            component.setState(() => reflectedState);
                                            Hf.log(`info0`, `State mutated for component:${component.props.name}.`);
                                        }
                                    });
                                    /* this event is call ONLY when the state did mutate in store and FORCE component to update */
                                    component.props.intf.incoming(`as-state-forced-to-mutate`).handle((reflectedState) => {
                                        if (Hf.isObject(reflectedState) && (component.mountStage === WILL_MOUNT_STAGE || component.mountStage === DID_MOUNT_STAGE)) {
                                            component.mutationOccurred = true;
                                            component.setState(() => reflectedState);
                                            component.forceUpdate();
                                            Hf.log(`info0`, `State mutated for component:${component.props.name}.`);
                                            Hf.log(`info0`, `Forced update for component:${component.props.name}.`);
                                        }
                                    });
                                }

                                // if (alwaysUpdateAsParent && Hf.isDefined(component.props.children)) {
                                if (alwaysUpdateAsParent) {
                                    component.mutationOccurred = true;
                                }

                                const defaultProperty = component.props.intf.getStateAsObject();

                                /* needs to sync up interface state and component props before mounting.
                                   This is needed because componentWillReceiveProps is not called right after mounting. */
                                if (component.props.intf.reduceState(Hf.fallback(defaultProperty).of(Hf.mix(component.props, {
                                    exclusion: {
                                        enumerablePropertiesOnly: true,
                                        keys: [ `*` ],
                                        exception: {
                                            keys: Object.keys(defaultProperty).filter((key) => key !== `name` && key !== `fId`)
                                        }
                                    }
                                }).with({})))) {
                                    component.mutationOccurred = true;
                                    Hf.log(`info0`, `Property mutated for component:${component.props.name}.`);
                                }
                                component.outgoing(`on-component-${component.props.name}-${component.props.fId}-will-mount`).emit(() => component);
                            };
                            /**
                             * @description - React method for when component will get props.
                             *
                             * @method componentWillReceiveProps
                             * @param {object} nextProperty
                             * @returns void
                             */
                            this.componentWillReceiveProps = function componentWillReceiveProps (nextProperty) {
                                const component = this;
                                /* interface tracks new props mutation when component receive new props.
                                   This will do necessary mutation on interface state. */
                                const currentProperty = component.getStateAsObject();
                                const defaultProperty = component.props.intf.getStateAsObject();

                                // if (alwaysUpdateAsParent && Hf.isDefined(component.props.children)) {
                                if (alwaysUpdateAsParent) {
                                    component.mutationOccurred = true;
                                }

                                if (component.props.intf.reduceState(Hf.fallback(currentProperty).of(Hf.mix(nextProperty, {
                                    exclusion: {
                                        enumerablePropertiesOnly: true,
                                        keys: [ `*` ],
                                        exception: {
                                            keys: Object.keys(defaultProperty).filter((key) => key !== `name` && key !== `fId`)
                                        }
                                    }
                                }).with({})))) {
                                    /* The interface will detect mutation when component gets new props and update accordingly */
                                    component.mutationOccurred = true;
                                    Hf.log(`info0`, `Property mutated for component:${component.props.name}.`);

                                    component.outgoing(`on-component-${component.props.name}-${component.props.fId}-will-receive-property`).emit(() => component);
                                }
                            };
                            /**
                             * @description - React method for setting up component after mounting.
                             *
                             * @method componentDidMount
                             * @returns void
                             */
                            this.componentDidMount = function componentDidMount () {
                                const component = this;

                                component.mountStage = DID_MOUNT_STAGE;

                                component.outgoing(`on-component-${component.props.name}-${component.props.fId}-did-mount`).emit(() => component);
                            };
                            /**
                             * @description - React method for tearing down component before unmounting.
                             *
                             * @method componentWillMount
                             * @returns void
                             */
                            this.componentWillUnmount = function componentWillUnmount () {
                                const component = this;

                                component.mountStage = WILL_UNMOUNT_STAGE;

                                component.outgoing(`on-component-${component.props.name}-${component.props.fId}-will-unmount`).emit(() => component);
                            };
                            /**
                             * @description - React method for preparing component before updating.
                             *
                             * @method componentWillUpdate
                             * @returns void
                             */
                            this.componentWillUpdate = function componentWillUpdate () {
                                const component = this;

                                component.outgoing(`on-component-${component.props.name}-${component.props.fId}-will-update`).emit(() => component);
                            };
                            /**
                             * @description - React method for preparing component after updating.
                             *
                             * @method componentDidUpdate
                             * @returns void
                             */
                            this.componentDidUpdate = function componentDidUpdate () {
                                const component = this;

                                component.outgoing(`on-component-${component.props.name}-${component.props.fId}-did-update`).emit(() => component);
                            };
                            /**
                             * @description - React method for checking if component should update.
                             *
                             * @method shouldComponentUpdate
                             * @returns {boolean}
                             */
                            this.shouldComponentUpdate = function shouldComponentUpdate () {
                                const component = this;

                                if (component.mutationOccurred) {
                                    component.mutationOccurred = false;
                                    Hf.log(`info1`, `Rendering component:${component.props.name}.`);

                                    return true;
                                } else { // eslint-disable-line
                                    Hf.log(`info1`, `Skipped rendering for component:${component.props.name}.`);

                                    return false;
                                }
                            };
                        }
                    }
                }).mixin(intf).resolve())();

                Component = CreateReactClass(IntfComponentWrapper);

                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(Component)) {
                        Hf.log(`error`, `ReactComponentComposite.toComponent - Interface:${intf.name} React component is invalid.`);
                    }
                }

                return Component;
            };
        }
    }
});
