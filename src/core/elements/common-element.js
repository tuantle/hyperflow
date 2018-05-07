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
 * @module CommonElement
 * @description - Common element module which provides common methods that will be used
 * throughout Hf toolkit.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

const PRIVATE_PREFIX = `_`;

const LOG_HISTORY_SIZE = 500;

/**
 * @description - Common element prototype object.
 *
 * CommonElementPrototype
 */
const CommonElementPrototype = Object.create({}).prototype = {
    /* ----- Common Prototype Definitions --------------------- */
    /**
     * @description - Helper function to compare and verify object schema.
     *
     * @method _deepCompareSchema
     * @param {object} schema - Predefined schema.
     * @param {object} target - Predefined schema.
     * @returns {object}
     * @private
     */
    _deepCompareSchema: function _deepCompareSchema (schema, target) {
        const Hf = this;
        let verified = true;

        if (Hf.isObject(schema) && Hf.isObject(target)) {
            Hf.forEach(schema, (schemaItem, key) => {
                if (verified) {
                    let itemTypes = [];
                    if (target.hasOwnProperty(key) || Object.getPrototypeOf(target).hasOwnProperty(key)) {
                        const targetItem = target[key];
                        if ((Hf.isObject(targetItem) && Hf.isObject(schemaItem)) || (Hf.isArray(targetItem) && Hf.isArray(schemaItem))) {
                            verified = Hf._deepCompareSchema(schemaItem, targetItem);
                        } else if (Hf.isString(schemaItem)) {
                            itemTypes = Hf.stringToArray(schemaItem, `|`);
                            verified = itemTypes.some((itemType) => {
                                if (itemType === `defined`) {
                                    return Hf.isDefined(targetItem);
                                }
                                return Hf.typeOf(targetItem) === itemType;
                            });
                        } else {
                            verified = false;
                        }
                    } else {
                        if (Hf.isString(schemaItem)) {
                            itemTypes = Hf.stringToArray(schemaItem, `|`);
                            verified = itemTypes.includes(`undefined`);
                        } else {
                            verified = false;
                        }
                    }
                }
            });
        } else if (Hf.isArray(schema) && Hf.isArray(target)) {
            if (schema.length === 1) {
                const [ schemaItem ] = schema;
                verified = target.reduce((_verified, targetItem) => {
                    let itemTypes = [];
                    if ((Hf.isObject(targetItem) && Hf.isObject(schemaItem)) || (Hf.isArray(targetItem) && Hf.isArray(schemaItem))) {
                        _verified = Hf._deepCompareSchema(schemaItem, targetItem);
                    } else if (Hf.isString(schemaItem)) {
                        itemTypes = Hf.stringToArray(schemaItem, `|`);
                        _verified = itemTypes.some((itemType) => {
                            if (itemType === `defined`) {
                                return Hf.isDefined(targetItem);
                            }
                            return Hf.typeOf(targetItem) === itemType;
                        });
                    } else {
                        _verified = false;
                    }
                    return _verified;
                }, verified);
            } else {
                Hf.log(`warn1`, `CommonElement._deepCompareSchema - Predefined schema test array must have a length of 1.`);
                verified = false;
            }
        } else {
            verified = false;
        }
        return verified;
    },
    /**
     * @description - Helper function to return a new object that was deep mutated from source by reference target mutator object.
     *
     * @method _deepMutation
     * @param {object} source - Target source object.
     * @param {object} mutator - Mutator object.
     * @param {array} pathId - Mutation path Id.
     * @returns {object}
     * @private
     */
    _deepMutation: function _deepMutation (source, mutator, pathId = []) {
        const Hf = this;
        let result;

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isArray(pathId))) {
                Hf.log(`error`, `CommonElement._deepMutation - Input pathId is invalid.`);
            }
        }

        if (Hf.isEmpty(pathId)) {
            if (Hf.isObject(source) && Hf.isObject(mutator)) {
                result = Object.assign({}, source);
                const sourceKeys = Object.keys(source);
                const mutatorKeys = Object.keys(mutator);

                if (sourceKeys.length >= mutatorKeys.length && mutatorKeys.every((key) => sourceKeys.includes(key))) {
                    mutatorKeys.forEach((key) => {
                        const sourceItem = source[key];
                        const mutatorItem = mutator[key];

                        if ((Hf.isObject(sourceItem) && !Hf.isObject(mutatorItem) || Hf.isArray(sourceItem) && !Hf.isArray(mutatorItem)) ||
                            (!Hf.isObject(sourceItem) && Hf.isObject(mutatorItem) || !Hf.isArray(sourceItem) && Hf.isArray(mutatorItem))) {
                            Hf.log(`warn1`, `CommonElement._deepMutation - Input mutator schema at key:${key} must be a subset of source schema.`);
                            Hf.log(`debug`, `CommonElement._deepMutation - sourceItem:${JSON.stringify(sourceItem, null, `\t`)}`);
                            Hf.log(`debug`, `CommonElement._deepMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                        } else {
                            if (Hf.isObject(sourceItem) && Hf.isObject(mutatorItem) || Hf.isArray(sourceItem) && Hf.isArray(mutatorItem)) {
                                result[key] = Hf._deepMutation(sourceItem, mutatorItem);
                            } else {
                                result[key] = mutatorItem;
                            }
                        }
                    });
                } else {
                    Hf.log(`warn1`, `CommonElement._deepMutation - Input mutator object schema is not a subset of the source schema.`);
                    Hf.log(`debug`, `CommonElement._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                    Hf.log(`debug`, `CommonElement._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                }
            } else if (Hf.isArray(source) && Hf.isArray(mutator)) {
                result = source.slice(0);
                if (source.length === mutator.length) {
                    source.forEach((sourceItem, key) => {
                        const mutatorItem = mutator[key];
                        if ((Hf.isObject(sourceItem) && !Hf.isObject(mutatorItem) || Hf.isArray(sourceItem) && !Hf.isArray(mutatorItem)) ||
                            (!Hf.isObject(sourceItem) && Hf.isObject(mutatorItem) || !Hf.isArray(sourceItem) && Hf.isArray(mutatorItem))) {
                            Hf.log(`warn1`, `CommonElement._deepMutation - Input mutator schema at key:${key} must be a subset of source schema.`);
                            Hf.log(`debug`, `CommonElement._deepMutation - sourceItem:${JSON.stringify(sourceItem, null, `\t`)}`);
                            Hf.log(`debug`, `CommonElement._deepMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                        } else {
                            if (Hf.isObject(sourceItem) && Hf.isObject(mutatorItem) || Hf.isArray(sourceItem) && Hf.isArray(mutatorItem)) {
                                result[key] = Hf._deepMutation(sourceItem, mutatorItem);
                            } else {
                                result[key] = mutatorItem;
                            }
                        }
                    });
                } else {
                    Hf.log(`warn1`, `CommonElement._deepMutation - Input mutator array must be the same size as the source array.`);
                    Hf.log(`debug`, `CommonElement._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                    Hf.log(`debug`, `CommonElement._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                }
            } else {
                Hf.log(`error`, `CommonElement._deepMutation - Input source or target mutator is invalid.`);
            }
        } else {
            const key = pathId.shift();
            if (Hf.isObject(source) && source.hasOwnProperty(key)) {
                result = Object.assign({}, source);
                if (Hf.isEmpty(pathId)) {
                    if (Hf.isObject(mutator) && mutator.hasOwnProperty(key)) {
                        result[key] = Hf._deepMutation(source[key], mutator[key], pathId.slice(0));
                    } else {
                        Hf.log(`warn1`, `CommonElement._deepMutation - Key:${key} of path Id:${pathId} is not defined in mutator.`);
                        Hf.log(`debug`, `CommonElement._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                        Hf.log(`debug`, `CommonElement._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                } else {
                    result[key] = Hf._deepMutation(source[key], mutator, pathId.slice(0));
                }
            } else if (Hf.isArray(source) && Hf.isInteger(key) && key < source.length) {
                result = source.slice(0);
                if (Hf.isEmpty(pathId)) {
                    if (Hf.isArray(mutator) && key < mutator.length) {
                        result[key] = Hf._deepMutation(source[key], mutator[key], pathId.slice(0));
                    } else {
                        Hf.log(`warn1`, `CommonElement._deepMutation - Array index:${key} is greater than mutator array size.`);
                        Hf.log(`debug`, `CommonElement._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                        Hf.log(`debug`, `CommonElement._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                } else {
                    result[key] = Hf._deepMutation(source[key], mutator, pathId.slice(0));
                }
            } else {
                Hf.log(`error`, `CommonElement._deepMutation - Path ends at property key:${key}.`);
            }
        }
        return result;
    },
    /**
     * @description - Helper function to deep merge source with target and return result.
     *
     * @method _deepMerge
     * @param {object} source - Source object.
     * @param {object} target - Target object.
     * @param {array} pathId - Merge at path Id.
     * @returns {object}
     * @private
     */
    _deepMerge: function _deepMerge (source, target, pathId = []) {
        const Hf = this;
        let result;

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(source) || Hf.isArray(source)) &&
                !(Hf.isObject(target) || Hf.isArray(target))) {
                Hf.log(`error`, `CommonElement._deepMerge - Input source or mutation is invalid.`);
            }
        }

        pathId = Hf.isArray(pathId) ? pathId : [];

        if (Hf.isEmpty(pathId)) {
            if (Hf.isArray(source) && Hf.isArray(target)) {
                result = source.slice(0);
                target.forEach((item, key) => {
                    if (!Hf.isDefined(result[key])) {
                        result[key] = item;
                    } else if (Hf.isObject(item)) {
                        result[key] = Hf._deepMerge(source[key], item);
                    } else {
                        if (!source.includes(item)) {
                            result.push(item);
                        }
                    }
                });
            } else {
                if (Hf.isObject(source)) {
                    result = Object.assign({}, source);
                }

                Object.entries(target).forEach(([ key, targetValue ]) => {
                    if (Hf.isObject(targetValue) || Hf.isArray(targetValue)) {
                        if (!Hf.isDefined(source[key])) {
                            result[key] = targetValue;
                        } else {
                            result[key] = Hf._deepMerge(source[key], targetValue);
                        }
                    } else {
                        result[key] = targetValue;
                    }
                });
            }
        } else {
            const key = pathId.shift();
            if (Hf.isObject(source) && source.hasOwnProperty(key)) {
                result = Object.assign({}, source);
                if (Hf.isEmpty(pathId)) {
                    if (Hf.isObject(target) && target.hasOwnProperty(key)) {
                        result[key] = Hf._deepMerge(source[key], target[key], pathId.slice(0));
                    }
                } else {
                    result[key] = Hf._deepMerge(source[key], target, pathId.slice(0));
                }
            } else if (Hf.isArray(source) && Hf.isInteger(key) && key < source.length) {
                result = source.slice(0);
                if (Hf.isEmpty(pathId)) {
                    if (Hf.isArray(target) && key < target.length) {
                        result[key] = Hf._deepMerge(source[key], target[key], pathId.slice(0));
                    }
                } else {
                    result[key] = Hf._deepMerge(source[key], target, pathId.slice(0));
                }
            } else {
                Hf.log(`error`, `CommonElement._deepMerge - Path ends at property key:${key}.`);
            }
        }
        return result;
    },
    /**
     * @description - Helper function to do compare and fallback if mismatched.
     *
     * @method _deepCompareAndFallback
     * @param {object} source - Source object.
     * @param {object} target - Target object.
     * @param {function} notify - Optional notification callback when a fallback occurs.
     * @returns {object}
     * @private
     */
    _deepCompareAndFallback: function _deepCompareAndFallback (source, target, notify) {
        const Hf = this;
        let result;

        if (Hf.isObject(source) && Hf.isObject(target)) {
            result = Hf.clone(target);
            Hf.forEach(source, (sourceItem, key) => {
                if (target.hasOwnProperty(key)) {
                    const targetItem = target[key];
                    if ((Hf.isObject(targetItem) && Hf.isObject(sourceItem)) || (Hf.isArray(targetItem) && Hf.isArray(sourceItem))) {
                        result[key] = Hf._deepCompareAndFallback(sourceItem, targetItem, notify);
                    } else {
                        if (Hf.typeOf(targetItem) !== Hf.typeOf(sourceItem)) {
                            result[key] = sourceItem;
                            if (Hf.isFunction(notify)) {
                                notify(key);
                            }
                        }
                    }
                } else {
                    result[key] = sourceItem;
                    if (Hf.isFunction(notify)) {
                        notify(key);
                    }
                }
            });
        } else if (Hf.isArray(source) && Hf.isArray(target)) {
            result = Hf.clone(target);
            Hf.forEach(source, (sourceItem, key) => {
                if (key >= 0 && key < target.length) {
                    const targetItem = target[key];
                    if ((Hf.isObject(targetItem) && Hf.isObject(sourceItem)) || (Hf.isArray(targetItem) && Hf.isArray(sourceItem))) {
                        result[key] = Hf._deepCompareAndFallback(sourceItem, targetItem, notify);
                    } else {
                        if (Hf.typeOf(targetItem) !== Hf.typeOf(sourceItem)) {
                            result[key] = sourceItem;
                            if (Hf.isFunction(notify)) {
                                notify(key);
                            }
                        }
                    }
                } else {
                    result.push(sourceItem);
                    if (Hf.isFunction(notify)) {
                        notify(key);
                    }
                }
            });
        } else {
            Hf.log(`error`, `CommonElement._deepCompareAndFallback - Input source or target object is invalid.`);
        }
        return result;
    },
    /**
     * @description - Helper function to recursively parsing through and retrieve an object property at pathId.
     *
     * @method _deepRetrieval
     * @param {object} target - Target object to retrieve property.
     * @param {array} pathId - Retrival path Id.
     * @param {boolean} asNestedObject
     * @returns {object}
     * @private
     */
    _deepRetrieval: function _deepRetrieval (target, pathId, asNestedObject) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(target) || Hf.isArray(target))) {
                Hf.log(`error`, `CommonElement._deepRetrieval - Input target object or array is invalid.`);
            } else if (!(Hf.isArray(pathId))) {
                Hf.log(`error`, `CommonElement._deepRetrieval - Input pathId is invalid.`);
            } else if (Hf.isArray(pathId) && Hf.isEmpty(pathId)) {
                Hf.log(`error`, `CommonElement._deepRetrieval - No property is defined.`);
            }
        }

        const key = pathId.shift();
        let resultAtPath = Hf.isObject(target) ? {} : Array(key).fill(null);
        let propertyAtPath;

        if (Hf.isObject(target) && target.hasOwnProperty(key)) {
            if (!Hf.isEmpty(pathId)) {
                propertyAtPath = Hf._deepRetrieval(target[key], pathId.slice(0), asNestedObject);
                resultAtPath[key] = propertyAtPath;
            } else {
                propertyAtPath = target[key];
                resultAtPath[key] = propertyAtPath;
            }
        } else if (Hf.isArray(target) && Hf.isInteger(key) && key < target.length) {
            if (!Hf.isEmpty(pathId)) {
                propertyAtPath = Hf._deepRetrieval(target[key], pathId.slice(0), asNestedObject);
                resultAtPath.push(propertyAtPath);
            } else {
                propertyAtPath = target[key];
                resultAtPath.push(propertyAtPath);
            }
        }

        if (Hf.DEVELOPMENT) {
            if (!Hf.isDefined(propertyAtPath) && !Hf.isEmpty(pathId)) {
                Hf.log(`error`, `CommonElement._deepRetrieval - Path ends at property key:${key}.`);
            }
        }

        return asNestedObject ? resultAtPath : propertyAtPath;
    },
    /**
     * @description - Check if value is an integer.
     *
     * @method isInteger
     * @param {number} value - To be checked if it is an integer.
     * @returns {boolean}
     */
    isInteger: function isInteger (value) {
        return (/^-?\d+$/.test(String(value)));
    },

    /**
     * @description - Check if value is a float.
     *
     * @method isFloat
     * @param {number} value - To be checked if it is a float.
     * @returns {boolean}
     */
    isFloat: function isFloat (value) {
        return (/^[+-]?\d+(\.\d+)?$/.test(String(value)));
    },

    /**
     * @description - Check if value is a number.
     *
     * @method isNumeric
     * @param {number} value - To be checked if it is a number.
     * @returns {boolean}
     */
    isNumeric: function isNumeric (value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    /**
     * @description - Check if an object, array, or string is empty.
     *
     * @method isEmpty
     * @param {object|array|string} value - To be checked if it is an empty object, array, or string.
     * @returns {boolean}
     */
    isEmpty: function isEmpty (value) {
        const Hf = this;

        if (Hf.isObject(value)) {
            return Object.getOwnPropertyNames(value).length === 0;
        } else if (Hf.isArray(value) || Hf.isString(value)) {
            return value.length === 0;
        }
        return true;
    },
    /**
     * @description - Check for a string type.
     *
     * @method isString
     * @param {string} str - To be checked if it is a string.
     * @returns {boolean}
     */
    isString: function isString (str) {
        const Hf = this;

        return Hf.typeOf(str) === `string` || (Hf.typeOf(str) === `object` && str.constructor === String);
    },
    /**
     * @description - Check for a string type and is not empty.
     *
     * @method isNonEmptyString
     * @param {string} str - To be checked if it is a string and not empty.
     * @returns {boolean}
     */
    isNonEmptyString: function isNonEmptyString (str) {
        const Hf = this;

        return Hf.isString(str) && !Hf.isEmpty(str);
    },
    /**
     * @description - Check if value is a boolean.
     *
     * @method isBoolean
     * @param value - To be checked if it is a boolean.
     * @returns {boolean}
     */
    isBoolean: function isBoolean (value) {
        const Hf = this;

        return Hf.typeOf(value) === `boolean` || (Hf.isString(value) && (value.toLowerCase() === `true` || value.toLowerCase() === `false`));
    },
    /**
     * @description - Check for defined type.
     *
     * @method isDefined
     * @param {*} value - To be checked if value is defined.
     * @returns {boolean}
     */
    isDefined: function isDefined (value) {
        const Hf = this;

        return Hf.typeOf(value) !== `undefined`;
    },
    /**
     * @description - Check for function type.
     *
     * @method isFunction
     * @param {function} fn - To be checked if it is a function.
     * @returns {boolean}
     */
    isFunction: function isFunction (fn) {
        return Object.prototype.toString.call(fn) === `[object Function]` || Object.prototype.toString.call(fn) === `[object AsyncFunction]`;
    },
    /**
     * @description - Check for regex type.
     *
     * @method isRegEx
     * @param {*} regex
     * @returns {boolean}
     */
    isRegEx: function isRegEx (regex) {
        return Object.prototype.toString.call(regex) === `[object RegEx]`;
    },
    /**
     * @description - Check for date type.
     *
     * @method isDate
     * @param {*} date
     * @returns {boolean}
     */
    isDate: function isDate (date) {
        return Object.prototype.toString.call(date) === `[object Date]`;
    },
    /**
     * @description - Check for array type.
     *
     * @method isArray
     * @param {array} array - To be checked if it is an array.
     * @returns {boolean}
     */
    isArray: function isArray (array) {
        return Object.prototype.toString.call(array) === `[object Array]` || Array.isArray(array) && array !== null;
    },
    /**
     * @description - Check for an array type and is not empty.
     *
     * @method isNonEmptyArray
     * @param {array} array - To be checked if it is an array and not empty.
     * @returns {boolean}
     */
    isNonEmptyArray: function isNonEmptyArray (array) {
        const Hf = this;

        return Hf.isArray(array) && !Hf.isEmpty(array);
    },
    /**
     * @description - Check for object type.
     *
     * @method isObject
     * @param {object} obj - To be checked if it is an object.
     * @returns {boolean}
     */
    isObject: function isObject (obj) {
        const Hf = this;

        return Hf.typeOf(obj) === `object` && obj === Object(obj) && !Hf.isArray(obj) && obj !== null;
    },
    /**
     * @description - Check for an object type and is not empty.
     *
     * @method isNonEmptyObject
     * @param {array} array - To be checked if it is an object and not empty.
     * @returns {boolean}
     */
    isNonEmptyObject: function isNonEmptyObject (array) {
        const Hf = this;

        return Hf.isObject(array) && !Hf.isEmpty(array);
    },
    /**
     * @description - Check object by comparing it to a predefined schema.
     *
     * @usage TODO: Write usage for CommonElement.isSchema method.
     *
     * @method isSchema
     * @param {object} schema - Predefined schema.
     * @returns {object}
     */
    isSchema: function isSchema (schema) {
        const Hf = this;
        return {
            /**
             * @description - Compare schema of the target object...
             *
             * @prototype isSchema.of
             * @param {object} target - Target object be compared with.
             * @returns {boolean}
             */
            of: function of (target) {
                return Hf._deepCompareSchema(schema, target);
            }
        };
    },
    /**
     * @description - Get the type string of input value.
     *
     * @method typeOf
     * @param {*} value
     * @returns {string}
     */
    typeOf: function typeOf (value) {
        // FIXME: Crash occurs when value is an object with circular reference.
        return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },
    /**
     * @description - Forge and return a composed function of two or more functions.
     *
     * @method compose
     * @param {array} fns
     * @return {function}
     */
    compose: function compose (...fns) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (fns.length < 2) {
                Hf.log(`error`, `CommonElement.compose - Input function array must have more than two functions.`);
            } else if (!fns.every((fn) => Hf.isFunction(fn))) {
                Hf.log(`error`, `CommonElement.compose - Input function is invalid.`);
            }
        }

        /**
         * @description - A composed function of two or more functions.
         *
         * @method composed
         * @param {*} value
         * @returns {function}
         */
        return function composed (value) {
            return fns.reduce((result, fn) => {
                if (Hf.isDefined(result)) {
                    return fn(result);
                }
                return fn();
            }, value);
        };
    },
    /**
     * @description - Collect propteries from an object or array and return those propteries as an array.
     *
     * @method collect
     * @param {array} pathIds
     * @return {object}
     */
    collect: function collect (...pathIds) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!pathIds.every((pathId) => Hf.isString(pathId) || Hf.isArray(pathId))) {
                Hf.log(`error`, `CommonElement.collect - Input pathId is invalid.`);
            }
        }

        /**
         * @description - Collect from a target object.
         *
         * @method collect.from
         * @param {object|array} target
         * @return {array}
         */
        return {
            from: function from (target) {
                if (Hf.DEVELOPMENT) {
                    if (!(Hf.isObject(target) || Hf.isArray(target))) {
                        Hf.log(`error`, `CommonElement.collect.from - Input target is invalid.`);
                    }
                }

                return Hf.isEmpty(pathIds) ? [] : pathIds.map((pathId) => Hf.retrieve(pathId, `.`).from(target));
            }
        };
    },
    /**
     * @description - Clear all object or array.
     *
     * @method clear
     * @param {object|array} value
     * @return void
     */
    clear: function clear (value) {
        const Hf = this;

        if (Hf.isObject(value)) {
            Object.getOwnPropertyNames(value).forEach((key) => {
                delete value[key];
                // value[key] = undefined;
            });
        } else if (Hf.isArray(value)) {
            value.length = 0;
        } else {
            Hf.log(`error`, `CommonElement.clear - Input is not an object or array type.`);
        }
    },
    /**
     * @description - Create an exact clone of an object or array.
     *
     * @method clone
     * @param {object|array} source - Source object or array to be cloned.
     * @returns {object}
     */
    clone: function clone (source) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(source) || Hf.isArray(source))) {
                Hf.log(`error`, `CommonElement.clone - Input is not an object or array type.`);
            }
        }
        let result;
        if (Hf.isObject(source)) {
            result = Object.assign({}, source);
        }
        if (Hf.isArray(source)) {
            result = source.map((value) => {
                return Hf.isObject(value) || Hf.isArray(value) ? Hf.clone(value) : value;
            }).slice(0);
        }
        // return Object.isFrozen(source) ? Object.freeze(result) : result;
        return result;
    },
    /**
     * @description - Deep free a source object or function.
     *
     * @method freeze
     * @param {object|function} source
     * @return {object}
     */
    freeze: function freeze (source) {
        const Hf = this;

        if ((Hf.isObject(source) || Hf.isFunction(source)) && !Object.isFrozen(source)) {
            Object.freeze(source);
            Object.getOwnPropertyNames(source).forEach((key) => Hf.freeze(source[key]));
        }

        return source;
    },
    /**
     * @description - Mutate and return an object of source that was mutated by the reference target mutator object.
     *                Only mutate matching property keys.
     *
     * @method mutate
     * @param {object} source - Source object to be mutated from.
     * @returns {object}
     */
    mutate: function mutate (source) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(source)) {
                Hf.log(`error`, `CommonElement.mutate - Input source is invalid.`);
            }
        }

        return {
            /**
             * @description - Return a new mutating of source at pathId from reference mutate object...
             *
             * @method mutate.atPathBy
             * @param {object} mutator - Target reference mutator object.
             * @param {string|array} pathId - Path of the property to retrieve.
             * @returns {object}
             */
            atPathBy: function atPathBy (mutator, pathId) {
                pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(mutator)) {
                        Hf.log(`error`, `CommonElement.mutate.atPathBy - Input mutator is invalid.`);
                    } else if (!(Hf.isArray(pathId) && !Hf.isEmpty(pathId))) {
                        Hf.log(`error`, `CommonElement.mutate.atPathBy - Input pathId is invalid.`);
                    }
                }

                return Hf._deepMutation(source, mutator, pathId.slice(0));
            },
            /**
             * @description - Mutating the source from reference target mutator object...
             *
             * @method mutate.by
             * @param {object} mutator - Target reference mutator object.
             * @returns {object}
             */
            by: function by (mutator) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(mutator)) {
                        Hf.log(`error`, `CommonElement.mutate.by - Input mutator is invalid.`);
                    }
                }

                return Hf._deepMutation(source, mutator);
            }
        };
    },
    /**
     * @description - Deep merging source to target object.
     *
     * @method merge
     * @param {object} source - Source object be merged from.
     * @returns {object}
     */
    merge: function merge (source) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(source)) {
                Hf.log(`error`, `CommonElement.merge - Input source is invalid.`);
            }
        }

        return {
            /**
             * @description - Merging with the target object at pathId...
             *
             * @method merge.atPathWith
             * @param {object} target - Target object be merged to.
             * @param {string|array} pathId - Path of the property to retrieve.
             * @returns {object}
             */
            atPathWith: function atPathWith (target, pathId) {
                pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(target)) {
                        Hf.log(`error`, `CommonElement.merge.atPathWith - Input target is invalid.`);
                    } else if (!(Hf.isArray(pathId) && !Hf.isEmpty(pathId))) {
                        Hf.log(`error`, `CommonElement.merge.atPathWith - Input pathId is invalid.`);
                    }
                }

                return Hf._deepMerge(source, target, pathId.slice(0));
            },
            /**
             * @description - Merging with the target object...
             *
             * @method merge.with
             * @param {object} target - Target object be merged to.
             * @returns {object}
             */
            with: function _with (target) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(target)) {
                        Hf.log(`error`, `CommonElement.merge.with - Input target is invalid.`);
                    }
                }

                return Hf._deepMerge(source, target);
            }
        };
    },
    /**
     * @description - Fallback to source if target does not have the same properties.
     * Fallback occurs if target does not have the same property/index (name and type or index) of source.
     *
     * @usage TODO: Write usage for CommonElement.fallback method.
     *
     * @method fallback
     * @param {object|array} source - Default source object or array to fallback to.
     * @param {function} notify - Notify when a fallback has occured.
     * @return {object}
     */
    fallback: function fallback (source, notify) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(source) || Hf.isArray(source))) {
                Hf.log(`error`, `CommonElement.fallback - Input source object is invalid.`);
            }
        }

        return {
            /**
             * @description - Fallback from the target object/array...
             *
             * @method fallback.of
             * @param {object|array} target - Target object or array.
             * @return {object}
             */
            of: function of (target) {
                if (Hf.DEVELOPMENT) {
                    if ((Hf.isObject(source) && !Hf.isObject(target)) || Hf.isArray(source) && !Hf.isArray(target)) {
                        Hf.log(`error`, `CommonElement.fallback.of - Input target object is invalid.`);
                    }
                }

                return Hf._deepCompareAndFallback(source, target, notify);
            }
        };
    },
    /**
     * @description - Mixing function that do shallow mixing and binding of source and target object or fuction to a mixed object or function.
     *
     * @usage TODO: Write usage for CommonElement.mix method.
     *
     * @method mix
     * @param {object|fuction} source - Source object or function that is being extended from.
     * @param {object} option - Exclusion, a list of functions or properties that should not be mixed.
     * @return {object}
     */
    mix: function mix (source, option = {
        fnOverrided: true,
        exclusion: {
            prototypes: false,
            properties: false,
            enumerablePropertiesOnly: false,
            prefixes: [ PRIVATE_PREFIX ],
            postfixes: [],
            keys: [],
            exception: {
                prefixes: [],
                postfixes: [],
                keys: []
            }
        }
    }) {
        const Hf = this;

        if (!Hf.DEVELOPMENT) {
            if (!(Hf.isObject(source) || Hf.isFunction(source))) {
                Hf.log(`error`, `CommonElement.mix - Input source object or function is invalid.`);
            }
        }

        const {
            fnOverrided,
            exclusion
        } = Hf.fallback({
            fnOverrided: true,
            exclusion: {
                prototypes: false,
                properties: false,
                enumerablePropertiesOnly: false,
                prefixes: [ PRIVATE_PREFIX ],
                postfixes: [],
                keys: [],
                exception: {
                    prefixes: [],
                    postfixes: [],
                    keys: []
                }
            }
        }).of(option);
        let result;
        /* helper function to filter out key in the exclusion list. */
        const isIncluded = function isIncluded (key) {
            let included = false;

            if (!Hf.DEVELOPMENT) {
                exclusion.prefixes.push(`DEBUG_`);
            }

            if (Hf.isString(key) && key !== `prototype`) {
                const prefixExcepted = !Hf.isEmpty(exclusion.exception.prefixes) ? exclusion.exception.prefixes.some((prefix) => {
                    return key.substr(0, prefix.length) === prefix;
                }) : false;
                const postfixExcepted = !Hf.isEmpty(exclusion.exception.postfixes) ? exclusion.exception.postfixes.some((postfix) => {
                    return key.substr(0, postfix.length) === postfix;
                }) : false;
                const keyExcepted = !Hf.isEmpty(exclusion.exception.keys) ? exclusion.exception.keys.includes(key) : false;

                included = true;

                if (included && !Hf.isEmpty(exclusion.prefixes)) {
                    included = exclusion.prefixes.every((prefix) => key.substr(0, prefix.length) !== prefix);
                }
                if (included && !Hf.isEmpty(exclusion.postfixes)) {
                    included = exclusion.postfixes.every((postfix) => key.substr(0, postfix.length) !== postfix);
                }
                if (included && !Hf.isEmpty(exclusion.keys)) {
                    if (exclusion.keys.length === 1 && exclusion.keys[0] === `*`) {
                        included = false;
                    } else {
                        if (included) {
                            included = !exclusion.keys.includes(key);
                        }
                    }
                }
                included = included || (prefixExcepted || postfixExcepted || keyExcepted);
            }
            return included;
        };

        if (Hf.isObject(source)) {
            result = {};
        } else if (Hf.isFunction(source)) {
            result = function () {};
        }

        if (!exclusion.prototypes) {
            /* copy source object prototypes to new mixed result object */
            result = Object.entries(Object.getPrototypeOf(source)).filter(([ fnName, fn ]) => {
                return Hf.isFunction(fn) && isIncluded(fnName);
            }).reduce((_result, [ fnName, fn ]) => {
                /* bind the prototype to source object */
                _result[fnName] = fn.bind(source);
                return _result;
            }, result);

            /* copy source object functions to new mixed result object */
            result = Object.entries(source).filter(([ fnName, fn ]) => {
                return Hf.isFunction(fn) && isIncluded(fnName);
            }).reduce((_result, [ fnName, fn ]) => {
                /* bind the prototype to source object */
                _result[fnName] = fn;
                return _result;
            }, result);
        }

        if (!exclusion.properties) {
            result = Object.keys(Object.getPrototypeOf(source)).concat(
                exclusion.enumerablePropertiesOnly ? Object.keys(source) : Object.getOwnPropertyNames(source)
            ).filter((key) => {
                return !Hf.isFunction(source[key]) && isIncluded(key);
            }).reduce((_result, key) => {
                const sourceObjDesc = Object.getOwnPropertyDescriptor(source, key);

                if (Hf.isObject(sourceObjDesc)) {
                    Object.defineProperty(_result, key, {
                        get: function get () {
                            return source[key];
                        },
                        set: function set (value) {
                            source[key] = value;
                        },
                        configurable: sourceObjDesc.configurable,
                        enumerable: sourceObjDesc.enumerable
                    });
                } else {
                    Object.defineProperty(_result, key, {
                        get: function get () {
                            return source[key];
                        },
                        set: function set (value) {
                            source[key] = value;
                        },
                        configurable: false,
                        enumerable: true
                    });
                }

                return _result;
            }, result);
        }

        return {
            /**
             * @description - Mixing with the target object or function...
             *
             * @method mix.with
             * @param {object|fuction} target - Target object or function that is being extended to.
             * @return {object}
             */
            with: function _with (target) {
                if (Hf.DEVELOPMENT) {
                    if (!(Hf.isObject(target) || Hf.isFunction(target))) {
                        Hf.log(`error`, `CommonElement.mix.with - Input target object or function is invalid.`);
                    }
                    // if (Hf.isObject(source) && !Hf.isObject(target)) {
                    //     Hf.log(`error`, `CommonElement.mix.with - Input target object is invalid.`);
                    // } else if (Hf.isFunction(source) && !Hf.isFunction(target)) {
                    //     Hf.log(`error`, `CommonElement.mix.with - Input target function is invalid.`);
                    // }
                }

                if (!exclusion.prototypes) {
                    /* copy target object prototypes to new mixed result object */
                    result = Object.entries(Object.getPrototypeOf(target)).filter(([ fnName, fn ]) => {
                        if (Hf.isFunction(fn) && isIncluded(fnName)) {
                            if (!fnOverrided) {
                                if (!result.hasOwnProperty(fnName)) {
                                    return true;
                                }
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }).reduce((_result, [ fnName, fn ]) => {
                        /* bind the prototype to target object */
                        _result[fnName] = fn.bind(target);
                        return _result;
                    }, result);

                    /* copy target object functions to new mixed result object */
                    result = Object.entries(target).filter(([ fnName, fn ]) => {
                        if (Hf.isFunction(fn) && isIncluded(fnName)) {
                            /* mix prototypes only */
                            if (!fnOverrided) {
                                if (!result.hasOwnProperty(fnName)) {
                                    return true;
                                }
                                return false;
                            }
                            return true;
                        }
                        return false;
                    }).reduce((_result, [ fnName, fn ]) => {
                        _result[fnName] = fn;
                        return _result;
                    }, result);
                }

                if (!exclusion.properties) {
                    result = Object.keys(Object.getPrototypeOf(target)).concat(
                        exclusion.enumerablePropertiesOnly ? Object.keys(target) : Object.getOwnPropertyNames(target)
                    ).filter((key) => {
                        return !Hf.isFunction(target[key]) && target.hasOwnProperty(key) && !result.hasOwnProperty(key) && isIncluded(key);
                    }).reduce((_result, key) => {
                        const targetObjDesc = Object.getOwnPropertyDescriptor(target, key);

                        if (Hf.isObject(targetObjDesc)) {
                            Object.defineProperty(_result, key, {
                                get: function get () {
                                    return target[key];
                                },
                                set: function set (value) {
                                    target[key] = value;
                                },
                                configurable: targetObjDesc.configurable,
                                enumerable: targetObjDesc.enumerable
                            });
                        } else {
                            Object.defineProperty(_result, key, {
                                get: function get () {
                                    return target[key];
                                },
                                set: function set (value) {
                                    target[key] = value;
                                },
                                configurable: false,
                                enumerable: true
                            });
                        }

                        return _result;
                    }, result);
                }
                return result;
            }
        };
    },
    /**
     * @description - Reveal the closure as a public object.
     *
     * @method reveal
     * @param {object} closure - A closure function or object.
     * @param {object} option
     * @return {object}
     */
    reveal: function reveal (closure, option = {}) {
        const Hf = this;

        option = Hf.isObject(option) ? option : {};

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(closure) || Hf.isFunction(closure))) {
                Hf.log(`error`, `CommonElement.reveal - Input closure is invalid.`);
            }
        }

        if (Hf.isObject(closure)) {
            return Hf.mix(closure, option).with({});
        }

        if (Hf.isFunction(closure)) {
            let enclosedObj = {};

            closure.call(enclosedObj);
            return Hf.mix(enclosedObj, option).with({});
        }
    },
    /**
     * @description - Retrieve an object property at pathId.
     *
     * @usage TODO: Write usage for CommonElement.retrieve method.
     *
     * @method retrieve
     * @param {string|array} pathId - Path of the property to retrieve.
     * @param {string} delimiter
     * @param {object} asNestedObject - Flag to indicate the return value is a nested object of pathId.
     * @return {object}
     */
    retrieve: function retrieve (pathId, delimiter, asNestedObject = false) {
        const Hf = this;

        asNestedObject = Hf.isBoolean(asNestedObject) ? asNestedObject : false;

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isString(pathId) || Hf.isArray(pathId))) {
                Hf.log(`error`, `CommonElement.retrieve - Input pathId is invalid.`);
            } else if (!(Hf.isString(delimiter) && delimiter.length === 1)) {
                Hf.log(`error`, `CommonElement.retrieve - Input delimiter is invalid.`);
            }
        }

        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, delimiter) : pathId;
        return {
            /**
             * @description - Target object to retrive property from...
             *
             * @method retrieve.from
             * @param {object|array} target
             * @returns {*}
             */
            from: function from (target) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(target)) {
                        Hf.log(`error`, `CommonElement.retrieve.from - Input target object is invalid.`);
                    }
                }

                return Hf._deepRetrieval(target, pathId.slice(0), asNestedObject);
            }
        };
    },
    /**
     * @description - Loop through an object or array.
     *
     * @method forEach
     * @param {object|array} value - Object or array value to iterate over.
     * @param {function} iterator - Iterator function.
     * @param {object} context - Object to become context (`this`) for the iterator function.
     * @returns void
     */
    forEach: function forEach (value, iterator, context) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(value) || Hf.isArray(value))) {
                Hf.log(`error`, `CommonElement.forEach - Input value is invalid.`);
            } else if (!Hf.isFunction(iterator)) {
                Hf.log(`error`, `CommonElement.forEach - Input iterator callback is invalid.`);
            }
        }
        if (Hf.isObject(value)) {
            const obj = value;

            Object.entries(obj).forEach(([ key, _value ]) => {
                iterator.call(context, _value, key);
            });
        } else if (Hf.isArray(value)) {
            const array = value;

            array.forEach((item, key) => {
                iterator.call(context, item, key);
            });
        }
    },
    /**
     * @description - Convert an array to string at delimiter.
     *
     * @function arrayToString
     * @param {array} array
     * @param {string} delimiter
     * @return {string}
     */
    arrayToString: function arrayToString (array, delimiter) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isArray(array)) {
                Hf.log(`error`, `CommonElement.arrayToString - Input array is invalid.`);
            } else if (!(Hf.isString(delimiter) && delimiter.length === 1)) {
                Hf.log(`error`, `CommonElement.arrayToString - Input delimiter is invalid.`);
            }
        }

        return array.join(delimiter);
    },
    /**
     * @description - Split string to array at delimiter.
     *
     * @function stringToArray
     * @param {string} str
     * @param {string} delimiter
     * @return {array}
     */
    stringToArray: function stringToArray (str, delimiter) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(str)) {
                Hf.log(`error`, `CommonElement.stringToArray - Input string is invalid.`);
            } else if (!(Hf.isString(delimiter) && delimiter.length === 1)) {
                Hf.log(`error`, `CommonElement.stringToArray - Input delimiter is invalid.`);
            }
        }

        if (str.includes(delimiter) && str.length > 1) {
            /* split string into array */
            return str.split(delimiter).map((value) => Hf.isInteger(value) ? parseInt(value, 10) : value);
            // return str.split(delimiter).map((value) => {
            //     return Hf.isInteger(value) ? parseInt(value, 10) : value;
            // }).filter(Boolean);
        }
        return [ str ];
    },
    /**
     * @description - Helper function to convert camel case str name to underscore.
     *
     * @method camelcaseToUnderscore
     * @param {string} str
     * @return {string}
     */
    camelcaseToUnderscore: function camelcaseToUnderscore (str) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(str)) {
                Hf.log(`error`, `CommonElement.camelcaseToUnderscore - Input string is invalid.`);
            }
        }

        return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => `_${word.toLowerCase()}`).replace(/^_/, ``);
    },
    /**
     * @description - Helper function to convert unserScore str name to camelcase.
     *
     * @method underscoreToCamelcase
     * @param {string} str
     * @return {string}
     */
    underscoreToCamelcase: function underscoreToCamelcase (str) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(str)) {
                Hf.log(`error`, `CommonElement.underscoreToCamelcase - Input string is invalid.`);
            }
        }

        return str.replace(/_([a-z])/g, (match, word) => word.toUpperCase());
    },
    /**
     * @description - Helper function to convert camel case str name to dash.
     *
     * @method camelcaseToDash
     * @param {string} str
     * @return {string}
     */
    camelcaseToDash: function camelcaseToDash (str) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(str)) {
                Hf.log(`error`, `CommonElement.camelcaseToDash - Input string is invalid.`);
            }
        }

        return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => `-${word.toLowerCase()}`).replace(/^-/, ``);
    },
    /**
     * @description - Helper function to convert dash str name to camelcase.
     *
     * @method dashToCamelcase
     * @param {string} str
     * @return {string}
     */
    dashToCamelcase: function dashToCamelcase (str) {
        const Hf = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(str)) {
                Hf.log(`error`, `CommonElement.dashToCamelcase - Input string is invalid.`);
            }
        }

        return str.replace(/-([a-z])/g, (match, word) => word.toUpperCase());
    },
    /**
     * @description - A simple console log wrapper. Only active in debug/development mode.
     *
     * @method log
     * @param {string} type
     * @param {string} message
     * @returns void
     */
    log: function log (type, message) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            let stringifiedMessage = ``;

            if (Hf.isObject(message) || Hf.isArray(message)) {
                stringifiedMessage = JSON.stringify(message, null, `\t`);
            } else {
                stringifiedMessage = message;
            }
            const logger = {
                error: function error () {
                    throw new Error(`ERROR: ${message}`);
                },
                warn0: function warn0 () {
                    if (Hf._consoleLog.enableWarn0Logging) {
                        console.warn(`WARN-0: ${stringifiedMessage}`);

                        if (Hf._consoleLog.history.index >= LOG_HISTORY_SIZE) {
                            Hf._consoleLog.history.index = 0;
                        } else {
                            Hf._consoleLog.history.index++;
                        }

                        Hf._consoleLog.history.logs[Hf._consoleLog.history.index] = {
                            type: `warn0`,
                            timestamp: new Date(),
                            message: `WARN-0: ${stringifiedMessage}`
                        };
                    }
                },
                warn1: function warn1 () {
                    if (Hf._consoleLog.enableWarn1Logging) {
                        console.warn(`WARN-1: ${stringifiedMessage}`);

                        if (Hf._consoleLog.history.index >= LOG_HISTORY_SIZE) {
                            Hf._consoleLog.history.index = 0;
                        } else {
                            Hf._consoleLog.history.index++;
                        }

                        Hf._consoleLog.history.logs[Hf._consoleLog.history.index] = {
                            type: `warn1`,
                            timestamp: new Date(),
                            message: `WARN-1: ${stringifiedMessage}`
                        };
                    }
                },
                info0: function info0 () {
                    if (Hf._consoleLog.enableInfo0Logging) {
                        console.info(`INFO-0: ${stringifiedMessage}`);

                        if (Hf._consoleLog.history.index >= LOG_HISTORY_SIZE) {
                            Hf._consoleLog.history.index = 0;
                        } else {
                            Hf._consoleLog.history.index++;
                        }

                        Hf._consoleLog.history.logs[Hf._consoleLog.history.index] = {
                            type: `info0`,
                            timestamp: new Date(),
                            message: `INFO-0: ${stringifiedMessage}`
                        };
                    }
                },
                info1: function info1 () {
                    if (Hf._consoleLog.enableInfo1Logging) {
                        console.info(`INFO-1: ${stringifiedMessage}`);

                        if (Hf._consoleLog.history.index >= LOG_HISTORY_SIZE) {
                            Hf._consoleLog.history.index = 0;
                        } else {
                            Hf._consoleLog.history.index++;
                        }

                        Hf._consoleLog.history.logs[Hf._consoleLog.history.index] = {
                            type: `info1`,
                            timestamp: new Date(),
                            message: `INFO-1: ${stringifiedMessage}`
                        };
                    }
                },
                debug: function debug () {
                    /* debug log is always enabled */
                    console.log(`DEBUG: ${stringifiedMessage}`);

                    if (Hf._consoleLog.history.index >= LOG_HISTORY_SIZE) {
                        Hf._consoleLog.history.index = 0;
                    } else {
                        Hf._consoleLog.history.index++;
                    }

                    Hf._consoleLog.history.logs[Hf._consoleLog.history.index] = {
                        type: `debug`,
                        timestamp: new Date(),
                        message: `DEBUG: ${stringifiedMessage}`
                    };
                }
            };
            switch (type) { // eslint-disable-line
            case `debug`:
                logger.debug();
                return;
            case `info0`:
                logger.info0();
                return;
            case `info1`:
                logger.info1();
                return;
            case `warn0`:
                logger.warn0();
                return;
            case `warn1`:
                logger.warn1();
                return;
            case `error`:
                logger.error();
                return;
            default:
                console.warn(`WARNING-1: CommonElement.log - Invalid log type:${type}.`);
                return;
            }
        }
    },
    /**
     * @description - Get log history.
     *
     * @method logHistory
     * @param {string} type
     * @returns {array}
     */
    getLogHistories: function getLogHistories (type) {
        const Hf = this;
        if (Hf.DEVELOPMENT) {
            switch (type) { // eslint-disable-line
            case `debug`:
                return Hf._consoleLog.history.logs.filter((log) => log !== null && log.type === `debug`).sort((logA, logB) => {
                    const timestampA = new Date(logA.timestamp);
                    const timestampB = new Date(logB.timestamp);

                    return timestampA - timestampB;
                });
            case `info0`:
                return Hf._consoleLog.history.logs.filter((log) => log !== null && log.type === `info0`).sort((logA, logB) => {
                    const timestampA = new Date(logA.timestamp);
                    const timestampB = new Date(logB.timestamp);

                    return timestampA - timestampB;
                });
            case `info1`:
                return Hf._consoleLog.history.logs.filter((log) => log !== null && log.type === `info1`).sort((logA, logB) => {
                    const timestampA = new Date(logA.timestamp);
                    const timestampB = new Date(logB.timestamp);

                    return timestampA - timestampB;
                });
            case `warn0`:
                return Hf._consoleLog.history.logs.filter((log) => log !== null && log.type === `warn0`).sort((logA, logB) => {
                    const timestampA = new Date(logA.timestamp);
                    const timestampB = new Date(logB.timestamp);

                    return timestampA - timestampB;
                });
            case `warn1`:
                return Hf._consoleLog.history.logs.filter((log) => log !== null && log.type === `warn1`).sort((logA, logB) => {
                    const timestampA = new Date(logA.timestamp);
                    const timestampB = new Date(logB.timestamp);

                    return timestampA - timestampB;
                });
            default:
                Hf.log(`warn1`, `CommonElement.getLogHistories - Invalid log type:${type}.`);
                return;
            }
        }
    }
};

