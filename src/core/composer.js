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
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../hyperflow';

/* load CompositeElement */
import CompositeElement from './elements/composite-element';

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
                static: `object|undefined`,
                state: `object|undefined`,
                composites: `array|undefined`
            }).of(definition)) {
                Hf.log(`error`, `Composer.augment - Input factory definition for state object or composites array is invalid.`);
            } else {
                const {
                    static: _static,
                    state,
                    composites
                } = Hf.fallback({
                    constant: {},
                    state: {},
                    composites: []
                }).of(definition);
                /* collect and set method if defined */
                // const methodDefinition = Object.keys(definition).filter((fnName) => {
                //     const fn = definition[fnName];
                //     return Hf.isFunction(fn);
                // }).reduce((_method, fnName) => {
                //     const fn = definition[fnName];
                //     _method[fnName] = fn;
                //     return _method;
                // }, {});
                const methodDefinition = Object.entries(definition).filter(([ fnName, fn ]) => Hf.isFunction(fn)).reduce((_method, [ fnName, fn ]) => { // eslint-disable-line
                    _method[fnName] = fn;
                    return _method;
                }, {});
                let factory;
                let initialStatic;
                let initialState;

                /* set constant definition if defined and then resolve the composite into a factory */
                if (!Hf.isEmpty(_static)) {
                    if (Object.keys(_static).every((key) => {
                        if (composer._static.hasOwnProperty(key)) {
                            Hf.log(`warn1`, `Composer.augment - Cannot redefine factory statiC key:${key}.`);
                            return false;
                        }
                        return true;
                    })) {
                        initialStatic = Hf.merge(composer._static).with(_static);
                    }
                } else {
                    initialStatic = composer._static;
                }

                /* set state definition if defined and then resolve the composite into a factory */
                if (!Hf.isEmpty(state)) {
                    if (Object.keys(state).every((key) => {
                        if (composer._state.hasOwnProperty(key)) {
                            Hf.log(`warn1`, `Composer.augment - Cannot redefine factory state key:${key}.`);
                            return false;
                        }
                        return true;
                    })) {
                        initialState = Hf.merge(composer._state).with(state);
                    }
                } else {
                    initialState = composer._state;
                }

                if (!Hf.isEmpty(composites)) {
                    factory = composer._composite.compose(...composites).mixin(methodDefinition).resolve(initialStatic, initialState);
                } else {
                    factory = composer._composite.mixin(methodDefinition).resolve(initialStatic, initialState);
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
            static: `object|undefined`,
            state: `object|undefined`,
            composites: `array|undefined`
        }).of(definition)) {
            Hf.log(`error`, `Composer - Input factory definition for state object or composites array is invalid.`);
        } else {
            const {
                static: _static,
                state,
                exclusion,
                composites
            } = Hf.fallback({
                static: {},
                state: {},
                exclusion: {},
                composites: []
            }).of(definition);
            const compositeDefinition = {
                exclusion,
                enclosure: {}
            };

            // compositeDefinition.enclosure = Object.keys(definition).filter((key) => {
            //     return key !== `static` && key !== `state` && key !== `composites` && Hf.isFunction(definition[key]);
            // }).reduce((_enclosure, key) => {
            //     _enclosure[key] = definition[key];
            //     return _enclosure;
            // }, {});
            compositeDefinition.enclosure = Object.entries(definition).filter(([ key, value ]) => {
                return key !== `static` && key !== `state` && key !== `composites` && Hf.isFunction(value);
            }).reduce((_enclosure, [ key, value ]) => {
                _enclosure[key] = value;
                return _enclosure;
            }, {});

            if (Hf.isEmpty(compositeDefinition.enclosure)) {
                Hf.log(`error`, `Composer - Input enclose function is invalid.`);
            } else {
                const composer = Object.create(ComposerPrototype, {
                    _static: {
                        value: _static,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    },
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
