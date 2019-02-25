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
 * @module DescriptorElement
 * @description - A data descriptor element for describing:
 *                * observable object property
 *                * computable object property
 *                * constrainable object property
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line


import CommonElement from './common-element';

/* load descriptors */
import ConstrainableDescriptor from './descriptors/constrainable-descriptor';
import ObservableDescriptor from './descriptors/observable-descriptor';
import ComputableDescriptor from './descriptors/computable-descriptor';

const Hf = CommonElement();

/**
 * @description - A data descriptor element prototypes.
 *
 * DescriptorElementPrototype
 */
const DescriptorElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Select a descriptor type.
     *
     * @method select
     * @param {string} type
     * @return {object}
     */
    select (type) {
        const desc = this;
        let registry;
        let Descriptor;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(type)) {
                Hf.log(`error`, `DescriptorElement.select - Input descriptor type is invalid.`);
            }
        }

        switch (type) {
        case `constrainable`:
            registry = desc._constrainableRegistry;
            Descriptor = ConstrainableDescriptor;
            break;
        case `computable`:
            registry = desc._computableRegistry;
            Descriptor = ComputableDescriptor;
            break;
        case `observable`:
            registry = desc._observableRegistry;
            Descriptor = ObservableDescriptor;
            break;
        default:
            Hf.log(`error`, `DescriptorElement.select - Unknow descriptor type:${type}.`);
        }

        return {
            /**
             * @description - Check that descriptor has a description at Id.
             *
             * @method select.hasDescription
             * @param id
             * @returns {boolean}
             */
            hasDescription (id) {
                return Hf.isString(id) ? registry.hasOwnProperty(id) : false;
            },
            /**
             * @description - Get a description.
             * @method select.getDescription
             * @param id
             * @returns {object}
             */
            getDescription (id) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isString(id)) {
                        Hf.log(`error`, `DescriptorElement.select.getDescription - Input description Id is invalid.`);
                    } else if (!this.hasDescription(id)) {
                        Hf.log(`error`, `DescriptorElement.select.getDescription - Description Id:${id} is not defined.`);
                    }
                }

                return registry[id];
            },
            /**
             * @description - Add a description.
             *
             * @method select.addDescription
             * @param {string} id
             * @return {object}
             */
            addDescription (id) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isString(id)) {
                        Hf.log(`error`, `DescriptorElement.select.addDescription - Input description Id is invalid.`);
                    } else if (this.hasDescription(id)) {
                        Hf.log(`error`, `DescriptorElement.select.addDescription - Description Id:${id} is already added.`);
                    }
                }

                registry[id] = Descriptor(id);
                return registry[id];
            },
            /**
             * @description - Remove a description.
             *
             * @method select.removeDescription
             * @param {string} id
             * @return void
             */
            removeDescription (id) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isString(id)) {
                        Hf.log(`error`, `DescriptorElement.select.removeDescription - Input descriptor Id is invalid.`);
                    } else if (!this.hasDescription(id)) {
                        Hf.log(`error`, `DescriptorElement.select.removeDescription - Descriptor Id:${id} is not defined.`);
                    }
                }

                registry[id].unassign();
                delete registry[id];
                // registry[id] = undefined;
            }
        };
    }
};

/**
 * @description - A descriptor element module.
 *
 * @module DescriptorElement
 * @return {object}
 */
export default function DescriptorElement () {
    const element = Object.create(DescriptorElementPrototype, {
        _constrainableRegistry: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        },
        _computableRegistry: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        },
        _observableRegistry: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        }
    });

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(element)) {
            Hf.log(`error`, `DescriptorElement - Unable to create a descriptor element instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return Hf.compose(Hf.reveal, Object.freeze)(element);
}
