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
 * @module CommonUtility
 * @description - Provides common utility methods that will be used throughout.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* eslint no-process-env: 0 */

const PRIVATE_PREFIX = `_`;

let ENV = {
    DEVELOPMENT: true,
    TARGET: `web`,
    LOGGING: {
        INFO0: true,
        INFO1: true,
        WARN0: true,
        WARN1: true,
        HISTORY_SIZE: 500
    }
};

let consoleLogHistory = {
    index: 0,
    logs: Array(ENV.LOGGING.HISTORY_SIZE).fill(null)
};

if (typeof window === `object`) {
    ENV.DEVELOPMENT = window.DEVELOPMENT ?? ENV.DEVELOPMENT;
    ENV.TARGET = window.TARGET ?? ENV.TARGET;
    ENV.LOGGING = {
        INFO0: window.LOGGING_INFO0 ?? ENV.LOGGING.INFO0,
        INFO1: window.LOGGING_INFO1 ?? ENV.LOGGING.INFO1,
        WARN0: window.LOGGING_WARN0 ?? ENV.LOGGING.WARN0,
        WARN1: window.LOGGING_WARN1 ?? ENV.LOGGING.WARN1,
        HISTORY_SIZE: window.LOGGING_HISTORY_SIZE ?? ENV.LOGGING.HISTORY_SIZE
    };
} else if (typeof process === `object`) {
    ENV.DEVELOPMENT = process.env?.NODE_ENV ? process.env.NODE_ENV === `development` : ENV.DEVELOPMENT;
    ENV.TARGET = process.env?.TARGET ?? ENV.TARGET;
    if (typeof process.env === `object`) { // eslint-disable-line
        ENV.LOGGING = {
            INFO0: process.env?.LOGGING_INFO0 ? process.env.LOGGING_INFO0 === `true` : ENV.LOGGING.INFO0,
            INFO1: process.env?.LOGGING_INFO1 ? process.env.LOGGING_INFO1 === `true` : ENV.LOGGING.INFO1,
            WARN0: process.env?.LOGGING_WARN0 ? process.env.LOGGING_WARN0 === `true` : ENV.LOGGING.WARN0,
            WARN1: process.env?.LOGGING_WARN1 ? process.env.LOGGING_WARN1 === `true` : ENV.LOGGING.WARN1,
            HISTORY_SIZE: parseInt(process.env?.LOGGING_HISTORY_SIZE ?? ENV.LOGGING.HISTORY_SIZE, 10)
        };
    }
}

export { ENV };

/**
 * @description - Get the type string of input value.
 *
 * @method typeOf
 * @param {*} value
 * @returns {string}
 */
