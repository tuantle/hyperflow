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
 * @module Composite
 * @description - A composite can be resolved into a factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isFunction,
    isObject,
    isNonEmptyString,
    isNonEmptyArray,
    isNonEmptyObject,
    isSchema,
    clone,
    collect,
    compose,
    mix,
    merge,
    fallback,
    reveal,
    log
} from '../libs/utils/common-util';


const PRIVATE_PREFIX = `_`;
const INITIALIZATION_PREFIX = `$`;
const DEFAULT_EXCLUSION_PREFIXES = [ PRIVATE_PREFIX, INITIALIZATION_PREFIX ];
const DEFAULT_EXCLUSION_KEYS = [];
const RESERVED_KEYWORDS = [ `name`, `enclosure`, `template`, `exclusion` ];

let Composite;

/**
 * @description - A composite prototypes.
 *
 * CompositePrototype
 */
const CompositePrototype = Object.create({}).prototype = {
    /**
     * @description - Get a cloned set of composite enclosure.
     *
     * @method getEnclosure
     * @param {array} fnNames - Names of the composed enclosures to retrieve.
     * @return {object}
     */
    getEnclosure (...fnNames) {
        const composite = this;
        let clonedEnclosure = clone(composite._enclosure);

        if (!isNonEmptyArray(fnNames)) {
            // log(`warn0`, `Composite.getEnclosure - Input enclosure function name array is empty.`);
            return clonedEnclosure;
        }

        if (ENV.DEVELOPMENT) {
            if (fnNames.some((fnName) => !isString(fnName))) {
                log(`error`, `Composite.getEnclosure - Input enclosure function name is invalid.`);
            }
        }

        return fnNames.filter((fnName) => Object.prototype.hasOwnProperty.call(composite._enclosure, fnName)).reduce((enclosure, fnName) => {
            enclosure[fnName] = clonedEnclosure[fnName];
            return enclosure;
        }, {});
    },

    /**
     * @description - Get a cloned set of composite template.
     *
     * @method getTemplate
     * @param {array} keys - Names of the template methods and properties to retrieve.
     * @return {object}
     */
    getTemplate (...keys) {
        const composite = this;
        let clonedTemplate = clone(composite._template);

        if (!isNonEmptyArray(keys)) {
            // log(`warn0`, `Composite.getTemplate - Input template key array is empty.`);
            return clonedTemplate;
        }

        if (ENV.DEVELOPMENT) {
            if (keys.some((key) => !isString(key))) {
                log(`error`, `Composite.getTemplate - Input template key is invalid.`);
            }
        }
        return keys.filter((key) => Object.prototype.hasOwnProperty.call(composite._template, key)).reduce((template, key) => {
            template[key] = clonedTemplate[key];
            return template;
        }, {});
    },

    /**
     * @description - Get a cloned of composite exclusion option.
     *
     * @method getExclusion
     * @return {object}
     */
    getExclusion () {
        const composite = this;
        return clone(composite._exclusion);
    },

    /**
     * @description - Mix self with a set of methods defined by source.
     *
     * @method mixin
     * @param {array} sources
     * @param {object|undefined} definition
     * @return {object}
     */
    mixin (sources, definition) {
        const composite = this;

        if (ENV.DEVELOPMENT) {
            if (!isNonEmptyArray(sources)) {
                log(`warn0`, `Composite.mixin - Input source array is empty.`);
            } else if (sources.some((source) => !(isObject(source) || isFunction(source)))) {
                log(`warn0`, `Composite.mixin - Input source is invalid.`);
            }
        }

        const mixedTemplate = sources.reduce((_mixedTemplate, source) => {
            let sourceObj = {};

            if (isObject(source)) {
                /* object literal mixins */
                sourceObj = source;
            }
            if (isFunction(source)) {
                /* functional mixins */
                source.call(sourceObj, definition);
            }
            _mixedTemplate = mix(sourceObj).with(_mixedTemplate);

            return _mixedTemplate;
        }, composite.getTemplate());

        if (ENV.DEVELOPMENT) {
            if (!isObject(mixedTemplate)) {
                log(`error`, `Composite.mixin - Unable to mixin methods of source object.`);
            }
        }

        return Composite({
            exclusion: composite.getExclusion(),
            enclosure: composite.getEnclosure(),
            template: mixedTemplate
        });
    },

    /**
     * @description - Compose self with a set of composites into a new composite.
     *
     * @method compose
     * @param {array} composites - A set of composites.
     * @return {object}
     */
    compose (composites) {
        const composite = this;

        if (ENV.DEVELOPMENT) {
            if (!isNonEmptyArray(composites)) {
                log(`warn0`, `Composite.compose - Input composites set is empty.`);
            } else if (!composites.every((_composite) => isSchema({
                // NOTE: for composite with internal private state, use enclosure.
                getEnclosure: `function`,
                // NOTE: for composite with no internal private state, use template.
                getTemplate: `function`,
                getExclusion: `function`
            }).of(_composite))) {
                log(`error`, `Composite.compose - Input composite object is invalid.`);
            }
        }

        const composedExclusion = composites.reduce((_composedExclusion, _composite) => {
            const mergeExclusion = compose(_composite.getExclusion, merge);
            _composedExclusion = mergeExclusion().with(_composedExclusion);
            return _composedExclusion;
        }, composite.getExclusion());
        const composedEnclosure = composites.reduce((_composedEnclosure, _composite) => {
            const mixEnclosure = compose(_composite.getEnclosure, mix);
            _composedEnclosure = mixEnclosure().with(_composedEnclosure);
            return _composedEnclosure;
        }, composite.getEnclosure());
        const composedTemplate = composites.reduce((_composedTemplate, _composite) => {
            const mixTemplate = compose(_composite.getTemplate, mix);
            _composedTemplate = mixTemplate().with(_composedTemplate);
            return _composedTemplate;
        }, composite.getTemplate());

        if (ENV.DEVELOPMENT) {
            if (!(isObject(composedEnclosure) && isObject(composedTemplate))) {
                log(`error`, `Composite.compose - Unable to compose composites set.`);
            }
        }

        return Composite({
            exclusion: composedExclusion,
            enclosure: composedEnclosure,
            template: composedTemplate
        });
    },

    /**
     * @description - Resolve a composite with a definition object and returns a factory.
     *
     * @method resolve
     * @param {object} definition
     * @return {object}
     */
    resolve (definition) {
        const composite = this;

        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                static: `object|undefined`
            }).of(definition)) {
                log(`error`, `Composite.resolve - Input composite definition object is invalid.`);
            }
        }

        let factoryStatic = isNonEmptyObject(definition.static) ? definition.static : {};
        const exclusion = composite.getExclusion();
        const enclosure = composite.getEnclosure();

        if (isNonEmptyObject(factoryStatic)) {
            if (ENV.DEVELOPMENT) {
                if (Object.keys(factoryStatic).some((key) => RESERVED_KEYWORDS.includes(key))) {
                    log(`error`, `Composite.resolve - Input factory static property key cannot be any of [ ${RESERVED_KEYWORDS.join(`, `)} ].`);
                }
            }
            factoryStatic = Object.entries(factoryStatic).filter(([ key, value ]) => { // eslint-disable-line
                return !RESERVED_KEYWORDS.includes(key);
            }).reduce((_static, [ key, value ]) => {
                _static[key] = value;
                return _static;
            }, {});
        }

        /* return a factory function */
        return function Factory (name = `unamed`) {
            if (ENV.DEVELOPMENT) {
                if (!isNonEmptyString(name)) {
                    log(`error`, `Factory - Factory name is invalid.`);
                }
            }

            factoryStatic.name = name;

            let _initialized = false;
            const _product = composite.mixin([ factoryStatic, {
                /**
                 * @description - Check that factory is initialized.
                 *
                 * @method isInitialized
                 * @return {object}
                 */
                isInitialized () {
                    return _initialized;
                }
            }]).mixin([ ...collect(...Object.keys(enclosure)).from(enclosure) ], definition).getTemplate();

            Object.keys(factoryStatic).forEach((key) => {
                Object.defineProperty(_product, key, {
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            });

            const _revealedProduct = reveal(_product, {
                exclusion
            });

            /* if a function with initialization prefix is defined, call it once at init */
            Object.entries(_product)
                .filter(([ fnName, fn ]) => isFunction(fn) && fnName.charAt(0) === INITIALIZATION_PREFIX)
                .sort(([ fnNameA, fnA ], [ fnNameB, fnB ]) => fnNameA <= fnNameB ? -1 : 1).forEach(([ fnName, fn ]) => { // eslint-disable-line
                    fn.call(_revealedProduct);
                });

            _initialized = true;

            /* reveal only the public properties and functions */
            return Object.freeze(_revealedProduct);
        };
    }
};

