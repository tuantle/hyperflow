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
 * @module ConstrainableDataDescription
 * @description -  A constraint data description that applies constraint functions to an object property.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isFunction,
    isObject,
    isArray,
    isSchema,
    clear,
    compose,
    fallback,
    reveal,
    log
} from '../../utils/common-util';

/**
 * @description - A constraint description prototypes.
 *
 * ConstrainableDataDescriptionPrototype
 */
const ConstrainableDataDescriptionPrototype = Object.create({}).prototype = {
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

        if (ENV.DEVELOPMENT) {
            if (!isString(constraintKey)) {
                log(`error`, `ConstrainableDataDescription.getConstraint - Input constraint key is invalid.`);
            } else if (!constrainable.hasConstraint(constraintKey)) {
                log(`warn1`, `ConstrainableDataDescription.getConstraint - Constraint key:${constraintKey} is not found.`);
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

        if (ENV.DEVELOPMENT) {
            if (!isFunction(constrainer)) {
                log(`error`, `ConstrainableDataDescription.addConstraint - Input constrainer function is invalid.`);
            } else if (!isString(constraintKey)) {
                log(`error`, `ConstrainableDataDescription.addConstraint - Input constraint key is invalid.`);
            } else if (constrainable.hasConstraint(constraintKey)) {
                log(`warn0`, `ConstrainableDataDescription.addConstraint - Overwriting constraint key:${constraintKey}.`);
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

        if (ENV.DEVELOPMENT) {
            if (!isString(constraintKey)) {
                log(`error`, `ConstrainableDataDescription.removeConstraint - Input constraint key is invalid.`);
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
     * @param {object} descPreset - A description preset object.
     *                              Contains target property key and constraint set object.
     * @return {object}
     */
    assign (descPreset) {
        const constrainable = this;

        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                key: `string|number`,
                constraint: `object`
            }).of(descPreset)) {
                log(`error`, `ConstrainableDataDescription.assign - Input data description preset object is invalid.`);
            } else if (!Object.values(descPreset.constraint).every((constraintValue) => isSchema({
                constrainer: `function`
            }).of(constraintValue))) {
                log(`error`, `ConstrainableDataDescription.assign - Input data description constraint is invalid.`);
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
                if (ENV.DEVELOPMENT) {
                    if (!(isObject(target) || isArray(target))) {
                        log(`error`, `ConstrainableDataDescription.assign.to - Input target is invalid.`);
                    } else if (!target.hasOwnProperty(key)) {
                        log(`error`, `ConstrainableDataDescription.assign.to - Property key:${key} is not defined.`);
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
                        let verified = true;

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
                            return fallback({
                                verified: true,
                                reject () {}
                            }, (_key) => {
                                log(`warn1`, `ConstrainableDataDescription.assign.to - Constraint callback returns invalid result object key${_key}.`);
                            }).of(constrainer.call(context, condition));
                        });
                        results.forEach((result) => {
                            if (!result.verified) {
                                verified = false;
                                result.reject();
                            }
                        });
                        if (verified) {
                            if (constrainable._description.orgDesc.hasOwnProperty(`set`)) {
                                constrainable._description.orgDesc.set(value);
                            } else {
                                constrainable._description.orgDesc.value = value;
                            }
                        }
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

            /* restore original property with it data description */
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
            clear(constrainable._description.constraint);
        }
    }
};

/**
 * @description - A constraint data description module.
 *
 * @module ConstrainableDataDescription
 * @param {string} id - data description Id.
 * @return {object}
 */
export default function ConstrainableDataDescription (id) {
    if (ENV.DEVELOPMENT) {
        if (!isString(id)) {
            log(`error`, `ConstrainableDataDescription - Input data description Id is invalid.`);
        }
    }

    const dataDescription = Object.create(ConstrainableDataDescriptionPrototype, {
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

    if (ENV.DEVELOPMENT) {
        if (!isObject(dataDescription)) {
            log(`error`, `ConstrainableDataDescription - Unable to create a constrainable data description instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return compose(reveal, Object.freeze)(dataDescription);
}