export function typeOf (value) {
    // FIXME: Crash occurs when value is an object with circular reference.
    return ({}).toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

/**
 * @description - Check if value is an integer.
 *
 * @method isInteger
 * @param {number} value - To be checked if it is an integer.
 * @returns {boolean}
 */
export function isInteger (value) {
    return (/^-?\d+$/.test(String(value)));
}

/**
 * @description - Check if value is a float.
 *
 * @method isFloat
 * @param {number} value - To be checked if it is a float.
 * @returns {boolean}
 */
export function isFloat (value) {
    return (/^[+-]?\d+(\.\d+)?$/.test(String(value)));
}

/**
 * @description - Check if value is a number.
 *
 * @method isNumeric
 * @param {number} value - To be checked if it is a number.
 * @returns {boolean}
 */
export function isNumeric (value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * @description - Check for a string type.
 *
 * @method isString
 * @param {string} str - To be checked if it is a string.
 * @returns {boolean}
 */
export function isString (str) {
    return typeOf(str) === `string` || (typeOf(str) === `object` && str.constructor === String);
}

/**
 * @description - Check if value is a boolean.
 *
 * @method isBoolean
 * @param value - To be checked if it is a boolean.
 * @returns {boolean}
 */
export function isBoolean (value) {
    return typeOf(value) === `boolean` || (isString(value) && (value.toLowerCase() === `true` || value.toLowerCase() === `false`));
}

/**
 * @description - Check for defined type.
 *
 * @method isDefined
 * @param {*} value - To be checked if value is defined.
 * @returns {boolean}
 */
export function isDefined (value) {
    return typeOf(value) !== `undefined`;
}

/**
 * @description - Check for null type.
 *
 * @method isNull
 * @param {*} value - To be checked if value is null.
 * @returns {boolean}
 */
export function isNull (value) {
    return value === null;
}

/**
 * @description - Check for regex type.
 *
 * @method isRegEx
 * @param {*} regex
 * @returns {boolean}
 */

export function isRegEx (regex) {
    return Object.prototype.toString.call(regex) === `[object RegExp]`;
}

/**
 * @description - Check for date type.
 *
 * @method isDate
 * @param {*} date
 * @returns {boolean}
 */
export function isDate (date) {
    return Object.prototype.toString.call(date) === `[object Date]`;
}

/**
 * @description - Check for array type.
 *
 * @method isArray
 * @param {array} array - To be checked if it is an array.
 * @returns {boolean}
 */
export function isArray (array) {
    return Object.prototype.toString.call(array) === `[object Array]` || Array.isArray(array) && array !== null;
}

/**
 * @description - Check for object type.
 *
 * @method isObject
 * @param {object} obj - To be checked if it is an object.
 * @returns {boolean}
 */
export function isObject (obj) {
    return typeOf(obj) === `object` && obj === Object(obj) && !isArray(obj) && obj !== null;
}

/**
 * @description - Check for function type.
 *
 * @method isFunction
 * @param {function} fn - To be checked if it is a function.
 * @returns {boolean}
 */
export function isFunction (fn) {
    return Object.prototype.toString.call(fn) === `[object Function]` || Object.prototype.toString.call(fn) === `[object AsyncFunction]`;
}

/**
 * @description - Check for function a generator type.
 *
 * @method isGenerator
 * @param {generator} fn - To be checked if it is a generator.
 * @returns {boolean}
 */
export function isGenerator (fn) {
    return fn.constructor?.name === `GeneratorFunction`;
}

/**
 * @description - Check if object is an iterator type.
 *
 * @method isIterator
 * @param {iterator} iter - To be checked if it is an iterator.
 * @returns {boolean}
 */
export function isIterator (iter) {
    return iter && (typeof iter[Symbol.iterator] === `function` || typeof iter[Symbol.asyncIterator] === `function`);
}

/**
 * @description - Check if an object, array, or string is empty.
 *
 * @method isEmpty
 * @param {object|array|string} value - To be checked if it is an empty object, array, or string.
 * @returns {boolean}
 */
export function isEmpty (value) {
    if (isObject(value)) {
        return Object.getOwnPropertyNames(value).length === 0;
    } else if (isArray(value) || isString(value)) {
        return value.length === 0;
    }
    return true;
}

/**
 * @description - Check for an array type and is not empty.
 *
 * @method isNonEmptyArray
 * @param {array} array - To be checked if it is an array and not empty.
 * @returns {boolean}
 */
export function isNonEmptyArray (array) {
    return isArray(array) && !isEmpty(array);
}

/**
 * @description - Check for an object type and is not empty.
 *
 * @method isNonEmptyObject
 * @param {array} array - To be checked if it is an object and not empty.
 * @returns {boolean}
 */
export function isNonEmptyObject (array) {
    return isObject(array) && !isEmpty(array);
}

/**
 * @description - Check for a string type and is not empty.
 *
 * @method isNonEmptyString
 * @param {string} str - To be checked if it is a string and not empty.
 * @returns {boolean}
 */
export function isNonEmptyString (str) {
    return isString(str) && !isEmpty(str);
}

/**
 * @description - A simple console log wrapper. Only active in debug/development mode.
 *
 * @method log
 * @param {string} type
 * @param {string} message
 * @returns void
 */
export function log (type, message) {
    if (ENV.DEVELOPMENT) {
        let stringifiedMessage = ``;

        if (isObject(message) || isArray(message)) {
            stringifiedMessage = JSON.stringify(message, null, `\t`);
        } else {
            stringifiedMessage = message;
        }
        const logger = {
            error () {
                throw new Error(`ERROR: ${message}`);
            },
            warn0 () {
                if (ENV.LOGGING.WARN0) {
                    console.warn(`WARN-0: ${stringifiedMessage}`);

                    if (consoleLogHistory.index >= ENV.LOGGING.HISTORY_SIZE) {
                        consoleLogHistory.index = 0;
                    } else {
                        consoleLogHistory.index++;
                    }

                    consoleLogHistory.logs[consoleLogHistory.index] = {
                        type: `warn0`,
                        timestamp: new Date(),
                        message: `WARN-0: ${stringifiedMessage}`
                    };
                }
            },
            warn1 () {
                if (ENV.LOGGING.WARN1) {
                    console.warn(`WARN-1: ${stringifiedMessage}`);

                    if (consoleLogHistory.index >= ENV.LOGGING.HISTORY_SIZE) {
                        consoleLogHistory.index = 0;
                    } else {
                        consoleLogHistory.index++;
                    }

                    consoleLogHistory.logs[consoleLogHistory.index] = {
                        type: `warn1`,
                        timestamp: new Date(),
                        message: `WARN-1: ${stringifiedMessage}`
                    };
                }
            },
            info0 () {
                if (ENV.LOGGING.INFO0) {
                    console.info(`INFO-0: ${stringifiedMessage}`);

                    if (consoleLogHistory.index >= ENV.LOGGING.HISTORY_SIZE) {
                        consoleLogHistory.index = 0;
                    } else {
                        consoleLogHistory.index++;
                    }

                    consoleLogHistory.logs[consoleLogHistory.index] = {
                        type: `info0`,
                        timestamp: new Date(),
                        message: `INFO-0: ${stringifiedMessage}`
                    };
                }
            },
            info1 () {
                if (ENV.LOGGING.INFO1) {
                    console.info(`INFO-1: ${stringifiedMessage}`);

                    if (consoleLogHistory.index >= ENV.LOGGING.HISTORY_SIZE) {
                        consoleLogHistory.index = 0;
                    } else {
                        consoleLogHistory.index++;
                    }

                    consoleLogHistory.logs[consoleLogHistory.index] = {
                        type: `info1`,
                        timestamp: new Date(),
                        message: `INFO-1: ${stringifiedMessage}`
                    };
                }
            },
            debug () {
                /* debug log is always enabled */
                console.log(`DEBUG: ${stringifiedMessage}`);

                if (consoleLogHistory.index >= ENV.LOGGING.HISTORY_SIZE) {
                    consoleLogHistory.index = 0;
                } else {
                    consoleLogHistory.index++;
                }

                consoleLogHistory.logs[consoleLogHistory.index] = {
                    type: `debug`,
                    timestamp: new Date(),
                    message: `DEBUG: ${stringifiedMessage}`
                };
            }
        };
        switch (type) {
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
            console.warn(`WARNING-1: CommonUtility.log - Invalid log type:${type}.`);
            return;
        }
    }
}

/**
 * @description - Get log history.
 *
 * @method logHistory
 * @param {string} type
 * @returns {array}
 */
export function getLogHistories (type) {
    if (ENV.DEVELOPMENT) {
        switch (type) {
        case `debug`:
            return consoleLogHistory.logs.filter((logData) => logData !== null && logData.type === `debug`).sort((logDataA, logDataB) => {
                const timestampA = new Date(logDataA.timestamp);
                const timestampB = new Date(logDataB.timestamp);

                return timestampA - timestampB;
            });
        case `info0`:
            return consoleLogHistory.logs.filter((logData) => logData !== null && logData.type === `info0`).sort((logDataA, logDataB) => {
                const timestampA = new Date(logDataA.timestamp);
                const timestampB = new Date(logDataB.timestamp);

                return timestampA - timestampB;
            });
        case `info1`:
            return consoleLogHistory.logs.filter((logData) => logData !== null && logData.type === `info1`).sort((logDataA, logDataB) => {
                const timestampA = new Date(logDataA.timestamp);
                const timestampB = new Date(logDataB.timestamp);

                return timestampA - timestampB;
            });
        case `warn0`:
            return consoleLogHistory.logs.filter((logData) => logData !== null && logData.type === `warn0`).sort((logDataA, logDataB) => {
                const timestampA = new Date(logDataA.timestamp);
                const timestampB = new Date(logDataB.timestamp);

                return timestampA - timestampB;
            });
        case `warn1`:
            return consoleLogHistory.logs.filter((logData) => logData !== null && logData.type === `warn1`).sort((logDataA, logDataB) => {
                const timestampA = new Date(logDataA.timestamp);
                const timestampB = new Date(logDataB.timestamp);

                return timestampA - timestampB;
            });
        default:
            log(`warn1`, `CommonUtility.getLogHistories - Invalid log type:${type}.`);
            return;
        }
    }
}

/**
 * @description - Loop through an object or array.
 *
 * @method forEach
 * @param {object|array} value - Object or array value to iterate over.
 * @param {function} iterator - Iterator function.
 * @param {object} context - Object to become context (`this`) for the iterator function.
 * @returns void
 */
export function forEach (value, iterator, context) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(value) || isArray(value))) {
            log(`error`, `CommonUtility.forEach - Input value is invalid.`);
        } else if (!isFunction(iterator)) {
            log(`error`, `CommonUtility.forEach - Input iterator callback is invalid.`);
        }
    }
    if (isObject(value)) {
        const obj = value;

        Object.entries(obj).forEach(([ key, _value ]) => {
            iterator.call(context, _value, key);
        });
    } else if (isArray(value)) {
        const array = value;

        array.forEach((item, key) => {
            iterator.call(context, item, key);
        });
    }
}

