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
 * @module Composer
 * @description -  A composer factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from './elements/composite-element';

/* load CommonElement */
import CommonElement from './elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - A composer factory prototypes.
 *
 * ComposerPrototype
 */
const ComposerPrototype = Object.create({}).prototype = {
    /* ----- Composer Prototype Definitions --------------------- */
    /**
     * @description - Get composer state.
     *
     * @method getState
     * @returns {object}
     */
    // TODO: To be removed if find no use case.
    // getState: function getState () {
    //     const composer = this;
    //     return Hf.clone(composer._state);
    // },
    /**
     * @description - Get composer composite.
     *
     * @method getComposite
     * @returns {object}
     */
    // TODO: To be removed if find no use case.
    // getComposite: function getComposite () {
    //     const composer = this;
    //     const compositeDefinition = {
    //         exclusion: composer._composite.getExclusion(),
    //         enclosure: composer._composite.getEnclosure(),
    //         template: composer._composite.getTemplate()
    //     };
    //     return CompositeElement(compositeDefinition);
    // },
    /**
     * @description - Create a new composer factory by augmentation.
     *
     * @method augment
     * @param {object} definition
     * @returns {function}
     */
    augment: function augment (definition) {
        if (Hf.isObject(definition)) {
            const composer = this;
            if (!Hf.isSchema({
                // TODO: Add static for state that will not be modify and is not a DataElement.
                // static: `object|undefined`,
                state: `object|undefined`,
                composites: `array|undefined`
            }).of(definition)) {
                Hf.log(`error`, `Composer.augment - Input factory definition for state object or composites array is invalid.`);
            } else {
                const {
                    state,
                    composites
                } = Hf.fallback({
                    state: {},
                    composites: []
                }).of(definition);
                /* collect and set method if defined */
                const method = Object.keys(definition).filter((fnName) => {
                    const fn = definition[fnName];
                    return Hf.isFunction(fn);
                }).reduce((_method, fnName) => {
                    const fn = definition[fnName];
                    _method[fnName] = fn;
                    return _method;
                }, {});
                let factory;
                let factoryState;

                /* set state definition if defined and then resolve the composite into a factory */
                if (!Hf.isEmpty(state)) {
                    if (Object.keys(state).every((key) => {
                        if (composer._state.hasOwnProperty(key)) {
                            Hf.log(`error`, `Composer.augment - Cannot redefine factory state key:${key}.`);
                            return false;
                        }
                        return true;
                    })) {
                        factoryState = Hf.merge(composer._state).with(state);
                    }
                } else {
                    factoryState = composer._state;
                }

                if (!Hf.isEmpty(composites)) {
                    factory = composer._composite.compose(...composites).mixin(method).resolve(factoryState);
                } else {
                    factory = composer._composite.mixin(method).resolve(factoryState);
                }

                if (!Hf.isFunction(factory)) {
                    Hf.log(`error`, `Composer.augment - Unable to augment and return a factory.`);
                } else {
                    return factory;
                }
            }
        } else {
            Hf.log(`error`, `Composer.augment - Input augmentation definition object is invalid.`);
        }
    }
};

/**
 * @description - A composer factory module.
 *
 * @module Composer
 * @param {object} definition
 * @return {object}
 */
export default function Composer (definition) {
    if (Hf.isObject(definition)) {
        if (!Hf.isSchema({
            state: `object|undefined`,
            composites: `array|undefined`
        }).of(definition)) {
            Hf.log(`error`, `Composer - Input factory definition for state object or composites array is invalid.`);
        } else {
            const {
                state,
                exclusion,
                composites
            } = Hf.fallback({
                state: {},
                exclusion: {},
                composites: []
            }).of(definition);
            const compositeDefinition = {
                exclusion,
                enclosure: {}
            };

            compositeDefinition.enclosure = Object.keys(definition).filter((key) => {
                return key !== `state` && key !== `composites` && Hf.isFunction(definition[key]);
            }).reduce((_enclosure, key) => {
                _enclosure[key] = definition[key];
                return _enclosure;
            }, {});

            if (Hf.isEmpty(compositeDefinition.enclosure)) {
                Hf.log(`error`, `Composer - Input enclose function is invalid.`);
            } else {
                const composer = Object.create(ComposerPrototype, {
                    _state: {
                        value: state,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    },
                    _composite: {
                        value: (() => {
                            const composite = CompositeElement(compositeDefinition);
                            if (!Hf.isObject(composite)) {
                                Hf.log(`error`, `Composer - Unable to create a composite.`);
                            } else {
                                return !Hf.isEmpty(composites) ? composite.compose(...composites) : composite;
                            }
                        })(),
                        writable: false,
                        configurable: false,
                        enumerable: false
                    }
                });

                if (!Hf.isObject(composer)) {
                    Hf.log(`error`, `Composer - Unable to create a composer factory instance.`);
                } else {
                    const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
                    /* reveal only the public properties and functions */
                    return revealFrozen(composer);
                }
            }
        }
    } else {
        Hf.log(`error`, `Composer - Input factory definition object is invalid.`);
    }
}
