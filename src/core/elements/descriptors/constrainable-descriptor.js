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
 *
 * @flow
 */
'use strict'; // eslint-disable-line


import CommonElement from '../common-element';

const Hf = CommonElement();

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
    hasConstraint (constraintKey) {
        const constrainable = this;

        return constrainable._description.constraint.hasOwnProperty(constraintKey);
    },
    /**
     * @description - Get constraint from constraint set.
     *
     * @method getConstraint
     * @param {string} constraintKey
     * @return {object}
     */
    getConstraint (constraintKey) {
        const constrainable = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(constraintKey)) {
                Hf.log(`error`, `ConstrainableDescriptor.getConstraint - Input constraint key is invalid.`);
            } else if (!constrainable.hasConstraint(constraintKey)) {
                Hf.log(`warn1`, `ConstrainableDescriptor.getConstraint - Constraint key:${constraintKey} is not found.`);
            }
        }

        return constrainable._description.constraint[constraintKey];
    },
    /**
     * @description - Add a new constraint to constraint set.
     *
     * @method addConstraint
     * @param {function} constrainer - Constraint callback function.
     * @param {*} condition
     * @param {string} constraintKey
     * @return void
     */
    addConstraint (constrainer, condition, constraintKey) {
        const constrainable = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isFunction(constrainer)) {
                Hf.log(`error`, `ConstrainableDescriptor.addConstraint - Input constrainer function is invalid.`);
            } else if (!Hf.isString(constraintKey)) {
                Hf.log(`error`, `ConstrainableDescriptor.addConstraint - Input constraint key is invalid.`);
            } else if (constrainable.hasConstraint(constraintKey)) {
                Hf.log(`warn0`, `ConstrainableDescriptor.addConstraint - Overwriting constraint key:${constraintKey}.`);
            }
        }

        constrainable._description.constraint[constraintKey] = {
            constrainer,
            condition
        };
        if (constrainable._description.assigned) {
            const key = constrainable._description.key;
            /* set the original value to the newly contrained object */
            constrainable._description.proxy[key] = constrainable._description.orgDesc.value;
        }
    },
    /**
     * @description - Remove a constraint from constraint set.
     *
     * @method removeConstraint
     * @param {string} constraintKey
     * @return void
     */
    removeConstraint (constraintKey) {
        const constrainable = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(constraintKey)) {
                Hf.log(`error`, `ConstrainableDescriptor.removeConstraint - Input constraint key is invalid.`);
            }
        }

        if (constrainable.hasConstraint(constraintKey)) {
            delete constrainable._description.constraint[constraintKey];
            // constrainable._description.constraint[constraintKey] = undefined;
        }
    },
    /**
     * @description - Assign a constrainable description.
     *
     * @method assign
     * @param {object} descPreset - A descriptor preset object.
     *                              Contains target property key and constraint set object.
     * @return {object}
     */
    assign (descPreset) {
        const constrainable = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isSchema({
                key: `string|number`,
                constraint: `object`
            }).of(descPreset)) {
                Hf.log(`error`, `ConstrainableDescriptor.assign - Input descriptor preset object is invalid.`);
            } else if (!Object.values(descPreset.constraint).every((constraintValue) => Hf.isSchema({
                constrainer: `function`
            }).of(constraintValue))) {
                Hf.log(`error`, `ConstrainableDescriptor.assign - Input descriptor constraint is invalid.`);
            }
        }

        const {
            key,
            constraint
        } = descPreset;

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
            to (target) {
                if (Hf.DEVELOPMENT) {
                    if (!(Hf.isObject(target) || Hf.isArray(target))) {
                        Hf.log(`error`, `ConstrainableDescriptor.assign.to - Input target is invalid.`);
                    } else if (!target.hasOwnProperty(key)) {
                        Hf.log(`error`, `ConstrainableDescriptor.assign.to - Property key:${key} is not defined.`);
                    }
                }

                constrainable._description.assigned = true;
                constrainable._description.proxy = target;
                constrainable._description.key = key;
                constrainable._description.orgDesc = Object.getOwnPropertyDescriptor(target, key);

                Object.defineProperty(constrainable._description.proxy, key, {
                    get () {
                        if (constrainable._description.orgDesc.hasOwnProperty(`get`)) {
                            return constrainable._description.orgDesc.get();
                        }
                        return constrainable._description.orgDesc.value;
                    },
                    set (value) {
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
                        results = Object.values(constrainable._description.constraint).map((constraintValue) => {
                            const {
                                constrainer,
                                condition
                            } = constraintValue;
                            return Hf.fallback({
                                verified: true,
                                reject () {}
                            }, (_key) => {
                                Hf.log(`error`, `ConstrainableDescriptor.assign.to - Constraint callback returns invalid result object key${_key}.`);
                            }).of(constrainer.call(context, condition));
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
                Object.entries(constraint).forEach(([ constraintKey, constraintValue ]) => {
                    const {
                        constrainer,
                        condition
                    } = constraintValue;
                    constrainable.addConstraint(constrainer, condition, constraintKey);
                });
            }
        };
    },
    /**
     * @description - Unassign a constrainable description.
     *
     * @method unassign
     * @return void
     */
    unassign () {
        const constrainable = this;

        if (constrainable._description.assigned) {
            const key = constrainable._description.key;

            /* delete current property */
            delete constrainable._description.proxy[key];
            // constrainable._description.proxy[key] = undefined;

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
            Hf.clear(constrainable._description.constraint);
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
    if (Hf.DEVELOPMENT) {
        if (!Hf.isString(id)) {
            Hf.log(`error`, `ConstrainableDescriptor - Input descriptor Id is invalid.`);
        }
    }

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

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(descriptor)) {
            Hf.log(`error`, `ConstrainableDescriptor - Unable to create a computable descriptor instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return Hf.compose(Hf.reveal, Object.freeze)(descriptor);
}
