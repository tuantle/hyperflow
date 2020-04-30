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
 * @module EventStreamComposite
 * @description - A reactive event stream composite, based on rxjs.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isInteger,
    isNumeric,
    isBoolean,
    isDefined,
    isFunction,
    isObject,
    isNonEmptyArray,
    isNonEmptyString,
    isEmpty,
    isSchema,
    clear,
    fallback,
    log
} from '../utils/common-util';

import Composite from '../../src/composite';

/* load Rx dependency */
import {
    Subject as RxSubject,
    Subscriber as RxSubscriber,
    Observable as RxObservable,
    NEVER as RxObservableNever,
    merge as rxMerge,
    of as rxOf,
    interval as rxInterval
} from 'rxjs';
import {
    bufferTime as rxBufferTimeOp,
    delay as rxDelayOp,
    debounceTime as rxDebounceTimeOp,
    filter as rxFilterOp,
    flatMap as rxFlatMapOp,
    map as rxMapOp,
    merge as rxMergeOp,
    reduce as rxReduceOp,
    scan as rxScanOp,
    startWith as rxStartWithOp,
    takeLast as rxTakeLastOp,
    tap as rxTapOp,
    timeout as rxTimeoutOp,
    timeInterval as rxTimeIntervalOp,
    throttle as rxThrottleOp,
    share as rxShareOp
} from 'rxjs/operators';
// TODO: Only import part of Rx that is needed.

const INCOMING_DIRECTION = 0;
const OUTGOING_DIRECTION = 1;
const DIVERTED_INCOMING_DIRECTION = 2;
const DIVERTED_OUTGOING_DIRECTION = 3;

const INCOMING_EVENT = 0;
const OUTGOING_EVENT = 1;
const RELAY_EVENT = 2;
const REPEATING_EVENT = 3;
const REPEATED_EVENT = 4;
const LOOPBACK_EVENT = 5;

const DEFAULT_ARBITER = {
    eventDirectionalState: -1,
    completed: false,
    waitTime: 0,
    period: 0,
    predicator: null,
    mapper: null,
    handler: null,
    stopper: null,
    canceller: null,
    relayer: null
};

