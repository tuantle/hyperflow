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
 * @module ImmutableStateComposite
 * @description - A persistent immutable state for managing state mutation composite module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isInteger,
    isNumeric,
    isString,
    isDefined,
    isFunction,
    isObject,
    isArray,
    isNonEmptyObject,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    clear,
    fallback,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

import ImmutableData from '../../data/immutable-data';

/* number mutations to persist in mutation map before roll-over */
const DEFAULT_MUTATION_MAX_REFERAL_DEPTH = -1;
const DEFAULT_MUTATION_HISTORY_SIZE = 32;
const RESERVED_KEYWORDS = [ `static`, `exclusion`, `composites`, `name`, `type`, `enclosure`, `template` ];

export default Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initImmutableStateComposite
         * @return void
         */
        $initImmutableStateComposite () {
            const factory = this;

            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    outgoing: `function`
                }).of(factory)) {
                    log(`error`, `ImmutableStateComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
                if (factory.type === `domain` || factory.type === `interface`) {
                    log(`error`, `ImmutableStateComposite.$init - Cannot apply state mutation composite to domain or interface factory.`);
                }
            }
        }
    },
    enclosure: {
        ImmutableStateComposite (definition) {
            let _data;
            let _initialStateAsObject;
            let _stateCursor;
            let _originalStateAccessor;
            let _currentStateAccessor;
            let _nextStateAccessor;
            let _originalStateAccessorCache = {};

            /**
             * @description - Helper function to deep mutation original state by a mutator.
             *
             * @method _deepStateMutation
             * @param {object|array} originalState
             * @param {object|array} mutator
             * @return {array}
             * @private
             */
            function _deepStateMutation (originalState, mutator) {
                if (isObject(originalState) && isObject(mutator)) {
                    const originalStateKeys = Object.keys(originalState);
                    const mutatorKeys = Object.keys(mutator);
                    if (originalStateKeys.length >= mutatorKeys.length && mutatorKeys.every((key) => originalStateKeys.includes(key))) {
                        mutatorKeys.filter((key) => {
                            if (_stateCursor.isItemComputable(key)) {
                                // log(`warn0`, `ImmutableStateComposite._deepStateMutation - Ignore mutation of computable key:${key}.`);
                                return false;
                            } else if (_stateCursor.isItemObservable(key)) {
                                // log(`warn0`, `ImmutableStateComposite._deepStateMutation - Ignore mutation of observable key:${key}.`);
                                return false;
                            }
                            return true;
                        }).forEach((key) => {
                            const originalStateItem = originalState[key];
                            const mutatorItem = mutator[key];

                            if ((isNonEmptyObject(originalStateItem) && !isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && !isArray(mutatorItem)) ||
                                (!isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || !isNonEmptyArray(originalStateItem) && isArray(mutatorItem))) {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutation - Input mutator schema at key:${key} must be a subset of state schema. Use state mutation with reconfig option instead.`);
                                log(`debug`, `ImmutableStateComposite._deepStateMutation - originalStateItem:${JSON.stringify(originalStateItem, null, `\t`)}`);
                                log(`debug`, `ImmutableStateComposite._deepStateMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                            } else {
                                if (isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && isArray(mutatorItem)) {
                                    _deepStateMutation(originalStateItem, mutatorItem);
                                } else {
                                    originalState[key] = mutatorItem;
                                }
                            }
                        });
                    } else {
                        log(`warn1`, `ImmutableStateComposite._deepStateMutation - Input mutator schema must be a subset of the top level state schema. Use state mutation with reconfig option instead.`);
                        log(`debug`, `ImmutableStateComposite._deepStateMutation - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                        log(`debug`, `ImmutableStateComposite._deepStateMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                } else if (isArray(originalState) && isArray(mutator)) {
                    if (originalState.length === mutator.length) {
                        originalState.forEach((originalStateItem, key) => {
                            const mutatorItem = mutator[key];

                            if ((isNonEmptyObject(originalStateItem) && !isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && !isArray(mutatorItem)) ||
                                (!isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || !isNonEmptyArray(originalStateItem) && isArray(mutatorItem))) {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutation - Input mutator schema at key:${key} must be a subset of state schema. Use state mutation with reconfig option instead.`);
                                log(`debug`, `ImmutableStateComposite._deepStateMutation - originalStateItem:${JSON.stringify(originalStateItem, null, `\t`)}`);
                                log(`debug`, `ImmutableStateComposite._deepStateMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                            } else {
                                if (isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && isArray(mutatorItem)) {
                                    _deepStateMutation(originalStateItem, mutatorItem);
                                } else {
                                    originalState[key] = mutatorItem;
                                }
                            }
                        });
                    } else {
                        log(`warn1`, `ImmutableStateComposite._deepStateMutation - Input mutator must be the same size as the top level state. Use state mutation with reconfig option instead.`);
                        log(`debug`, `ImmutableStateComposite._deepStateMutation - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                        log(`debug`, `ImmutableStateComposite._deepStateMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                } else {
                    log(`error`, `ImmutableStateComposite._deepStateMutation - Input mutator is invalid.`);
                }
            }

            /**
             * @description - Helper function to deep mutation (with reconfiguration) original state by a mutator.
             *
             * @method _deepStateMutationWithReconfiguration
             * @param {object|array} originalState
             * @param {object|array} mutator
             * @param {object|array} parentState
             * @param {string} parentKey
             * @return {array}
             * @private
             */
            function _deepStateMutationWithReconfiguration (originalState, mutator, parentState, parentKey = ``) {
                let mutatorPathIds = [];

                parentKey = isString(parentKey) ? parentKey : ``;

                if (isObject(originalState) && isObject(mutator)) {
                    const originalStateKeys = Object.keys(originalState);
                    const mutatorKeys = Object.keys(mutator);

                    if (originalStateKeys.length >= mutatorKeys.length && mutatorKeys.every((key) => originalStateKeys.includes(key))) {
                        mutatorKeys.filter((key) => {
                            if (_stateCursor.isItemComputable(key)) {
                                // log(`warn0`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Ignore mutation of computable key:${key}.`);
                                return false;
                            } else if (_stateCursor.isItemObservable(key)) {
                                // log(`warn0`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Ignore mutation of observable key:${key}.`);
                                return false;
                            }
                            return true;
                        }).forEach((key) => {
                            const originalStateItem = originalState[key];
                            const mutatorItem = mutator[key];

                            if (isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && isArray(mutatorItem)) {
                                mutatorPathIds.concat(_deepStateMutationWithReconfiguration(originalStateItem, mutatorItem, originalState, key));
                            } else if (isNonEmptyObject(originalStateItem) && !isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && !isArray(mutatorItem)) {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Cannot mutate state object with reconfiguration at key:${key} as it is not null or empty initially.`);
                            } else {
                                originalState[key] = mutatorItem;
                                mutatorPathIds.push(`${parentKey}.${key}`);
                            }
                        });
                    } else {
                        if (isObject(parentState) && Object.prototype.hasOwnProperty.call(parentState, parentKey)) {
                            if (parentState[parentKey] === null || isEmpty(parentState[parentKey])) {
                                parentState[parentKey] = mutator;
                            } else {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Cannot mutate state object with reconfiguration at key:${parentKey} as it is not null or empty initially.`);
                            }
                        } else {
                            log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Top level state object is non-configurable.`);
                            log(`debug`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                            log(`debug`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                        }
                    }
                } else if (isArray(originalState) && isArray(mutator)) {
                    if (originalState.length === mutator.length) {
                        originalState.forEach((originalStateItem, key) => {
                            const mutatorItem = mutator[key];

                            if (isNonEmptyObject(originalStateItem) && isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && isArray(mutatorItem)) {
                                mutatorPathIds.concat(_deepStateMutationWithReconfiguration(originalStateItem, mutatorItem, originalState, key));
                            } else if (isNonEmptyObject(originalStateItem) && !isObject(mutatorItem) || isNonEmptyArray(originalStateItem) && !isArray(mutatorItem)) {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Cannot mutate state array with reconfiguration at key:${key} as it is not null or empty initially.`);
                            } else {
                                originalState[key] = mutatorItem;
                                mutatorPathIds.push(`${parentKey}.${key}`);
                            }
                        });
                    } else {
                        if (isObject(parentState) && Object.prototype.hasOwnProperty.call(parentState, parentKey)) {
                            if (parentState[parentKey] === null || isEmpty(parentState[parentKey])) {
                                parentState[parentKey] = mutator;
                            } else {
                                log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Cannot mutate state array with reconfiguration at key:${parentKey} as it is not null or empty initially.`);
                            }
                        } else {
                            log(`warn1`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Top level state array is non-configurable.`);
                            log(`debug`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                            log(`debug`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                        }
                    }
                } else {
                    log(`error`, `ImmutableStateComposite._deepStateMutationWithReconfiguration - Input mutator is invalid.`);
                }
                return mutatorPathIds;
            }

            /**
             * @description - Do a strict mutation of original state. The mutator object must have matching
             *                property keys/indexes as the original state.
             *                Reconfig = true option allows modification inner state schema. Top level state
             *                schema is still non-configurable.
             *
             * @method _mutateState
             * @param {object} mutator
             * @return {boolean}
             * @private
             */
            function _mutateState (mutator, option = {
                reconfig: false
            }) {
                if (ENV.DEVELOPMENT) {
                    if (!isObject(mutator)) {
                        log(`error`, `ImmutableStateComposite._mutateState - Input mutator is invalid.`);
                    }
                }

                const {
                    reconfig
                } = fallback({
                    reconfig: false
                }).of(option);
                let mutated = false;

                if (!reconfig) {
                    _deepStateMutation(_currentStateAccessor, mutator);
                    _nextStateAccessor = _stateCursor.getAccessor({
                        maxReferalDepth: DEFAULT_MUTATION_MAX_REFERAL_DEPTH
                    });
                    mutated = _currentStateAccessor !== _nextStateAccessor;
                    if (mutated) {
                        /* do update state accessor if mutation did occur */
                        _currentStateAccessor = _nextStateAccessor;
                    }
                } else {
                    const mutatorKeys = Object.keys(mutator);
                    const originalStateKeys = Object.keys(_originalStateAccessor);

                    if (ENV.DEVELOPMENT) {
                        if (originalStateKeys.length < mutatorKeys.length || !mutatorKeys.every((key) => originalStateKeys.includes(key))) {
                            log(`error`, `ImmutableStateComposite._reconfigState - Input mutator is invalid.`);
                        }
                    }

                    let mutatorPathIds = [];

                    mutatorKeys.forEach((key) => {
                        let stateAccessorAtPath;
                        const pathId = `state.${key}`;

                        if (_originalStateAccessor[key] !== null && (isNonEmptyObject(_originalStateAccessor[key]) || isNonEmptyArray(_originalStateAccessor[key]))) {
                            if (!Object.prototype.hasOwnProperty.call(_originalStateAccessorCache, pathId)) {
                                stateAccessorAtPath = _data.select(pathId).getAccessor({
                                    maxReferalDepth: DEFAULT_MUTATION_MAX_REFERAL_DEPTH
                                });
                                _originalStateAccessorCache[pathId] = stateAccessorAtPath;
                            } else {
                                stateAccessorAtPath = _originalStateAccessorCache[pathId];
                            }
                            mutatorPathIds = _deepStateMutationWithReconfiguration(stateAccessorAtPath, mutator[key], _originalStateAccessor, key);
                        } else {
                            mutatorPathIds = _deepStateMutationWithReconfiguration(_originalStateAccessor, mutator, null, `state`);
                        }
                    });

                    _nextStateAccessor = _stateCursor.getAccessor({
                        maxReferalDepth: DEFAULT_MUTATION_MAX_REFERAL_DEPTH,
                        excludedReferalPathIds: mutatorPathIds
                    });

                    /* do update current state accessor after reconfiged state */
                    _currentStateAccessor = _nextStateAccessor;

                    mutated = true;
                }

                return mutated;
            }

            /**
             * @description - Initialized immutable data state for ImmutableStateComposite
             *
             * @method $initImmutableDataState
             * @return void
             */
            this.$initImmutableDataState = function () {
                const revealedFactory = this;

                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        state: `object`
                        // opion: `object|undefined`
                    }).of(definition)) {
                        log(`error`, `ImmutableStateComposite.$initImmutableDataState - Input composite definition object is invalid.`);
                    }
                }

                const factoryState = definition.state;
                const initialState = Object.assign({}, factoryState);
                // const {
                //     disableDatImmutablity: false,
                //     disableDataDescriptions: false
                // } = definition.option;

                if (ENV.DEVELOPMENT) {
                    if (Object.keys(factoryState).some((key) => RESERVED_KEYWORDS.includes(key))) {
                        log(`error`, `ImmutableStateComposite.$initImmutableDataState - Input factory state property key cannot be any of [ ${RESERVED_KEYWORDS.join(`, `)} ].`);
                    }
                }

                _data = ImmutableData().read(initialState, `state`).asImmutable(true);
                _stateCursor = _data.select(`state`);

                _initialStateAsObject = Object.freeze(_stateCursor.toObject());

                _originalStateAccessor = _stateCursor.getAccessor({
                    maxReferalDepth: DEFAULT_MUTATION_MAX_REFERAL_DEPTH
                });
                _currentStateAccessor = _stateCursor.getAccessor({
                    maxReferalDepth: DEFAULT_MUTATION_MAX_REFERAL_DEPTH
                });
                _originalStateAccessorCache = {
                    state: _originalStateAccessor
                };

                _stateCursor.getContentItemKeys().forEach((key) => {
                    if (ENV.DEVELOPMENT) {
                        if (Object.prototype.hasOwnProperty.call(revealedFactory, key)) {
                            log(`error`, `ImmutableStateComposite.$initImmutableDataState - Cannot assign factory state property key:${key} due to naming conflict.`);
                        }
                    }
                    Object.defineProperty(revealedFactory, key, {
                        get () {
                            return _currentStateAccessor[key];
                        },
                        configurable: false,
                        enumerable: true
                    });
                });

                /* reset all state data  mutation history recorded during init */
                _data.setMutationHistorySize(DEFAULT_MUTATION_HISTORY_SIZE);
                _data.flush(`state`);
            };

            /**
             * @description - Get state as a plain object.
             *
             * @method getStateAsObject
             * @return {object}
             */
            this.getStateAsObject = function () {
                return _stateCursor.toObject();
            };

            /**
             * @description - Reset to initial state.
             *
             * @method resetToInitialState
             * @param {object} option
             * @return void
             */
            this.getInitialStateAsObject = function () {
                return Object.assign({}, _initialStateAsObject);
            };

            /**
             * @description - Reset state to initial default.
             *
             * @method reset
             * @param {object} option
             * @return void
             */
            this.reset = function (option = {
                forceMutationEvent: false,
                suppressMutationEvent: false,
                delayMutationEvent: 0
            }) {
                const factory = this;
                const {
                    forceMutationEvent,
                    suppressMutationEvent,
                    delayMutationEvent
                } = fallback({
                    forceMutationEvent: false,
                    suppressMutationEvent: false,
                    delayMutationEvent: 0
                }).of(option);
                const initialState = factory.getInitialStateAsObject();

                _mutateState(initialState, {
                    reconfig: true
                });

                factory.flush(option);

                if (forceMutationEvent || !suppressMutationEvent) {
                    const stateMutationEventId = !forceMutationEvent ? `as-state-mutated` : `as-state-forced-to-mutate`;
                    /* emitting a mutation event to interface */
                    if (delayMutationEvent > 0) {
                        factory.outgoing(stateMutationEventId).delay(delayMutationEvent).emit(() => initialState);
                    } else {
                        factory.outgoing(stateMutationEventId).emit(() => initialState);
                    }
                }
            };

            /**
             * @description - Clear all state mutation history.
             *
             * @method flush
             * @param {object} option
             * @return void
             */
            this.flush = function (option = {
                mutationHistorySize: DEFAULT_MUTATION_HISTORY_SIZE
            }) {
                const {
                    /* skip referal of pathIds in the exclusion list. */
                    mutationHistorySize
                } = fallback({
                    mutationHistorySize: DEFAULT_MUTATION_HISTORY_SIZE
                }).of(option);

                clear(_originalStateAccessorCache);
                /* reset all state data  mutation history recorded */
                _data.setMutationHistorySize(mutationHistorySize);
                _data.flush(`state`);
            };

            /**
             * @description - Revert to the previous state mutation from time history at path Id.
             *                Head state cursor changes back to the previous timeIndex.
             *
             * @method revertToTimeIndex
             * @param {string} key
             * @param {number} timeIndexOffset
             * @return {bool}
             */
            this.revertToTimeIndex = function (key, timeIndexOffset = -1) {
                const factory = this;
                let mutator = {};

                if (ENV.DEVELOPMENT) {
                    if (!_stateCursor.hasItem(key)) {
                        log(`error`, `ImmutableStateComposite.revertToTimeIndex - Data item key:${key} is not defined.`);
                    } else if (!isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                        log(`error`, `ImmutableStateComposite.revertToTimeIndex - Input time index offset must be non-zero and negative.`);
                    }
                }

                const {
                    recallTimeIndex,
                    content
                } = _stateCursor.recallContentItem(key, timeIndexOffset);

                if (!isDefined(content)) {
                    if (ENV.DEVELOPMENT) {
                        log(`warn1`, `ImmutableStateComposite.revertToTimeIndex - Unable to time traverse to undefined state of key:${key} at time index.`);
                    }
                    return [ false, 0 ];
                }

                mutator[key] = content;
                _mutateState(mutator, {
                    reconfig: true
                });

                const recalledState = factory.getStateAsObject();

                /* emitting a mutation event to interface */
                factory.outgoing(`as-state-mutated`).emit(() => recalledState);
                log(`info0`, `Time traversing to previous state at timeIndex:${timeIndexOffset} of key:${key}.`);

                if (recallTimeIndex >= 0) {
                    return [ false, 0 ];
                }
                return [ true, 3 ];
            };

            /**
             * @description - Traverse and recall the previous state mutation from time history.
             *                Head state cursor does not change.
             *
             * @method recall
             * @param {string} key
             * @param {number} timeIndexOffset
             * @return {object|null}
             */
            this.recall = function (key, timeIndexOffset) {
                if (ENV.DEVELOPMENT) {
                    if (!_stateCursor.hasItem(key)) {
                        log(`error`, `ImmutableStateComposite.recall - Data item key:${key} is not defined.`);
                    } else if (!isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                        log(`error`, `ImmutableStateComposite.recall - Input time index offset must be non-zero and negative.`);
                    }
                }

                const {
                    timestamp,
                    content
                } = _stateCursor.recallContentItem(key, timeIndexOffset);

                if (!(isDefined(content) && isNumeric(timestamp))) {
                    if (ENV.DEVELOPMENT) {
                        log(`warn1`, `ImmutableStateComposite.recall - Unable to recall an undefined state of key:${key} at time index.`);
                    }
                } else {
                    log(`info0`, `Recalling previous state at timestamp:${timestamp} of key:${key}.`);
                }
                return content;
            };

            /**
             * @description - Traverse and recall all the previous state mutation from time history.
             *                Head state cursor does not change.
             *
             * @method recallAll
             * @param {string} key
             * @return {array}
             */
            this.recallAll = function (key) {
                if (ENV.DEVELOPMENT) {
                    if (!_stateCursor.hasItem(key)) {
                        log(`error`, `ImmutableStateComposite.recallAll - Data item key:${key} is not defined.`);
                    }
                }

                const contentHistoryItems = _stateCursor.recallAllContentItems(key);

                if (!isArray(contentHistoryItems)) {
                    if (ENV.DEVELOPMENT) {
                        log(`error`, `ImmutableStateComposite.recallAll - Unable to recall all previous states of key:${key}.`);
                    }
                } else {
                    log(`info0`, `Recalling all previous states of key:${key}.`);
                }
                return contentHistoryItems;
            };

            /**
             * @description - Do state change/mutation.
             *
             * @method mutate
             * @param {object|function} mutator
             * @param {object} option
             * @return {boolean}
             */
            this.mutate = function (mutator, option = {
                reconfig: false,
                forceMutationEvent: false,
                suppressMutationEvent: false,
                delayMutationEvent: 0
            }) {
                const factory = this;
                const {
                    forceMutationEvent,
                    suppressMutationEvent,
                    delayMutationEvent
                } = fallback({
                    reconfig: false,
                    forceMutationEvent: false,
                    suppressMutationEvent: false,
                    delayMutationEvent: 0
                }).of(option);
                const currentState = factory.getStateAsObject();
                let mutated = false;

                if (isFunction(mutator)) {
                    mutated = _mutateState(mutator(currentState), option);
                } else if (isObject(mutator)) {
                    mutated = _mutateState(mutator, option);
                }

                if (forceMutationEvent || (mutated && !suppressMutationEvent)) {
                    const newState = factory.getStateAsObject();
                    const stateMutationEventId = !forceMutationEvent ? `as-state-mutated` : `as-state-forced-to-mutate`;

                    /* emitting a mutation event to interface */
                    if (delayMutationEvent > 0) {
                        factory.outgoing(stateMutationEventId).delay(delayMutationEvent).emit(() => newState);
                    } else {
                        factory.outgoing(stateMutationEventId).emit(() => newState);
                    }
                }

                return mutated;
            };
        }
    }
});
