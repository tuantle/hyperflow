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
 * @module EventStreamIdUtility
 * @description - Event stream id map creator utility for EventStreamComposite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isSchema,
    log
} from './common-util';

export default {
    /**
     * @description - Function to contruct an event id map for factory event stream.
     *
     * @function eventIdCreate
     * @param {object} sourceEventMap - Event Id map contructor object
     * @returns {object}
     */
    create (sourceEventMap) {
        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                asEvents: `array|undefined`,
                onEvents: `array|undefined`,
                doEvents: `array|undefined`,
                requestEvents: `array|undefined`,
                broadcastEvents: `array|undefined`
            }).of(sourceEventMap)) {
                log(`error`, `Event.create - Input event map is invalid.`);
            }
        }

        /* helper function to convert dash to uppercase underscore */
        const dashToUpperCaseUnderscore = (str) => {
            return str.replace(/-([a-z])/g, (match, word) => {
                return `_${word}`;
            }).toUpperCase();
        };

        const outputEventMap = Object.keys(sourceEventMap).reduce((_outputEventMap, key) => {
            if (ENV.DEVELOPMENT) {
                if (!sourceEventMap[key].every((_key) => isString(_key))) {
                    log(`error`, `Event.create - Input ${key} event keys are invalid.`);
                }
            }
            if (key === `asEvents`) {
                _outputEventMap.AS = sourceEventMap[key].reduce((asEventMap, _key) => {
                    asEventMap[
                        dashToUpperCaseUnderscore(_key)
                    ] = `as-${_key}`;
                    return asEventMap;
                }, {});
            }
            if (key === `onEvents`) {
                _outputEventMap.ON = sourceEventMap[key].reduce((onEventMap, _key) => {
                    onEventMap[
                        dashToUpperCaseUnderscore(_key)
                    ] = `on-${_key}`;
                    return onEventMap;
                }, {});
            }
            if (key === `doEvents`) {
                _outputEventMap.DO = sourceEventMap[key].reduce((doEventMap, _key) => {
                    doEventMap[
                        dashToUpperCaseUnderscore(_key)
                    ] = `do-${_key}`;
                    return doEventMap;
                }, {});
            }
            if (key === `broadcastEvents`) {
                _outputEventMap.BROADCAST = sourceEventMap[key].reduce((broadcastEventMap, _key) => {
                    broadcastEventMap[
                        dashToUpperCaseUnderscore(_key)
                    ] = `broadcast-${_key}`;
                    return broadcastEventMap;
                }, {});
            }
            if (key === `requestEvents`) {
                _outputEventMap.REQUEST = sourceEventMap[key].reduce((requestForEventMap, _key) => {
                    requestForEventMap[
                        dashToUpperCaseUnderscore(_key)
                    ] = `request-for-${_key}`;
                    return requestForEventMap;
                }, {});
                _outputEventMap.RESPONSE = {
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
                            ALERT: `response-to-${_key}-alert`,
                            WARN: `response-to-${_key}-warn`,
                            ERROR: `response-to-${_key}-error`,
                            CANCELED: `response-to-${_key}-canceled`,
                            CONFLICT: `response-to-${_key}-conflict`,
                            NOT_FOUND: `response-to-${_key}-not-found`,
                            TIMED_OUT: `response-to-${_key}-timed-out`,
                            NOT_AVAILABLE: `response-to-${_key}-not-available`,
                            NOT_MODIFIED: `response-to-${_key}-not-modified`,
                            UNAUTHORIZED: `response-to-${_key}-unauthorized`,
                            DEBUG: `response-to-${_key}-debug`
                        };
                        return responseToEventMap;
                    }, {})
                };
            }
            return _outputEventMap;
        }, {});
        // return Object.freeze(outputEventMap);
        return outputEventMap;
    }
};
