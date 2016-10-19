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
            const data = DataElement();
            let product;

            if (!Hf.isEmpty(initialState)) {
                const cursor = data.read(initialState, `state`).select(`state`);
                /* helper function to deep mutate product state by a mutator. */
                const deepStateMutation = function deepStateMutation (_source, _mutator, _pathId = []) {
                    _pathId = Hf.isArray(_pathId) ? _pathId : [];
                    if (Hf.isEmpty(_pathId)) {
                        if (Hf.isObject(_source) && Hf.isObject(_mutator)) {
                            Object.keys(_source).filter((key) => {
                                if (!_mutator.hasOwnProperty(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateMutation - Source key:${key} is not defined in mutator.`);
                                    return false;
                                } else if (cursor.isItemComputable(key)) {
                                    Hf.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of computable key:${key}.`);
                                    return false;
                                } else if (Hf.isFunction(_source[key])) {
                                    Hf.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of function key:${key}.`);
                                    return false;
                                }
                                return true;
                            }).forEach((key) => {
                                const sourceItem = _source[key];
                                const mutatorItem = _mutator[key];
                                if ((Hf.isObject(sourceItem) && Hf.isObject(mutatorItem)) ||
                                    (Hf.isArray(sourceItem) && Hf.isArray(mutatorItem))) {
                                    deepStateMutation(sourceItem, mutatorItem);
                                } else {
                                    _source[key] = mutatorItem;
                                }
                            });
                        } else if (Hf.isArray(_source) && Hf.isArray(_mutator)) {
                            _source.filter((sourceItem, key) => {
                                if (Hf.isFunction(sourceItem)) {
                                    Hf.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of function key:${key}.`);
                                    return false;
                                }
                                return key < _mutator.length;
                            }).forEach((sourceItem, key) => {
                                const mutatorItem = _mutator[key];
                                if ((Hf.isObject(sourceItem) && Hf.isObject(mutatorItem)) ||
                                    (Hf.isArray(sourceItem) && Hf.isArray(mutatorItem))) {
                                    deepStateMutation(sourceItem, mutatorItem);
                                } else {
                                    _source[key] = mutatorItem;
                                }
                            });
                        } else {
                            Hf.log(`error`, `Factory.deepStateMutation - Input mutator is invalid.`);
                        }
                    } else {
                        const key = _pathId.shift();
                        if (Hf.isObject(_source) && _source.hasOwnProperty(key)) {
                            if (Hf.isEmpty(_pathId)) {
                                if (Hf.isObject(_mutator) && _mutator.hasOwnProperty(key)) {
                                    deepStateMutation(_source[key], _mutator[key], _pathId.slice(0));
                                }
                            } else {
                                deepStateMutation(_source[key], _mutator, _pathId.slice(0));
                            }
                        } else if (Hf.isArray(_source) && Hf.isInteger(key) && key < _source.length) {
                            if (Hf.isEmpty(_pathId)) {
                                if (Hf.isArray(_mutator) && key < _mutator.length) {
                                    deepStateMutation(_source[key], _mutator[key], _pathId.slice(0));
                                }
                            } else {
                                deepStateMutation(_source[key], _mutator, _pathId.slice(0));
                            }
                        } else {
                            Hf.log(`error`, `Factory.deepStateMutation - Path ends at property key:${key}.`);
                        }
                    }
                };
                // FIXME: error thrown in collect method when enclosure is empty.
                product = composite.mixin(...Hf.collect(enclosure, ...Object.keys(enclosure))).mixin({
                    /**
                     * @description - Check if product state has muated.
                     *
                     * @method didStateMutate
                     * @return {boolean}
                     */
                    didStateMutate: function didStateMutate () {
                        const currentState = product._cursor.getAccessor();
                        return product._state !== currentState;
                    },
                    /**
                     * @description - Get product state cursor.
                     *
                     * @method getStateCursor
                     * @return {object}
                     */
                    getStateCursor: function getStateCursor () {
                        return product._cursor;
                    },
                    /**
                     * @description - Get product state accessor.
                     *
                     * @method getStateAccessor
                     * @return {object}
                     */
                    // TODO: Remove if find no use case.
                    // getStateAccessor: function getStateAccessor () {
                    //     return product._cursor.getAccessor();
                    // },
                    /**
                     * @description - Get product state schema.
                     *
                     * @method getStateSchema
                     * @return {object}
                     */
                    // TODO: Remove if find no use case.
                    // getStateSchema: function getStateSchema () {
                    //     return product._cursor.getSchema();
                    // },
                    /**
                     * @description - Get product state as a plain object.
                     *
                     * @method getStateAsObject
                     * @return {object}
                     */
                    getStateAsObject: function getStateAsObject () {
                        return product._cursor.toObject();
                    },
                    /**
                     * @description - Update product state accessor.
                     *
                     * @method updateStateAccessor
                     * @return void
                     */
                    updateStateAccessor: function updateStateAccessor () {
                        const currentState = product._cursor.getAccessor();
                        if (product._state !== currentState) {
                            product._state = currentState;
                        }
                    },
                    /**
                     * @description - Do a strict mutation of product state. The mutator object must have matching
                     *                property keys/indexes as the product state.
                     *
                     * @method mutateState
                     * @param {object} mutator - Object contains the state mutator.
                     * @return {boolean}
                     */
                    mutateState: function mutateState (mutator) {
                        let stateMutated = false;
                        if (Hf.isObject(mutator)) {
                            deepStateMutation(product._state, mutator);
                            if (product._cursor.isImmutable()) {
                                const currentState = product._cursor.getAccessor();
                                stateMutated = product._state !== currentState;
                            }
                        } else {
                            Hf.log(`error`, `Factory.mutateState - Input mutator is invalid.`);
                        }
                        return stateMutated;
                    },
                    /**
                     * @description - Do a strict mutation of product state by a mutator at selected pathId.
                     *                The mutator object must have matching property keys/indexes as the product state.
                     *
                     * @method mutateStateAtPath
                     * @param {object} mutator - Object contains the state mutator.
                     * @param {string|array} pathId - State pathId.
                     * @return {boolean}
                     */
                    mutateStateAtPath: function mutateStateAtPath (mutator, pathId) {
                        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
                        if (!(Hf.isArray(pathId) && !Hf.isEmpty(pathId))) {
                            Hf.log(`error`, `Factory.mutateStateAtPath - Input pathId is invalid.`);
                        } else {
                            let stateMutated = false;
                            if (Hf.isObject(mutator)) {
                                deepStateMutation(product._state, mutator, pathId.slice(0));
                                if (product._cursor.isImmutable()) {
                                    const currentState = product._cursor.getAccessor();
                                    stateMutated = product._state !== currentState;
                                }
                            } else {
                                Hf.log(`error`, `Factory.mutateStateAtPath - Input mutator is invalid.`);
                            }
                            return stateMutated;
                        }
                    }
                }).getTemplate();

                Object.defineProperty(product, `_cursor`, {
                    value: cursor,
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
                Object.defineProperty(product, `_state`, {
                    value: cursor.getAccessor(),
                    writable: true,
                    configurable: false,
                    enumerable: false
                });

                if (Hf.isObject(state) && !Hf.isEmpty(state)) {
                    if (product.mutateState(state)) {
                        product.updateStateAccessor();
                    }
                }
                product = product._cursor.getContentItemKeys().reduce((productState, key) => {
                    Object.defineProperty(productState, key, {
                        get: function get () {
                            return product._state[key];
                        },
                        set: function set (value) {
                            product._state[key] = value;
                        },
                        configurable: false,
                        enumerable: true
                    });
                    return productState;
                }, product);
            } else {
                // FIXME: error thrown in collect method when enclosure is empty.
                product = composite.mixin(...Hf.collect(enclosure, ...Object.keys(enclosure))).getTemplate();
            }
            let revealedProduct = Hf.reveal(product, {
                exclusion
            });

            /* reset all state data element mutation history recorded during init */
            data.flush(`state`);

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
            return exclusion.prefixes.indexOf(prefix) === -1;
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
