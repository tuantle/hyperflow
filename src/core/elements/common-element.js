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
 * throughout Hflow toolkit.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

const PRIVATE_PREFIX = `_`;

/* this flag indicates develeopment or production status of the project */
let DEVELOPMENT = true;

/* this flag enables console log of debug messages when calling method Hflow.log(`info`, `a debug message.`) */
let CONSOLE_LOG_DEBUG = {
    ENABLE_INFO_MESSAGE: true,
    ENABLE_WARN_LVL0_MESSAGE: false,
    ENABLE_WARN_LVL1_MESSAGE: true
};

/**
 * @description - Common element prototype object.
 *
 * CommonElementPrototype
 */
const CommonElementPrototype = Object.create({}).prototype = {
    /* ----- Common Prototype Definitions --------------------- */
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
     * @description - Check for a string type.
     *
     * @method isString
     * @param {string} str - To be checked if it is a string.
     * @returns {boolean}
     */
    isString: function isString (str) {
        const common = this;

        return common.typeOf(str) === `string` || (common.typeOf(str) === `object` && str.constructor === String);
    },
    /**
     * @description - Check if value is a boolean.
     *
     * @method isBoolean
     * @param value - To be checked if it is a boolean.
     * @returns {boolean}
     */
    isBoolean: function isBoolean (value) {
        const common = this;

        return common.typeOf(value) === `boolean` || (common.isString(value) && (value.toLowerCase() === `true` || value.toLowerCase() === `false`));
    },
    /**
     * @description - Check for defined type.
     *
     * @method isDefined
     * @param {*} value - To be checked if value is defined.
     * @returns {boolean}
     */
    isDefined: function isDefined (value) {
        const common = this;

        return common.typeOf(value) !== `undefined`;
    },
    /**
     * @description - Check for function type.
     *
     * @method isFunction
     * @param {function} fn - To be checked if it is a function.
     * @returns {boolean}
     */
    isFunction: function isFunction (fn) {
        return Object.prototype.toString.call(fn) === `[object Function]`;
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
     * @description - Check for object type.
     *
     * @method isObject
     * @param {object} obj - To be checked if it is an object.
     * @returns {boolean}
     */
    isObject: function isObject (obj) {
        const common = this;

        return common.typeOf(obj) === `object` && obj === Object(obj) && !common.isArray(obj) && obj !== null;
    },
    /**
     * @description - Check if an object, array, or string is empty.
     *
     * @method isEmpty
     * @param {object|array|string} value - To be checked if it is an empty object, array, or string.
     * @returns {boolean}
     */
    isEmpty: function isEmpty (value) {
        const common = this;

        if (common.isObject(value)) {
            return Object.getOwnPropertyNames(value).length === 0;
        } else if (common.isArray(value) || common.isString(value)) {
            return value.length === 0;
        }
        return true;
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
        const common = this;
        /* helper function to compare and verify object schema */
        const deepCompareSchema = function deepCompareSchema (_schema, _target) {
            let verified = true;

            if (common.isObject(_schema) && common.isObject(_target)) {
                common.forEach(_schema, (schemaItem, key) => {
                    if (verified) {
                        let itemTypes = [];
                        if (_target.hasOwnProperty(key) || Object.getPrototypeOf(_target).hasOwnProperty(key)) {
                            const targetItem = _target[key];
                            if ((common.isObject(targetItem) && common.isObject(schemaItem)) || (common.isArray(targetItem) && common.isArray(schemaItem))) {
                                verified = deepCompareSchema(schemaItem, targetItem);
                            } else if (common.isString(schemaItem)) {
                                itemTypes = common.stringToArray(schemaItem, `|`);
                                verified = itemTypes.some((itemType) => {
                                    if (itemType === `defined`) {
                                        return common.isDefined(targetItem);
                                    }
                                    return common.typeOf(targetItem) === itemType;
                                });
                            } else {
                                verified = false;
                            }
                        } else {
                            if (common.isString(schemaItem)) {
                                itemTypes = common.stringToArray(schemaItem, `|`);
                                verified = itemTypes.indexOf(`undefined`) !== -1;
                            } else {
                                verified = false;
                            }
                        }
                    }
                });
            } else if (common.isArray(_schema) && common.isArray(_target)) {
                if (_schema.length === 1) {
                    const schemaItem = _schema[0];
                    verified = _target.reduce((_verified, targetItem) => {
                        let itemTypes = [];
                        if ((common.isObject(targetItem) && common.isObject(schemaItem)) || (common.isArray(targetItem) && common.isArray(schemaItem))) {
                            _verified = deepCompareSchema(schemaItem, targetItem);
                        } else if (common.isString(schemaItem)) {
                            itemTypes = common.stringToArray(schemaItem, `|`);
                            _verified = itemTypes.some((itemType) => {
                                if (itemType === `defined`) {
                                    return common.isDefined(targetItem);
                                }
                                return common.typeOf(targetItem) === itemType;
                            });
                        } else {
                            _verified = false;
                        }
                        return _verified;
                    }, verified);
                } else {
                    common.log(`warn1`, `CommonElement.deepCompareSchema - Predefined schema test array must have a length of 1.`);
                    verified = false;
                }
            } else {
                verified = false;
            }
            return verified;
        };
        return {
            /**
             * @description - Compare schema of the target object...
             *
             * @prototype isSchema.of
             * @param {object} target - Target object be compared with.
             * @returns {boolean}
             */
            of: function of (target) {
                return deepCompareSchema(schema, target);
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
        const common = this;

        if (fns.length < 2) {
            common.log(`error`, `CommonElement.compose - Input function array must have more than two functions.`);
        } else if (!fns.every((fn) => common.isFunction(fn))) {
            common.log(`error`, `CommonElement.compose - Input function is invalid.`);
        } else {
            /**
             * @description - A composed function of two or more functions.
             *
             * @method mutate.atPathBy
             * @param {*} value
             * @returns {function}
             */
            return function composed (value) {
                return fns.reduce((result, fn) => {
                    if (common.isDefined(result)) {
                        return fn(result);
                    }
                    return fn();
                }, value);
            };
        }
    },
    /**
     * @description - Collect propteries from an object or array and return those propteries as an array.
     *
     * @method collect
     * @param {object|array} target
     * @param {array} pathIds
     * @return {array}
     */
    collect: function collect (target, ...pathIds) {
        const common = this;

        if (!(common.isObject(target) || common.isArray(target))) {
            common.log(`error`, `CommonElement.collect - Input target is invalid.`);
        } else if (common.isEmpty(pathIds)) {
            common.log(`error`, `CommonElement.collect - Input pathId is empty.`);
        } else if (!pathIds.every((pathId) => common.isString(pathId) || common.isArray(pathId))) {
            common.log(`error`, `CommonElement.collect - Input pathId is invalid.`);
        } else {
            return pathIds.map((pathId) => {
                return common.retrieve(pathId, `.`).from(target);
            });
        }
    },
    /**
     * @description - Clear all object or array.
     *
     * @method clear
     * @param {object|array} value
     * @return void
     */
    clear: function clear (value) {
        // TODO: To be removed if find no use case.
        const common = this;

        if (common.isObject(value)) {
            Object.getOwnPropertyNames(value).forEach((key) => {
                value[key] = undefined;
                delete value[key];
            });
        } else if (common.isArray(value)) {
            value.length = 0;
        } else {
            common.log(`error`, `CommonElement.clear - Input is not an object or array type.`);
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
        const common = this;

        if (!(common.isObject(source) || common.isArray(source))) {
            common.log(`error`, `CommonElement.clone - Input is not an object or array type.`);
        } else {
            let result;
            if (common.isObject(source)) {
                result = Object.assign({}, source);
            }
            if (common.isArray(source)) {
                result = source.map((value) => {
                    return common.isObject(value) || common.isArray(value) ? common.clone(value) : value;
                }).slice(0);
            }
            return result;
            // return Object.isFrozen(source) ? Object.freeze(result) : result;
        }
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
        const common = this;
        /* helper function to return a new object that was deep mutated from source by reference target mutator object. */
        const deepMutation = function deepMutation (_source, _mutator, _pathId = []) {
            if (!(common.isArray(_pathId))) {
                common.log(`error`, `CommonElement.deepMutation - Input pathId is invalid.`);
            } else {
                let result;
                if (common.isEmpty(_pathId)) {
                    if (common.isObject(_source) && common.isObject(_mutator)) {
                        result = Object.assign({}, _source);
                        Object.keys(_source).filter((key) => {
                            if (!_mutator.hasOwnProperty(key)) {
                                common.log(`warn0`, `CommonElement.deepMutation - Source key:${key} is not defined in mutator.`);
                                return false;
                            } else if (common.isFunction(_source[key])) {
                                common.log(`warn0`, `CommonElement.deepMutation - Ignore mutation of function key:${key}.`);
                                return false;
                            }
                            return true;
                        }).forEach((key) => {
                            const sourceItem = _source[key];
                            const mutatorItem = _mutator[key];
                            if ((common.isObject(sourceItem) && common.isObject(mutatorItem)) ||
                                (common.isArray(sourceItem) && common.isArray(mutatorItem))) {
                                result[key] = deepMutation(sourceItem, mutatorItem);
                            } else {
                                result[key] = mutatorItem;
                            }
                        });
                    } else if (common.isArray(_source) && common.isArray(_mutator)) {
                        result = _source.slice(0);
                        if (_source.length < _mutator.length) {
                            common.log(`warn0`, `CommonElement.deepMutation - Target mutator array length is greater than what is defined in source.`);
                        }
                        _source.filter((sourceItem, key) => {
                            if (common.isFunction(sourceItem)) {
                                common.log(`warn0`, `CommonElement.deepMutation - Ignore mutation of function key:${key}.`);
                                return false;
                            }
                            return key < _mutator.length;
                        }).forEach((sourceItem, key) => {
                            const mutatorItem = _mutator[key];
                            if ((common.isObject(sourceItem) && common.isObject(mutatorItem)) ||
                                (common.isArray(sourceItem) && common.isArray(mutatorItem))) {
                                result[key] = deepMutation(sourceItem, mutatorItem);
                            } else {
                                result[key] = mutatorItem;
                            }
                        });
                    } else {
                        common.log(`error`, `CommonElement.deepMutation - Input source or target mutator is invalid.`);
                    }
                } else {
                    const key = _pathId.shift();
                    if (common.isObject(_source) && _source.hasOwnProperty(key)) {
                        result = Object.assign({}, _source);
                        if (common.isEmpty(_pathId)) {
                            if (common.isObject(_mutator) && _mutator.hasOwnProperty(key)) {
                                result[key] = deepMutation(_source[key], _mutator[key], _pathId.slice(0));
                            }
                            // } else {
                            //     common.log(`warn1`, `CommonElement.deepMutation - Target mutator key:${key} is not defined in source.`);
                            // }
                        } else {
                            result[key] = deepMutation(_source[key], _mutator, _pathId.slice(0));
                        }
                    } else if (common.isArray(_source) && common.isInteger(key) && key < _source.length) {
                        result = _source.slice(0);
                        if (common.isEmpty(_pathId)) {
                            if (common.isArray(_mutator) && key < _mutator.length) {
                                result[key] = deepMutation(_source[key], _mutator[key], _pathId.slice(0));
                            }
                            // } else {
                            //     common.log(`warn1`, `CommonElement.deepMutation - Target mutator array length is greater than what is defined in source.`);
                            // }
                        } else {
                            result[key] = deepMutation(_source[key], _mutator, _pathId.slice(0));
                        }
                    } else {
                        common.log(`error`, `CommonElement.deepMutation - Path ends at property key:${key}.`);
                    }
                }
                return result;
            }
        };
        if (!common.isObject(source)) {
            common.log(`error`, `CommonElement.mutate - Input source is invalid.`);
        } else {
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
                    pathId = common.isString(pathId) ? common.stringToArray(pathId, `.`) : pathId;
                    if (!common.isObject(mutator)) {
                        common.log(`error`, `CommonElement.mutate.atPathBy - Input mutator is invalid.`);
                    } else if (!(common.isArray(pathId) && !common.isEmpty(pathId))) {
                        common.log(`error`, `CommonElement.mutate.atPathBy - Input pathId is invalid.`);
                    } else {
                        return deepMutation(source, mutator, pathId.slice(0));
                    }
                },
                /**
                 * @description - Mutating the source from reference target mutator object...
                 *
                 * @method mutate.by
                 * @param {object} mutator - Target reference mutator object.
                 * @returns {object}
                 */
                by: function by (mutator) {
                    if (!common.isObject(mutator)) {
                        common.log(`error`, `CommonElement.mutate.by - Input mutator is invalid.`);
                    } else {
                        return deepMutation(source, mutator);
                    }
                }
            };
        }
    },
    /**
     * @description - Deep merging source to target object.
     *
     * @method merge
     * @param {object} source - Source object be merged from.
     * @returns {object}
     */
    merge: function merge (source) {
        const common = this;
        /* helper function to deep merge source with target and return result. */
        const deepMerge = function deepMerge (_source, _target, _pathId = []) {
            let result;

            _pathId = common.isArray(_pathId) ? _pathId : [];

            if (common.isEmpty(_pathId)) {
                if ((common.isObject(_source) || common.isArray(_source)) &&
                    (common.isObject(_target) || common.isArray(_target))) {
                    if (common.isArray(_source) && common.isArray(_target)) {
                        result = _source.slice(0);
                        _target.forEach((item, key) => {
                            if (!common.isDefined(result[key])) {
                                result[key] = item;
                            } else if (common.isObject(item)) {
                                result[key] = deepMerge(_source[key], item);
                            } else {
                                if (_source.indexOf(item) === -1) {
                                    result.push(item);
                                }
                            }
                        });
                    } else {
                        if (common.isObject(_source)) {
                            result = Object.assign({}, _source);
                        }
                        Object.keys(_target).forEach((key) => {
                            if (common.isObject(_target[key]) || common.isArray(_target[key])) {
                                if (!common.isDefined(_source[key])) {
                                    result[key] = _target[key];
                                } else {
                                    result[key] = deepMerge(_source[key], _target[key]);
                                }
                            } else {
                                result[key] = _target[key];
                            }
                        });
                    }
                } else {
                    common.log(`error`, `CommonElement.deepMerge - Input source or mutation is invalid.`);
                }
            } else {
                const key = _pathId.shift();
                if (common.isObject(_source) && _source.hasOwnProperty(key)) {
                    result = Object.assign({}, _source);
                    if (common.isEmpty(_pathId)) {
                        if (common.isObject(_target) && _target.hasOwnProperty(key)) {
                            result[key] = deepMerge(_source[key], _target[key], _pathId.slice(0));
                        }
                    } else {
                        result[key] = deepMerge(_source[key], _target, _pathId.slice(0));
                    }
                } else if (common.isArray(_source) && common.isInteger(key) && key < _source.length) {
                    result = _source.slice(0);
                    if (common.isEmpty(_pathId)) {
                        if (common.isArray(_target) && key < _target.length) {
                            result[key] = deepMerge(_source[key], _target[key], _pathId.slice(0));
                        }
                    } else {
                        result[key] = deepMerge(_source[key], _target, _pathId.slice(0));
                    }
                } else {
                    common.log(`error`, `CommonElement.deepMerge - Path ends at property key:${key}.`);
                }
            }
            return result;
        };
        if (!common.isObject(source)) {
            common.log(`error`, `CommonElement.merge - Input source is invalid.`);
        } else {
            return {
                /**
                 * @description - Merging with the target object at pathId...
                 *
                 * @method merge.atPathWith
                 * @param {object} target - Target object be merged to.
                 * @param {string|array} pathId - Path of the property to retrieve.
                 * @returns {object}
                 */
                atPathWith: function _with (target, pathId) {
                    pathId = common.isString(pathId) ? common.stringToArray(pathId, `.`) : pathId;
                    if (!common.isObject(target)) {
                        common.log(`error`, `CommonElement.merge.atPathWith - Input target is invalid.`);
                    } else if (!(common.isArray(pathId) && !common.isEmpty(pathId))) {
                        common.log(`error`, `CommonElement.merge.atPathWith - Input pathId is invalid.`);
                    } else {
                        return deepMerge(source, target, pathId.slice(0));
                    }
                },
                /**
                 * @description - Merging with the target object...
                 *
                 * @method merge.with
                 * @param {object} target - Target object be merged to.
                 * @returns {object}
                 */
                with: function _with (target) {
                    if (!common.isObject(target)) {
                        common.log(`error`, `CommonElement.merge.with - Input target is invalid.`);
                    } else {
                        return deepMerge(source, target);
                    }
                }
            };
        }
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
        const common = this;
        /* helper function to do compare and fallback if mismatched */
        const deepCompareAndFallback = function deepCompareAndFallback (_source, _target) {
            let result;
            if (common.isObject(_source) && common.isObject(_target)) {
                result = {};
                /* shallow copy target to result object */
                Object.keys(_target).forEach((key) => {
                    const targetItemDesc = Object.getOwnPropertyDescriptor(_target, key);
                    Object.defineProperty(result, key, {
                        get: function get () {
                            if (targetItemDesc.hasOwnProperty(`get`)) {
                                return targetItemDesc.get();
                            }
                            return targetItemDesc.value;
                        },
                        set: function set (value) {
                            if (targetItemDesc.hasOwnProperty(`set`)) {
                                targetItemDesc.set(value);
                            } else {
                                targetItemDesc.value = value;
                            }
                        },
                        configurable: true,
                        enumerable: true
                    });
                });
                common.forEach(_source, (sourceItem, key) => {
                    if (_target.hasOwnProperty(key)) {
                        const targetItem = _target[key];
                        if ((common.isObject(targetItem) && common.isObject(sourceItem)) || (common.isArray(targetItem) && common.isArray(sourceItem))) {
                            result[key] = deepCompareAndFallback(sourceItem, targetItem);
                        } else {
                            if (common.typeOf(targetItem) !== common.typeOf(sourceItem)) {
                                result[key] = sourceItem;
                                if (common.isFunction(notify)) {
                                    notify(key);
                                }
                            }
                        }
                    } else {
                        result[key] = sourceItem;
                        if (common.isFunction(notify)) {
                            notify(key);
                        }
                    }
                });
            } else if (common.isArray(_source) && common.isArray(_target)) {
                result = _target.slice(0);
                common.forEach(_source, (sourceItem, key) => {
                    if (key >= 0 && key < _target.length) {
                        const targetItem = _target[key];
                        if ((common.isObject(targetItem) && common.isObject(sourceItem)) || (common.isArray(targetItem) && common.isArray(sourceItem))) {
                            result[key] = deepCompareAndFallback(sourceItem, targetItem);
                        } else {
                            if (common.typeOf(targetItem) !== common.typeOf(sourceItem)) {
                                result[key] = sourceItem;
                                if (common.isFunction(notify)) {
                                    notify(key);
                                }
                            }
                        }
                    } else {
                        result.push(sourceItem);
                        if (common.isFunction(notify)) {
                            notify(key);
                        }
                    }
                });
            } else {
                common.log(`error`, `CommonElement.deepCompareAndFallback - Input source or target object is invalid.`);
            }
            return result;
        };

        if (!(common.isObject(source) || common.isArray(source))) {
            common.log(`error`, `CommonElement.fallback - Input source object is invalid.`);
        } else {
            return {
                /**
                 * @description - Fallback from the target object/array...
                 *
                 * @method fallback.of
                 * @param {object|array} target - Target object or array.
                 * @return {object}
                 */
                of: function of (target) {
                    if ((common.isObject(source) && !common.isObject(target)) || common.isArray(source) && !common.isArray(target)) {
                        common.log(`error`, `CommonElement.fallback.of - Input target object is invalid.`);
                    } else {
                        return deepCompareAndFallback(source, target);
                    }
                }
            };
        }
    },
    /**
     * @description - Mixing function that do shallow mixing and binding of source and target object to a mixed object.
     *
     * @usage TODO: Write usage for CommonElement.mix method.
     *
     * @method mix
     * @param {object} source - Source or super object that is being extended from.
     * @param {object} option - Exclusion, a list of functions or properties that should not be mixed.
     * @return {object}
     */
    mix: function mix (source, option = {}) {
        const common = this;
        const {
            fnOverrided,
            exclusion
        } = common.fallback({
            fnOverrided: true,
            exclusion: {
                prototypes: false,
                properties: false,
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

        if (!DEVELOPMENT) {
            exclusion.prefixes.push(`DEBUG_`);
        }

        /* helper function to filter out key in the exclusion list. */
        const isIncluded = function isIncluded (key) {
            let included = false;
            if (common.isString(key)) {
                const prefixExcepted = !common.isEmpty(exclusion.exception.prefixes) ? exclusion.exception.prefixes.some((prefix) => {
                    return key.substr(0, prefix.length) === prefix;
                }) : false;
                const postfixExcepted = !common.isEmpty(exclusion.exception.postfixes) ? exclusion.exception.postfixes.some((postfix) => {
                    return key.substr(0, postfix.length) === postfix;
                }) : false;
                const keyExcepted = !common.isEmpty(exclusion.exception.keys) ? exclusion.exception.keys.indexOf(key) !== -1 : false;

                included = true;

                if (included && !common.isEmpty(exclusion.prefixes)) {
                    included = exclusion.prefixes.every((prefix) => key.substr(0, prefix.length) !== prefix);
                }
                if (included && !common.isEmpty(exclusion.postfixes)) {
                    included = exclusion.postfixes.every((postfix) => key.substr(0, postfix.length) !== postfix);
                }
                if (included && !common.isEmpty(exclusion.keys)) {
                    if (exclusion.keys.length === 1 && exclusion.keys[0] === `*`) {
                        included = false;
                    } else {
                        if (included) {
                            included = exclusion.keys.indexOf(key) === -1;
                        }
                    }
                }
                included = included || (prefixExcepted || postfixExcepted || keyExcepted);
            }
            return included;
        };

        if (!common.isObject(source)) {
            common.log(`error`, `CommonElement.mix - Input source object is invalid.`);
        } else {
            let result = {};

            if (!exclusion.prototypes) {
                /* copy source object prototypes to new mixed result object */
                result = Object.keys(Object.getPrototypeOf(source)).filter((fnName) => {
                    const fn = source[fnName];

                    return common.isFunction(fn) && isIncluded(fnName);
                }).reduce((_result, fnName) => {
                    /* bind the prototype to source object */
                    const fn = source[fnName];

                    _result[fnName] = fn.bind(source);
                    return _result;
                }, result);

                /* copy source object functions to new mixed result object */
                result = Object.keys(source).filter((fnName) => {
                    const fn = source[fnName];

                    return common.isFunction(fn) && isIncluded(fnName);
                }).reduce((_result, fnName) => {
                    /* bind the prototype to source object */
                    const fn = source[fnName];

                    _result[fnName] = fn;
                    return _result;
                }, result);
            }

            if (!exclusion.properties) {
                result = Object.keys(Object.getPrototypeOf(source)).concat(Object.getOwnPropertyNames(source)).filter((key) => {
                    return !common.isFunction(source[key]) && isIncluded(key);
                }).reduce((_result, key) => {
                    const sourceObjDesc = Object.getOwnPropertyDescriptor(source, key);

                    if (common.isObject(sourceObjDesc)) {
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
                 * @description - Mixing with the target object...
                 *
                 * @method mix.with
                 * @param {object} target - Target object that is being extended to.
                 * @return {object}
                 */
                with: function _with (target) {
                    if (!common.isObject(target)) {
                        common.log(`error`, `CommonElement.mix.with - Input target object is invalid.`);
                    } else {
                        if (!exclusion.prototypes) {
                            /* copy target object prototypes to new mixed result object */
                            result = Object.keys(Object.getPrototypeOf(target)).filter((fnName) => {
                                const fn = target[fnName];

                                if (common.isFunction(fn) && isIncluded(fnName)) {
                                    if (!fnOverrided) {
                                        if (!result.hasOwnProperty(fnName)) {
                                            return true;
                                        }
                                        return false;
                                    }
                                    return true;
                                }
                                return false;
                            }).reduce((_result, fnName) => {
                                /* bind the prototype to target object */
                                const fn = target[fnName];

                                _result[fnName] = fn.bind(target);
                                return _result;
                            }, result);

                            /* copy target object functions to new mixed result object */
                            result = Object.keys(target).filter((fnName) => {
                                const fn = target[fnName];

                                if (common.isFunction(fn) && isIncluded(fnName)) {
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
                            }).reduce((_result, fnName) => {
                                const fn = target[fnName];
                                _result[fnName] = fn;
                                return _result;
                            }, result);
                        }

                        if (!exclusion.properties) {
                            result = Object.keys(Object.getPrototypeOf(target)).concat(Object.getOwnPropertyNames(target)).filter((key) => {
                                return !common.isFunction(target[key]) && target.hasOwnProperty(key) && !result.hasOwnProperty(key) && isIncluded(key);
                            }).reduce((_result, key) => {
                                const targetObjDesc = Object.getOwnPropertyDescriptor(target, key);

                                if (common.isObject(targetObjDesc)) {
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
                }
            };
        }
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
        const common = this;

        option = common.isObject(option) ? option : {};

        if (!(common.isObject(closure) || common.isFunction(closure))) {
            common.log(`error`, `CommonElement.reveal - Input closure is invalid.`);
        } else {
            if (common.isObject(closure)) {
                return common.mix(closure, option).with({});
            }

            if (common.isFunction(closure)) {
                let enclosedObj = {};

                closure.call(enclosedObj);
                return common.mix(enclosedObj, option).with({});
            }
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
        const common = this;

        asNestedObject = common.isBoolean(asNestedObject) ? asNestedObject : false;
        /* helper function to recursively parsing through and retrieve an object property at pathId */
        const deepRetrieval = function deepRetrieval (_target, _pathId) {
            if (!(common.isObject(_target) || common.isArray(_target))) {
                common.log(`error`, `CommonElement.deepRetrieval - Input target object or array is invalid.`);
            } else if (!(common.isArray(_pathId))) {
                common.log(`error`, `CommonElement.deepRetrieval - Input pathId is invalid.`);
            } else {
                if (!common.isEmpty(_pathId)) {
                    const key = _pathId.shift();
                    let resultAtPath = common.isObject(_target) ? {} : Array(key).fill(null);
                    let propertyAtPath;

                    if (common.isObject(_target) && _target.hasOwnProperty(key)) {
                        if (!common.isEmpty(_pathId)) {
                            propertyAtPath = deepRetrieval(_target[key], _pathId.slice(0));
                            resultAtPath[key] = propertyAtPath;
                        } else {
                            propertyAtPath = _target[key];
                            resultAtPath[key] = propertyAtPath;
                        }
                    } else if (common.isArray(_target) && common.isInteger(key) && key < _target.length) {
                        if (!common.isEmpty(_pathId)) {
                            propertyAtPath = deepRetrieval(_target[key], _pathId.slice(0));
                            resultAtPath.push(propertyAtPath);
                        } else {
                            propertyAtPath = _target[key];
                            resultAtPath.push(propertyAtPath);
                        }
                    }

                    if (!common.isDefined(propertyAtPath) && !common.isEmpty(_pathId)) {
                        common.log(`error`, `CommonElement.deepRetrieval - Path ends at property key:${key}.`);
                    } else {
                        if (asNestedObject) {
                            return resultAtPath;
                        }
                        return propertyAtPath;
                    }
                } else {
                    common.log(`error`, `CommonElement.deepRetrieval - No property is defined.`);
                }
            }
        };

        if (!(common.isString(pathId) || common.isArray(pathId))) {
            common.log(`error`, `CommonElement.retrieve - Input pathId is invalid.`);
        } else if (!(common.isString(delimiter) && delimiter.length === 1)) {
            common.log(`error`, `CommonElement.retrieve - Input delimiter is invalid.`);
        } else {
            pathId = common.isString(pathId) ? common.stringToArray(pathId, delimiter) : pathId;
            return {
                /**
                 * @description - Target object to retrive property from...
                 *
                 * @method retrieve.from
                 * @param {object|array} target
                 * @returns {*}
                 */
                from: function from (target) {
                    if (!common.isObject(target)) {
                        common.log(`error`, `CommonElement.retrieve.from - Input target object is invalid.`);
                    } else {
                        return deepRetrieval(target, pathId.slice(0));
                    }
                }
            };
        }
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
        const common = this;

        if (!(common.isObject(value) || common.isArray(value))) {
            common.log(`error`, `CommonElement.forEach - Input value is invalid.`);
        } else if (!common.isFunction(iterator)) {
            common.log(`error`, `CommonElement.forEach - Input iterator callback is invalid.`);
        } else {
            if (common.isObject(value)) {
                const obj = value;

                Object.keys(obj).forEach((key) => {
                    iterator.call(context, obj[key], key);
                });
            }
            if (common.isArray(value)) {
                const array = value;

                array.forEach((item, key) => {
                    iterator.call(context, item, key);
                });
            }
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
        const common = this;

        if (!common.isArray(array)) {
            common.log(`error`, `CommonElement.arrayToString - Input array is invalid.`);
        } else if (!(common.isString(delimiter) && delimiter.length === 1)) {
            common.log(`error`, `CommonElement.arrayToString - Input delimiter is invalid.`);
        } else {
            return array.join(delimiter);
        }
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
        const common = this;

        if (!common.isString(str)) {
            common.log(`error`, `CommonElement.stringToArray - Input string is invalid.`);
        } else if (!(common.isString(delimiter) && delimiter.length === 1)) {
            common.log(`error`, `CommonElement.stringToArray - Input delimiter is invalid.`);
        } else {
            if (str.indexOf(delimiter) !== -1 && str.length > 1) {
                /* split string into array */
                return str.split(delimiter).map((value) => {
                    return common.isInteger(value) ? parseInt(value, 10) : value;
                });
                // return str.split(delimiter).map((value) => {
                //     return common.isInteger(value) ? parseInt(value, 10) : value;
                // }).filter(Boolean);
            }
            return [ str ];
        }
    },
    /**
     * @description - Helper function to convert camel case str name to underscore.
     *
     * @method camelcaseToUnderscore
     * @param {string} str
     * @return {string}
     */
    camelcaseToUnderscore: function camelcaseToUnderscore (str) {
        return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => {
            return `_${word.toLowerCase()}`;
        }).replace(/^_/, ``);
    },
    /**
     * @description - Helper function to convert unserScore str name to camelcase.
     *
     * @method underscoreToCamelcase
     * @param {string} str
     * @return {string}
     */
    underscoreToCamelcase: function underscoreToCamelcase (str) {
        return str.replace(/_([a-z])/g, (match, word) => {
            return word.toUpperCase();
        });
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
        if (DEVELOPMENT) {
            const logger = {
                error () {
                    throw new Error(`ERROR: ${message}`);
                },
                warn0 () {
                    if (CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL0_MESSAGE) {
                        console.warn(`WARNING-0: ${message}`);
                    }
                },
                warn1 () {
                    if (CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL1_MESSAGE) {
                        console.warn(`WARNING-1: ${message}`);
                    }
                },
                info () {
                    if (CONSOLE_LOG_DEBUG.ENABLE_INFO_MESSAGE) {
                        console.info(`INFO: ${message}`);
                    }
                }
            };
            // TODO: Implement a way to save all log messages.
            if (logger.hasOwnProperty(type)) {
                logger[type]();
            }
        }
    }
};

/* glocal scope  common element object */
const element = Object.create(CommonElementPrototype);

/**
 * @description - A common element module export function.
 *
 * @module CommonElement
 * @return {object}
 */
export default function CommonElement ({
    development = DEVELOPMENT,
    enableInfoMessage = CONSOLE_LOG_DEBUG.ENABLE_INFO_MESSAGE,
    enableWarn0Message = CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL0_MESSAGE,
    enableWarn1Message = CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL1_MESSAGE
} = {}) {
    DEVELOPMENT = element.isBoolean(development) ? development : DEVELOPMENT;
    CONSOLE_LOG_DEBUG.ENABLE_INFO_MESSAGE = element.isBoolean(enableInfoMessage) ? enableInfoMessage : CONSOLE_LOG_DEBUG.ENABLE_INFO_MESSAGE;
    CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL0_MESSAGE = element.isBoolean(enableWarn0Message) ? enableWarn0Message : CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL0_MESSAGE;
    CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL1_MESSAGE = element.isBoolean(enableWarn1Message) ? enableWarn1Message : CONSOLE_LOG_DEBUG.ENABLE_WARN_LVL1_MESSAGE;
    /* reveal only the public properties and functions */
    return Object.freeze(element.reveal(element));
}