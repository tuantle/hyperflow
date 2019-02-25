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


import CommonElement from './elements/common-element';

/* load CompositeElement */
import CompositeElement from './elements/composite-element';

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
    // getState () {
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
    // getComposite () {
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
    augment (definition) {
        const composer = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isSchema({
                static: `object|undefined`,
                state: `object|undefined`,
                composites: `array|undefined`
            }).of(definition)) {
                Hf.log(`error`, `Composer.augment - Input factory definition for state object or composites array is invalid.`);
            }
        }

        const {
            static: _static,
            state,
            composites
        } = Hf.fallback({
            static: {},
            state: {},
            composites: []
        }).of(definition);
        /* collect and set method if defined */
        const fnDefinition = Object.entries(definition).filter(([ fnName, fn ]) => Hf.isFunction(fn)).reduce((_fn, [ fnName, fn ]) => { // eslint-disable-line
            _fn[fnName] = fn;
            return _fn;
        }, {});
        let factory;
        let initialStatic;
        let initialState;

        /* set constant definition if defined and then resolve the composite into a factory */
        if (!Hf.isEmpty(_static)) {
            if (Object.keys(_static).every((key) => {
                if (composer._static.hasOwnProperty(key)) {
                    Hf.log(`warn1`, `Composer.augment - Cannot redefine factory static key:${key}.`);
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

        if (Hf.isNonEmptyArray(composites)) {
            factory = composer._composite.compose(...composites).mixin(fnDefinition).resolve(initialStatic, initialState);
        } else {
            factory = composer._composite.mixin(fnDefinition).resolve(initialStatic, initialState);
        }

        if (Hf.DEVELOPMENT) {
            if (!Hf.isFunction(factory)) {
                Hf.log(`error`, `Composer.augment - Unable to augment and return a factory.`);
            }
        }

        return factory;
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
    if (Hf.DEVELOPMENT) {
        if (!Hf.isSchema({
            static: `object|undefined`,
            state: `object|undefined`,
            composites: `array|undefined`
        }).of(definition)) {
            Hf.log(`error`, `Composer - Input factory definition for state object or composites array is invalid.`);
        }
    }

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

    compositeDefinition.enclosure = Object.entries(definition).filter(([ key, value ]) => {
        return key !== `static` && key !== `state` && key !== `composites` && Hf.isFunction(value);
    }).reduce((_enclosure, [ key, value ]) => {
        _enclosure[key] = value;
        return _enclosure;
    }, {});

    if (Hf.DEVELOPMENT) {
        if (Hf.isEmpty(compositeDefinition.enclosure)) {
            Hf.log(`error`, `Composer - Input enclose function is invalid.`);
        }
    }

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
                    return Hf.isNonEmptyArray(composites) ? composite.compose(...composites) : composite;
                }
            })(),
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(composer)) {
            Hf.log(`error`, `Composer - Unable to create a composer factory instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return Hf.compose(Hf.reveal, Object.freeze)(composer);
}
