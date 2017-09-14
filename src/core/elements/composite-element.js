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
 * @module CompositeElement
 * @description - A composite elements can be resolved into a factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/* load DataElement */
import DataElement from './data-element';

const PRIVATE_PREFIX = `_`;
const INITIALIZATION_PREFIX = `$`;
const DEFAULT_EXCLUSION_PREFIXES = [ PRIVATE_PREFIX, INITIALIZATION_PREFIX ];

/* number mutations to persist in mutation map before roll-over */
const DEFAULT_MUTATION_HISTORY_DEPTH = 128;

/**
 * @description - A composite element prototypes.
 *
 * CompositeElementPrototype
 */
const CompositeElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Get a cloned set of composite enclosure.
     *
     * @method getEnclosure
     * @param {array} fnNames - Names of the composed enclosures to retrieve.
     * @return {object}
     */
    getEnclosure: function getEnclosure (...fnNames) {
        const composite = this;
        let clonedEnclosure = Hf.clone(composite._enclosure);

        if (Hf.isEmpty(fnNames)) {
            Hf.log(`warn0`, `CompositeElement.getEnclosure - Input enclosure function name array is empty.`);
            return clonedEnclosure;
        } else { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (fnNames.some((fnName) => !Hf.isString(fnName))) {
                    Hf.log(`error`, `CompositeElement.getEnclosure - Input enclosure function name is invalid.`);
                }
            }
            return fnNames.filter((fnName) => composite._enclosure.hasOwnProperty(fnName)).reduce((enclosure, fnName) => {
                enclosure[fnName] = clonedEnclosure[fnName];
                return enclosure;
            }, {});
        }
    },
    /**
     * @description - Get a cloned set of composite template.
     *
     * @method getTemplate
     * @param {array} keys - Names of the template methods and properties to retrieve.
     * @return {object}
     */
    getTemplate: function getTemplate (...keys) {
        const composite = this;
        let clonedTemplate = Hf.clone(composite._template);

        if (Hf.isEmpty(keys)) {
            Hf.log(`warn0`, `CompositeElement.getTemplate - Input template key array is empty.`);
            return clonedTemplate;
        } else { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (keys.some((key) => !Hf.isString(key))) {
                    Hf.log(`error`, `CompositeElement.getTemplate - Input template key is invalid.`);
                }
            }
            return keys.filter((key) => composite._template.hasOwnProperty(key)).reduce((template, key) => {
                template[key] = clonedTemplate[key];
                return template;
            }, {});
        }
    },
    /**
     * @description - Get a cloned of composite exclusion option.
     *
     * @method getExclusion
     * @return {object}
     */
    getExclusion: function getExclusion () {
        const composite = this;
        return Hf.clone(composite._exclusion);
    },
    /**
     * @description - Mix self with a set of methods defined by source.
     *
     * @method mixin
     * @param {array} sources
     * @return {object}
     */
    mixin: function mixin (...sources) {
        const composite = this;

        if (Hf.DEVELOPMENT) {
            if (Hf.isEmpty(sources)) {
                Hf.log(`warn0`, `CompositeElement.mixin - Input source array is empty.`);
            } else if (sources.filter((source) => !(Hf.isObject(source) || Hf.isFunction(source)))) {
                Hf.log(`warn0`, `CompositeElement.mixin - Input source is invalid.`);
            }
        }

        const mixedTemplate = sources.reduce((_mixedTemplate, source) => {
            let sourceObj = {};

            if (Hf.isObject(source)) {
                /* object literal mixins */
                sourceObj = source;
            }
            if (Hf.isFunction(source)) {
                /* functional mixins */
                source.call(sourceObj);
            }
            _mixedTemplate = Hf.mix(sourceObj).with(_mixedTemplate);

            return _mixedTemplate;
        }, composite.getTemplate());

        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(mixedTemplate)) {
                Hf.log(`error`, `CompositeElement.mixin - Unable to mixin methods of source object.`);
            }
        }

        const definition = {
            exclusion: composite.getExclusion(),
            enclosure: composite.getEnclosure(),
            template: mixedTemplate
        };

        return CompositeElement(definition); // eslint-disable-line
    },
    /**
     * @description - Compose self with a set of composites into a new composite.
     *
     * @method compose
     * @param {array} composites - A set of composites.
     * @return {object}
     */
    compose: function compose (...composites) {
        const composite = this;

        if (Hf.DEVELOPMENT) {
            if (Hf.isEmpty(composites)) {
                Hf.log(`warn0`, `CompositeElement.compose - Input composites set is empty.`);
            } else if (!composites.every((_composite) => Hf.isSchema({
                // NOTE: for composite with internal private state, use enclosure.
                getEnclosure: `function`,
                // NOTE: for composite with no internal private state, use template.
                getTemplate: `function`,
                getExclusion: `function`
            }).of(_composite))) {
                Hf.log(`error`, `CompositeElement.compose - Input composite object is invalid.`);
            }
        }

        const composedExclusion = composites.reduce((_composedExclusion, _composite) => {
            const mergeExclusion = Hf.compose(_composite.getExclusion, Hf.merge);
            _composedExclusion = mergeExclusion().with(_composedExclusion);
            return _composedExclusion;
        }, composite.getExclusion());
        const composedEnclosure = composites.reduce((_composedEnclosure, _composite) => {
            const mixEnclosure = Hf.compose(_composite.getEnclosure, Hf.mix);
            _composedEnclosure = mixEnclosure().with(_composedEnclosure);
            return _composedEnclosure;
        }, composite.getEnclosure());
        const composedTemplate = composites.reduce((_composedTemplate, _composite) => {
            const mixTemplate = Hf.compose(_composite.getTemplate, Hf.mix);
            _composedTemplate = mixTemplate().with(_composedTemplate);
            return _composedTemplate;
        }, composite.getTemplate());

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(composedEnclosure) && Hf.isObject(composedTemplate))) {
                Hf.log(`error`, `CompositeElement.compose - Unable to compose composites set.`);
            }
        }

        const definition = {
            exclusion: composedExclusion,
            enclosure: composedEnclosure,
            template: composedTemplate
        };

        return CompositeElement(definition); // eslint-disable-line
    },
    /**
     * @description - Resolve a composite with required initial state values and returns a factory.
     *
     * @method resolve
     * @param {object} initialStatic - The initial constant of a factory.
     * @param {object} initialState - The initial state of a factory.
     * @return {object}
     */
    resolve: function resolve (initialStatic = {}, initialState = {}) {
        const composite = this;

        initialStatic = Hf.isObject(initialStatic) ? initialStatic : {};
        initialState = Hf.isObject(initialState) ? initialState : {};

        /* return a factory function */
        return function Factory (state = {}) {
            const exclusion = composite.getExclusion();
            const enclosure = composite.getEnclosure();
            let product;

            if (!Hf.isEmpty(initialState)) {
                const data = DataElement().read(initialState, `state`).asImmutable(true);
                const stateCursor = data.select(`state`);
                let originalStateAccessor = stateCursor.getAccessor();
                let currentStateAccessor = originalStateAccessor;
                let nextStateAccessor = originalStateAccessor;
                let originalStateAccessorCache = {
                    state: originalStateAccessor
                };

                /* helper function to deep reduce original state by a reducer. */
                const deepStateReduction = function deepStateReduction (originalState, reducer) {
                    if (Hf.isObject(originalState) && Hf.isObject(reducer)) {
                        const originalStateKeys = Object.keys(originalState);
                        const reducerKeys = Object.keys(reducer);
                        if (originalStateKeys.length >= reducerKeys.length && reducerKeys.every((key) => originalStateKeys.includes(key))) {
                            reducerKeys.filter((key) => {
                                if (stateCursor.isItemComputable(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateReduction - Ignore mutation of computable key:${key}.`);
                                    return false;
                                } else if (stateCursor.isItemObservable(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateReduction - Ignore mutation of observable key:${key}.`);
                                    return false;
                                }
                                return true;
                            }).forEach((key) => {
                                const originalStateItem = originalState[key];
                                const reducerItem = reducer[key];

                                if ((Hf.isNonEmptyObject(originalStateItem) && !Hf.isObject(reducerItem) || Hf.isNonEmptyArray(originalStateItem) && !Hf.isArray(reducerItem)) ||
                                    (!Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reducerItem) || !Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reducerItem))) {
                                    Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer schema at key:${key} must be a subset of state schema. Use state reconfiguration instead.`);
                                    Hf.log(`debug`, `Factory.deepStateReduction - originalStateItem:${JSON.stringify(originalStateItem, null, `\t`)}`);
                                    Hf.log(`debug`, `Factory.deepStateReduction - reducerItem:${JSON.stringify(reducerItem, null, `\t`)}`);
                                } else {
                                    if (Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reducerItem) || Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reducerItem)) {
                                        deepStateReduction(originalStateItem, reducerItem);
                                    } else {
                                        originalState[key] = reducerItem;
                                    }
                                }
                            });
                        } else {
                            Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer schema must be a subset of the top level state schema. Use state reconfiguration instead.`);
                            Hf.log(`debug`, `Factory.deepStateReduction - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                            Hf.log(`debug`, `Factory.deepStateReduction - reducer:${JSON.stringify(reducer, null, `\t`)}`);
                        }
                    } else if (Hf.isArray(originalState) && Hf.isArray(reducer)) {
                        if (originalState.length === reducer.length) {
                            originalState.forEach((originalStateItem, key) => {
                                const reducerItem = reducer[key];

                                if ((Hf.isNonEmptyObject(originalStateItem) && !Hf.isObject(reducerItem) || Hf.isNonEmptyArray(originalStateItem) && !Hf.isArray(reducerItem)) ||
                                    (!Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reducerItem) || !Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reducerItem))) {
                                    Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer schema at key:${key} must be a subset of state schema. Use state reconfiguration instead.`);
                                    Hf.log(`debug`, `Factory.deepStateReduction - originalStateItem:${JSON.stringify(originalStateItem, null, `\t`)}`);
                                    Hf.log(`debug`, `Factory.deepStateReduction - reducerItem:${JSON.stringify(reducerItem, null, `\t`)}`);
                                } else {
                                    if (Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reducerItem) || Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reducerItem)) {
                                        deepStateReduction(originalStateItem, reducerItem);
                                    } else {
                                        originalState[key] = reducerItem;
                                    }
                                }
                            });
                        } else {
                            Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer must be the same size as the top level state. Use state reconfiguration instead.`);
                            Hf.log(`debug`, `Factory.deepStateReduction - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                            Hf.log(`debug`, `Factory.deepStateReduction - reducer:${JSON.stringify(reducer, null, `\t`)}`);
                        }
                    } else {
                        Hf.log(`error`, `Factory.deepStateReduction - Input reducer is invalid.`);
                    }
                };

                /* helper function to deep reconfig original state by a reconfiguration. */
                const deepStateReconfiguration = function deepStateReconfiguration (originalState, reconfiguration, parentState, parentKey = ``) {
                    let reconfigurationPathIds = [];
                    parentKey = Hf.isString(parentKey) ? parentKey : ``;
                    if (Hf.isObject(originalState) && Hf.isObject(reconfiguration)) {
                        const originalStateKeys = Object.keys(originalState);
                        const reconfigurationKeys = Object.keys(reconfiguration);

                        if (originalStateKeys.length >= reconfigurationKeys.length && reconfigurationKeys.every((key) => originalStateKeys.includes(key))) {
                            reconfigurationKeys.filter((key) => {
                                if (stateCursor.isItemComputable(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateReconfiguration - Ignore mutation of computable key:${key}.`);
                                    return false;
                                } else if (stateCursor.isItemObservable(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateReconfiguration - Ignore mutation of observable key:${key}.`);
                                    return false;
                                }
                                return true;
                            }).forEach((key) => {
                                const originalStateItem = originalState[key];
                                const reconfigurationItem = reconfiguration[key];

                                if (Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reconfigurationItem) || Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reconfigurationItem)) {
                                    reconfigurationPathIds.concat(deepStateReconfiguration(originalStateItem, reconfigurationItem, originalState, key));
                                } else if (Hf.isNonEmptyObject(originalStateItem) && !Hf.isObject(reconfigurationItem) || Hf.isNonEmptyArray(originalStateItem) && !Hf.isArray(reconfigurationItem)) {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state object at key:${key} as it is not null or empty initially.`);
                                } else {
                                    originalState[key] = reconfigurationItem;
                                    reconfigurationPathIds.push(`${parentKey}.${key}`);
                                }
                            });
                        } else {
                            if (Hf.isObject(parentState) && parentState.hasOwnProperty(parentKey)) {
                                parentState[parentKey] = reconfiguration;
                                // if (parentState[parentKey] === null || Hf.isEmpty(parentState[parentKey])) {
                                //     parentState[parentKey] = reconfiguration;
                                // } else {
                                //     Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state object at key:${parentKey} as it is not null or empty initially.`);
                                // }
                            } else {
                                Hf.log(`warn1`, `Factory.deepStateReconfiguration - Top level state object is non-configurable.`);
                                Hf.log(`debug`, `Factory.deepStateReconfiguration - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                                Hf.log(`debug`, `Factory.deepStateReconfiguration - reconfiguration:${JSON.stringify(reconfiguration, null, `\t`)}`);
                            }
                        }
                    } else if (Hf.isArray(originalState) && Hf.isArray(reconfiguration)) {
                        if (originalState.length === reconfiguration.length) {
                            originalState.forEach((originalStateItem, key) => {
                                const reconfigurationItem = reconfiguration[key];

                                if (Hf.isNonEmptyObject(originalStateItem) && Hf.isObject(reconfigurationItem) || Hf.isNonEmptyArray(originalStateItem) && Hf.isArray(reconfigurationItem)) {
                                    reconfigurationPathIds.concat(deepStateReconfiguration(originalStateItem, reconfigurationItem, originalState, key));
                                } else if (Hf.isNonEmptyObject(originalStateItem) && !Hf.isObject(reconfigurationItem) || Hf.isNonEmptyArray(originalStateItem) && !Hf.isArray(reconfigurationItem)) {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state array at key:${key} as it is not null or empty initially.`);
                                } else {
                                    originalState[key] = reconfigurationItem;
                                    reconfigurationPathIds.push(`${parentKey}.${key}`);
                                }
                            });
                        } else {
                            if (Hf.isObject(parentState) && parentState.hasOwnProperty(parentKey)) {
                                parentState[parentKey] = reconfiguration;
                                // if (parentState[parentKey] === null || Hf.isEmpty(parentState[parentKey])) {
                                //     parentState[parentKey] = reconfiguration;
                                // } else {
                                //     Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state array at key:${parentKey} as it is not null or empty initially.`);
                                // }
                            } else {
                                Hf.log(`warn1`, `Factory.deepStateReconfiguration - Top level state array is non-configurable.`);
                                Hf.log(`debug`, `Factory.deepStateReconfiguration - originalState:${JSON.stringify(originalState, null, `\t`)}`);
                                Hf.log(`debug`, `Factory.deepStateReconfiguration - reconfiguration:${JSON.stringify(reconfiguration, null, `\t`)}`);
                            }
                        }
                    } else {
                        Hf.log(`error`, `Factory.deepStateReconfiguration - Input reconfiguration is invalid.`);
                    }
                    return reconfigurationPathIds;
                };

                product = composite.mixin(...Hf.collect(...Object.keys(enclosure)).from(enclosure)).mixin({
                    /**
                     * @description - Get original state cursor.
                     *
                     * @method getStateCursor
                     * @return {object}
                     */
                    // TODO: Need to find a way to not expose the state cursor.
                    getStateCursor: function getStateCursor () {
                        return stateCursor;
                    },
                    /**
                     * @description - Get state schema.
                     *
                     * @method getStateSchema
                     * @return {object}
                     */
                    // TODO: Remove if find no use case.
                    getStateSchema: function getStateSchema () {
                        return stateCursor.getSchema();
                    },
                    /**
                     * @description - Get state as a plain object.
                     *
                     * @method getStateAsObject
                     * @return {object}
                     */
                    getStateAsObject: function getStateAsObject () {
                        return stateCursor.toObject();
                    },
                    /**
                     * @description - Reset state to initial default and clear all mutation history.
                     *
                     * @method resetState
                     * @return void
                     */
                    resetState: function resetState () {
                        deepStateReconfiguration(originalStateAccessor, originalStateAccessor);
                        currentStateAccessor = originalStateAccessor;
                        nextStateAccessor = originalStateAccessor;

                        Hf.clear(originalStateAccessorCache);
                    },
                    /**
                     * @description - Clear all state mutation history.
                     *
                     * @method flushState
                     * @param {object} option
                     * @return void
                     */
                    flushState: function flushState (option = {}) {
                        const {
                            /* skip referal of pathIds in the exclusion list. */
                            mutationHistoryDepth
                        } = Hf.fallback({
                            mutationHistoryDepth: DEFAULT_MUTATION_HISTORY_DEPTH
                        }).of(option);

                        Hf.clear(originalStateAccessorCache);
                        /* reset all state data element mutation history recorded */
                        data.setMutationHistoryDepth(mutationHistoryDepth);
                        data.flush(`state`);
                    },
                    /**
                     * @description - Do a strict mutation of original state. The reducer object must have matching
                     *                property keys/indexes as the original state.
                     *
                     * @method reduceState
                     * @param {object} reducer
                     * @return {boolean}
                     */
                    reduceState: function reduceState (reducer) {
                        let mutated = false;

                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isObject(reducer)) {
                                Hf.log(`error`, `Factory.reduceState - Input reducer is invalid.`);
                            }
                        }

                        deepStateReduction(currentStateAccessor, reducer);
                        nextStateAccessor = stateCursor.getAccessor();
                        mutated = currentStateAccessor !== nextStateAccessor;
                        if (mutated) {
                            /* do update state accessor if mutation did occur */
                            currentStateAccessor = nextStateAccessor;
                        }

                        return mutated;
                    },
                    /**
                     * @description - Do a reconfiguration original state by a reconfiguration. Allows modification inner state schema.
                     *                Top level state schema is still non-configurable.
                     *
                     * @method reconfigState
                     * @param {object} reconfiguration
                     * @return void
                     * @return void
                     */
                    reconfigState: function reconfigState (reconfiguration) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isObject(reconfiguration)) {
                                Hf.log(`error`, `Factory.reconfigState - Input reconfiguration is invalid.`);
                            }
                        }

                        const reconfigurationKeys = Object.keys(reconfiguration);
                        const originalStateKeys = Object.keys(originalStateAccessor);

                        if (Hf.DEVELOPMENT) {
                            if (originalStateKeys.length < reconfigurationKeys.length || !reconfigurationKeys.every((key) => originalStateKeys.includes(key))) {
                                Hf.log(`error`, `Factory.reconfigState - Input reconfiguration is invalid.`);
                            }
                        }

                        let reconfigurationPathIds = [];

                        reconfigurationKeys.forEach((key) => {
                            let stateAccessorAtPath;
                            const pathId = `state.${key}`;

                            if (originalStateAccessor[key] !== null && (Hf.isNonEmptyObject(originalStateAccessor[key]) || Hf.isNonEmptyArray(originalStateAccessor[key]))) {
                                if (!originalStateAccessorCache.hasOwnProperty(pathId)) {
                                    stateAccessorAtPath = data.select(pathId).getAccessor();
                                    originalStateAccessorCache[pathId] = stateAccessorAtPath;
                                } else {
                                    stateAccessorAtPath = originalStateAccessorCache[pathId];
                                }
                                reconfigurationPathIds = deepStateReconfiguration(stateAccessorAtPath, reconfiguration[key], originalStateAccessor, key);
                            } else {
                                reconfigurationPathIds = deepStateReconfiguration(originalStateAccessor, reconfiguration, null, ``);
                            }
                        });

                        nextStateAccessor = stateCursor.getAccessor({
                            excludedNonmutatioReferalPathIds: reconfigurationPathIds.map((pathId) => `state.${pathId}`)
                        });

                        /* do update current state accessor after reconfiged state */
                        currentStateAccessor = nextStateAccessor;
                    }
                }).getTemplate();

                if (Hf.isNonEmptyObject(state)) {
                    if (product.reduceState(state)) {
                        originalStateAccessor = stateCursor.getAccessor();
                        originalStateAccessorCache = {
                            state: originalStateAccessor
                        };
                    }
                }

                product = stateCursor.getContentItemKeys().reduce((productState, key) => {
                    Object.defineProperty(productState, key, {
                        get: function get () {
                            return currentStateAccessor[key];
                        },
                        configurable: false,
                        enumerable: true
                    });
                    return productState;
                }, product);

                /* reset all state data element mutation history recorded during init */
                data.setMutationHistoryDepth(DEFAULT_MUTATION_HISTORY_DEPTH);
                data.flush(`state`);
            } else {
                product = composite.mixin(...Hf.collect(...Object.keys(enclosure)).from(enclosure)).getTemplate();
            }

            if (!Hf.isEmpty(initialStatic)) {
                product = Object.entries(initialStatic).reduce((productStatic, [ key, value ]) => {
                    Object.defineProperty(productStatic, key, {
                        get: function get () {
                            return Hf.freeze(value);
                        },
                        configurable: false,
                        enumerable: true
                    });
                    return productStatic;
                }, product);
            }

            let revealedProduct = Hf.reveal(product, {
                exclusion
            });

            /* if a function with initialization prefix is defined, call it once at init */
            Object.entries(product).filter(([ fnName, fn ]) => {
                return Hf.isFunction(fn) && fnName.charAt(0) === INITIALIZATION_PREFIX;
            }).sort(([ fnNameA, fnA ], [ fnNameB, fnB ]) => { // eslint-disable-line
                if (fnNameA < fnNameB) {
                    return -1;
                }
                if (fnNameA > fnNameB) {
                    return 1;
                }
                return 0;
            }).forEach(([ fnName, fn ]) => { // eslint-disable-line
                fn.call(revealedProduct);
            });

            /* reveal only the public properties and functions */
            return Object.freeze(revealedProduct);
        };
    }
};