export default Composite({
    template: {
        /**
         * @description - Initialized composite.
         *
         * @method $initEventStreamComposite
         * @return void
         */
        $initEventStreamComposite () {
            const factory = this;

            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`
                }).of(factory)) {
                    log(`error`, `EventStreamComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        EventStreamComposite () {
            let _outgoingStreamActivated = false;
            let _incomingStreamActivated = false;

            let _arbiter = {};
            let _targetRegistrationCache = {};
            /* a queue for payloads emitted before activation */
            let _unemitPayloads = [];

            let _observer;

            let _outgoingSubscription;
            let _incomingSubscription;
            /* creating factory event stream emitter */
            let _streamEmitter = new RxSubject();
            /* converting event stream emitter as a subject to an observable */
            let _outgoingStream = _streamEmitter.asObservable();
            /* creating factory incoming and outgoing event stream */
            let _incomingStream = RxObservableNever;

            let _divertedOutgoingStream = RxObservableNever;
            let _divertedIncomingStream = RxObservableNever;

            /**
             * @description - On subscription to next incoming payload...
             *
             * @method _next
             * @param {array} payloads - Incoming payloads
             * @return void
             * @private
             */
            function _next (...payloads) {
                payloads.forEach((payload) => {
                    if (ENV.DEVELOPMENT) {
                        if (!isSchema({
                            eventId: `string`
                        }).of(payload)) {
                            log(`error`, `EventStreamComposite._next - Payload eventId is invalid.`);
                        }
                    }

                    const {
                        eventId,
                        value,
                        cancellation
                    } = fallback({
                        cancellation: {
                            sourceEventIds: [],
                            confirmed: false
                        }
                    }).of(payload);

                    if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                        const {
                            eventDirectionalState,
                            completed,
                            waitTime,
                            predicator,
                            mapper,
                            handler,
                            canceller,
                            relayer
                        } = _arbiter[eventId];
                        /**
                         * @description - Called on cancellation to assign/regsiter a canceller callback.
                         *
                         * @method onCancel
                         * @param {function} _canceller - A canceller callback
                         * @return void
                         */
                        const onCancel = (_canceller) => {
                            if (ENV.DEVELOPMENT) {
                                if (!isFunction(_canceller)) {
                                    log(`error`, `EventStreamComposite._next.onCancel - Input canceller callback is invalid.`);
                                }
                            }

                            _arbiter[eventId].canceller = _canceller;
                        };
                        /**
                         * @description - Called on handling async handled value.
                         *
                         * @method onAsyncHandle
                         * @return void
                         */
                        const onAsyncHandle = async () => {
                            if (cancellation.confirmed && isFunction(canceller)) {
                                canceller(cancellation.sourceEventIds);
                            }

                            let passed = true;
                            if (isFunction(predicator)) {
                                passed = predicator(value);
                                passed = isBoolean(passed) ? passed : true;
                            }
                            if (passed) {
                                let mappedValue;
                                if (isFunction(mapper)) {
                                    mappedValue = mapper(value);
                                }

                                const handledValue = isFunction(handler) ? await handler(mappedValue ?? value, onCancel) : undefined;
                                if (isFunction(relayer)) {
                                    relayer(handledValue, cancellation);
                                }
                            }

                            if (completed) {
                                delete _arbiter[eventId];
                                // _arbiter[eventId] = undefined;
                            }
                        };

                        if (eventDirectionalState !== REPEATED_EVENT) {
                            if (eventDirectionalState === REPEATING_EVENT) {
                                _arbiter[eventId].eventDirectionalState = REPEATED_EVENT;
                            }
                            if (waitTime > 0) {
                                setTimeout(() => onAsyncHandle(), waitTime);
                            } else {
                                onAsyncHandle();
                            }
                        } else {
                            _arbiter[eventId].eventDirectionalState = REPEATING_EVENT;
                        }
                    }
                });
            }

            /**
             * @description - On subscription to error...
             *
             * @method _error
             * @param {string} errorMessage
             * @return void
             * @private
             */
            function _error (errorMessage) {
                log(`error`, `EventStreamComposite._error - Subscription error. ${errorMessage}`);
            }

            /**
             * @description - On subscription to completion...
             *
             * @method _complete
             * @return void
             * @private
             */
            function _complete () {
                log(`info0`, `Subscription completed.`);
            }

            /**
             * @description - Helper function to create stream operator object.
             *
             * @method _createStreamOperatorFor
             * @param {number} direction
             * @return {object}
             * @private
             */
            function _createStreamOperatorFor (direction) {
                const factory = this;

                const operator = {
                    /**
                     * @description - At observable stream, operates delay.
                     *
                     * @method delay
                     * @param {number} ms - Time in millisecond
                     * @return {object}
                     */
                    delay (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.delay - Input delay time is invalid.`);
                            }
                        }
                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxDelayOp(ms),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxDelayOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxDelayOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxDelayOp(ms),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.delay - Invalid direction:${direction}.`);
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates debounce.
                     *
                     * @method debounce
                     * @param {number} ms - Time in millisecond
                     * @return {object}
                     */
                    debounce (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.debounce - Input debounce time is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.debounce - Input debounce time should be greater than 0. Reset to 1ms.`);
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxDebounceTimeOp(ms),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxDebounceTimeOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxDebounceTimeOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxDebounceTimeOp(ms),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.debounce - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates filter.
                     *
                     * @method filter
                     * @param {function} predicator
                     * @return {object}
                     */
                    filter (predicator) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(predicator)) {
                                log(`error`, `EventStreamComposite.filter - Input filter predicator function is invalid.`);
                            }
                        }
                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxFilterOp(predicator),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxFilterOp(predicator),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxFilterOp(predicator),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxFilterOp(predicator),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.filter - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates map.
                     *
                     * @method map
                     * @param {function} mapper
                     * @return {object}
                     */
                    map (mapper) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(mapper)) {
                                log(`error`, `EventStreamComposite.map - Input map mapper function is invalid.`);
                            }
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxMapOp(mapper),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxMapOp(mapper),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxMapOp(mapper),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxMapOp(mapper),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.map - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates flatten and map.
                     *
                     * @method flatMap
                     * @param {function} mapper
                     * @param {function} resultSelector
                     * @return {object}
                     */
                    flatMap (mapper, resultSelector) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(mapper)) {
                                log(`error`, `EventStreamComposite.flatMap - Input flat map mapper function is invalid.`);
                            } else if (!isFunction(resultSelector)) {
                                log(`error`, `EventStreamComposite.flatMap - Input flat map result mapper function is invalid.`);
                            }
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxFlatMapOp(mapper, resultSelector),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxFlatMapOp(mapper, resultSelector),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxFlatMapOp(mapper, resultSelector),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxFlatMapOp(mapper, resultSelector),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.flatMap - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates reduce.
                     *
                     * @method reduce
                     * @param {function} accumulator
                     * @param {object|undefined} defaultPayload
                     * @return {object}
                     */
                    reduce (accumulator, defaultPayload) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(accumulator)) {
                                log(`error`, `EventStreamComposite.reduce - Input reduce accumulator function is invalid.`);
                            }
                        }
                        if (isObject(defaultPayload)) {
                            if (ENV.DEVELOPMENT) {
                                if (isSchema({
                                    eventId: `string`
                                }).of(defaultPayload)) {
                                    log(`error`, `EventStreamComposite.reduce - Payload eventId is invalid.`);
                                }
                            }
                            switch (direction) {
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.pipe(
                                    rxReduceOp(accumulator, defaultPayload),
                                    rxShareOp()
                                );
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.pipe(
                                    rxReduceOp(accumulator, defaultPayload),
                                    rxShareOp()
                                );
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.pipe(
                                    rxReduceOp(accumulator, defaultPayload),
                                    rxShareOp()
                                );
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                    rxReduceOp(accumulator, defaultPayload),
                                    rxShareOp()
                                );
                                break;
                            default:
                                log(`error`, `EventStreamComposite.reduce - Invalid direction:${direction}.`);
                            }
                        } else {
                            switch (direction) {
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.pipe(
                                    rxReduceOp(accumulator),
                                    rxShareOp()
                                );
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.pipe(
                                    rxReduceOp(accumulator),
                                    rxShareOp()
                                );
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.pipe(
                                    rxReduceOp(accumulator),
                                    rxShareOp()
                                );
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                    rxReduceOp(accumulator),
                                    rxShareOp()
                                );
                                break;
                            default:
                                log(`error`, `EventStreamComposite.reduce - Invalid direction:${direction}.`);
                            }
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates a start with on the entire stream.
                     *
                     * @method startWith
                     * @param {array} payloads
                     * @return {object}
                     */
                    startWith (...payloads) {
                        // FIXME: startWith method not working? Needs testings.
                        if (ENV.DEVELOPMENT) {
                            payloads.forEach((payload) => {
                                if (!isSchema({
                                    eventId: `string`
                                }).of(payload)) {
                                    log(`error`, `EventStreamComposite.startWith - Payload eventId is invalid.`);
                                }
                            });
                        }
                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxStartWithOp(...payloads),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxStartWithOp(...payloads),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxStartWithOp(...payloads),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxStartWithOp(...payloads),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.startWith - Invalid direction:${direction}.`);
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates take last.
                     *
                     * @method takeLast
                     * @param {number} count
                     * @return {object}
                     */
                    takeLast (count) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(count)) {
                                log(`error`, `EventStreamComposite.takeLast - Input count number is invalid.`);
                            }
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxTakeLastOp(count),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxTakeLastOp(count),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxTakeLastOp(count),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxTakeLastOp(count),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.takeLast - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates a throttle on the entire stream.
                     *
                     * @method throttle
                     * @param {number} ms - Time in ms to wait before emitting another item after emitting the last item.
                     * @return {object}
                     */
                    throttle (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.throttle - Input throttle time window is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.throttle - Input throttle time should be greater than 0. Reset to 1ms.`);
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxThrottleOp(ms),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxThrottleOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxThrottleOp(ms),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxThrottleOp(ms),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.throttle - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates a back pressure on the entire stream. Unlike throttle or debounce, this is not lossy.
                     *
                     * @method backPressure
                     * @param {number} ms - Maximum time length of a buffer.
                     * @return {object}
                     */
                    backPressure (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.backPressure - Input buffer time window is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.backPressure - Input buffer time span should be greater than 0. Reset to 1ms.`);
                        }

                        // FIXME: needs to reimplement flat map the outputs of bufferTime.
                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxBufferTimeOp(ms),
                                rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                                rxFlatMapOp((payload) => payload),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxBufferTimeOp(ms),
                                rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                                rxFlatMapOp((payload) => payload),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxBufferTimeOp(ms),
                                rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                                rxFlatMapOp((payload) => payload),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxBufferTimeOp(ms),
                                rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                                rxFlatMapOp((payload) => payload),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.backPressure - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates a timeout on the entire stream.
                     *
                     * @method timeout
                     * @param {object} timeoutPayload
                     * @param {number} ms
                     * @return {object}
                     */
                    timeout (timeoutPayload, ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                eventId: `string`
                            }).of(timeoutPayload)) {
                                log(`error`, `EventStreamComposite.timeout - Input timeout payload is invalid.`);
                            } else if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.timeout - Input timeout is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.timeout - Input timeout should be greater than 0. Reset to 1ms.`);
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxTimeoutOp(ms, rxOf(timeoutPayload)),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxTimeoutOp(ms, rxOf(timeoutPayload)),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxTimeoutOp(ms, rxOf(timeoutPayload)),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxTimeoutOp(ms, rxOf(timeoutPayload)),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.timeout - Invalid direction:${direction}.`);
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates a monitor on the entire stream.
                     *
                     * @method monitor
                     * @param {object} logger
                     * @return {object}
                     */
                    monitor (logger) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                logNext: `function`
                            }).of(logger)) {
                                log(`error`, `EventStreamComposite.monitor - Input logger object is invalid.`);
                            }
                        }

                        const {
                            logNext,
                            logError,
                            logCompleted
                        } = fallback({
                            /**
                             * @description - On subscription to error...
                             *
                             * @method logOnError
                             * @param {string} error
                             * @return void
                             */
                            logError (error) {
                                log(`error`, `EventStreamComposite.monitor.logError - ${error.message}`);
                            },
                            /**
                             * @description - On subscription to completion...
                             *
                             * @method logOnCompleted
                             * @return void
                             */
                            logCompleted () {
                                log(`info0`, `Complete side subscription.`);
                            }
                        }).of(logger);
                        /* using a side observer for monitoring */
                        const sideObserver = RxSubscriber.create(
                            logNext,
                            logError,
                            logCompleted
                        );
                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxTapOp(sideObserver),
                                rxShareOp()
                            );
                            break;
                        case OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxTapOp(sideObserver),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_INCOMING_DIRECTION:
                            _divertedIncomingStream = _divertedIncomingStream.pipe(
                                rxTapOp(sideObserver),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _divertedOutgoingStream.pipe(
                                rxTapOp(sideObserver),
                                rxShareOp()
                            );
                            break;
                        default:
                            log(`error`, `EventStreamComposite.monitor - Invalid direction:${direction}.`);
                        }

                        return operator;
                    },
                    recombine () {
                        switch (direction) {
                        case DIVERTED_INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.pipe(
                                rxMergeOp(_divertedIncomingStream),
                                rxShareOp()
                            );
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.pipe(
                                rxMergeOp(_divertedOutgoingStream),
                                rxShareOp()
                            );
                            Object.keys(_targetRegistrationCache).forEach((streamId) => {
                                _targetRegistrationCache[streamId].streamConnect(_divertedOutgoingStream);
                            });
                            break;
                        default:
                            log(`warn1`, `EventStreamComposite.recombine - Cannot recombine non diverted direction:${direction}.`);
                        }
                    },
                    /**
                     * @description - At observable stream, operates a diversion on the entire stream.
                     *
                     * @method divert
                     * @param {array} eventIds
                     * @return {object}
                     */
                    divert (...eventIds) {
                        if (ENV.DEVELOPMENT) {
                            if (!isNonEmptyArray(eventIds)) {
                                log(`error`, `EventStreamComposite.divert - Factory:${factory.name} input eventId array is empty.`);
                            } else if (eventIds.some((eventId) => !isNonEmptyString(eventId))) {
                                log(`error`, `EventStreamComposite.divert - Factory:${factory.name} input eventIds are invalid.`);
                            }
                        }

                        switch (direction) {
                        case INCOMING_DIRECTION:
                            _divertedIncomingStream = _incomingStream.pipe(
                                rxFilterOp((payload) => eventIds.includes(payload.eventId)),
                                rxScanOp((payloads, payload) => {
                                    payloads.push(payload);
                                    return payloads;
                                }, []),
                                rxFlatMapOp((payload) => payload)
                            );
                            /* filler out diverted events from main incoming stream */
                            _incomingStream = _incomingStream.pipe(
                                rxFilterOp((payload) => eventIds.every((eventId) => eventId !== payload.eventId)),
                                rxShareOp()
                            );
                            return _createStreamOperatorFor.call(factory, DIVERTED_INCOMING_DIRECTION);
                        case OUTGOING_DIRECTION:
                            _divertedOutgoingStream = _outgoingStream.pipe(
                                rxFilterOp((payload) => eventIds.includes(payload.eventId)),
                                rxScanOp((payloads, payload) => {
                                    payloads.push(payload);
                                    return payloads;
                                }, []),
                                rxFlatMapOp((payload) => payload)
                            );
                            /* filler out diverted events from main outgoing stream */
                            _outgoingStream = _outgoingStream.pipe(
                                rxFilterOp((payload) => eventIds.every((eventId) => eventId !== payload.eventId)),
                                rxShareOp()
                            );
                            return _createStreamOperatorFor.call(factory, DIVERTED_OUTGOING_DIRECTION);
                        case `diversion`:
                            log(`error`, `EventStreamComposite.divert - Cannot divert a diverted stream.`);
                            break;
                        default:
                            log(`error`, `EventStreamComposite.divert - Invalid direction:${direction}.`);
                        }
                    }
                };
                return operator;
            }

            /**
             * @description - Check if both outgoing and incoming stream are activated.
             *
             * @method isStreamActivated
             * @return {boolean}
             */
            this.isStreamActivated = function () {
                return _outgoingStreamActivated && _incomingStreamActivated;
            };

            /**
             * @description - Check if outgoing stream is activated.
             *
             * @method isOutgoingStreamActivated
             * @return {boolean}
             */
            this.isOutgoingStreamActivated = function () {
                return _outgoingStreamActivated;
            };

            /**
             * @description - Check if incoming stream is activated.
             *
             * @method isIncomingStreamActivated
             * @return {boolean}
             */
            this.isIncomingStreamActivated = function () {
                return _incomingStreamActivated;
            };

            /**
             * @description - Register factory outgoing event stream to an external observer.
             *
             * @method registerStream
             * @return void
             */
            this.registerStream = function (definition) {
                const factory = this;

                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        streamId: `string`,
                        streamConnect: `function`
                    }).of(definition)) {
                        log(`error`, `EventStreamComposite.registerStream - Factory:${factory.name} input stream definition is invalid.`);
                    }
                }

                const {
                    streamId,
                    streamConnect
                } = definition;

                _targetRegistrationCache[streamId] = {
                    streamConnect
                };
                streamConnect(_outgoingStream);
            };

            /**
             * @description - Apply incoming event stream operators.
             *
             * @method operateIncomingStream
             * @param {object} - operator
             * @return void
             */
            this.operateIncomingStream = function (operator) { // eslint-disable-line
                // log(`warn0`, `EventStreamComposite.operateIncomingStream - Method is not implemented by default. Ignore this warning if intended.`);
            };

            /**
             * @description - Apply outgoing event stream operators.
             *
             * @method operateOutgoingStream
             * @param {object} - operator
             * @return void
             */
            this.operateOutgoingStream = function (operator) { // eslint-disable-line
                // log(`warn0`, `EventStreamComposite.operateOutgoingStream - Method is not implemented by default. Ignore this warning if intended.`);
            };

            /**
             * @description - When there is an outgoing event...
             *
             * @method outgoing
             * @param {array} eventIds
             * @return {object}
             */
            this.outgoing = function (...eventIds) {
                const factory = this;

                if (ENV.DEVELOPMENT) {
                    if (!isNonEmptyArray(eventIds)) {
                        log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input eventId array is empty.`);
                    } else if (eventIds.some((eventId) => !isNonEmptyString(eventId))) {
                        log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input eventIds are invalid.`);
                    }
                }

                eventIds = eventIds.filter((eventId) => {
                    if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                        return _arbiter[eventId].eventDirectionalState !== REPEATING_EVENT;
                    }
                    return true;
                });
                const outgoingOperator = {
                    /**
                     * @description - At event,  and after delay for some time...
                     *
                     * @method outgoing.delay
                     * @param {number} ms
                     * @return {object}
                     */
                    delay (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.outgoing.delay - Input wait time is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.outgoing.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].waitTime = ms;
                                if (arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: OUTGOING_EVENT,
                                    waitTime: ms
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            emit: outgoingOperator.emit,
                            cancelLatest: outgoingOperator.cancelLatest,
                            periodic: outgoingOperator.periodic
                        };
                    },
                    /**
                     * @description - At event, and at a periodic...
                     *
                     * @method outgoing.periodic
                     * @param {number} ms - Period in millisecond
                     * @param {function} stopper - Interval stopper
                     * @return {object}
                     */
                    periodic (ms, stopper = () => false) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.outgoing.periodic - Input period is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.outgoing.periodic - Input periodic period should be greater than 0. Reset to 1ms.`);
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].period = ms;
                                arbiter[eventId].stopper = stopper;
                                if (arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: OUTGOING_EVENT,
                                    period: ms,
                                    stopper
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            emit: outgoingOperator.emit
                        };
                    },
                    /**
                     * @description - At event, emit a payload with value to a handler with eventId.
                     *
                     * @method outgoing.emit
                     * @param {function} emitter
                     * @return void
                     */
                    emit (emitter) {
                        eventIds.map((eventId) => {
                            const payload = {
                                eventId,
                                cancellation: {
                                    sourceEventIds: [],
                                    confirmed: false
                                },
                                value: isFunction(emitter) ? emitter() : undefined
                            };
                            return payload;
                        }).forEach((payload) => {
                            const {
                                eventId
                            } = payload;

                            if (!factory.isOutgoingStreamActivated()) {
                                _unemitPayloads.push(payload);
                            } else {
                                if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                                    const {
                                        waitTime,
                                        period,
                                        stopper
                                    } = _arbiter[eventId];

                                    let sideSubscription;
                                    let sideStream = RxObservable;
                                    const sideObserver = RxSubscriber.create(
                                        /**
                                         * @description - On subscription to next incoming side value...
                                         *
                                         * @method next
                                         * @param {object} awaitedPayloadBundle
                                         * @return void
                                         */
                                        function next (tick) {
                                            if (isFunction(stopper)) {
                                                let periodicStopped = stopper(tick.value + 1);

                                                periodicStopped = isBoolean(periodicStopped) ? periodicStopped : true;

                                                if (periodicStopped) {
                                                    sideObserver.complete();
                                                }
                                            }
                                            _streamEmitter.next(payload);
                                        },
                                        /**
                                         * @description - On subscription to side error...
                                         *
                                         * @method error
                                         * @param {string} errorMessage
                                         * @return void
                                         */
                                        function error (errorMessage) {
                                            log(`error`, `EventStreamComposite.outgoing.emit.error - Side subscription error. ${errorMessage}`);
                                        },
                                        /**
                                         * @description - On subscription to side completion...
                                         *
                                         * @method complete
                                         * @return void
                                         */
                                        function complete () {
                                            sideSubscription.unsubscribe();
                                            log(`info0`, `Side subscription completed.`);
                                        }
                                    );

                                    if (_arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                        _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                    }

                                    if (waitTime > 0 && period === 0) {
                                        setTimeout(() => {
                                            _streamEmitter.next(payload);
                                        }, waitTime);
                                    } else if (waitTime > 0 && period > 0) {
                                        setTimeout(() => {
                                            sideStream = rxInterval(period).pipe(
                                                rxTimeIntervalOp(),
                                                rxShareOp()
                                            );
                                            _outgoingStream = _outgoingStream.pipe(
                                                rxMergeOp(sideStream),
                                                rxShareOp()
                                            );
                                            sideSubscription = sideStream.subscribe(sideObserver);
                                        }, waitTime);
                                    } else if (waitTime === 0 && period > 0) {
                                        sideStream = rxInterval(period).pipe(
                                            rxTimeIntervalOp(),
                                            rxShareOp()
                                        );
                                        _outgoingStream = _outgoingStream.pipe(
                                            rxMergeOp(sideStream),
                                            rxShareOp()
                                        );
                                        sideSubscription = sideStream.subscribe(sideObserver);
                                    } else {
                                        _streamEmitter.next(payload);
                                    }
                                } else {
                                    _arbiter[eventId] = {
                                        ...DEFAULT_ARBITER,
                                        eventDirectionalState: OUTGOING_EVENT
                                    };
                                    _streamEmitter.next(payload);
                                }
                                log(`info0`, `Emitting eventIds:[${eventIds}].`);
                            }
                        });
                    },
                    /**
                     * @description - Cancel the latest outgoing events...
                     *
                     * @method outgoing.cancelLatest
                     * @param {array} sourceEventIds
                     * @return void
                     */
                    cancelLatest (...sourceEventIds) {
                        if (ENV.DEVELOPMENT) {
                            if (isNonEmptyArray(sourceEventIds)) {
                                if (sourceEventIds.some((sourceEventId) => !isNonEmptyString(sourceEventId))) {
                                    log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input source eventId is invalid.`);
                                }
                            }
                        }

                        sourceEventIds = isNonEmptyArray(sourceEventIds) ? sourceEventIds : eventIds;

                        eventIds.map((eventId) => {
                            const payload = {
                                eventId,
                                cancellation: {
                                    sourceEventIds,
                                    confirmed: true
                                },
                                value: undefined
                            };
                            return payload;
                        }).forEach((payload) => {
                            const {
                                eventId
                            } = payload;
                            if (!_outgoingStreamActivated) {
                                _unemitPayloads = _unemitPayloads.filter((unemitPayload) => unemitPayload.eventId !== eventId);
                            } else {
                                if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                                    const {
                                        waitTime,
                                        period
                                    } = _arbiter[eventId];

                                    if (ENV.DEVELOPMENT) {
                                        if (period !== 0) {
                                            log(`warn1`, `EventStreamComposite.outgoing.cancelLatest - Interval is not used by cancelLatest. Ignoring periodic with period:${period}.`);
                                        }
                                    }

                                    if (_arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                        _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                    }
                                    if (waitTime > 0) {
                                        setTimeout(() => {
                                            _streamEmitter.next(payload);
                                        }, waitTime);
                                    } else {
                                        _streamEmitter.next(payload);
                                    }
                                } else {
                                    log(`warn1`, `EventStreamComposite.outgoing.cancelLatest - Cancelling payload with eventId:${eventId} before emitting.`);
                                }
                                log(`info0`, `Cancelling eventIds:[${sourceEventIds}].`);
                            }
                        });
                    }
                };
                return outgoingOperator;
            };

            /**
             * @description - When there is an incoming event...
             *
             * @method incoming
             * @param {array} eventIds
             * @return {object}
             */
            this.incoming = function (...eventIds) {
                const factory = this;

                if (ENV.DEVELOPMENT) {
                    if (!isNonEmptyArray(eventIds)) {
                        log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input eventId array is empty.`);
                    } else if (eventIds.some((eventId) => !isNonEmptyString(eventId))) {
                        log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input eventIds are invalid.`);
                    }
                }

                eventIds = eventIds.filter((eventId) => {
                    if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                        return _arbiter[eventId].eventDirectionalState !== REPEATED_EVENT;
                    }
                    return true;
                });
                const incomingOperator = {
                    /**
                     * @description - At event, and after filtering...
                     *
                     * @method incoming.filter
                     * @param {function} predicator
                     * @return {object}
                     */
                    filter (predicator) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(predicator)) {
                                log(`error`, `EventStreamComposite.incoming.validate - Input filter predicator is invalid.`);
                            }
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].predicator = predicator;
                                if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: INCOMING_EVENT,
                                    predicator
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            delay: incomingOperator.delay,
                            asPromised: incomingOperator.asPromised,
                            await: incomingOperator.await,
                            map: incomingOperator.map,
                            handle: incomingOperator.handle,
                            forward: incomingOperator.forward,
                            repeat: incomingOperator.repeat
                        };
                    },
                    /**
                     * @description - At event, and after mapping...
                     *
                     * @method incoming.map
                     * @param {function} mapper
                     * @return {object}
                     */
                    map (mapper) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(mapper)) {
                                log(`error`, `EventStreamComposite.incoming.validate - Input filter mapper is invalid.`);
                            }
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].mapper = mapper;
                                if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: INCOMING_EVENT,
                                    mapper
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            delay: incomingOperator.delay,
                            asPromised: incomingOperator.asPromised,
                            await: incomingOperator.await,
                            handle: incomingOperator.handle,
                            forward: incomingOperator.forward,
                            repeat: incomingOperator.repeat
                        };
                    },
                    /**
                     * @description - At event, and after delay for some time...
                     *
                     * @method incoming.delay
                     * @param {number} ms
                     * @return {object}
                     */
                    delay (ms) {
                        if (ENV.DEVELOPMENT) {
                            if (!isInteger(ms)) {
                                log(`error`, `EventStreamComposite.incoming.delay - Input wait time is invalid.`);
                            }
                        }

                        if (ms < 1) {
                            ms = 1;
                            log(`warn1`, `EventStreamComposite.incoming.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].waitTime = ms;
                                if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: INCOMING_EVENT,
                                    waitTime: ms
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            asPromised: incomingOperator.asPromised,
                            await: incomingOperator.await,
                            validate: incomingOperator.validate,
                            handle: incomingOperator.handle,
                            forward: incomingOperator.forward,
                            repeat: incomingOperator.repeat
                        };
                    },
                    /**
                     * @description - At all events, return a promise or an array promises of the payloads.
                     *
                     * @method incoming.asPromised
                     * @return {object|array}
                     */
                    asPromised () {
                        if (eventIds.length === 1) {
                            const [ eventId ] = eventIds;
                            return new Promise((resolve) => {
                                if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                                    _arbiter[eventId].handler = (value) => resolve(value);
                                    if (_arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                        _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                    }
                                } else {
                                    _arbiter[eventId] = {
                                        ...DEFAULT_ARBITER,
                                        eventDirectionalState: INCOMING_EVENT,
                                        handler: (value) => resolve(value)
                                    };
                                }
                            });
                        }
                        return eventIds.map((eventId) => new Promise((resolve) => {
                            if (Object.prototype.hasOwnProperty.call(_arbiter, eventId)) {
                                _arbiter[eventId].handler = (value) => resolve(value);
                                if (_arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                    _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                _arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: INCOMING_EVENT,
                                    handler: (value) => resolve(value)
                                };
                            }
                        }));
                    },
                    /**
                     * @description - Wait for all events to arrive...
                     *
                     * @method incoming.await
                     * @param {number} ms
                     * @param {function} timeoutError - Time out error callback
                     * @return {object}
                     */
                    await (ms = 0, timeoutError = () => null) {
                        if (!isNumeric(ms) || ms < 0) {
                            ms = 0;
                            log(`warn1`, `EventStreamComposite.incoming.await - Input await time should be greater or equal to 0. Reset to 0ms.`);
                        }

                        timeoutError = isFunction(timeoutError) ? timeoutError : () => null;

                        if (eventIds.length > 1) {
                            let sideSubscription;
                            let sideStream = RxObservableNever;
                            let timeoutId = null;
                            let timedout = false;
                            const awaitedEventId = eventIds.reduce((_awaitedEventId, eventId) => {
                                if (isEmpty(_awaitedEventId)) {
                                    return eventId;
                                }
                                return `${_awaitedEventId},${eventId}`;
                            }, ``);
                            const incomingAwaitOperator = factory.incoming(awaitedEventId);
                            const sideObserver = RxSubscriber.create(
                                /**
                                 * @description - On subscription to next incoming side value...
                                 *
                                 * @method next
                                 * @param {object} awaitedPayloadBundle
                                 * @return void
                                 */
                                function next (awaitedPayloadBundle) {
                                    if (!timedout) {
                                        const awaitedBundleEventIds = Object.keys(awaitedPayloadBundle).filter((eventId) => !awaitedPayloadBundle[eventId].cancellation?.confirmed);
                                        const cancelledBundleEventIds = Object.keys(awaitedPayloadBundle).filter((eventId) => awaitedPayloadBundle[eventId].cancellation?.confirmed);

                                        if (awaitedBundleEventIds.length === eventIds.length &&
                                            awaitedBundleEventIds.every((eventId) => eventIds.includes(eventId))) {
                                            factory.outgoing(awaitedEventId)
                                                .emit(() => awaitedBundleEventIds.map((awaitedBundleEventId) => awaitedPayloadBundle[awaitedBundleEventId].value));
                                            if (timeoutId !== null) {
                                                timedout = false;
                                                clearTimeout(timeoutId);
                                                timeoutId = null;
                                            }
                                        } else if (ms > 0 && awaitedBundleEventIds.length === 0) {
                                            timeoutId = setTimeout(() => {
                                                timedout = true;
                                                timeoutError();
                                            }, ms);
                                        }

                                        if (isNonEmptyArray(cancelledBundleEventIds)) {
                                            factory.outgoing(awaitedEventId).cancelLatest(...cancelledBundleEventIds);
                                        }
                                    }
                                },
                                /**
                                 * @description - On subscription to side error...
                                 *
                                 * @method error
                                 * @param {string} errorMessage
                                 * @return void
                                 */
                                function error (errorMessage) {
                                    if (timeoutId !== null) {
                                        timedout = false;
                                        clearTimeout(timeoutId);
                                        timeoutId = null;
                                    }
                                    log(`error`, `EventStreamComposite.incoming.await.error - Side subscription error. ${errorMessage}`);
                                },
                                /**
                                 * @description - On subscription to side completion...
                                 *
                                 * @method complete
                                 * @return void
                                 */
                                function complete () {
                                    if (timeoutId !== null) {
                                        timedout = false;
                                        clearTimeout(timeoutId);
                                        timeoutId = null;
                                    }
                                    sideSubscription.unsubscribe();
                                    log(`info0`, `Side subscription completed.`);
                                }
                            );

                            sideStream = _incomingStream.pipe(
                                rxFilterOp((payload) => eventIds.includes(payload.eventId)),
                                rxScanOp((awaitedPayloadBundle, payload) => {
                                    awaitedPayloadBundle[payload.eventId] = {
                                        cancellation: payload.cancellation,
                                        value: payload.value
                                    };
                                    return awaitedPayloadBundle;
                                }, {}),
                                rxShareOp()
                            );
                            sideSubscription = sideStream.subscribe(sideObserver);

                            return {
                                // asPromised: incoming.asPromised,
                                handle: incomingAwaitOperator.handle,
                                forward: incomingAwaitOperator.forward
                            };
                        }
                        return {
                            // asPromised: incoming.asPromised,
                            handle: incomingOperator.handle,
                            forward: incomingOperator.forward
                        };
                    },
                    /**
                     * @description - At any events, wait for any event to arrive and do handle the the payloads.
                     *
                     * @method incoming.handle
                     * @param {function} handler
                     * @return {object}
                     */
                    handle (handler) {
                        if (ENV.DEVELOPMENT) {
                            if (!isFunction(handler)) {
                                log(`error`, `EventStreamComposite.incoming.handle - Factory:${factory.name} input handler is invalid.`);
                            }
                        }

                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].handler = handler;
                                if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                    arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                }
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: INCOMING_EVENT,
                                    handler
                                };
                            }
                            return arbiter;
                        }, _arbiter);

                        return {
                            /**
                             * @description - At event, relay new event of handled payload.
                             *
                             * @method incoming.handle.relay
                             * @param {array} relayEventIds
                             * @return void
                             */
                            relay (...relayEventIds) {
                                if (ENV.DEVELOPMENT) {
                                    if (!isNonEmptyArray(relayEventIds)) {
                                        log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input eventId array is empty.`);
                                    } else if (relayEventIds.some((relayEventId) => !isNonEmptyString(relayEventId))) {
                                        log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input eventIds are invalid.`);
                                    }
                                }

                                relayEventIds = relayEventIds.filter((relayEventId) => {
                                    if (eventIds.includes(relayEventId)) {
                                        /* relaying the same eventIds will cause infinite loop error */
                                        log(`warn1`, `EventStreamComposite.incoming.handle.relay - Cannot relay the same eventId:${relayEventId}.`);
                                        return false;
                                    }
                                    return true;
                                });
                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    arbiter[eventId].eventDirectionalState = RELAY_EVENT;
                                    arbiter[eventId].relayer = (handledValue, cancellation) => {
                                        if (!cancellation.confirmed) {
                                            factory.outgoing(...relayEventIds).emit(() => handledValue);
                                        } else {
                                            factory.outgoing(...relayEventIds).cancelLatest(...cancellation.sourceEventIds);
                                        }
                                        log(`info0`, `Relaying eventIds:[${relayEventIds}].`);
                                    };
                                    return arbiter;
                                }, _arbiter);
                            },
                            /**
                             * @description - At any event, complete and end the event with Id.
                             *
                             * @method incoming.handle.complete
                             * @return void
                             */
                            complete () {
                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    arbiter[eventId].completed = true;
                                    return arbiter;
                                }, _arbiter);
                                log(`info0`, `Completing eventIds:[${eventIds}].`);
                            }
                        };
                    },
                    /**
                     * @description - At event, repeat event of unhandled payload as a new event.
                     *
                     * @method incoming.repeat
                     * @return {object}
                     */
                    repeat () {
                        // TODO: use rxRepeat?
                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                            if (Object.prototype.hasOwnProperty.call(arbiter, eventId)) {
                                arbiter[eventId].eventDirectionalState = REPEATING_EVENT;
                                arbiter[eventId].handler = (value) => value;
                                arbiter[eventId].relayer = (handledValue, cancellation) => {
                                    if (!cancellation.confirmed) {
                                        factory.outgoing(eventId).emit(() => handledValue);
                                    } else {
                                        factory.outgoing(eventId).cancelLatest();
                                    }
                                    log(`info0`, `Repeating eventIds:[${eventId}].`);
                                };
                            } else {
                                arbiter[eventId] = {
                                    ...DEFAULT_ARBITER,
                                    eventDirectionalState: REPEATING_EVENT,
                                    handler: (value) => value,
                                    relayer: (handledValue, cancellation) => {
                                        if (!cancellation.confirmed) {
                                            factory.outgoing(eventId).emit(() => handledValue);
                                        } else {
                                            factory.outgoing(eventId).cancelLatest();
                                        }
                                        log(`info0`, `Repeating eventIds:[${eventId}].`);
                                    }
                                };
                            }
                            return arbiter;
                        }, _arbiter);
                    },
                    /**
                     * @description - At any event, forward event of unhandled payload as a new event.
                     *
                     * @method incoming.forward
                     * @param {array} forwardEventIds
                     * @return void
                     */
                    forward (...forwardEventIds) {
                        if (ENV.DEVELOPMENT) {
                            if (!isNonEmptyArray(forwardEventIds)) {
                                log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input eventId array is empty.`);
                            } else if (forwardEventIds.some((forwardEventId) => !isNonEmptyString(forwardEventId))) {
                                log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input eventIds are invalid.`);
                            }
                        }

                        forwardEventIds = forwardEventIds.filter((forwardEventId) => {
                            if (eventIds.includes(forwardEventId)) {
                                /* forwarding the same eventIds will cause infinite loop error */
                                log(`warn1`, `EventStreamComposite.incoming.forward - Cannot forward the same eventId:${forwardEventId}.`);
                                return false;
                            }
                            return true;
                        });
                        incomingOperator.handle((value) => value).relay(...forwardEventIds);
                    }
                };
                return incomingOperator;
            };

            /**
             * @description - Start the incoming event stream subscription.
             *
             * @method activateIncomingStream
             * @param {object} option
             * @return void
             */
            this.activateIncomingStream = function (option = {
                forceBufferingOnAllIncomingStreams: false,
                bufferTimeSpan: 1,
                bufferTimeShift: 1
            }) {
                const factory = this;
                let {
                    forceBufferingOnAllIncomingStreams,
                    bufferTimeSpan,
                    bufferTimeShift
                } = fallback({
                    forceBufferingOnAllIncomingStreams: false,
                    bufferTimeSpan: 1,
                    bufferTimeShift: 1
                }).of(option);

                if (!factory.isIncomingStreamActivated()) {
                    if (!isDefined(_observer)) {
                        /* creating factory event stream observer */
                        _observer = RxSubscriber.create(
                            _next,
                            _error,
                            _complete
                        );
                    }
                    /* first do operations on the incoming event stream */
                    factory.operateIncomingStream(_createStreamOperatorFor.call(factory, INCOMING_DIRECTION));
                    /* then do incoming event stream subscriptions */
                    if (forceBufferingOnAllIncomingStreams) {
                        if (bufferTimeSpan < 1) {
                            bufferTimeSpan = 1;
                            log(`warn1`, `EventStreamComposite.activateIncomingStream - Input buffer time span option should be greater than 0. Reset to 1ms.`);
                        }
                        if (bufferTimeShift < 1) {
                            bufferTimeShift = 1;
                            log(`warn1`, `EventStreamComposite.activateIncomingStream - Input buffer time shift option should be greater than 0. Reset to 1ms.`);
                        }
                        _incomingSubscription = _incomingStream.pipe(
                            rxBufferTimeOp(bufferTimeSpan, bufferTimeShift),
                            rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                            rxFlatMapOp((payload) => payload)
                        ).subscribe(_observer);
                    } else {
                        _incomingSubscription = _incomingStream.subscribe(_observer);
                    }
                    _incomingStreamActivated = true;
                } else {
                    log(`warn0`, `EventStreamComposite.activateIncomingStream - Incoming event stream subscription is already activated.`);
                }
            };

            /**
             * @description - Start the outgoing event stream subscription.
             *
             * @method activateOutgoingStream
             * @param {object} option
             * @return void
             */
            this.activateOutgoingStream = function (option = {
                bufferOutgoingStreams: false,
                bufferTimeSpan: 1,
                bufferTimeShift: 1
            }) {
                const factory = this;
                let {
                    bufferOutgoingStreams,
                    bufferTimeSpan,
                    bufferTimeShift
                } = fallback({
                    bufferOutgoingStreams: false,
                    bufferTimeSpan: 1,
                    bufferTimeShift: 1
                }).of(option);

                if (!factory.isOutgoingStreamActivated()) {
                    if (!isDefined(_observer)) {
                        /* creating factory event stream observer */
                        _observer = RxSubscriber.create(
                            _next,
                            _error,
                            _complete
                        );
                    }
                    /* first do operations on the outgoing event stream */
                    factory.operateOutgoingStream(_createStreamOperatorFor.call(factory, OUTGOING_DIRECTION));
                    /* then do outgoing event stream subscriptions */
                    if (bufferOutgoingStreams) {
                        if (bufferTimeSpan < 1) {
                            bufferTimeSpan = 1;
                            log(`warn1`, `EventStreamComposite.activateOutgoingStream - Input buffer time span option should be greater than 0. Reset to 1ms.`);
                        }
                        if (bufferTimeShift < 1) {
                            bufferTimeShift = 1;
                            log(`warn1`, `EventStreamComposite.activateOutgoingStream - Input buffer time shift option should be greater than 0. Reset to 1ms.`);
                        }
                        _outgoingSubscription = _outgoingStream.pipe(
                            rxBufferTimeOp(bufferTimeSpan, bufferTimeShift),
                            rxFilterOp((payloads) => isNonEmptyArray(payloads)),
                            rxFlatMapOp((payload) => payload)
                        ).subscribe(_observer);
                    } else {
                        _outgoingSubscription = _outgoingStream.subscribe(_observer);
                    }
                    _outgoingStreamActivated = true;

                    /* emit all the un-emitted payloads that were pushed to queue before activation */
                    _unemitPayloads.forEach(({
                        eventId,
                        value
                    }) => {
                        // FIXME: unemitPayloads are being emitted multiple times.
                        factory.outgoing(eventId).emit(() => value);
                    });
                    clear(_unemitPayloads);
                } else {
                    log(`warn0`, `EventStreamComposite.activateOutgoingStream - Outgoing event stream subscription is already activated.`);
                }
            };

            /**
             * @description - Stop the incoming event stream by disposing subscription.
             *
             * @method deactivateIncomingStream
             * @return void
             */
            this.deactivateIncomingStream = function () {
                const factory = this;

                if (factory.isIncomingStreamActivated()) {
                    _incomingSubscription.unsubscribe();
                    _incomingSubscription = undefined;
                    _observer = undefined;
                    _incomingStream = undefined;
                    _divertedIncomingStream = undefined;

                    clear(_arbiter);
                    clear(_targetRegistrationCache);

                    _incomingStream = RxObservableNever;
                    _divertedIncomingStream = RxObservableNever;

                    _incomingStreamActivated = false;
                } else {
                    log(`warn0`, `EventStreamComposite.deactivateIncomingStream - Incoming event stream subscription is not activated.`);
                }
            };

            /**
             * @description - Stop the outgoing event stream by disposing subscription.
             *
             * @method deactivateOutgoingStream
             * @return void
             */
            this.deactivateOutgoingStream = function () {
                const factory = this;

                if (factory.isOutgoingStreamActivated()) {
                    _streamEmitter.complete();
                    _outgoingSubscription.unsubscribe();
                    _outgoingSubscription = undefined;
                    _observer = undefined;
                    _streamEmitter = undefined;
                    _outgoingStream = undefined;
                    _divertedOutgoingStream = undefined;

                    clear(_arbiter);
                    clear(_targetRegistrationCache);
                    clear(_unemitPayloads);

                    _streamEmitter = new RxSubject();
                    /* converting event stream emitter as a subject to an observable */
                    _outgoingStream = _streamEmitter.asObservable();
                    _divertedOutgoingStream = RxObservableNever;

                    _outgoingStreamActivated = false;
                } else {
                    log(`warn0`, `EventStreamComposite.deactivateOutgoingStream - Outgoing event stream subscription is not activated.`);
                }
            };

            /**
             * @description - Do subscription on the external incoming event stream sources.
             *
             * @method observe
             * @param {array} sources
             * @return {object}
             */
            this.observe = function (...sources) {
                const factory = this;

                if (ENV.DEVELOPMENT) {
                    if (!isNonEmptyArray(sources)) {
                        log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source array is empty.`);
                    } else if (sources.some((source) => !isSchema({
                        name: `string`,
                        type: `string`,
                        registerStream: `function`
                    }).of(source))) {
                        log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source objects are invalid.`);
                    }
                }

                /**
                 * @description -
                 *
                 * @method streamConnect
                 * @return void
                 */
                const streamConnect = (sourceOutgoingStream) => {
                    if (ENV.DEVELOPMENT) {
                        if (!isDefined(sourceOutgoingStream)) {
                            log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source objects are invalid.`);
                        }
                    }
                    /* merge all external incoming event streams into one */
                    _incomingStream = rxMerge(sourceOutgoingStream, _incomingStream).pipe(
                        rxShareOp()
                    );
                };

                sources.forEach((source) => source.registerStream({
                    streamId: `${source.type}-${source.name}`,
                    streamConnect: streamConnect.bind(source)
                }));

                return _createStreamOperatorFor.call(factory, INCOMING_DIRECTION);
            };
        }
    }
});
