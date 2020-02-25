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
 * @module ComputableDataDescription
 * @description -  A data description for describing a computable property
 *                 and assigns that to an object property.
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
    isArray,
    isEmpty,
    isSchema,
    stringToArray,
    compose,
    retrieve,
    reveal,
    log
} from '../../utils/common-util';

/**
 * @description - A computable data description prototypes.
 *
 * ComputableDataDescriptionPrototype
 */
const ComputableDataDescriptionPrototype = Object.create({}).prototype = {
    /**
     * @description - Assign a computable description.
     *
     * @method assign
     * @param {object} descPreset - A data description preset object.
     *                              Contains computable name, context keys, and computable callback.
     * @return {object}
     */
    assign (descPreset) {
        const computable = this;

        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                key: `string|number`,
                contexts: `array`,
                compute: `function`
            }).of(descPreset)) {
                log(`error`, `ComputableDataDescription.assign - Input data description preset object is invalid.`);
            }
        }

        const {
            key: fnName,
            contexts: contextPathIds,
            compute
        } = descPreset;

        if (computable._description.assigned) {
            computable.unassign();
        }

        computable._description.compute = compute;

        return {
            /**
             * @description - The target object to get this computable property.
             *
             * @method assign.to
             * @param {object|array} target - Target object.
             * @return void
             */
            to (target) {
                if (ENV.DEVELOPMENT) {
                    if (!(isObject(target) || isArray(target))) {
                        log(`error`, `ComputableDataDescription.assign.to - Input target is invalid.`);
                    } else if (target.hasOwnProperty(fnName) && target[fnName] !== null) {
                        log(`error`, `ComputableDataDescription.assign.to - Target already has a defined property key:${fnName}`);
                    }
                }

                computable._description.assigned = true;
                computable._description.fnName = fnName;
                computable._description.proxy = target;

                /* create context of the computable */
                computable._description.context = contextPathIds.reduce((_context, contextPathId) => {
                    contextPathId = isString(contextPathId) ? stringToArray(contextPathId, `.`) : contextPathId;
                    const key = contextPathId.pop();
                    Object.defineProperty(_context, key, {
                        get () {
                            if (isEmpty(contextPathId)) {
                                return computable._description.proxy[key];
                            }
                            return retrieve(contextPathId, `.`).from(computable._description.proxy)[key];
                        },
                        configurable: false,
                        enumerable: true
                    });
                    return _context;
                }, {});

                /* create the computable property for the assigned object */
                Object.defineProperty(computable._description.proxy, fnName, {
                    get () {
                        return computable._description.compute.call(computable._description.context);
                    },
                    configurable: false,
                    enumerable: true
                });
            }
        };
    },

    /**
     * @description - Unassign a computable description.
     *
     * @method unassign
     * @return void
     */
    unassign () {
        const computable = this;

        if (computable._description.assigned) {
            /* delete the computable property */
            // FIXME: Cannot delete a computable.
            delete computable._description.proxy[computable._description.fnName];
            // computable._description.proxy[computable._description.fnName] = undefined;

            computable._description.assigned = false;
            computable._description.fnName = undefined;
            computable._description.compute = undefined;
            computable._description.proxy = undefined;
            computable._description.context = undefined;
        }
    }
};

/**
 * @description - A computable data description module.
 *
 * @module ComputableDataDescription
 * @param {string} id - data description Id.
 * @return {object}
 */
export default function ComputableDataDescription (id) {
    if (ENV.DEVELOPMENT) {
        if (!isString(id)) {
            log(`error`, `ComputableDataDescription - Input data description Id is invalid.`);
        }
    }

    const dataDescription = Object.create(ComputableDataDescriptionPrototype, {
        _id: {
            value: id,
            writable: false,
            configurable: false,
            enumerable: false
        },
        _description: {
            value: {
                assigned: false,
                fnName: undefined,
                context: undefined,
                compute: undefined,
                // TODO: Used es6 Proxy.
                proxy: undefined
            },
            writable: true,
            configurable: true,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(dataDescription)) {
            log(`error`, `ComputableDataDescription - Unable to create a computable data description instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return compose(reveal, Object.freeze)(dataDescription);
}
