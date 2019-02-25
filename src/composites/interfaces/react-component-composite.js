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

import CommonElement from '../../core/elements/common-element';

import CompositeElement from '../../core/elements/composite-element';

const DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS = [
    /* interface reserved method prefixes */
    `on`,
    `do`,
    `handle`,
    `animate`,
    `render`
];

const DEFAULT_COMPONENT_FN_AND_PROPERTY_INCLUSIONS = [
    `outgoing`,
    `getComponentComposites`,
    `getInterfaceComposites`
];

const Hf = CommonElement();

export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactComponentComposite
         * @return void
         */
        $initReactComponentComposite () {
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
                        setState: `function`,
                        forceUpdate: `function`,
                        componentWillMount: `function`,
                        componentWillReceiveProps: `function`,
                        componentDidMount: `function`,
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
         * @description - Handle logic at component after updating stage.
         *
         * @method onCompleteUpdating
         * @param {function} handler
         * @return void
         */
        onCompleteUpdating (handler) {
            const intf = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(handler)) {
                    Hf.log(`error`, `ReactComponentComposite.onCompleteUpdating - Input handler function is invalid.`);
                }
            }
            intf.incoming(`on-component-${intf.name}-${intf.fId}-did-update`).handle((component) => handler(component));
        }
    },
    enclosure: {
        ReactComponentComposite () {
            /* ----- Private Variables ------------- */
            let _mounted = false;
            /* ----- Public Functions -------------- */
            /**
             * @description - Check if interface has a component that is mounted
             *
             * @method isMounted
             * @return {boolean}
             */
            this.isMounted = function () {
                return _mounted;
            };
            /**
             * @description - Handle logic at component mounting stage.
             *
             * @method onMounting
             * @param {function} handler
             * @return void
             */
            this.onMounting = function (handler) {
                const intf = this;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(handler)) {
                        Hf.log(`error`, `ReactComponentComposite.onMounting - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-${intf.fId}-did-mount`).handle((component) => {
                    _mounted = true;
                    handler(component);
                });
            };
            /**
             * @description - Handle logic at component dismounting stage.
             *
             * @method onDismounting
             * @param {function} handler
             * @return void
             */
            this.onDismounting = function (handler) {
                const intf = this;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isFunction(handler)) {
                        Hf.log(`error`, `ReactComponentComposite.onDismounting - Input handler function is invalid.`);
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
            this.toComponent = function (option = {
                alwaysUpdateAsParent: true,
                fnPrefixInclusions: [],
                fnAndPropertyInclusions: []
            }) {
                const intf = this;
                const {
                    React,
                    PropTypes
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

                if (intf.isMounted()) {
                    Hf.log(`error`, `ReactComponentComposite.toComponent - Interface:${intf.name} already have a mounted component.`);
                }

                if (Hf.DEVELOPMENT) {
                    if (!Hf.isSchema({
                        Component: `function`
                    }).of(React)) {
                        Hf.log(`error`, `ReactComponentComposite.toComponent - React library is invalid.`);
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

                const Component = class Component extends React.Component {
                    // static defaultProps = intf.getStateAsObject();
                    // static propTypes = (() => {
                    //     let propTypes = Object.keys(intf.getStateAsObject()).reduce((propType, key) => {
                    //         if (intf.getStateCursor().isItemStronglyTyped(key)) {
                    //             const propertyTypeAliasKey = Hf.typeOf(intf.getStateAsObject()[key]);
                    //             if (reactPropTypeAlias.hasOwnProperty(propertyTypeAliasKey)) {
                    //                 if (intf.getStateCursor().isItemRequired(key)) {
                    //                     propType[key] = reactPropTypeAlias[propertyTypeAliasKey].isRequired;
                    //                 } else {
                    //                     propType[key] = reactPropTypeAlias[propertyTypeAliasKey];
                    //                 }
                    //             }
                    //         }
                    //         return propType;
                    //     }, {});
                    //
                    //     return Object.keys(intf.getStateAsObject()).reduce((propType, key) => {
                    //         if (intf.getStateCursor().isItemOneOfValues(key)) {
                    //             const {
                    //                 condition: values
                    //             } = intf.getStateCursor().getItemDescription(key).ofConstrainable().getConstraint(`oneOf`);
                    //             propType[key] = PropTypes.oneOf(values);
                    //         }
                    //         if (intf.getStateCursor().isItemOneOfTypes(key)) {
                    //             const {
                    //                 condition: types
                    //             } = intf.getStateCursor().getItemDescription(key).ofConstrainable().getConstraint(`oneTypeOf`);
                    //             propType[key] = PropTypes.oneOfType(types.map((typeAliasKey) => {
                    //                 return reactPropTypeAlias[typeAliasKey];
                    //             }));
                    //         }
                    //         return propType;
                    //     }, propTypes);
                    // })();
                    constructor (props) {
                        super(props);
                        const component = this;
                        component.refCache = {};
                        component.mutationOccurred = false;
                        component.state = !intf.isStateless() ? intf.getInitialReflectedState() : null;

                        Object.entries(Hf.mix(intf, option = {
                            exclusion: {
                                keys: [ `*` ],
                                properties: true,
                                exception: {
                                    prefixes: DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS.concat(fnPrefixInclusions),
                                    keys: DEFAULT_COMPONENT_FN_AND_PROPERTY_INCLUSIONS.concat(fnAndPropertyInclusions)
                                }
                            }
                        }).with({})).forEach(([ key, value ]) => {
                            if (Hf.isFunction(value)) {
                                const autobind = DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS.some((prefix) => key.substr(0, prefix.length) === prefix);
                                if (autobind) {
                                    component[key] = value.bind(component);
                                } else {
                                    component[key] = value;
                                }
                            }
                        });
                    }
                    /**
                     * @description - Assign the registered component's reference object.
                     *
                     * @method assignComponentRef
                     * @param {string} refName
                     * @returns function
                     */
                    assignComponentRef (refName) {
                        const component = this;

                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isString(refName)) {
                                Hf.log(`error`, `ReactComponentComposite.assignComponentRef - Input component reference name is invalid.`);
                            }
                        }

                        /* helper function to set component ref */
                        const setComponentRef = function (componentRef) {
                            component.refCache[refName] = Hf.isDefined(componentRef) ? componentRef : null;
                        };
                        return setComponentRef;
                    }
                    /**
                     * @description - Lookup the registered component's reference object.
                     *
                     * @method lookupComponentRefs
                     * @param {array} refNames
                     * @returns {array}
                     */
                    lookupComponentRefs (...refNames) {
                        const component = this;
                        let componentRefs = [];

                        if (Hf.isNonEmptyArray(refNames)) {
                            if (Hf.DEVELOPMENT) {
                                if (!refNames.every((refName) => Hf.isString(refName))) {
                                    Hf.log(`error`, `ReactComponentComposite.lookupComponentRefs - Input component reference name is invalid.`);
                                } else if (!refNames.every((refName) => component.refCache.hasOwnProperty(refName))) {
                                    Hf.log(`warn0`, `ReactComponentComposite.lookupComponentRefs - Component reference is not found.`);
                                    return Array(refNames.length).fill(null);
                                }
                            }

                            componentRefs = Hf.collect(...refNames).from(component.refCache);
                        } else {
                            Hf.log(`error`, `ReactComponentComposite.lookupComponentRefs - Input component reference name array is empty.`);
                        }

                        return componentRefs;
                    }
                    /**
                     * @description - React method for setting up component after mounting.
                     *
                     * @method componentDidMount
                     * @returns void
                     */
                    componentDidMount () {
                        const component = this;

                        if (!intf.isStateless()) {
                            /* this event is call ONLY when the state did mutate in store */
                            intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                                if (Hf.isObject(reflectedState)) {
                                    component.setState(() => reflectedState, () => {
                                        component.mutationOccurred = true;
                                        Hf.log(`info0`, `State mutated for component:${component.props.name}.`);
                                    });
                                }
                            });
                            /* this event is call ONLY when the state did mutate in store and FORCE component to update */
                            intf.incoming(`as-state-forced-to-mutate`).handle((reflectedState) => {
                                if (Hf.isObject(reflectedState)) {
                                    component.setState(() => reflectedState, () => {
                                        component.mutationOccurred = true;
                                        component.forceUpdate();
                                        Hf.log(`info0`, `State mutated for component:${component.props.name}.`);
                                        Hf.log(`info0`, `Forced update for component:${component.props.name}.`);
                                    });
                                }
                            });
                        }

                        // if (alwaysUpdateAsParent && Hf.isDefined(component.props.children)) {
                        if (alwaysUpdateAsParent) {
                            component.mutationOccurred = true;
                        }

                        const defaultProperty = intf.getStateAsObject();

                        /* needs to sync up interface state and component props after mounting */
                        if (intf.reduceState(Hf.fallback(defaultProperty).of(Hf.mix(component.props, {
                            exclusion: {
                                enumerablePropertiesOnly: true,
                                keys: [ `*` ],
                                exception: {
                                    keys: Object.keys(defaultProperty).filter((key) => key !== `name` && key !== `fId` && key !== `intf`)
                                }
                            }
                        }).with({})))) {
                            component.mutationOccurred = true;
                            Hf.log(`info0`, `Property mutated for component:${component.props.name}.`);
                        }
                        component.outgoing(`on-component-${component.props.name}-${component.props.fId}-did-mount`).emit(() => component);
                    }
                    /**
                     * @description - React method for tearing down component before unmounting.
                     *
                     * @method componentWillMount
                     * @returns void
                     */
                    componentWillUnmount () {
                        const component = this;

                        component.outgoing(`on-component-${component.props.name}-${component.props.fId}-will-unmount`).emit(() => component);
                    }
                    /**
                     * @description - React method for preparing component after updating.
                     *
                     * @method componentDidUpdate
                     * @returns void
                     */
                    componentDidUpdate () {
                        const component = this;

                        component.outgoing(`on-component-${component.props.name}-${component.props.fId}-did-update`).emit(() => component);
                    }
                    /**
                     * @description - React method for checking if component should update.
                     *
                     * @method shouldComponentUpdate
                     * @returns {boolean}
                     */
                    shouldComponentUpdate () {
                        const component = this;

                        if (component.mutationOccurred) {
                            component.mutationOccurred = false;
                            Hf.log(`info1`, `Rendering component:${component.props.name}.`);

                            return true;
                        } else { // eslint-disable-line
                            Hf.log(`info1`, `Skipped rendering for component:${component.props.name}.`);

                            return false;
                        }
                    }
                };
                Component.defaultProps = intf.getStateAsObject();
                Component.propTypes = (() => {
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
