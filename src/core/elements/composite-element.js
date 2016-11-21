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
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load DataElement */
import DataElement from './data-element';

/* load CommonElement */
import CommonElement from './common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

const PRIVATE_PREFIX = `_`;
const INITIALIZATION_PREFIX = `$`;
const DEFAULT_EXCLUSION_PREFIXES = [ PRIVATE_PREFIX, INITIALIZATION_PREFIX ];
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
        } else {
            return fnNames.filter((fnName) => {
                if (!Hf.isString(fnName)) {
                    Hf.log(`error`, `CompositeElement.getEnclosure - Input enclosure function name is invalid.`);
                    return false;
                }
                return composite._enclosure.hasOwnProperty(fnName);
            }).reduce((enclosure, fnName) => {
                enclosure[fnName] = clonedEnclosure[fnName];
                return enclosure;
            }, {});
        }
        return clonedEnclosure;
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
        } else {
            return keys.filter((key) => {
                if (!Hf.isString(key)) {
                    Hf.log(`error`, `CompositeElement.getTemplate - Input template key is invalid.`);
                    return false;
                }
                return composite._template.hasOwnProperty(key);
            }).reduce((template, key) => {
                template[key] = clonedTemplate[key];
                return template;
            }, {});
        }
        return clonedTemplate;
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

        if (!Hf.isEmpty(sources)) {
            const mixedTemplate = sources.filter((source) => {
                if (!(Hf.isObject(source) || Hf.isFunction(source))) {
                    Hf.log(`warn0`, `CompositeElement.mixin - Input source is invalid.`);
                    return false;
                }
                return true;
            }).reduce((_mixedTemplate, source) => {
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

            if (!Hf.isObject(mixedTemplate)) {
                Hf.log(`error`, `CompositeElement.mixin - Unable to mixin methods of source object.`);
            } else {
                const definition = {
                    exclusion: composite.getExclusion(),
                    enclosure: composite.getEnclosure(),
                    template: mixedTemplate
                };
                return CompositeElement(definition); // eslint-disable-line
            }
        } else {
            Hf.log(`warn0`, `CompositeElement.mixin - Input source array is empty.`);
        }
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

        if (!Hf.isEmpty(composites)) {
            composites = composites.filter((_composite) => {
                if (!Hf.isSchema({
                    // NOTE: for composite with internal private state, use enclosure.
                    getEnclosure: `function`,
                    // NOTE: for composite with no internal private state, use template.
                    getTemplate: `function`,
                    getExclusion: `function`
                }).of(_composite)) {
                    Hf.log(`warn0`, `CompositeElement.compose - Input composite object is invalid.`);
                    return false;
                }
                return true;
            });

            if (!Hf.isEmpty(composites)) {
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

                if (!(Hf.isObject(composedEnclosure) && Hf.isObject(composedTemplate))) {
                    Hf.log(`error`, `CompositeElement.compose - Unable to compose composites set.`);
                } else {
                    const definition = {
                        exclusion: composedExclusion,
                        enclosure: composedEnclosure,
                        template: composedTemplate
                    };
                    return CompositeElement(definition); // eslint-disable-line
                }
            } else {
                Hf.log(`error`, `CompositeElement.compose - Input composites set is invalid.`);
            }
        } else {
            Hf.log(`warn0`, `CompositeElement.compose - Input composites set is empty.`);
        }
    },
    /**
     * @description - Resolve a composite with required initial state values and returns a factory.
     *
     * @method resolve
     * @param {object} initialState - The initial state of a factory.
     * @return {object}
     */
    resolve: function resolve (initialState = {}) {
        const composite = this;
        initialState = Hf.isObject(initialState) ? initialState : {};
        /* return a factory function */
        return function Factory (state = {}) {
            const exclusion = composite.getExclusion();
            const enclosure = composite.getEnclosure();
            let product;

            if (!Hf.isEmpty(initialState)) {
                const data = DataElement().read(initialState, `state`).asImmutable(true);
                const stateCursor = data.select(`state`);
                const originalStateAccessor = stateCursor.getAccessor();
                let currentStateAccessor = originalStateAccessor;
                let nextStateAccessor = originalStateAccessor;
                let originalStateAccessorAtPathCache = {
                    state: originalStateAccessor
                };

                /* helper function to deep reduce original state by a reducer. */
                const deepStateReduction = function deepStateReduction (originalState, reducer) {
                    if (Hf.isObject(originalState) && Hf.isObject(reducer)) {
                        const originalStateKeys = Object.keys(originalState);
                        const reducerKeys = Object.keys(reducer);
                        if (originalStateKeys.length >= reducerKeys.length && reducerKeys.every((key) => originalStateKeys.some((_key) => _key === key))) {
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

                                if (Hf.isObject(originalStateItem) && !Hf.isObject(reducerItem) || Hf.isArray(originalStateItem) && !Hf.isArray(reducerItem)) {
                                    Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer schema at key:${key} must be a subset of state schema. Use state reconfiguration instead.`);
                                } else {
                                    if (Hf.isObject(originalStateItem) && Hf.isObject(reducerItem) || Hf.isArray(originalStateItem) && Hf.isArray(reducerItem)) {
                                        deepStateReduction(originalStateItem, reducerItem);
                                    } else {
                                        originalState[key] = reducerItem;
                                    }
                                }
                            });
                        } else {
                            Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer schema must be a subset of the top level state schema. Use state reconfiguration instead.`);
                        }
                    } else if (Hf.isArray(originalState) && Hf.isArray(reducer)) {
                        if (originalState.length === reducer.length) {
                            originalState.forEach((originalStateItem, key) => {
                                const reducerItem = reducer[key];
                                if (Hf.isObject(originalStateItem) && Hf.isObject(reducerItem) || Hf.isArray(originalStateItem) && Hf.isArray(reducerItem)) {
                                    deepStateReduction(originalStateItem, reducerItem);
                                } else {
                                    originalState[key] = reducerItem;
                                }
                            });
                        } else {
                            Hf.log(`warn1`, `Factory.deepStateReduction - Input reducer must be the same size as the top level state. Use state reconfiguration instead.`);
                        }
                    } else {
                        Hf.log(`error`, `Factory.deepStateReduction - Input reducer is invalid.`);
                    }
                };

                /* helper function to deep reconfig original state by a reconfiguration. */
                const deepStateReconfiguration = function deepStateReconfiguration (originalState, reconfiguration, parentState, parentKey = ``) {
                    parentKey = Hf.isString(parentKey) ? parentKey : ``;
                    if (Hf.isObject(originalState) && Hf.isObject(reconfiguration)) {
                        const originalStateKeys = Object.keys(originalState);
                        const reconfigurationKeys = Object.keys(reconfiguration);
                        if (originalStateKeys.length >= reconfigurationKeys.length && reconfigurationKeys.every((key) => originalStateKeys.some((_key) => _key === key))) {
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
                                if (Hf.isObject(originalStateItem) && Hf.isObject(reconfigurationItem) || Hf.isArray(originalStateItem) && Hf.isArray(reconfigurationItem)) {
                                    deepStateReconfiguration(originalStateItem, reconfigurationItem, originalState, key);
                                } else if (Hf.isObject(originalStateItem) && !Hf.isObject(reconfigurationItem) || Hf.isArray(originalStateItem) && !Hf.isArray(reconfigurationItem)) {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state object at key:${key} as it is not null initially.`);
                                } else {
                                    originalState[key] = reconfigurationItem;
                                }
                            });
                        } else {
                            if (Hf.isObject(parentState) && parentState.hasOwnProperty(parentKey)) {
                                if (parentState[parentKey] === null) {
                                    parentState[parentKey] = reconfiguration;
                                } else {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state object at key:${parentKey} as it is not null initially.`);
                                }
                            } else {
                                Hf.log(`warn1`, `Factory.deepStateReconfiguration - Top level state object is non-configurable.`);
                            }
                        }
                    } else if (Hf.isArray(originalState) && Hf.isArray(reconfiguration)) {
                        if (originalState.length === reconfiguration.length) {
                            originalState.forEach((originalStateItem, key) => {
                                const reconfigurationItem = reconfiguration[key];
                                if (Hf.isObject(originalStateItem) && Hf.isObject(reconfigurationItem) || Hf.isArray(originalStateItem) && Hf.isArray(reconfigurationItem)) {
                                    deepStateReconfiguration(originalStateItem, reconfigurationItem, originalState, key);
                                } else if (Hf.isObject(originalStateItem) && !Hf.isObject(reconfigurationItem) || Hf.isArray(originalStateItem) && !Hf.isArray(reconfigurationItem)) {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state array at key:${key} as it is not null initially.`);
                                } else {
                                    originalState[key] = reconfigurationItem;
                                }
                            });
                        } else {
                            if (Hf.isObject(parentState) && parentState.hasOwnProperty(parentKey)) {
                                if (parentState[parentKey] === null) {
                                    parentState[parentKey] = reconfiguration;
                                } else {
                                    Hf.log(`warn1`, `Factory.deepStateReconfiguration - Cannot reconfig state array at key:${parentKey} as it is not null initially.`);
                                }
                            } else {
                                Hf.log(`warn1`, `Factory.deepStateReconfiguration - Top level state array is non-configurable.`);
                            }
                        }
                    } else {
                        Hf.log(`error`, `Factory.deepStateReconfiguration - Input reconfiguration is invalid.`);
                    }
                };

                // FIXME: error thrown in collect method when enclosure is empty.
                product = composite.mixin(...Hf.collect(enclosure, ...Object.keys(enclosure))).mixin({
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
                     * @description - Update state accessor.
                     *
                     * @method updateStateAccessor
                     * @return void
                     */
                    updateStateAccessor: function updateStateAccessor () {
                        currentStateAccessor = nextStateAccessor;
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

                        Hf.clear(originalStateAccessorAtPathCache);
                        /* reset all state data element mutation history recorded */
                        data.flush(`state`);
                    },
                    /**
                     * @description - Clear all state mutation history.
                     *
                     * @method flushState
                     * @return void
                     */
                    flushState: function flushState () {
                        Hf.clear(originalStateAccessorAtPathCache);
                        /* reset all state data element mutation history recorded */
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
                        let stateMutated = false;
                        if (Hf.isObject(reducer)) {
                            deepStateReduction(currentStateAccessor, reducer);
                            nextStateAccessor = stateCursor.getAccessor();
                            stateMutated = currentStateAccessor !== nextStateAccessor;
                        } else {
                            Hf.log(`error`, `Factory.reduceState - Input reducer is invalid.`);
                        }
                        return stateMutated;
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
                        if (Hf.isObject(reconfiguration)) {
                            const skipNonmutationReferals = true;
                            deepStateReconfiguration(originalStateAccessor, reconfiguration);
                            nextStateAccessor = stateCursor.getAccessor(skipNonmutationReferals);
                        } else {
                            Hf.log(`error`, `Factory.reconfigState - Input reconfiguration is invalid.`);
                        }
                    },
                    /**
                     * @description - Do a strict mutation of original state by a reducer at selected pathId.
                     *                The reducer object must have matching property keys/indexes as the original state.
                     *
                     * @method reduceStateAtPath
                     * @param {object} reducer
                     * @param {string|array} pathId - State pathId.
                     * @return {boolean}
                     */
                    reduceStateAtPath: function reduceStateAtPath (reducer, pathId) {
                        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
                        if (!Hf.isNonEmptyArray(pathId)) {
                            Hf.log(`error`, `Factory.reduceStateAtPath - Input pathId is invalid.`);
                        } else {
                            let stateMutated = false;

                            pathId.unshift(`state`);

                            if (Hf.isObject(reducer)) {
                                const stateCursorAtPath = data.select(pathId);
                                const stateAccessorAtPath = stateCursorAtPath.getAccessor();

                                deepStateReduction(stateAccessorAtPath, reducer);
                                nextStateAccessor = stateCursor.getAccessor();
                                stateMutated = currentStateAccessor !== nextStateAccessor;
                            } else {
                                Hf.log(`error`, `Factory.reduceStateAtPath - Input reducer is invalid.`);
                            }
                            return stateMutated;
                        }
                    },
                    /**
                    * @description - Do a reconfiguration original state by a reconfiguration at selected pathId. Allows modification inner state schema.
                    *                Top level state schema is still non-configurable.
                     *
                     * @method reconfigStateAtPath
                     * @param {object} reconfiguration
                     * @param {string|array} pathId - State pathId.
                     * @return void
                     */
                    reconfigStateAtPath: function reconfigStateAtPath (reconfiguration, pathId) {
                        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
                        if (!Hf.isNonEmptyArray(pathId)) {
                            Hf.log(`error`, `Factory.reconfigStateAtPath - Input pathId is invalid.`);
                        } else {
                            pathId.unshift(`state`);

                            let stateAccessorAtPath;
                            const key = Hf.arrayToString(pathId, `.`);

                            if (!originalStateAccessorAtPathCache.hasOwnProperty(key)) {
                                originalStateAccessorAtPathCache[key] = data.select(pathId).getAccessor();
                                stateAccessorAtPath = originalStateAccessorAtPathCache[key];
                            } else {
                                stateAccessorAtPath = originalStateAccessorAtPathCache[key];
                            }

                            if (Hf.isObject(reconfiguration)) {
                                deepStateReconfiguration(stateAccessorAtPath, reconfiguration, null, ``);
                                nextStateAccessor = stateCursor.getAccessor();
                            } else {
                                Hf.log(`error`, `Factory.reconfigStateAtPath - Input reconfiguration is invalid.`);
                            }
                        }
                    }
                }).getTemplate();

                if (Hf.isNonEmptyObject(state)) {
                    if (product.reduceState(state)) {
                        product.updateStateAccessor();
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
                data.flush(`state`);
            } else {
                // FIXME: error thrown in collect method when enclosure is empty.
                product = composite.mixin(...Hf.collect(enclosure, ...Object.keys(enclosure))).getTemplate();
            }
            let revealedProduct = Hf.reveal(product, {
                exclusion
            });

            /* if a function with initialization prefix is defined, call it once at init */
            Object.keys(product).filter((key) => {
                return Hf.isFunction(product[key]) && key.charAt(0) === INITIALIZATION_PREFIX;
            }).sort((fnNameA, fnNameB) => {
                if (fnNameA < fnNameB) {
                    return -1;
                }
                if (fnNameA > fnNameB) {
                    return 1;
                }
                return 0;
            }).map((fnName) => {
                return product[fnName];
            }).forEach((fn) => {
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
    if (!Hf.isObject(definition)) {
        Hf.log(`error`, `CompositeElement - Input composite definition object is invalid.`);
    } else {
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

        if (!Object.keys(enclosure).every((fnName) => Hf.isFunction(enclosure[fnName]))) {
            Hf.log(`error`, `CompositeElement - Input composite definition for enclosure object is invalid.`);
        } else {
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

            if (!Hf.isObject(element)) {
                Hf.log(`error`, `CompositeElement - Unable to create a composite element instance.`);
            } else {
                const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
                /* reveal only the public properties and functions */
                return revealFrozen(element);
            }
        }
    }
}