/**
 * @description - Convert an array to string at delimiter.
 *
 * @function arrayToString
 * @param {array} array
 * @param {string} delimiter
 * @return {string}
 */
export function arrayToString (array, delimiter) {
    if (ENV.DEVELOPMENT) {
        if (!isArray(array)) {
            log(`error`, `CommonUtility.arrayToString - Input array is invalid.`);
        } else if (!(isString(delimiter) && delimiter.length === 1)) {
            log(`error`, `CommonUtility.arrayToString - Input delimiter is invalid.`);
        }
    }

    return array.join(delimiter);
}

/**
 * @description - Split string to array at delimiter.
 *
 * @function stringToArray
 * @param {string} str
 * @param {string} delimiter
 * @return {array}
 */
export function stringToArray (str, delimiter) {
    if (ENV.DEVELOPMENT) {
        if (!isString(str)) {
            log(`error`, `CommonUtility.stringToArray - Input string is invalid.`);
        } else if (!(isString(delimiter) && delimiter.length === 1)) {
            log(`error`, `CommonUtility.stringToArray - Input delimiter is invalid.`);
        }
    }

    if (str.includes(delimiter) && str.length > 1) {
        return str.split(delimiter).map((value) => {
            let trimmedValue = value.replace(/ /g, ``);
            return isInteger(trimmedValue) ? parseInt(trimmedValue, 10) : trimmedValue;
        });
        // return str.split(delimiter).map((value) => {
        //     let trimmedValue = value.replace(/ /g, ``);
        //     return isInteger(trimmedValue) ? parseInt(trimmedValue, 10) : trimmedValue;
        // }).filter(Boolean);
    }
    return [ str ];
}
/**
 * @description - Helper function to convert camel case str name to underscore.
 *
 * @method camelcaseToUnderscore
 * @param {string} str
 * @return {string}
 */
export function camelcaseToUnderscore (str) {
    if (ENV.DEVELOPMENT) {
        if (!isString(str)) {
            log(`error`, `CommonUtility.camelcaseToUnderscore - Input string is invalid.`);
        }
    }

    return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => `_${word.toLowerCase()}`).replace(/^_/, ``);
}

/**
 * @description - Helper function to convert unserScore str name to camelcase.
 *
 * @method underscoreToCamelcase
 * @param {string} str
 * @return {string}
 */
export function underscoreToCamelcase (str) {
    if (ENV.DEVELOPMENT) {
        if (!isString(str)) {
            log(`error`, `CommonUtility.underscoreToCamelcase - Input string is invalid.`);
        }
    }

    return str.replace(/_([a-z])/g, (match, word) => word.toUpperCase());
}
/**
 * @description - Helper function to convert camel case str name to dash.
 *
 * @method camelcaseToDash
 * @param {string} str
 * @return {string}
 */
export function camelcaseToDash (str) {
    if (ENV.DEVELOPMENT) {
        if (!isString(str)) {
            log(`error`, `CommonUtility.camelcaseToDash - Input string is invalid.`);
        }
    }

    return str.replace(/(?:^|\.?)([A-Z])/g, (match, word) => `-${word.toLowerCase()}`).replace(/^-/, ``);
}

/**
 * @description - Helper function to convert dash str name to camelcase.
 *
 * @method dashToCamelcase
 * @param {string} str
 * @return {string}
 */
export function dashToCamelcase (str) {
    if (ENV.DEVELOPMENT) {
        if (!isString(str)) {
            log(`error`, `CommonUtility.dashToCamelcase - Input string is invalid.`);
        }
    }

    return str.replace(/-([a-z])/g, (match, word) => word.toUpperCase());
}

/**
 * @description - Forge and return a composed function of two or more functions.
 *
 * @method compose
 * @param {array} fns
 * @return {function}
 */
export function compose (...fns) {
    if (ENV.DEVELOPMENT) {
        if (fns.length < 2) {
            log(`error`, `CommonUtility.compose - Input function array must have more than two functions.`);
        } else if (!fns.every((fn) => isFunction(fn))) {
            log(`error`, `CommonUtility.compose - Input function is invalid.`);
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
            if (isDefined(result)) {
                return fn(result);
            }
            return fn();
        }, value);
    };
}

/**
 * @description - Clear all object or array.
 *
 * @method clear
 * @param {object|array} value
 * @return void
 */
