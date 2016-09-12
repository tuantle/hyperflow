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
 * @module ComputableDescriptor
 * @description -  A descriptor for describing a computable property
               and assigns that to an object property.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../common-element';

/* create Hflow object */
const Hflow = CommonElement();

/**
 * @description - A computable descriptor prototypes.
 *
 * ComputableDescriptorPrototype
 */
const ComputableDescriptorPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Assign a computable description.
     *
     * @method assign
     * @param {object} descObj - A descriptor setup object.
     *                           Contains computable name, context keys, and computable callback.
     * @return {object}
     */
    assign: function assign (descObj) {
        if (!Hflow.isSchema({
            key: `string|number`,
            contexts: `array`,
            compute: `function`
        }).of(descObj)) {
            Hflow.log(`error`, `ComputableDescriptor.assign - Input descriptor setup object is invalid.`);
        } else {
            const computable = this;
            const {
                key: fnName,
                contexts: contextPathIds,
                compute
            } = descObj;

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
                to: function to (target) {
                    if (Hflow.isObject(target) || Hflow.isArray(target)) {
                        if (target.hasOwnProperty(fnName) && target[fnName] !== null) {
                            Hflow.log(`error`, `ComputableDescriptor.assign.to - Target already has a defined property key:${fnName}`);
                        } else {
                            computable._description.assigned = true;
                            computable._description.fnName = fnName;
                            computable._description.proxy = target;

                            /* create context of the computable */
                            computable._description.context = contextPathIds.reduce((_context, contextPathId) => {
                                contextPathId = Hflow.isString(contextPathId) ? Hflow.stringToArray(contextPathId, `.`) : contextPathId;
                                const key = contextPathId.pop();
                                Object.defineProperty(_context, key, {
                                    get: function get () {
                                        if (Hflow.isEmpty(contextPathId)) {
                                            return computable._description.proxy[key];
                                        }
                                        return Hflow.retrieve(contextPathId, `.`).from(computable._description.proxy)[key];
                                    },
                                    configurable: false,
                                    enumerable: true
                                });
                                return _context;
                            }, {});

                            /* create the computable property for the assigned object */
                            Object.defineProperty(computable._description.proxy, fnName, {
                                get: function get () {
                                    return computable._description.compute.call(computable._description.context);
                                },
                                configurable: false,
                                enumerable: true
                            });
                        }
                    } else {
                        Hflow.log(`error`, `ComputableDescriptor.assign.to - Input target is invalid.`);
                    }
                }
            };
        }
    },
    /**
     * @description - Unassign a computable description.
     *
     * @method unassign
     * @return void
     */
    unassign: function unassign () {
        const computable = this;

        if (computable._description.assigned) {
            /* delete the computable property */
            // FIXME: Cannot delete a computable.
            computable._description.proxy[computable._description.fnName] = undefined;
            delete computable._description.proxy[computable._description.fnName];

            computable._description.assigned = false;
            computable._description.fnName = undefined;
            computable._description.compute = undefined;
            computable._description.proxy = undefined;
            computable._description.context = undefined;
        }
    }
};

/**
 * @description - A computable descriptor module.
 *
 * @module ComputableDescriptor
 * @param {string} id - Descriptor Id.
 * @return {object}
 */
export default function ComputableDescriptor (id) {
    if (!Hflow.isString(id)) {
        Hflow.log(`error`, `ComputableDescriptor - Input descriptor Id is invalid.`);
    } else {
        const descriptor = Object.create(ComputableDescriptorPrototype, {
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

        if (!Hflow.isObject(descriptor)) {
            Hflow.log(`error`, `ComputableDescriptor - Unable to create a computable descriptor instance.`);
        } else {
            const revealFrozen = Hflow.compose(Hflow.reveal, Object.freeze);
            /* reveal only the public properties and functions */
            return revealFrozen(descriptor);
        }
    }
}
