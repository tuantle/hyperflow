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
 * @module Composer
 * @description -  A composer for creating factories.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isFunction,
    isObject,
    isNonEmptyArray,
    isNonEmptyObject,
    isEmpty,
    isSchema,
    compose,
    merge,
    fallback,
    reveal,
    log
} from '../libs/utils/common-util';

import Composite from './composite';

const RESERVED_KEYWORDS = [ `static`, `exclusion`, `composites` ];

/**
 * @description - A composer prototypes.
 *
 * ComposerPrototype
 */
const ComposerPrototype = Object.create({}).prototype = {
    /**
     * @description - Create a new factory by augmentation.
     *
     * @method augment
     * @param {object} definition
     * @returns {function}
     */
    augment (definition) {
        const composer = this;

        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                static: `object|undefined`,
                composites: `array|undefined`
            }).of(definition)) {
                log(`error`, `Composer.augment - Input factory definition object is invalid.`);
            }
        }

        const factoryFnDefinition = Object.entries(definition).filter(([ fnName, fn ]) => {
            return !RESERVED_KEYWORDS.includes(fnName) && isFunction(fn);
        }).reduce((fnDefinition, [ fnName, fn ]) => {
            fnDefinition[fnName] = fn;
            return fnDefinition;
        }, {});
        let factoryNonFnDefinition = Object.entries(definition).filter(([ key, value ]) => {
            return !RESERVED_KEYWORDS.includes(key) && !isFunction(value);
        }).reduce((nonFnDefinition, [ key, value ]) => {
            nonFnDefinition[key] = value;
            return nonFnDefinition;
        }, {});
        const factoryComposites = definition.composites;
        let factoryStatic = definition.static;
        let factory;

        if (isNonEmptyObject(factoryStatic)) {
            if (ENV.DEVELOPMENT) {
                if (Object.keys(factoryStatic).some((key) => RESERVED_KEYWORDS.includes(key))) {
                    log(`error`, `Composer.augment - Input factory static property key cannot be any of [ ${RESERVED_KEYWORDS.join(`, `)} ].`);
                }
                if (isNonEmptyObject(composer._static)) {
                    Object.keys(factoryStatic).forEach((key) => {
                        if (Object.prototype.hasOwnProperty.call(composer, key)) {
                            log(`warn1`, `Composer.augment - Overriding factory static property key:${key}.`);
                        }
                    });
                }
            }
            factoryStatic = Object.entries(factoryStatic).filter(([ key, value ]) => { // eslint-disable-line
                return !RESERVED_KEYWORDS.includes(key);
            }).reduce((_static, [ key, value ]) => {
                _static[key] = value;
                return _static;
            }, {});
            if (isNonEmptyObject(composer._static)) {
                factoryStatic = merge(composer._static).with(factoryStatic);
            }
        } else {
            factoryStatic = composer._static;
        }

        if (isNonEmptyArray(factoryComposites)) {
            factory = composer._composite.compose(factoryComposites).mixin([ factoryFnDefinition ]).resolve({
                static: factoryStatic,
                ...factoryNonFnDefinition
            });
        } else {
            factory = composer._composite.mixin([ factoryFnDefinition ]).resolve({
                static: factoryStatic,
                ...factoryNonFnDefinition
            });
        }

        if (ENV.DEVELOPMENT) {
            if (!isFunction(factory)) {
                log(`error`, `Composer.augment - Unable to augment and return a factory.`);
            }
        }

        return factory;
    }
};

/**
 * @description - A composer module.
 *
 * @module Composer
 * @param {object} definition
 * @return {object}
 */
export default function Composer (definition) {
    if (ENV.DEVELOPMENT) {
        if (!isSchema({
            static: `object|undefined`,
            exclusion: `object|undefined`,
            composites: `array|undefined`
        }).of(definition)) {
            log(`error`, `Composer - Input composite definition object is invalid.`);
        }
    }

    const {
        exclusion,
        composites
    } = fallback({
        exclusion: {
            prefixes: []
        }
    }).of(definition);
    const compositeDefinition = {
        exclusion,
        enclosure: {}
    };
    let _static = definition.static;

    if (isNonEmptyObject(_static)) {
        if (ENV.DEVELOPMENT) {
            if (Object.keys(_static).some((key) => RESERVED_KEYWORDS.includes(key))) {
                log(`error`, `Composer - Input composite static property key cannot be any of [ ${RESERVED_KEYWORDS.join(`, `)} ].`);
            }
        }
        _static = Object.entries(_static).filter(([ key, value ]) => { // eslint-disable-line
            return !RESERVED_KEYWORDS.includes(key);
        }).reduce((__static, [ key, value ]) => {
            __static[key] = value;
            return __static;
        }, {});
    }

    compositeDefinition.enclosure = Object.entries(definition).filter(([ key, value ]) => {
        return !RESERVED_KEYWORDS.includes(key) && isFunction(value);
    }).reduce((_enclosure, [ key, value ]) => {
        _enclosure[key] = value;
        return _enclosure;
    }, {});

    if (ENV.DEVELOPMENT) {
        if (isEmpty(compositeDefinition.enclosure)) {
            log(`error`, `Composer - Input composite definition for enclose is invalid.`);
        }
    }

    let composite = Composite(compositeDefinition);

    if (ENV.DEVELOPMENT) {
        if (!isObject(composite)) {
            log(`error`, `Composer - Unable to create a composite.`);
        }
    }

    composite = isNonEmptyArray(composites) ? composite.compose(composites) : composite;

    const composer = Object.create(ComposerPrototype, {
        _static: {
            value: _static,
            writable: false,
            configurable: false,
            enumerable: false
        },
        _composite: {
            value: composite,
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(composer)) {
            log(`error`, `Composer - Unable to create a composer instance.`);
        }
    }

    return compose(reveal, Object.freeze)(composer);
}