/**
 * @description - A common element module export function.
 *
 * @module CommonElement
 * @param {object} option
 * @return {object}
 */
export default function CommonElement (option = {
    development: true,
    logging: {
        info0: false,
        info1: true,
        warn0: false,
        warn1: true
    }
}) {
    let {
        development,
        logging
    } = option;
    const element = Object.create(CommonElementPrototype, {
        /* this flag indicates develeopment or production status of the project */
        DEVELOPMENT: {
            value: CommonElementPrototype.isBoolean(development) ? development : true,
            writable: false,
            configurable: false,
            enumerable: true
        },
        _consoleLog: {
            value: {
                /* this flag enables console log of debug messages when calling method Hf.log(`info`, `a debug message.`) */
                enableInfo0Logging: CommonElementPrototype.isObject(logging) && CommonElementPrototype.isBoolean(logging.info0) ? logging.info0 : false,
                enableInfo1Logging: CommonElementPrototype.isObject(logging) && CommonElementPrototype.isBoolean(logging.info1) ? logging.info1 : true,
                enableWarn0Logging: CommonElementPrototype.isObject(logging) && CommonElementPrototype.isBoolean(logging.warn0) ? logging.warn0 : false,
                enableWarn1Logging: CommonElementPrototype.isObject(logging) && CommonElementPrototype.isBoolean(logging.warn1) ? logging.warn1 : true,
                history: {
                    index: 0,
                    logs: Array(LOG_HISTORY_SIZE).fill(null)
                }
            },
            writable: false,
            configurable: true,
            enumerable: false
        }
    });
    /* reveal only the public properties and functions */
    return Object.freeze(element.reveal(element));
}