export function clear (value) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(value) || isArray(value))) {
            log(`error`, `CommonUtility.clear - Input is not an object or array type.`);
        }
    }

    if (isObject(value)) {
        Object.getOwnPropertyNames(value).forEach((key) => {
            delete value[key];
            // value[key] = undefined;
        });
    } else if (isArray(value)) {
        value.length = 0;
    }
}

/**
 * @description - Create an exact clone of an object or array.
 *
 * @method clone
 * @param {object|array} source - Source object or array to be cloned.
 * @returns {object}
 */
export function clone (source) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(source) || isArray(source))) {
            log(`error`, `CommonUtility.clone - Input is not an object or array type.`);
        }
    }
    let result;
    if (isObject(source)) {
        result = Object.entries(source).reduce((_result, [ key, value ]) => {
            if (isObject(value) || isArray(value)) {
                _result[key] = clone(value);
            } else {
                _result[key] = value;
            }
            return _result;
        }, {});
    } else if (isArray(source)) {
        result = source.map((value) => {
            return isObject(value) || isArray(value) ? clone(value) : value;
        });
    }
    // return Object.isFrozen(source) ? Object.freeze(result) : result;
    return result;
}

/**
 * @description - Deep free a source object or function.
 *
 * @method freeze
 * @param {object|function} source
 * @return {object}
 */
export function freeze (source) {
    if ((isObject(source) || isFunction(source)) && !Object.isFrozen(source)) {
        Object.freeze(source);
        Object.getOwnPropertyNames(source).forEach((key) => freeze(source[key]));
    }

    return source;
}

/**
 * @description - Helper function to compare and verify object schema.
 *
 * @method _deepCompareSchema
 * @param {object} schema - Predefined schema.
 * @param {object} target - Predefined schema.
 * @returns {object}
 * @private
 */
function _deepCompareSchema (schema, target) {
    let verified = true;

    if (isObject(schema) && isObject(target)) {
        forEach(schema, (schemaItem, key) => {
            if (verified) {
                let itemTypes = [];
                if (Object.prototype.hasOwnProperty.call(target, key) || Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(target), key)) {
                    const targetItem = target[key];
                    if ((isObject(targetItem) && isObject(schemaItem)) || (isArray(targetItem) && isArray(schemaItem))) {
                        verified = _deepCompareSchema(schemaItem, targetItem);
                    } else if (isString(schemaItem)) {
                        itemTypes = stringToArray(schemaItem, `|`);
                        verified = itemTypes.some((itemType) => {
                            if (itemType === `defined`) {
                                return isDefined(targetItem);
                            }
                            return typeOf(targetItem) === itemType;
                        });
                    } else {
                        verified = false;
                    }
                } else {
                    if (isString(schemaItem)) {
                        itemTypes = stringToArray(schemaItem, `|`);
                        verified = itemTypes.includes(`undefined`);
                    } else {
                        verified = false;
                    }
                }
            }
        });
    } else if (isArray(schema) && isArray(target)) {
        if (schema.length === 1) {
            const [ schemaItem ] = schema;
            verified = target.reduce((_verified, targetItem) => {
                let itemTypes = [];
                if ((isObject(targetItem) && isObject(schemaItem)) || (isArray(targetItem) && isArray(schemaItem))) {
                    _verified = _deepCompareSchema(schemaItem, targetItem);
                } else if (isString(schemaItem)) {
                    itemTypes = stringToArray(schemaItem, `|`);
                    _verified = itemTypes.some((itemType) => {
                        if (itemType === `defined`) {
                            return isDefined(targetItem);
                        }
                        return typeOf(targetItem) === itemType;
                    });
                } else {
                    _verified = false;
                }
                return _verified;
            }, verified);
        } else {
            log(`warn1`, `CommonUtility._deepCompareSchema - Predefined schema test array must have a length of 1.`);
            verified = false;
        }
    } else {
        verified = false;
    }
    return verified;
}

/**
 * @description - Check object by comparing it to a predefined schema.
 *
 * @usage TODO: Write usage for CommonUtility.isSchema method.
 *
 * @method isSchema
 * @param {object} schema - Predefined schema.
 * @returns {object}
 */
export function isSchema (schema) {
    return {
        /**
         * @description - Compare schema of the target object...
         *
         * @prototype isSchema.of
         * @param {object} target - Target object be compared with.
         * @returns {boolean}
         */
        of (target) {
            return _deepCompareSchema(schema, target);
        }
    };
}

/**
 * @description - Helper function to do compare and fallback if mismatched.
 *
 * @method _deepCompareAndFallback
 * @param {object} source - Source object.
 * @param {object} target - Target object.
 * @param {function} notify - Notification callback when a fallback occurs.
 * @returns {object}
 * @private
 */
function _deepCompareAndFallback (source, target, notify) {
    let result;

    if (ENV.DEVELOPMENT) {
        if (!(isObject(source) || isArray(source)) &&
            !(isObject(target) || isArray(target))) {
            log(`error`, `CommonUtility._deepCompareAndFallback - Input source or target object is invalid.`);
        }
        if (!isFunction(notify)) {
            log(`error`, `CommonUtility._deepCompareAndFallback - Input notify function is invalid.`);
        }
    }

    if (isObject(source) && isObject(target)) {
        result = Object.assign({}, target); // clone(target);
        forEach(source, (sourceItem, key) => {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                const targetItem = target[key];
                if ((isObject(targetItem) && isObject(sourceItem)) || (isArray(targetItem) && isArray(sourceItem))) {
                    result[key] = _deepCompareAndFallback(sourceItem, targetItem, notify);
                } else {
                    if (typeOf(targetItem) !== typeOf(sourceItem)) {
                        result[key] = sourceItem;
                        notify(key);
                    }
                }
            } else {
                result[key] = sourceItem;
                notify(key);
            }
        });
    } else if (isArray(source) && isArray(target)) {
        if (source.length > target.length) {
            result = target.slice(0).concat(source.slice(target.length, source.length));
        } else {
            result = target.slice(0); // clone(target);
        }
        forEach(source, (sourceItem, key) => {
            if (key >= 0 && key < target.length) {
                const targetItem = target[key];
                if ((isObject(targetItem) && isObject(sourceItem)) || (isArray(targetItem) && isArray(sourceItem))) {
                    result[key] = _deepCompareAndFallback(sourceItem, targetItem, notify);
                } else {
                    if (typeOf(targetItem) !== typeOf(sourceItem)) {
                        result[key] = sourceItem;
                        notify(key);
                    }
                }
            }
        });
    }
    return result;
}

