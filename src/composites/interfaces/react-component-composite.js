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
 * @description - A React component factory composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../core/elements/composite-element';

/* load CommonElement */
import CommonElement from '../../core/elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

const WILL_MOUNT_STAGE = 0;
const DID_MOUNT_STAGE = 1;
const WILL_UNMOUNT_STAGE = 2;

const EXCEPTION_KEYS = [
    /* react specific methods and properties */
    `propTypes`,
    `defaultProps`,
    `setNativeProps`,
    `getDefaultProps`,
    `getInitialState`,
    `componentWillMount`,
    `componentDidMount`,
    `componentWillReceiveProps`,
    `shouldComponentUpdate`,
    `componentWillUpdate`,
    `componentDidUpdate`,
    `componentWillUnmount`,
    `shouldComponentUpdate`,
    /* interface specific methods and properties */
    `getInterface`,
    `assignComponentRef`,
    `lookupComponentRefs`,
    `getComponentComposites`
];

const PURE_EXCEPTION_KEYS = [
    /* react specific methods and properties */
    `propTypes`,
    `defaultProps`,
    `setNativeProps`,
    `pureRender`,
    /* interface specific methods and properties */
    `getInterface`,
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
export default CompositeElement({
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
                    updateStateAccessor: `function`,
                    getStateCursor: `function`,
                    getStateAsObject: `function`,
                    getComponentLib: `function`,
                    getInitialReflectedState: `function`
                }).of(intf)) {
                    Hf.log(`error`, `ReactComponentComposite.$init - Interface is invalid. Cannot apply composite.`);
                } else {
                    if (Hf.isSchema({
                        getDefaultProps: `function`,
                        getInitialState: `function`,
                        componentWillMount: `function`,
                        componentDidMount: `function`,
                        componentWillReceiveProps: `function`,
                        componentWillUpdate: `function`,
                        componentDidUpdate: `function`,
                        componentWillUnmount: `function`,
                        shouldComponentUpdate: `function`
                    }).of(intf)) {
                        Hf.log(`warn1`, `ReactComponentComposite.toComponent - Interface:${intf.name} should not have internally reverved React lifecyle methods defined.`);
                    }
                }
            }
        },
        /**
         * @description - Handle logic at component premounting stage.
         *
         * @method preMountStage
         * @param {function} handler
         * @return void
         */
        preMountStage: function preMountStage (handler) {
            const intf = this;
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.preMountStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-will-mount`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-will-mount`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
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
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.postMountStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-did-mount`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-did-mount`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
            }
        },
        /**
         * @description - Handle logic at component predismounting stage.
         *
         * @method preDismountStage
         * @param {function} handler
         * @return void
         */
        preDismountStage: function preDismountStage (handler) {
            const intf = this;
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.preDismountStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-will-unmount`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-will-unmount`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
            }
        },
        /**
         * @description - Handle logic at component postdismounting stage.
         *
         * @method postDismountStage
         * @param {function} handler
         * @return void
         */
        postDismountStage: function postDismountStage (handler) {
            const intf = this;
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.postDismountStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-did-unmount`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-did-unmount`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
            }
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
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.preUpdateStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-will-update`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-will-update`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
            }
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
            if (!Hf.isFunction(handler)) {
                Hf.log(`error`, `ReactComponentComposite.postUpdateStage - Input handler function is invalid.`);
            } else {
                // intf.incoming(`on-component-did-update`).filter((component) => component.props.fId === intf.fId).handle((component) => {
                //     handler(component);
                // });
                intf.incoming(`on-component-did-update`).handle((component) => {
                    if (component.props.fId === intf.fId) {
                        handler(component);
                    }
                });
            }
        }
    },
    enclosure: {
        ReactComponentComposite: function ReactComponentComposite () {
            /* ----- Private Variables ------------- */
            let _mutationOccurred = false;
            let _mountStage = WILL_MOUNT_STAGE;
            /* ----- Public Functions -------------- */
            /**
             * @description - Convert composite to a renderable pure component.
             *
             * @method toPureComponent
             * @returns {object}
             */
            this.toPureComponent = function toPureComponent () {
                const intf = this;
                const stateless = intf.isStateless();
                const stateCursor = intf.getStateCursor();
                if (!stateless) {
                    Hf.log(`error`, `ReactComponentComposite.toPureComponent - Interface:${intf.name} is stateful. Cannot create pure React compoenent.`);
                } else {
                    const {
                        React
                    } = intf.getComponentLib();
                    if (!Hf.isSchema({
                        PropTypes: `object`,
                        createClass: `function`
                    }).of(React)) {
                        Hf.log(`error`, `ReactComponentComposite.toPureComponent - React component is invalid.`);
                    } else {
                        const defaultProperty = intf.getStateAsObject();
                        const reactPropTypeAlias = {
                            boolean: React.PropTypes.bool,
                            array: React.PropTypes.array,
                            object: React.PropTypes.object,
                            function: React.PropTypes.func,
                            string: React.PropTypes.string,
                            number: React.PropTypes.number
                        };
                        const reactPureDefinition = (CompositeElement({
                            exclusion: {
                                keys: [ `*` ],
                                exception: {
                                    prefixes: [
                                        `on`,
                                        `handle`,
                                        `render`
                                    ],
                                    keys: PURE_EXCEPTION_KEYS
                                }
                            },
                            enclosure: {
                                ReactPureDefinition: function ReactPureDefinition () {
                                    /* set react property type checking */
                                    this.propTypes = (() => {
                                        let _propTypes = Object.keys(defaultProperty).reduce((propType, key) => {
                                            if (stateCursor.isItemStronglyTyped(key)) {
                                                const propertyTypeAliasKey = Hf.typeOf(defaultProperty[key]);
                                                if (reactPropTypeAlias.hasOwnProperty(propertyTypeAliasKey)) {
                                                    if (stateCursor.isItemRequired(key)) {
                                                        propType[key] = reactPropTypeAlias[propertyTypeAliasKey].isRequired;
                                                    } else {
                                                        propType[key] = reactPropTypeAlias[propertyTypeAliasKey];
                                                    }
                                                }
                                            }
                                            return propType;
                                        }, {});

                                        return Object.keys(defaultProperty).reduce((propType, key) => {
                                            if (stateCursor.isItemOneOfValues(key)) {
                                                const {
                                                    condition: types
                                                } = stateCursor.getItemDescription(key).ofConstrainable().getConstraint(`oneOf`);
                                                propType[key] = React.PropTypes.oneOf(types);
                                            }
                                            if (stateCursor.isItemOneOfTypes(key)) {
                                                const {
                                                    condition: types
                                                } = stateCursor.getItemDescription(key).ofConstrainable().getConstraint(`oneTypeOf`);
                                                propType[key] = React.PropTypes.oneOfType(types.map((typeAliasKey) => {
                                                    return reactPropTypeAlias[typeAliasKey];
                                                }));
                                            }
                                            return propType;
                                        }, _propTypes);
                                    })();
                                    /* set react default property */
                                    this.defaultProps = defaultProperty;
                                }
                            }
                        }).mixin(intf).resolve())();
                        if (!Hf.isSchema({
                            pureRender: `function`
                        }).of(reactPureDefinition)) {
                            Hf.log(`error`, `ReactComponentComposite.toPureComponent - React pure component definition is invalid.`);
                        } else {
                            let {
                                pureRender: reactPureFunctionalComponent
                            } = reactPureDefinition;

                            reactPureFunctionalComponent = reactPureFunctionalComponent.bind(reactPureDefinition);

                            /* allow React pure component function access to React propTypes */
                            reactPureFunctionalComponent.propTypes = reactPureDefinition.propTypes;

                            /* allow React pure component function access to default property */
                            reactPureFunctionalComponent.defaultProps = reactPureDefinition.defaultProps;

                            return reactPureFunctionalComponent;
                        }
                    }
                }
            };
            /**
             * @description - Convert composite to a renderable component.
             *
             * @method toComponent
             * @returns {object}
             */
            this.toComponent = function toComponent () {
                const intf = this;
                const stateCursor = intf.getStateCursor();
                const {
                    React
                } = intf.getComponentLib();
                if (!Hf.isSchema({
                    PropTypes: `object`,
                    createClass: `function`
                }).of(React)) {
                    Hf.log(`error`, `ReactComponentComposite.toComponent - React component is invalid.`);
                } else {
                    const stateless = intf.isStateless();
                    const defaultProperty = intf.getStateAsObject();
                    const reactPropTypeAlias = {
                        boolean: React.PropTypes.bool,
                        array: React.PropTypes.array,
                        object: React.PropTypes.object,
                        function: React.PropTypes.func,
                        string: React.PropTypes.string,
                        number: React.PropTypes.number
                    };
                    const reactDefinition = (CompositeElement({
                        exclusion: {
                            keys: [ `*` ],
                            exception: {
                                prefixes: [
                                    `on`,
                                    `handle`,
                                    `render`
                                ],
                                keys: EXCEPTION_KEYS
                            }
                        },
                        enclosure: {
                            ReactDefinition: function ReactDefinition () {
                                /* set react property type checking */
                                this.propTypes = (() => {
                                    let _propTypes = Object.keys(defaultProperty).reduce((propType, key) => {
                                        if (stateCursor.isItemStronglyTyped(key)) {
                                            const propertyTypeAliasKey = Hf.typeOf(defaultProperty[key]);
                                            if (reactPropTypeAlias.hasOwnProperty(propertyTypeAliasKey)) {
                                                if (stateCursor.isItemRequired(key)) {
                                                    propType[key] = reactPropTypeAlias[propertyTypeAliasKey].isRequired;
                                                } else {
                                                    propType[key] = reactPropTypeAlias[propertyTypeAliasKey];
                                                }
                                            }
                                        }
                                        return propType;
                                    }, {});

                                    return Object.keys(defaultProperty).reduce((propType, key) => {
                                        if (stateCursor.isItemOneOfValues(key)) {
                                            const {
                                                condition: types
                                            } = stateCursor.getItemDescription(key).ofConstrainable().getConstraint(`oneOf`);
                                            propType[key] = React.PropTypes.oneOf(types);
                                        }
                                        if (stateCursor.isItemOneOfTypes(key)) {
                                            const {
                                                condition: types
                                            } = stateCursor.getItemDescription(key).ofConstrainable().getConstraint(`oneTypeOf`);
                                            propType[key] = React.PropTypes.oneOfType(types.map((typeAliasKey) => {
                                                return reactPropTypeAlias[typeAliasKey];
                                            }));
                                        }
                                        return propType;
                                    }, _propTypes);
                                })();
                                /* ----- Public Functions -------------- */
                                /**
                                 * @description - Get this component's interface.
                                 *
                                 * @method getInterface
                                 * @return {object}
                                 */
                                this.getInterface = function getInterface () {
                                    return intf;
                                };
                                /**
                                 * @description - React method for getting the default prop values.
                                 *
                                 * @method getDefaultProps
                                 * @returns {object}
                                 */
                                this.getDefaultProps = function getDefaultProps () {
                                    return defaultProperty;
                                };
                                /**
                                 * @description - React method for getting the initial state values.
                                 *
                                 * @method getInitialState
                                 * @returns {object}
                                 */
                                this.getInitialState = function getInitialState () {
                                    if (stateless) {
                                        _mutationOccurred = false;
                                        return {};
                                    } else { // eslint-disable-line
                                        _mutationOccurred = true;
                                        return intf.getInitialReflectedState();
                                    }
                                };
                                /**
                                 * @description - React method for setting up component before mounting.
                                 *
                                 * @method componentWillMount
                                 * @returns void
                                 */
                                this.componentWillMount = function componentWillMount () {
                                    const component = this;

                                    _mountStage = WILL_MOUNT_STAGE;

                                    /* needs to sync up interface state and component props before mounting.
                                       This is needed because componentWillReceiveProps is not called right after mounting. */
                                    if (intf.reduceState(Hf.fallback(defaultProperty).of(component.props))) {
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hf.log(`info`, `Property mutated for component:${component.props.name}.`);
                                    }
                                    intf.outgoing(`on-component-will-mount`).emit(() => component);
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
                                    /* The interface tracks new props mutation when component receive new props.
                                       This will do necessary mutation on interface state. */
                                    const currentProperty = intf.getStateAsObject();
                                    if (intf.reduceState(Hf.fallback(currentProperty).of(nextProperty))) {
                                        /* The interface will detect mutation when component gets new props and update accordingly */
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hf.log(`info`, `Property mutated for component:${component.props.name}.`);
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

                                    _mountStage = DID_MOUNT_STAGE;

                                    if (!stateless) {
                                        /* this event is call ONLY when the state did mutate in store */
                                        intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                                            if (Hf.isObject(reflectedState) && _mountStage === DID_MOUNT_STAGE) {
                                            // if (Hf.isObject(reflectedState) && !(_mountStage === WILL_MOUNT_STAGE || _mountStage === WILL_UNMOUNT_STAGE)) {
                                                component.setState(reflectedState);
                                                _mutationOccurred = true;
                                                Hf.log(`info`, `State mutated for component:${component.props.name}.`);
                                            }
                                        });
                                    }
                                    const currentProperty = intf.getStateAsObject();
                                    if (intf.reduceState(Hf.fallback(currentProperty).of(component.props))) {
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hf.log(`info`, `Property mutated for component:${component.props.name}.`);
                                    }
                                    intf.outgoing(`on-component-did-mount`).emit(() => component);
                                };
                                /**
                                 * @description - React method for tearing down component before unmounting.
                                 *
                                 * @method componentWillMount
                                 * @returns void
                                 */
                                this.componentWillUnmount = function componentWillUnmount () {
                                    const component = this;

                                    _mountStage = WILL_UNMOUNT_STAGE;

                                    intf.outgoing(`on-component-will-unmount`).emit(() => component);
                                };
                                /**
                                 * @description - React method for preparing component before updating.
                                 *
                                 * @method componentWillUpdate
                                 * @returns void
                                 */
                                this.componentWillUpdate = function componentWillUpdate () {
                                    const component = this;
                                    intf.outgoing(`on-component-will-update`).emit(() => component);
                                };
                                /**
                                 * @description - React method for preparing component after updating.
                                 *
                                 * @method componentDidUpdate
                                 * @returns void
                                 */
                                this.componentDidUpdate = function componentDidUpdate () {
                                    const component = this;
                                    intf.outgoing(`on-component-did-update`).emit(() => component);
                                };
                                /**
                                 * @description - React method for checking if component should update.
                                 *
                                 * @method shouldComponentUpdate
                                 * @returns {boolean}
                                 */
                                this.shouldComponentUpdate = function shouldComponentUpdate () {
                                    const component = this;
                                    let shouldUpdate = false;
                                    if (_mutationOccurred) {
                                        _mutationOccurred = false;
                                        shouldUpdate = true;
                                        Hf.log(`info`, `Render updated for component:${component.props.name}.`);
                                    } else {
                                        // Hf.log(`info`, `Render skipped update for component:${component.props.name}.`);
                                    }
                                    return shouldUpdate;
                                };
                            }
                        }
                    }).mixin(intf).resolve())();
                    let reactComponent = React.createClass(reactDefinition);

                    /* allow React factory function access to the get interface function */
                    reactComponent.getInterface = reactDefinition.getInterface;

                    if (!Hf.isFunction(reactComponent)) {
                        Hf.log(`error`, `ReactComponentComposite.toPureComponent - React component definition is invalid.`);
                    } else {
                        return reactComponent;
                    }
                }
            };
        }
    }
});
