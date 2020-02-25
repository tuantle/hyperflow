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
 * @module DataDescriptor
 * @description - A data descriptor for describing:
 *                * observable object property
 *                * computable object property
 *                * constrainable object property
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isObject,
    compose,
    reveal,
    log
} from '../utils/common-util';

/* load descriptors */
import ConstrainableDataDescription from './data-descriptions/constrainable-data-description';

import ObservableDataDescription from './data-descriptions/observable-data-description';

import ComputableDataDescription from './data-descriptions/computable-data-description';

/**
 * @description - A data descriptor prototypes.
 *
 * DataDescriptorPrototype
 */
const DataDescriptorPrototype = Object.create({}).prototype = {
    /**
     * @description - Select a descriptor type.
     *
     * @method select
     * @param {string} type
     * @return {object}
     */
    select (type) {
        const dataDescriptor = this;
        let registry;
        let DataDescription;

        if (ENV.DEVELOPMENT) {
            if (!isString(type)) {
                log(`error`, `DataDescriptor.select - Input description type is invalid.`);
            }
        }

        switch (type) {
        case `constrainable`:
            registry = dataDescriptor._constrainableRegistry;
            DataDescription = ConstrainableDataDescription;
            break;
        case `computable`:
            registry = dataDescriptor._computableRegistry;
            DataDescription = ComputableDataDescription;
            break;
        case `observable`:
            registry = dataDescriptor._observableRegistry;
            DataDescription = ObservableDataDescription;
            break;
        default:
            log(`error`, `DataDescriptor.select - Unknow description type:${type}.`);
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
                return isString(id) ? registry.hasOwnProperty(id) : false;
            },
            /**
             * @description - Get a description.
             * @method select.getDescription
             * @param id
             * @returns {object}
             */
            getDescription (id) {
                if (ENV.DEVELOPMENT) {
                    if (!isString(id)) {
                        log(`error`, `DataDescriptor.select.getDescription - Input data description Id is invalid.`);
                    } else if (!this.hasDescription(id)) {
                        log(`error`, `DataDescriptor.select.getDescription - Data description Id:${id} is not defined.`);
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
                if (ENV.DEVELOPMENT) {
                    if (!isString(id)) {
                        log(`error`, `DataDescriptor.select.addDescription - Input data description Id is invalid.`);
                    } else if (this.hasDescription(id)) {
                        log(`error`, `DataDescriptor.select.addDescription - Data description Id:${id} is already added.`);
                    }
                }

                registry[id] = DataDescription(id);
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
                if (ENV.DEVELOPMENT) {
                    if (!isString(id)) {
                        log(`error`, `DataDescriptor.select.removeDescription - Input data description Id is invalid.`);
                    } else if (!this.hasDescription(id)) {
                        log(`error`, `DataDescriptor.select.removeDescription - Data description Id:${id} is not defined.`);
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
 * @description - A data descriptor module.
 *
 * @module DataDescriptor
 * @return {object}
 */
export default function DataDescriptor () {
    const dataDescriptor = Object.create(DataDescriptorPrototype, {
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

    if (ENV.DEVELOPMENT) {
        if (!isObject(dataDescriptor)) {
            log(`error`, `DataDescriptor - Unable to create a data descriptor instance.`);
        }
    }

    return compose(reveal, Object.freeze)(dataDescriptor);
}
