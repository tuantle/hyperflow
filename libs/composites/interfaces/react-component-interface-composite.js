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
 * @module ReactComponentInterfaceComposite
 * @description - A React component interface factory composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

import React from 'react';

import PropTypes from 'prop-types';

import {
    ENV,
    isFunction,
    isObject,
    isSchema,
    fallback,
    mix,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

const DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS = [
    /* interface reserved method prefixes */
    `on`,
    `animate`
];

const DEFAULT_COMPONENT_FN_INCLUSIONS = [
    `outgoing`,
    `getChildInterfacedComponents`
];

const DEFAULT_COMPONENT_STATICS = [
    `contextType`,
    `propTypes`,
    `defaultProps`,
    `router`
];

export default Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactComponentInterfaceComposite
         * @return void
         */
        $initReactComponentInterfaceComposite () {
            const intf = this;
            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    isStateless: `function`,
                    incoming: `function`,
                    outgoing: `function`,
                    getComponent: `function`,
                    getInitialState: `function`
                }).of(intf) || intf.type !== `interface`) {
                    log(`error`, `ReactComponentInterfaceComposite.$init - Interface is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        ReactComponentInterfaceComposite () {
            let _InterfacedComponent;

            /**
             * @description - Handle logic at component mounting stage.
             *
             * @method handleMounting
             * @param {function} handler
             * @return void
             */
            this.handleMounting = function (handler) {
                const intf = this;

                if (ENV.DEVELOPMENT) {
                    if (!isFunction(handler)) {
                        log(`error`, `ReactComponentInterfaceComposite.handleMounting - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-did-mount`).handle((extendedProperty) => handler(extendedProperty));
            };

            /**
             * @description - Handle logic at component dismounting stage.
             *
             * @method handleDismounting
             * @param {function} handler
             * @return void
             */
            this.handleDismounting = function (handler) {
                const intf = this;

                if (ENV.DEVELOPMENT) {
                    if (!isFunction(handler)) {
                        log(`error`, `ReactComponentInterfaceComposite.handleDismounting - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-will-unmount`).handle((extendedProperty) => handler(extendedProperty));
            };

            /**
             * @description - Handle logic at component after updating stage.
             *
             * @method handleDoneUpdating
             * @param {function} handler
             * @return void
             */
            this.handleDoneUpdating = function (handler) {
                const intf = this;

                if (ENV.DEVELOPMENT) {
                    if (!isFunction(handler)) {
                        log(`error`, `ReactComponentInterfaceComposite.handleDoneUpdating - Input handler function is invalid.`);
                    }
                }
                intf.incoming(`on-component-${intf.name}-did-update`).handle((extendedProperty) => handler(extendedProperty));
            };

            /**
             * @description - Check if interfeaced component is available.
             *
             * @method hasInterfacedComponent
             * @return {object}
             */
            this.hasInterfacedComponent = function () {
                return isFunction(_InterfacedComponent) || isObject(_InterfacedComponent);
            };

            /**
             * @description - Convert composite to a renderable component.
             *
             * @method getInterfacedComponent
             * @param {object} option
             * @returns {object}
             */
            this.getInterfacedComponent = function (option = {
                alwaysUpdateAsParent: false,
                fnPrefixInclusions: [],
                fnAndPropertyInclusions: []
            }) {
                const intf = this;

                if (intf.hasInterfacedComponent()) {
                    return _InterfacedComponent;
                }

                const {
                    alwaysUpdateAsParent,
                    fnPrefixInclusions,
                    fnAndPropertyInclusions
                } = fallback({
                    alwaysUpdateAsParent: false,
                    fnPrefixInclusions: [],
                    fnAndPropertyInclusions: []
                }).of(option);

                const Component = intf.getComponent();
                const extendedFn = mix(intf, option = {
                    bindFnsToSource: true,
                    exclusion: {
                        keys: [ `*` ],
                        properties: true,
                        exception: {
                            prefixes: DEFAULT_COMPONENT_FN_PREFIX_INCLUSIONS.concat(fnPrefixInclusions),
                            keys: DEFAULT_COMPONENT_FN_INCLUSIONS.concat(fnAndPropertyInclusions)
                        }
                    }
                }).with({});
                const interfacedComponent = (property) => {
                    const [ , forceUpdate ] = React.useReducer((toggle) => !toggle, false);
                    const [ state, setState ] = !intf.isStateless() ? React.useState(intf.getInitialState()) : [ null, null ];
                    const extendedProperty = {
                        ...property,
                        ...state,
                        ...extendedFn
                    };

                    React.useEffect(() => {
                        let didCancel = false;

                        if (!didCancel) {
                            if (!intf.isStateless()) {
                                /* this event is call ONLY when the state did mutate in store */
                                intf.incoming(`as-state-mutated`).handle((storeState) => {
                                    setState(storeState);
                                    if (alwaysUpdateAsParent) {
                                        forceUpdate();
                                        log(`info0`, `State mutated (forced) for component:${intf.name}.`);
                                    } else {
                                        log(`info0`, `State mutated for component:${intf.name}.`);
                                    }
                                });
                                /* this event is call ONLY when the state did mutate in store and FORCE component to update */
                                intf.incoming(`as-state-forced-to-mutate`).handle((storeState) => {
                                    setState(storeState);
                                    forceUpdate();
                                    log(`info0`, `State mutated (forced) for component:${intf.name}.`);
                                });
                            }
                            intf.outgoing(`on-component-${intf.name}-did-mount`).emit(() => extendedProperty);
                        }

                        intf.outgoing(`on-component-${intf.name}-did-update`).emit(() => extendedProperty);

                        return () => {
                            didCancel = true;
                            intf.outgoing(`on-component-${intf.name}-will-unmount`).emit(() => extendedProperty);
                        };
                    }, []);

                    return (
                        <Component { ...extendedProperty }/>
                    );
                };

                if (ENV.DEVELOPMENT) {
                    if (!(isFunction(interfacedComponent) || isObject(interfacedComponent))) {
                        log(`error`, `ReactComponentInterfaceComposite.getInterfacedComponent - Interface:${intf.name} React component is invalid.`);
                    }
                }

                _InterfacedComponent = DEFAULT_COMPONENT_STATICS.reduce((__InterfacedComponent, componentStatic) => {
                    if (isObject(Object.getOwnPropertyDescriptor(Component, componentStatic))) {
                        __InterfacedComponent[componentStatic] = Component[componentStatic];
                    }
                    switch(componentStatic) {
                    case `propTypes`:
                        __InterfacedComponent[componentStatic] = {
                            ...__InterfacedComponent[componentStatic],
                            ...Object.keys(extendedFn).reduce((_extendedFnPropType, fnName) => {
                                _extendedFnPropType[fnName] = PropTypes.func;
                                return _extendedFnPropType;
                            }, {})
                        };
                        break;
                    case `defaultProps`:
                        __InterfacedComponent[componentStatic] = {
                            ...__InterfacedComponent[componentStatic]
                        };
                        break;
                    default:
                        break;
                    }
                    return __InterfacedComponent;
                }, interfacedComponent);

                // console.log({
                //     defaultProps: _InterfacedComponent.defaultProps,
                //     propTypes: _InterfacedComponent.propTypes
                // })

                return intf.isStateless() ? React.memo(_InterfacedComponent) : _InterfacedComponent;
            };
        }
    }
});
