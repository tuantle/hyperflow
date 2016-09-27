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
 * @module ConstrainableDescriptor
 * @description -  A constraint descriptor that applies constraint functions to an object property.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - A constraint descriptor prototypes.
 *
 * ConstrainableDescriptorPrototype
 */
const ConstrainableDescriptorPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Check if constraint is in constraint set.
     *
     * @method hasConstraint
     * @param {string} constraintKey
     * @return {boolean}
     */
    hasConstraint: function hasConstraint (constraintKey) {
        const constrainable = this;

        return constrainable._description.constraint.hasOwnProperty(constraintKey);
    },
    /**
     * @description - Add a new constraint to constraint set.
     *
     * @method addConstraint
     * @param {function} constrainer - Constraint callback function.
     * @param {string} constraintKey
     * @return void
     */
    addConstraint: function addConstraint (constrainer, constraintKey) {
        if (!Hflow.isFunction(constrainer)) {
            Hflow.log(`error`, `ConstrainableDescriptor.addConstraint - Input constrainer function is invalid.`);
        } else if (!Hflow.isString(constraintKey)) {
            Hflow.log(`error`, `ConstrainableDescriptor.addConstraint - Input constraint key is invalid.`);
        } else {
            const constrainable = this;

            if (!constrainable.hasConstraint(constraintKey)) {
                constrainable._description.constraint[constraintKey] = constrainer;
            }

            if (constrainable._description.assigned) {
                const key = constrainable._description.key;
                /* set the original value to the newly contrained object */
                constrainable._description.proxy[key] = constrainable._description.orgDesc.value;
            }
        }
    },
    /**
     * @description - Remove a constraint from constraint set.
     *
     * @method removeConstraint
     * @param {string} constraintKey
     * @return void
     */
    removeConstraint: function removeConstraint (constraintKey) {
        if (!Hflow.isString(constraintKey)) {
            Hflow.log(`error`, `ConstrainableDescriptor.removeConstraint - Input constraint key is invalid.`);
        } else {
            const constrainable = this;

            if (constrainable.hasConstraint(constraintKey)) {
                constrainable._description.constraint[constraintKey] = undefined;
                delete constrainable._description.constraint[constraintKey];
            }
        }
    },
    /**
     * @description - Assign a constrainable description.
     *
     * @method assign
     * @param {object} descObj - A descriptor setup object.
     *                           Contains target property key and constraint set object.
     * @return {object}
     */
    assign: function assign (descObj) {
        if (!Hflow.isSchema({
            key: `string|number`,
            constraint: `object`
        }).of(descObj)) {
            Hflow.log(`error`, `ConstrainableDescriptor.assign - Input descriptor setup object is invalid.`);
        } else {
            const constrainable = this;
            const {
                key,
                constraint
            } = descObj;

            if (constrainable._description.assigned) {
                constrainable.unassign();
            }
            return {
                /**
                 * @description - The target object to get this constrainable property.
                 *
                 * @method assign.to
                 * @param {object|array} target - Target object.
                 * @return void
                 */
                to: function to (target) {
                    if (Hflow.isObject(target) || Hflow.isArray(target)) {
                        if (target.hasOwnProperty(key)) {
                            constrainable._description.assigned = true;
                            constrainable._description.proxy = target;
                            constrainable._description.key = key;
                            constrainable._description.orgDesc = Object.getOwnPropertyDescriptor(target, key);

                            Object.defineProperty(constrainable._description.proxy, key, {
                                get: function get () {
                                    if (constrainable._description.orgDesc.hasOwnProperty(`get`)) {
                                        return constrainable._description.orgDesc.get();
                                    }
                                    return constrainable._description.orgDesc.value;
                                },
                                set: function set (value) {
                                    let oldValue;
                                    let context = {};
                                    let results = [];

                                    if (constrainable._description.orgDesc.hasOwnProperty(`get`)) {
                                        oldValue = constrainable._description.orgDesc.get();
                                    } else {
                                        oldValue = constrainable._description.orgDesc.value;
                                    }

                                    /* add key to context of onConstraint function */
                                    Object.defineProperty(context, `key`, {
                                        value: constrainable._description.key,
                                        writable: false,
                                        configurable: false,
                                        enumerable: true
                                    });
                                    /* add current key value to context of onConstraint function */
                                    Object.defineProperty(context, `oldValue`, {
                                        value: oldValue,
                                        writable: false,
                                        configurable: false,
                                        enumerable: true
                                    });
                                    /* add new key value to context of onConstraint function */
                                    Object.defineProperty(context, `newValue`, {
                                        value,
                                        writable: false,
                                        configurable: false,
                                        enumerable: true
                                    });
                                    results = Object.keys(constrainable._description.constraint).map((constraintKey) => {
                                        const constrainer = constrainable._description.constraint[constraintKey];
                                        return Hflow.fallback({
                                            verified: true,
                                            reject: function reject () {}
                                        }, (_key) => {
                                            Hflow.log(`error`, `ConstrainableDescriptor.assign.to - Constraint callback returns invalid result object key${_key}.`);
                                        }).of(constrainer.call(context));
                                    });
                                    results.forEach((result) => {
                                        if (result.verified) {
                                            if (constrainable._description.orgDesc.hasOwnProperty(`set`)) {
                                                constrainable._description.orgDesc.set(value);
                                            } else {
                                                constrainable._description.orgDesc.value = value;
                                            }
                                        } else {
                                            result.reject();
                                        }
                                    });
                                },
                                configurable: false,
                                enumerable: true
                            });
                            /* add new constraints to constraint set */
                            Hflow.forEach(constraint, (constrainer, constraintKey) => {
                                constrainable.addConstraint(constrainer, constraintKey);
                            });
                        } else {
                            Hflow.log(`error`, `ConstrainableDescriptor.assign.to - Property key:${key} is not defined.`);
                        }
                    } else {
                        Hflow.log(`error`, `ConstrainableDescriptor.assign.to - Input target is invalid.`);
                    }
                }
            };
        }
    },
    /**
     * @description - Unassign a constrainable description.
     *
     * @method unassign
     * @return void
     */
    unassign: function unassign () {
        const constrainable = this;

        if (constrainable._description.assigned) {
            const key = constrainable._description.key;

            /* delete current property */
            constrainable._description.proxy[key] = undefined;
            delete constrainable._description.proxy[key];

            /* restore original property with it descriptor */
            if (constrainable._description.orgDesc.hasOwnProperty(`get`) || constrainable._description.orgDesc.hasOwnProperty(`set`)) {
                Object.defineProperty(constrainable._description.proxy, key, {
                    get: constrainable._description.orgDesc.get,
                    set: constrainable._description.orgDesc.set,
                    configurable: constrainable._description.orgDesc.configurable,
                    enumerable: constrainable._description.orgDesc.enumerable
                });
            } else {
                constrainable._description.proxy[key] = constrainable._description.orgDesc.value;
            }

            constrainable._description.assigned = false;
            constrainable._description.key = undefined;
            constrainable._description.orgDesc = undefined;
            constrainable._description.proxy = undefined;
            Hflow.clear(constrainable._description.constraint);
        }
    }
};

/**
 * @description - A constraint descriptor module.
 *
 * @module ConstrainableDescriptor
 * @param {string} id - Descriptor Id.
 * @return {object}
 */
export default function ConstrainableDescriptor (id) {
    if (!Hflow.isString(id)) {
        Hflow.log(`error`, `ConstrainableDescriptor - Input descriptor Id is invalid.`);
    } else {
        const descriptor = Object.create(ConstrainableDescriptorPrototype, {
            _id: {
                value: id,
                writable: false,
                configurable: false,
                enumerable: false
            },
            _description: {
                value: {
                    assigned: false,
                    key: undefined,
                    orgDesc: undefined,
                    // TODO: Used es6 Proxy.
                    proxy: undefined,
                    constraint: {}
                },
                writable: true,
                configurable: true,
                enumerable: false
            }
        });

        if (!Hflow.isObject(descriptor)) {
            Hflow.log(`error`, `ConstrainableDescriptor - Unable to create a computable descriptor instance.`);
        } else {
            const revealFrozen = Hflow.compose(Hflow.reveal, Object.freeze);
            /* reveal only the public properties and functions */
            return revealFrozen(descriptor);
        }
    }
}
