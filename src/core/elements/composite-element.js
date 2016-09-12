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
'use strict'; // eslint-disable-line

/* load DataElement */
import DataElement from './data-element';

/* load CommonElement */
import CommonElement from './common-element';

/* create Hflow object */
const Hflow = CommonElement();

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
        let clonedEnclosure = Hflow.clone(composite._enclosure);

        if (Hflow.isEmpty(fnNames)) {
            Hflow.log(`warn0`, `CompositeElement.getEnclosure - Input enclosure function name array is empty.`);
        } else {
            return fnNames.filter((fnName) => {
                if (!Hflow.isString(fnName)) {
                    Hflow.log(`error`, `CompositeElement.getEnclosure - Input enclosure function name is invalid.`);
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
        let clonedTemplate = Hflow.clone(composite._template);

        if (Hflow.isEmpty(keys)) {
            Hflow.log(`warn0`, `CompositeElement.getTemplate - Input template key array is empty.`);
        } else {
            return keys.filter((key) => {
                if (!Hflow.isString(key)) {
                    Hflow.log(`error`, `CompositeElement.getTemplate - Input template key is invalid.`);
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
        return Hflow.clone(composite._exclusion);
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

        if (!Hflow.isEmpty(sources)) {
            const mixedTemplate = sources.filter((source) => {
                if (!(Hflow.isObject(source) || Hflow.isFunction(source))) {
                    Hflow.log(`warn0`, `CompositeElement.mixin - Input source is invalid.`);
                    return false;
                }
                return true;
            }).reduce((_mixedTemplate, source) => {
                let sourceObj = {};

                if (Hflow.isObject(source)) {
                    /* object literal mixins */
                    sourceObj = source;
                }
                if (Hflow.isFunction(source)) {
                    /* functional mixins */
                    source.call(sourceObj);
                }
                _mixedTemplate = Hflow.mix(sourceObj).with(_mixedTemplate);

                return _mixedTemplate;
            }, composite.getTemplate());

            if (!Hflow.isObject(mixedTemplate)) {
                Hflow.log(`error`, `CompositeElement.mixin - Unable to mixin methods of source object.`);
            } else {
                const definition = {
                    exclusion: composite.getExclusion(),
                    enclosure: composite.getEnclosure(),
                    template: mixedTemplate
                };
                return CompositeElement(definition); // eslint-disable-line
            }
        } else {
            Hflow.log(`warn0`, `CompositeElement.mixin - Input source array is empty.`);
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

        if (!Hflow.isEmpty(composites)) {
            composites = composites.filter((_composite) => {
                if (!Hflow.isSchema({
                    // NOTE: for composite with internal private state, use enclosure.
                    getEnclosure: `function`,
                    // NOTE: for composite with no internal private state, use template.
                    getTemplate: `function`,
                    getExclusion: `function`
                }).of(_composite)) {
                    Hflow.log(`warn0`, `CompositeElement.compose - Input composite object is invalid.`);
                    return false;
                }
                return true;
            });

            if (!Hflow.isEmpty(composites)) {
                const composedExclusion = composites.reduce((_composedExclusion, _composite) => {
                    const mergeExclusion = Hflow.compose(_composite.getExclusion, Hflow.merge);
                    _composedExclusion = mergeExclusion().with(_composedExclusion);
                    return _composedExclusion;
                }, composite.getExclusion());
                const composedEnclosure = composites.reduce((_composedEnclosure, _composite) => {
                    const mixEnclosure = Hflow.compose(_composite.getEnclosure, Hflow.mix);
                    _composedEnclosure = mixEnclosure().with(_composedEnclosure);
                    return _composedEnclosure;
                }, composite.getEnclosure());
                const composedTemplate = composites.reduce((_composedTemplate, _composite) => {
                    const mixTemplate = Hflow.compose(_composite.getTemplate, Hflow.mix);
                    _composedTemplate = mixTemplate().with(_composedTemplate);
                    return _composedTemplate;
                }, composite.getTemplate());

                if (!(Hflow.isObject(composedEnclosure) && Hflow.isObject(composedTemplate))) {
                    Hflow.log(`error`, `CompositeElement.compose - Unable to compose composites set.`);
                } else {
                    const definition = {
                        exclusion: composedExclusion,
                        enclosure: composedEnclosure,
                        template: composedTemplate
                    };
                    return CompositeElement(definition); // eslint-disable-line
                }
            } else {
                Hflow.log(`error`, `CompositeElement.compose - Input composites set is invalid.`);
            }
        } else {
            Hflow.log(`warn0`, `CompositeElement.compose - Input composites set is empty.`);
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
        initialState = Hflow.isObject(initialState) ? initialState : {};
        /* return a factory function */
        return function Factory (state = {}) {
            const exclusion = composite.getExclusion();
            const enclosure = composite.getEnclosure();
            const data = DataElement();
            let product;

            if (!Hflow.isEmpty(initialState)) {
                const cursor = data.read(initialState, `state`).select(`state`);
                /* helper function to deep mutate product state by a mutator. */
                const deepStateMutation = function deepStateMutation (_source, _mutator, _pathId = []) {
                    _pathId = Hflow.isArray(_pathId) ? _pathId : [];
                    if (Hflow.isEmpty(_pathId)) {
                        if (Hflow.isObject(_source) && Hflow.isObject(_mutator)) {
                            Object.keys(_source).filter((key) => {
                                if (!_mutator.hasOwnProperty(key)) {
                                    Hflow.log(`warn0`, `Factory.deepStateMutation - Source key:${key} is not defined in mutator.`);
                                    return false;
                                } else if (cursor.isItemComputable(key)) {
                                    Hflow.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of computable key:${key}.`);
                                    return false;
                                } else if (Hflow.isFunction(_source[key])) {
                                    Hflow.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of function key:${key}.`);
                                    return false;
                                }
                                return true;
                            }).forEach((key) => {
                                const sourceItem = _source[key];
                                const mutatorItem = _mutator[key];
                                if ((Hflow.isObject(sourceItem) && Hflow.isObject(mutatorItem)) ||
                                    (Hflow.isArray(sourceItem) && Hflow.isArray(mutatorItem))) {
                                    deepStateMutation(sourceItem, mutatorItem);
                                } else {
                                    _source[key] = mutatorItem;
                                }
                            });
                        } else if (Hflow.isArray(_source) && Hflow.isArray(_mutator)) {
                            _source.filter((sourceItem, key) => {
                                if (Hflow.isFunction(sourceItem)) {
                                    Hflow.log(`warn0`, `Factory.deepStateMutation - Ignore mutation of function key:${key}.`);
                                    return false;
                                }
                                return key < _mutator.length;
                            }).forEach((sourceItem, key) => {
                                const mutatorItem = _mutator[key];
                                if ((Hflow.isObject(sourceItem) && Hflow.isObject(mutatorItem)) ||
                                    (Hflow.isArray(sourceItem) && Hflow.isArray(mutatorItem))) {
                                    deepStateMutation(sourceItem, mutatorItem);
                                } else {
                                    _source[key] = mutatorItem;
                                }
                            });
                        } else {
                            Hflow.log(`error`, `Factory.deepStateMutation - Input mutator is invalid.`);
                        }
                    } else {
                        const key = _pathId.shift();
                        if (Hflow.isObject(_source) && _source.hasOwnProperty(key)) {
                            if (Hflow.isEmpty(_pathId)) {
                                if (Hflow.isObject(_mutator) && _mutator.hasOwnProperty(key)) {
                                    deepStateMutation(_source[key], _mutator[key], _pathId.slice(0));
                                }
                            } else {
                                deepStateMutation(_source[key], _mutator, _pathId.slice(0));
                            }
                        } else if (Hflow.isArray(_source) && Hflow.isInteger(key) && key < _source.length) {
                            if (Hflow.isEmpty(_pathId)) {
                                if (Hflow.isArray(_mutator) && key < _mutator.length) {
                                    deepStateMutation(_source[key], _mutator[key], _pathId.slice(0));
                                }
                            } else {
                                deepStateMutation(_source[key], _mutator, _pathId.slice(0));
                            }
                        } else {
                            Hflow.log(`error`, `Factory.deepStateMutation - Path ends at property key:${key}.`);
                        }
                    }
                };
                product = composite.mixin(...Hflow.collect(enclosure, ...Object.keys(enclosure))).mixin({
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
                    getStateAccessor: function getStateAccessor () {
                        return product._cursor.getAccessor();
                    },
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
                        if (Hflow.isObject(mutator)) {
                            deepStateMutation(product._state, mutator);
                            if (product._cursor.isImmutable()) {
                                const currentState = product._cursor.getAccessor();
                                stateMutated = product._state !== currentState;
                            }
                        } else {
                            Hflow.log(`error`, `Factory.mutateState - Input mutator is invalid.`);
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
                        pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
                        if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
                            Hflow.log(`error`, `Factory.mutateStateAtPath - Input pathId is invalid.`);
                        } else {
                            let stateMutated = false;
                            if (Hflow.isObject(mutator)) {
                                deepStateMutation(product._state, mutator, pathId.slice(0));
                                if (product._cursor.isImmutable()) {
                                    const currentState = product._cursor.getAccessor();
                                    stateMutated = product._state !== currentState;
                                }
                            } else {
                                Hflow.log(`error`, `Factory.mutateStateAtPath - Input mutator is invalid.`);
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

                if (Hflow.isObject(state) && !Hflow.isEmpty(state)) {
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
                product = composite.mixin(...Hflow.collect(enclosure, ...Object.keys(enclosure))).getTemplate();
            }
            let revealedProduct = Hflow.reveal(product, {
                exclusion
            });

            /* reset all state data element mutation history recorded during init */
            data.flush(`state`);

            /* if a function with initialization prefix is defined, call it once at init */
            Object.keys(product).filter((key) => {
                return Hflow.isFunction(product[key]) && key.charAt(0) === INITIALIZATION_PREFIX;
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
    if (!Hflow.isObject(definition)) {
        Hflow.log(`error`, `CompositeElement - Input composite definition object is invalid.`);
    } else {
        const {
            enclosure,
            template,
            exclusion
        } = Hflow.fallback({
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

        if (!Object.keys(enclosure).every((fnName) => Hflow.isFunction(enclosure[fnName]))) {
            Hflow.log(`error`, `CompositeElement - Input composite definition for enclosure object is invalid.`);
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

            if (!Hflow.isObject(element)) {
                Hflow.log(`error`, `CompositeElement - Unable to create a composite element instance.`);
            } else {
                const revealFrozen = Hflow.compose(Hflow.reveal, Object.freeze);
                /* reveal only the public properties and functions */
                return revealFrozen(element);
            }
        }
    }
}
