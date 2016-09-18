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
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../core/elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

const EXCEPTION_KEYS = [
    /* react specific methods and properties */
    `render`,
    `propTypes`,
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
    // `outgoing`,
    // `incoming`,
    `getInterface`,
    `assignComponentRef`,
    `lookupComponentRefs`,
    `getComponentLib`,
    `getComponentComposites`
];

const REACT_DEFINITION_EXCLUSION = {
    keys: [ `*` ],
    exception: {
        prefixes: [
            `on`,
            `handle`,
            `render`
        ],
        keys: EXCEPTION_KEYS
    }
};

/**
 * @description - A React component factory composite module.
 *
 * @module ReactComponentComposite
 * @return {object}
 */
export default CompositeElement({
    enclosure: {
        ReactComponentComposite: function ReactComponentComposite () {
            /* ----- Private Variables ------------- */
            let _mutationOccurred = false;
            /* ----- Public Functions -------------- */
            /**
             * @description - Initialized and check that factory is valid for this composite.
             *
             * @method $initReactComponentComposite
             * @return void
             */
            this.$initReactComponentComposite = function $initReactComponentComposite () {
                const intf = this;
                if (Hflow.DEVELOPMENT) {
                    if (!Hflow.isSchema({
                        name: `string`,
                        isStateless: `function`,
                        incoming: `function`,
                        outgoing: `function`,
                        getStateCursor: `function`,
                        getStateAsObject: `function`,
                        getComponentLib: `function`,
                        getInitialReflectedState: `function`
                    }).of(intf)) {
                        Hflow.log(`error`, `ReactComponentComposite.$init - Interface is invalid. Cannot apply composite.`);
                    } else {
                        const cursor = intf.getStateCursor();
                        if (!Hflow.isSchema({
                            forEach: `function`,
                            isItemComputable: `function`,
                            isItemObservable: `function`
                        }).of(cursor)) {
                            Hflow.log(`error`, `StateHistoryTraversalComposite.$init - Interface state curcor is invalid. Cannot apply composite.`);
                        } else {
                            cursor.forEach((value, key) => {
                                if (key !== `fId`) {
                                    if (cursor.isItemComputable(key)) {
                                        Hflow.log(`error`, `ReactComponentComposite.$init - Computable state key:${key} is not allowed for interface. Cannot apply composite.`);
                                    }
                                    if (cursor.isItemObservable(key)) {
                                        Hflow.log(`error`, `ReactComponentComposite.$init - Observable state key:${key} is not allowed for interface. Cannot apply composite.`);
                                    }
                                }
                            });
                        }
                        if (Hflow.isSchema({
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
                            Hflow.log(`warn1`, `ReactComponentComposite.toComponent - Interface:${intf.name} should not have internally reverved React lifecyle methods defined.`);
                        }
                    }
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
                const intf = this;
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.preMountStage - Input handler function is invalid.`);
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
            };
            /**
             * @description - Handle logic at component postmounting stage.
             *
             * @method postMountStage
             * @param {function} handler
             * @return void
             */
            this.postMountStage = function postMountStage (handler) {
                const intf = this;
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.postMountStage - Input handler function is invalid.`);
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
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.preDismountStage - Input handler function is invalid.`);
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
            };
            /**
             * @description - Handle logic at component postdismounting stage.
             *
             * @method postDismountStage
             * @param {function} handler
             * @return void
             */
            this.postDismountStage = function postDismountStage (handler) {
                const intf = this;
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.postDismountStage - Input handler function is invalid.`);
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
            };
            /**
             * @description - Handle logic at component prepare to update stage.
             *
             * @method preUpdateStage
             * @param {function} handler
             * @return void
             */
            this.preUpdateStage = function preUpdateStage (handler) {
                const intf = this;
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.preUpdateStage - Input handler function is invalid.`);
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
            };
            /**
             * @description - Handle logic at component after updating stage.
             *
             * @method postUpdateStage
             * @param {function} handler
             * @return void
             */
            this.postUpdateStage = function postUpdateStage (handler) {
                const intf = this;
                if (!Hflow.isFunction(handler)) {
                    Hflow.log(`error`, `ReactComponentComposite.postUpdateStage - Input handler function is invalid.`);
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
            };
            /**
             * @description - Convert composite to a renderable component.
             *
             * @method toComponent
             * @returns {object}
             */
            this.toComponent = function toComponent () {
                const intf = this;
                const {
                    React
                } = intf.getComponentLib();
                if (!Hflow.isSchema({
                    PropTypes: `object`,
                    createClass: `function`
                }).of(React)) {
                    Hflow.log(`error`, `ReactComponentComposite.toComponent - React component is invalid.`);
                } else {
                    const stateless = intf.isStateless();
                    const defaultProperty = intf.getStateAsObject();
                    const reactDefinition = CompositeElement({
                        exclusion: REACT_DEFINITION_EXCLUSION,
                        enclosure: {
                            ReactDefinition: function ReactDefinition () {
                                /* ----- Public Functions -------------- */
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
                                 * @description - Get this component's interface.
                                 *
                                 * @method getInterface
                                 * @return {object}
                                 */
                                this.getInterface = function getInterface () {
                                    return intf;
                                };
                                /**
                                 * @description - React method for setting up component before mounting.
                                 *
                                 * @method componentWillMount
                                 * @returns void
                                 */
                                this.componentWillMount = function componentWillMount () {
                                    const component = this;
                                    // if (!stateless) {
                                    //     /* this event is call ONLY when the state did mutate in store */
                                    //     intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                                    //         if (Hflow.isObject(reflectedState)) {
                                    //             component.setState(reflectedState);
                                    //             _mutationOccurred = true;
                                    //             Hflow.log(`info`, `State mutated for component:${component.props.name}.`);
                                    //         }
                                    //     });
                                    // }
                                    /* needs to sync up interface state and component props before mounting.
                                       This is needed because componentWillReceiveProps is not called right after mounting. */
                                    if (intf.mutateState(component.props)) {
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hflow.log(`info`, `Props mutated for component:${component.props.name}.`);
                                    }
                                    intf.outgoing(`on-component-will-mount`).emit(() => component);
                                };
                                /**
                                 * @description - React method for when component will get props.
                                 *
                                 * @method componentWillReceiveProps
                                 * @param {object} nextProps
                                 * @returns void
                                 */
                                this.componentWillReceiveProps = function componentWillReceiveProps (nextProps) {
                                    const component = this;
                                    /* The interface tracks new props mutation when component receive new props.
                                       This will do necessary mutation on interface state. */
                                    if (intf.mutateState(nextProps)) {
                                        /* The interface will detect mutation when component gets new props and update accordingly */
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hflow.log(`info`, `Props mutated for component:${component.props.name}.`);
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
                                    if (!stateless) {
                                        /* this event is call ONLY when the state did mutate in store */
                                        intf.incoming(`as-state-mutated`).handle((reflectedState) => {
                                            if (Hflow.isObject(reflectedState)) {
                                                component.setState(reflectedState);
                                                _mutationOccurred = true;
                                                Hflow.log(`info`, `State mutated for component:${component.props.name}.`);
                                            }
                                        });
                                    }
                                    if (intf.mutateState(component.props)) {
                                        intf.updateStateAccessor();
                                        _mutationOccurred = true;
                                        Hflow.log(`info`, `Props mutated for component:${component.props.name}.`);
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
                                        Hflow.log(`info`, `Render updated for component:${component.props.name}.`);
                                    } else {
                                        // Hflow.log(`info`, `Render skipped update for component:${component.props.name}.`);
                                    }
                                    return shouldUpdate;
                                };
                            }
                        }
                    }).mixin(intf);
                    const reactPropTypeAlias = {
                        boolean: React.PropTypes.bool.isRequired,
                        array: React.PropTypes.array.isRequired,
                        object: React.PropTypes.object.isRequired,
                        function: React.PropTypes.func.isRequired,
                        string: React.PropTypes.string.isRequired,
                        number: React.PropTypes.number.isRequired
                    };
                    const ReactProduct = reactDefinition.mixin({
                        propTypes: (() => {
                            return Object.keys(defaultProperty).reduce((propType, key) => {
                                const typeAliasKey = Hflow.typeOf(defaultProperty[key]);
                                if (reactPropTypeAlias.hasOwnProperty(typeAliasKey)) {
                                    propType[key] = reactPropTypeAlias[typeAliasKey];
                                }
                                return propType;
                            }, {});
                        })()
                    }).resolve();
                    const reactComponent = React.createClass(ReactProduct());
                    if (!Hflow.isFunction(reactComponent)) {
                        Hflow.log(`error`, `ReactComponentComposite.toComponent - Unable to initialize a React component.`);
                    } else {
                        return reactComponent;
                    }
                }
            };
        }
    }
});