/**
 * @description - Fallback to source if target does not have the same properties.
 * Fallback occurs if target does not have the same property/index (name and type or index) of source.
 *
 * @usage TODO: Write usage for CommonUtility.fallback method.
 *
 * @method fallback
 * @param {object|array} source - Default source object or array to fallback to.
 * @param {function|undefined} notify - Notify when a fallback has occured.
 * @return {object}
 */
export function fallback (source, notify = () => null) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(source) || isArray(source))) {
            log(`error`, `CommonUtility.fallback - Input source object is invalid.`);
        }
    }

    notify = isFunction(notify) ? notify : () => null;

    return {
        /**
         * @description - Fallback from the target object/array...
         *
         * @method fallback.of
         * @param {object|array} target - Target object or array.
         * @return {object}
         */
        of (target) {
            if (ENV.DEVELOPMENT) {
                if ((isObject(source) && !isObject(target)) || isArray(source) && !isArray(target)) {
                    log(`error`, `CommonUtility.fallback.of - Input target object is invalid.`);
                }
            }

            return _deepCompareAndFallback(source, target, notify);
        }
    };
}

/**
 * @description - Helper function to return a new object that was deep mutated from source by reference target mutator object.
 *
 * @method _deepMutation
 * @param {object} source - Target source object.
 * @param {object} mutator - Mutator object.
 * @param {array} pathId - Mutation path Id.
 * @param {bool} reconfig - Enable reconfiguration.
 * @returns {object}
 * @private
 */