/**
 * @description - A composite module.
 *
 * @module Composite
 * @param {object} definition - Composite definition.
 * @return {object}
 */
Composite = function (definition) {
    if (ENV.DEVELOPMENT) {
        if (!isSchema({
            enclosure: `object|undefined`,
            template: `object|undefined`,
            exclusion: `object|undefined`
        }).of(definition)) {
            log(`error`, `Composite - Input composite definition object is invalid.`);
        }
    }

    const {
        enclosure,
        template,
        exclusion
    } = fallback({
        enclosure: {},
        template: {},
        exclusion: {
            keys: DEFAULT_EXCLUSION_KEYS,
            prefixes: DEFAULT_EXCLUSION_PREFIXES
        }
    }).of(definition);

    if (ENV.DEVELOPMENT) {
        if (isNonEmptyObject(enclosure) && !Object.values(enclosure).every((fn) => isFunction(fn))) {
            log(`error`, `Composite - Input composite definition for enclosure object is invalid.`);
        }
    }

    exclusion.keys = [ ...new Set([ ...exclusion.keys, DEFAULT_EXCLUSION_KEYS ]) ];
    exclusion.prefixes = [ ...new Set([ ...exclusion.prefixes, DEFAULT_EXCLUSION_PREFIXES ]) ];

    const composite = Object.create(CompositePrototype, {
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

    if (ENV.DEVELOPMENT) {
        if (!isObject(composite)) {
            log(`error`, `Composite - Unable to create a composite instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return compose(reveal, Object.freeze)(composite);
};

export default Composite;