/**
 * @description - A composite element module.
 *
 * @module CompositeElement
 * @param {object} definition - Composite definition.
 * @return {object}
 */
export default function CompositeElement (definition) {
    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(definition)) {
            Hf.log(`error`, `CompositeElement - Input composite definition object is invalid.`);
        }
    }

    const {
        enclosure,
        template,
        exclusion
    } = Hf.fallback({
        enclosure: {},
        template: {},
        exclusion: {
            /* set default exclusion */
            prefixes: DEFAULT_EXCLUSION_PREFIXES,
            properties: false
        }
    }).of(definition);

    exclusion.prefixes = exclusion.prefixes.concat(DEFAULT_EXCLUSION_PREFIXES.filter((prefix) => {
        return !exclusion.prefixes.includes(prefix);
    }));

    if (Hf.DEVELOPMENT) {
        if (!Object.values(enclosure).every((fn) => Hf.isFunction(fn))) {
            Hf.log(`error`, `CompositeElement - Input composite definition for enclosure object is invalid.`);
        }
    }

    const element = Object.create(CompositeElementPrototype, {
        // TODO: Implement $init sequence for composer method. This will allow the $init method call order to be deterministic.
        // _initSequences: [],
        /* internal composite enclose functions */
        _enclosure: {
            value: enclosure,
            writable: true,
            configurable: false,
            enumerable: false
        },
        /* internal composite method template */
        _template: {
            value: template,
            writable: true,
            configurable: false,
            enumerable: false
        },
        /* esolve exclusion option */
        _exclusion: {
            value: exclusion,
            writable: true,
            configurable: false,
            enumerable: false
        }
    });

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(element)) {
            Hf.log(`error`, `CompositeElement - Unable to create a composite element instance.`);
        }
    }

    const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
    /* reveal only the public properties and functions */
    return revealFrozen(element);
}