function _deepMutation (source, mutator, pathId = [], reconfig = false) {
    let result;

    if (ENV.DEVELOPMENT) {
        if (!(isObject(source) || isArray(source)) &&
            !(isObject(mutator) || isArray(mutator))) {
            log(`error`, `CommonUtility._deepMutation - Input source or target mutator is invalid.`);
        } else if (!isArray(pathId)) {
            log(`error`, `CommonUtility._deepMutation - Input pathId is invalid.`);
        } else if (!isBoolean(reconfig)) {
            log(`error`, `CommonUtility._deepMutation - Input reconfig is invalid.`);
        }
    }

    if (isEmpty(pathId)) {
        if (isObject(source) && isObject(mutator)) {
            if (reconfig) {
                result = Object.assign({}, mutator);
            } else {
                result = Object.assign({}, source);
                // result = { ...source };
                const sourceKeys = Object.keys(source);
                const mutatorKeys = Object.keys(mutator);

                if (sourceKeys.length >= mutatorKeys.length && mutatorKeys.every((key) => sourceKeys.includes(key))) {
                    mutatorKeys.forEach((key) => {
                        const sourceItem = source[key];
                        const mutatorItem = mutator[key];

                        if ((isObject(sourceItem) && !isObject(mutatorItem) || isArray(sourceItem) && !isArray(mutatorItem)) ||
                            (!isObject(sourceItem) && isObject(mutatorItem) || !isArray(sourceItem) && isArray(mutatorItem))) {
                            log(`warn1`, `CommonUtility._deepMutation - Input mutator schema at key:${key} must be a subset of source schema. Use reconfig=true option to override.`);
                            log(`debug`, `CommonUtility._deepMutation - sourceItem:${JSON.stringify(sourceItem, null, `\t`)}`);
                            log(`debug`, `CommonUtility._deepMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                        } else {
                            if (isObject(sourceItem) && isObject(mutatorItem) || isArray(sourceItem) && isArray(mutatorItem)) {
                                result[key] = _deepMutation(sourceItem, mutatorItem, [], reconfig);
                            } else {
                                result[key] = mutatorItem;
                            }
                        }
                    });
                } else {
                    log(`warn1`, `CommonUtility._deepMutation - Input mutator object schema is not a subset of the source schema. Use reconfig=true option to override.`);
                    log(`debug`, `CommonUtility._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                    log(`debug`, `CommonUtility._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                }
            }
        } else if (isArray(source) && isArray(mutator)) {
            if (reconfig) {
                result = mutator.slice(0);
            } else {
                result = source.slice(0);
                if (source.length === mutator.length) {
                    source.forEach((sourceItem, key) => {
                        const mutatorItem = mutator[key];
                        if ((isObject(sourceItem) && !isObject(mutatorItem) || isArray(sourceItem) && !isArray(mutatorItem)) ||
                            (!isObject(sourceItem) && isObject(mutatorItem) || !isArray(sourceItem) && isArray(mutatorItem))) {
                            log(`warn1`, `CommonUtility._deepMutation - Input mutator schema at key:${key} must be a subset of source schema. Use reconfig=true option to override.`);
                            log(`debug`, `CommonUtility._deepMutation - sourceItem:${JSON.stringify(sourceItem, null, `\t`)}`);
                            log(`debug`, `CommonUtility._deepMutation - mutatorItem:${JSON.stringify(mutatorItem, null, `\t`)}`);
                        } else {
                            if (isObject(sourceItem) && isObject(mutatorItem) || isArray(sourceItem) && isArray(mutatorItem)) {
                                result[key] = _deepMutation(sourceItem, mutatorItem, [], reconfig);
                            } else {
                                result[key] = mutatorItem;
                            }
                        }
                    });
                } else {
                    log(`warn1`, `CommonUtility._deepMutation - Input mutator array must be the same size as the source array. Use reconfig=true option to override.`);
                    log(`debug`, `CommonUtility._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                    log(`debug`, `CommonUtility._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                }
            }
        }
    } else {
        const key = pathId.shift();
        if (isObject(source) && Object.prototype.hasOwnProperty.call(source, key)) {
            result = Object.assign({}, source);
            if (isEmpty(pathId)) {
                if (reconfig) {
                    if (isObject(mutator[key])) {
                        result[key] = Object.assign({}, mutator[key]);
                    } else if (isArray(mutator[key])) {
                        result[key] = mutator[key].slice(0);
                    } else {
                        result[key] = mutator[key];
                    }
                } else {
                    if (isObject(mutator) && Object.prototype.hasOwnProperty.call(mutator, key)) {
                        result[key] = _deepMutation(source[key], mutator[key], pathId.slice(0), reconfig);
                    } else {
                        log(`warn1`, `CommonUtility._deepMutation - Key:${key} of path Id:${pathId} is not defined in mutator.`);
                        log(`debug`, `CommonUtility._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                        log(`debug`, `CommonUtility._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                }
            } else {
                result[key] = _deepMutation(source[key], mutator, pathId.slice(0), reconfig);
            }
        } else if (isArray(source) && isInteger(key) && key < source.length) {
            result = source.slice(0);
            if (isEmpty(pathId)) {
                if (reconfig) {
                    if (isObject(mutator[key])) {
                        result[key] = Object.assign({}, mutator[key]);
                    } else if (isArray(mutator[key])) {
                        result[key] = mutator[key].slice(0);
                    } else {
                        result[key] = mutator[key];
                    }
                } else {
                    if (isArray(mutator) && key < mutator.length) {
                        result[key] = _deepMutation(source[key], mutator[key], pathId.slice(0), reconfig);
                    } else {
                        log(`warn1`, `CommonUtility._deepMutation - Array index:${key} is greater than mutator array size`);
                        log(`debug`, `CommonUtility._deepMutation - source:${JSON.stringify(source, null, `\t`)}`);
                        log(`debug`, `CommonUtility._deepMutation - mutator:${JSON.stringify(mutator, null, `\t`)}`);
                    }
                }
            } else {
                result[key] = _deepMutation(source[key], mutator, pathId.slice(0), reconfig);
            }
        }

        if (ENV.DEVELOPMENT) {
            if (!isDefined(result) && !isEmpty(pathId)) {
                log(`error`, `CommonUtility._deepMutation - Path ends at property key:${key}.`);
            }
        }
    }
    return result;
}

/**
 * @description - Mutate and return an object of source that was mutated by the reference target mutator object.
 *                Only mutate matching property keys.
 *
 * @method mutate
 * @param {object} source - Source object to be mutated from.
 * @returns {object}
 */
export function mutate (source, option = {
    reconfig: false
}) {
    if (ENV.DEVELOPMENT) {
        if (!isObject(source)) {
            log(`error`, `CommonUtility.mutate - Input source is invalid.`);
        }
    }

    const {
        reconfig
    } = fallback({
        reconfig: false
    }).of(option);

    return {
        /**
         * @description - Return a new mutating of source at pathId from reference mutate object...
         *
         * @method mutate.atPathBy
         * @param {object} mutator - Target reference mutator object.
         * @param {string|array} pathId - Path of the property to retrieve.
         * @returns {object}
         */
        atPathBy (mutator, pathId) {
            pathId = isString(pathId) ? stringToArray(pathId, `.`) : pathId;
            if (ENV.DEVELOPMENT) {
                if (!isObject(mutator)) {
                    log(`error`, `CommonUtility.mutate.atPathBy - Input mutator is invalid.`);
                } else if (!(isArray(pathId) && !isEmpty(pathId))) {
                    log(`error`, `CommonUtility.mutate.atPathBy - Input pathId is invalid.`);
                }
            }

            return _deepMutation(source, mutator, pathId.slice(0), reconfig);
        },
        /**
         * @description - Mutating the source from reference target mutator object...
         *
         * @method mutate.by
         * @param {object} mutator - Target reference mutator object.
         * @returns {object}
         */
        by (mutator) {
            if (ENV.DEVELOPMENT) {
                if (!isObject(mutator)) {
                    log(`error`, `CommonUtility.mutate.by - Input mutator is invalid.`);
                }
            }

            return _deepMutation(source, mutator, [], reconfig);
        }
    };
}

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
function _deepMerge (source, target, pathId = []) {
    let result;

    if (ENV.DEVELOPMENT) {
        if (!(isObject(source) || isArray(source)) &&
            !(isObject(target) || isArray(target))) {
            log(`error`, `CommonUtility._deepMerge - Input source or mutation is invalid.`);
        }
    }

    pathId = isArray(pathId) ? pathId : [];

    if (isEmpty(pathId)) {
        if (isArray(source) && isArray(target)) {
            result = source.slice(0);
            target.forEach((item, key) => {
                if (!isDefined(result[key])) {
                    result[key] = item;
                } else if (isObject(item)) {
                    result[key] = _deepMerge(source[key], item);
                } else {
                    if (!source.includes(item)) {
                        result.push(item);
                    }
                }
            });
        } else {
            if (isObject(source)) {
                result = Object.assign({}, source);
                // result = { ...source };
            }

            Object.entries(target).forEach(([ key, targetValue ]) => {
                if (isObject(targetValue) || isArray(targetValue)) {
                    if (!isDefined(source[key])) {
                        result[key] = targetValue;
                    } else {
                        result[key] = _deepMerge(source[key], targetValue);
                    }
                } else {
                    result[key] = targetValue;
                }
            });
        }
    } else {
        const key = pathId.shift();
        if (isObject(source) && Object.prototype.hasOwnProperty.call(source, key)) {
            result = Object.assign({}, source);
            // result = { ...source };
            if (isEmpty(pathId)) {
                if (isObject(target) && Object.prototype.hasOwnProperty.call(target, key)) {
                    result[key] = _deepMerge(source[key], target[key], pathId.slice(0));
                }
            } else {
                result[key] = _deepMerge(source[key], target, pathId.slice(0));
            }
        } else if (isArray(source) && isInteger(key) && key < source.length) {
            result = source.slice(0);
            if (isEmpty(pathId)) {
                if (isArray(target) && key < target.length) {
                    result[key] = _deepMerge(source[key], target[key], pathId.slice(0));
                }
            } else {
                result[key] = _deepMerge(source[key], target, pathId.slice(0));
            }
        }

        if (ENV.DEVELOPMENT) {
            if (!isDefined(result) && !isEmpty(pathId)) {
                log(`error`, `CommonUtility._deepMerge - Path ends at property key:${key}.`);
            }
        }
    }
    return result;
}

/**
 * @description - Deep merging source to target object.
 *
 * @method merge
 * @param {object} source - Source object be merged from.
 * @returns {object}
 */
export function merge (source) {
    if (ENV.DEVELOPMENT) {
        if (!isObject(source)) {
            log(`error`, `CommonUtility.merge - Input source is invalid.`);
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
        atPathWith (target, pathId) {
            pathId = isString(pathId) ? stringToArray(pathId, `.`) : pathId;
            if (ENV.DEVELOPMENT) {
                if (!isObject(target)) {
                    log(`error`, `CommonUtility.merge.atPathWith - Input target is invalid.`);
                } else if (!(isArray(pathId) && !isEmpty(pathId))) {
                    log(`error`, `CommonUtility.merge.atPathWith - Input pathId is invalid.`);
                }
            }

            return _deepMerge(source, target, pathId.slice(0));
        },
        /**
         * @description - Merging with the target object...
         *
         * @method merge.with
         * @param {object} target - Target object be merged to.
         * @returns {object}
         */
        with (target) {
            if (ENV.DEVELOPMENT) {
                if (!isObject(target)) {
                    log(`error`, `CommonUtility.merge.with - Input target is invalid.`);
                }
            }

            return _deepMerge(source, target);
        }
    };
}

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
function _deepRetrieval (target, pathId, asNestedObject) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(target) || isArray(target))) {
            log(`error`, `CommonUtility._deepRetrieval - Input target object or array is invalid.`);
        } else if (!(isArray(pathId))) {
            log(`error`, `CommonUtility._deepRetrieval - Input pathId is invalid.`);
        } else if (isArray(pathId) && isEmpty(pathId)) {
            log(`error`, `CommonUtility._deepRetrieval - No property is defined.`);
        }
    }

    const key = pathId[0];
    let resultAtPath = isObject(target) ? {} : Array(key).fill(null);
    let propertyAtPath;

    if (isObject(target) && Object.prototype.hasOwnProperty.call(target, key)) {
        if (pathId.length > 1) {
            propertyAtPath = _deepRetrieval(target[key], pathId.slice(1), asNestedObject);
            resultAtPath[key] = propertyAtPath;
        } else {
            propertyAtPath = target[key];
            resultAtPath[key] = propertyAtPath;
        }
    } else if (isArray(target) && isInteger(key) && key < target.length) {
        if (pathId.length > 1) {
            propertyAtPath = _deepRetrieval(target[key], pathId.slice(1), asNestedObject);
            resultAtPath.push(propertyAtPath);
        } else {
            propertyAtPath = target[key];
            resultAtPath.push(propertyAtPath);
        }
    }

    if (ENV.DEVELOPMENT) {
        if (!isDefined(propertyAtPath) && !isEmpty(pathId)) {
            log(`error`, `CommonUtility._deepRetrieval - Path ends at property key:${key}.`);
        }
    }

    return asNestedObject ? resultAtPath : propertyAtPath;
}

/**
 * @description - Retrieve an object property at pathId.
 *
 * @usage TODO: Write usage for CommonUtility.retrieve method.
 *
 * @method retrieve
 * @param {string|array} pathId - Path of the property to retrieve.
 * @param {string} delimiter
 * @param {object} asNestedObject - Flag to indicate the return value is a nested object of pathId.
 * @return {object}
 */
export function retrieve (pathId, delimiter, asNestedObject = false) {
    asNestedObject = isBoolean(asNestedObject) ? asNestedObject : false;

    if (ENV.DEVELOPMENT) {
        if (!(isString(pathId) || isArray(pathId))) {
            log(`error`, `CommonUtility.retrieve - Input pathId is invalid.`);
        } else if (!(isString(delimiter) && delimiter.length === 1)) {
            log(`error`, `CommonUtility.retrieve - Input delimiter is invalid.`);
        }
    }

    pathId = isString(pathId) ? stringToArray(pathId, delimiter) : pathId;

    return {
        /**
         * @description - Target object to retrive property from...
         *
         * @method retrieve.from
         * @param {object|array} target
         * @returns {*}
         */
        from (target) {
            if (ENV.DEVELOPMENT) {
                if (!isObject(target)) {
                    log(`error`, `CommonUtility.retrieve.from - Input target object is invalid.`);
                }
            }

            return _deepRetrieval(target, pathId.slice(0), asNestedObject);
        }
    };
}

/**
 * @description - Collect propteries from an object or array and return those propteries as an array.
 *
 * @method collect
 * @param {array} pathIds
 * @return {object}
 */
export function collect (...pathIds) {
    if (ENV.DEVELOPMENT) {
        if (!pathIds.every((pathId) => isString(pathId) || isArray(pathId))) {
            log(`error`, `CommonUtility.collect - Input pathId is invalid.`);
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
        from (target) {
            if (ENV.DEVELOPMENT) {
                if (!(isObject(target) || isArray(target))) {
                    log(`error`, `CommonUtility.collect.from - Input target is invalid.`);
                }
            }

            return isEmpty(pathIds) ? [] : pathIds.map((pathId) => retrieve(pathId, `.`).from(target));
        }
    };
}

/**
 * @description - Mixing function that do shallow mixing and binding of source and target object or fuction to a mixed object or function.
 *
 * @usage TODO: Write usage for CommonUtility.mix method.
 *
 * @method mix
 * @param {object|fuction} source - Source object or function that is being extended from.
 * @param {object} option - Exclusion, a list of functions or properties that should not be mixed.
 * @return {object}
 */
export function mix (source, option = {
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
    if (!ENV.DEVELOPMENT) {
        if (!(isObject(source) || isFunction(source))) {
            log(`error`, `CommonUtility.mix - Input source object or function is invalid.`);
        }
    }

    const {
        fnOverrided,
        bindPrototypesToSource,
        bindFnsToSource,
        exclusion
    } = fallback({
        fnOverrided: true,
        bindPrototypesToSource: true,
        bindFnsToSource: false,
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
    /* helper function to filter out key in the exclusion list. */
    const isIncluded = (key) => {
        let included = false;

        if (!ENV.DEVELOPMENT) {
            exclusion.prefixes.push(`DEBUG_`);
        }

        if (isString(key) && key !== `prototype`) {
            const prefixExcepted = isNonEmptyArray(exclusion.exception.prefixes) ? exclusion.exception.prefixes.some((prefix) => {
                return key.substr(0, prefix.length) === prefix;
            }) : false;
            const postfixExcepted = isNonEmptyArray(exclusion.exception.postfixes) ? exclusion.exception.postfixes.some((postfix) => {
                return key.substr(0, postfix.length) === postfix;
            }) : false;
            const keyExcepted = isNonEmptyArray(exclusion.exception.keys) ? exclusion.exception.keys.includes(key) : false;

            included = true;

            if (included && isNonEmptyArray(exclusion.prefixes)) {
                included = exclusion.prefixes.every((prefix) => key.substr(0, prefix.length) !== prefix);
            }
            if (included && isNonEmptyArray(exclusion.postfixes)) {
                included = exclusion.postfixes.every((postfix) => key.substr(0, postfix.length) !== postfix);
            }
            if (included && isNonEmptyArray(exclusion.keys)) {
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
    let result;


    if (isObject(source)) {
        result = {};
    } else if (isFunction(source)) {
        result = () => {};
    }

    if (!exclusion.prototypes) {
        /* copy source object prototypes to new mixed result object */
        result = Object.entries(Object.getPrototypeOf(source)).filter(([ fnName, fn ]) => {
            return isFunction(fn) && isIncluded(fnName);
        }).reduce((_result, [ fnName, fn ]) => {
            _result[fnName] = bindPrototypesToSource ? fn.bind(source) : fn;
            return _result;
        }, result);

        /* copy source object functions to new mixed result object */
        result = Object.entries(source).filter(([ fnName, fn ]) => {
            return isFunction(fn) && isIncluded(fnName);
        }).reduce((_result, [ fnName, fn ]) => {
            _result[fnName] = bindFnsToSource ? fn.bind(source) : fn;
            return _result;
        }, result);
    }

    if (!exclusion.properties) {
        result = Object.keys(Object.getPrototypeOf(source)).concat(
            exclusion.enumerablePropertiesOnly ? Object.keys(source) : Object.getOwnPropertyNames(source)
        ).filter((key) => {
            return !isFunction(source[key]) && isIncluded(key);
        }).reduce((_result, key) => {
            const sourceObjDesc = Object.getOwnPropertyDescriptor(source, key);

            if (isObject(sourceObjDesc)) {
                Object.defineProperty(_result, key, {
                    get () {
                        return source[key];
                    },
                    set (value) {
                        source[key] = value;
                    },
                    configurable: sourceObjDesc.configurable,
                    enumerable: sourceObjDesc.enumerable
                });
            } else {
                Object.defineProperty(_result, key, {
                    get () {
                        return source[key];
                    },
                    set (value) {
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
        with (target) {
            if (ENV.DEVELOPMENT) {
                if (!(isObject(target) || isFunction(target))) {
                    log(`error`, `CommonUtility.mix.with - Input target object or function is invalid.`);
                }
                // if (isObject(source) && !isObject(target)) {
                //     log(`error`, `CommonUtility.mix.with - Input target object is invalid.`);
                // } else if (isFunction(source) && !isFunction(target)) {
                //     log(`error`, `CommonUtility.mix.with - Input target function is invalid.`);
                // }
            }

            if (!exclusion.prototypes) {
                /* copy target object prototypes to new mixed result object */
                result = Object.entries(Object.getPrototypeOf(target)).filter(([ fnName, fn ]) => {
                    if (isFunction(fn) && isIncluded(fnName)) {
                        if (!fnOverrided) {
                            if (!Object.prototype.hasOwnProperty.call(result, fnName)) {
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
                    if (isFunction(fn) && isIncluded(fnName)) {
                        /* mix prototypes only */
                        if (!fnOverrided) {
                            if (!Object.prototype.hasOwnProperty.call(result, fnName)) {
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
                    return !isFunction(target[key]) &&
                           Object.prototype.hasOwnProperty.call(target, key) &&
                           !Object.prototype.hasOwnProperty.call(result, key) &&
                           isIncluded(key);
                }).reduce((_result, key) => {
                    const targetObjDesc = Object.getOwnPropertyDescriptor(target, key);

                    if (isObject(targetObjDesc)) {
                        Object.defineProperty(_result, key, {
                            get () {
                                return target[key];
                            },
                            set (value) {
                                target[key] = value;
                            },
                            configurable: targetObjDesc.configurable,
                            enumerable: targetObjDesc.enumerable
                        });
                    } else {
                        Object.defineProperty(_result, key, {
                            get () {
                                return target[key];
                            },
                            set (value) {
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
}

/**
 * @description - Reveal the closure as a public object.
 *
 * @method reveal
 * @param {object} closure - A closure function or object.
 * @param {object} option
 * @return {object}
 */
export function reveal (closure, option = {}) {
    if (ENV.DEVELOPMENT) {
        if (!(isObject(closure) || isFunction(closure))) {
            log(`error`, `CommonUtility.reveal - Input closure is invalid.`);
        }
        if (!isObject(option)) {
            log(`error`, `CommonUtility.reveal - Input option is invalid.`);
        }
    }

    if (isObject(closure)) {
        return mix(closure, option).with({});
    } else if (isFunction(closure)) {
        let enclosedObj = {};

        closure.call(enclosedObj);
        return mix(enclosedObj, option).with({});
    }
}
