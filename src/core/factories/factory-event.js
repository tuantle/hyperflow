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
 * @module FactoryEvent
 * @description - Factory event Id map creator.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/**
 * @description - A common element module export function.
 *
 * @module FactoryEvent
 * @return {object}
 */
export default {
    /**
     * @description - Function to contruct an event id map for factory event stream.
     *
     * @function eventIdCreate
     * @param {object} sourceEventMap - Event Id map contructor object
     * @returns {object}
     */
    create: function create (sourceEventMap) {
        if (!Hf.isSchema({
            asEvents: `array|undefined`,
            onEvents: `array|undefined`,
            doEvents: `array|undefined`,
            requestEvents: `array|undefined`,
            broadcastEvents: `array|undefined`
        }).of(sourceEventMap)) {
            Hf.log(`error`, `Event.create - Input event map is invalid.`);
        } else {
            /* helper function to convert dash to uppercase underscore */
            const dashToUpperCaseUnderscore = function dashToUpperCaseUnderscore (str) {
                return str.replace(/-([a-z])/g, (match, word) => {
                    return `_${word}`;
                }).toUpperCase();
            };

            const outputEventMap = Object.keys(sourceEventMap).reduce((_outputEventMap, key) => {
                if (key === `asEvents`) {
                    if (sourceEventMap[key].every((_key) => Hf.isString(_key))) {
                        _outputEventMap[`AS`] = sourceEventMap[key].reduce((asEventMap, _key) => {
                            asEventMap[
                                dashToUpperCaseUnderscore(_key)
                            ] = `as-${_key}`;
                            return asEventMap;
                        }, {});
                    } else {
                        Hf.log(`error`, `Event.create - Input 'as' event keys are invalid.`);
                    }
                }
                if (key === `onEvents`) {
                    if (sourceEventMap[key].every((_key) => Hf.isString(_key))) {
                        _outputEventMap[`ON`] = sourceEventMap[key].reduce((onEventMap, _key) => {
                            onEventMap[
                                dashToUpperCaseUnderscore(_key)
                            ] = `on-${_key}`;
                            return onEventMap;
                        }, {});
                    } else {
                        Hf.log(`error`, `Event.create - Input 'on' event keys are invalid.`);
                    }
                }
                if (key === `doEvents`) {
                    if (sourceEventMap[key].every((_key) => Hf.isString(_key))) {
                        _outputEventMap[`DO`] = sourceEventMap[key].reduce((doEventMap, _key) => {
                            doEventMap[
                                dashToUpperCaseUnderscore(_key)
                            ] = `do-${_key}`;
                            return doEventMap;
                        }, {});
                    } else {
                        Hf.log(`error`, `Event.create - Input 'do' event keys are invalid.`);
                    }
                }
                if (key === `broadcastEvents`) {
                    if (sourceEventMap[key].every((_key) => Hf.isString(_key))) {
                        _outputEventMap[`BROADCAST`] = sourceEventMap[key].reduce((broadcastEventMap, _key) => {
                            broadcastEventMap[
                                dashToUpperCaseUnderscore(_key)
                            ] = `broadcast-${_key}`;
                            return broadcastEventMap;
                        }, {});
                    } else {
                        Hf.log(`error`, `Event.create - Input 'broadcast' event keys are invalid.`);
                    }
                }
                if (key === `requestEvents`) {
                    if (sourceEventMap[key].every((_key) => Hf.isString(_key))) {
                        _outputEventMap[`REQUEST`] = sourceEventMap[key].reduce((requestForEventMap, _key) => {
                            requestForEventMap[
                                dashToUpperCaseUnderscore(_key)
                            ] = `request-for-${_key}`;
                            return requestForEventMap;
                        }, {});
                        _outputEventMap[`RESPONSE`] = {
                            WITH: sourceEventMap[key].reduce((responseToEventMap, _key) => {
                                responseToEventMap[
                                    dashToUpperCaseUnderscore(_key)
                                ] = `response-with-${_key}`;
                                return responseToEventMap;
                            }, {}),
                            TO: sourceEventMap[key].reduce((responseToEventMap, _key) => {
                                responseToEventMap[
                                    dashToUpperCaseUnderscore(_key)
                                ] = {
                                    OK: `response-to-${_key}-ok`,
                                    ERROR: `response-to-${_key}-error`,
                                    CANCELED: `response-to-${_key}-canceled`,
                                    CONFLICT: `response-to-${_key}-conflict`,
                                    NOT_FOUND: `response-to-${_key}-not-found`,
                                    NOT_AVAILABLE: `response-to-${_key}-not-available`,
                                    NOT_MODIFIED: `response-to-${_key}-not-modified`,
                                    UNAUTHORIZED: `response-to-${_key}-unauthorized`
                                };
                                return responseToEventMap;
                            }, {})
                        };
                    } else {
                        Hf.log(`error`, `Event.create - Input 'request-for' event keys are invalid.`);
                    }
                }
                return _outputEventMap;
            }, {});
            // return Object.freeze(outputEventMap);
            return outputEventMap;
        }
    }
};
