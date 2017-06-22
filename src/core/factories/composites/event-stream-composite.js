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
 * @module EventStreamComposite
 * @description - A reactive event stream composite, based on rxjs.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../hyperflow';

/* load Rx dependency */
import Rx from 'rxjs/Rx';
// TODO: Only import part of Rx that is needed.

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE,
    DOMAIN_FACTORY_CODE,
    INTERFACE_FACTORY_CODE,
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

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

/**
 * @description - A reactive event stream composite module.
 *
 * @module EventStreamComposite
 * @return {object}
 */
export default Hf.Composite({
    template: {
        /**
         * @description - Initialized composite.
         *
         * @method $initEventStreamComposite
         * @return void
         */
        $initEventStreamComposite: function $initEventStreamComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`
                }).of(factory) || !(factory.fId.substr(0, FIXTURE_FACTORY_CODE.length) === FIXTURE_FACTORY_CODE ||
                                    factory.fId.substr(0, DOMAIN_FACTORY_CODE.length) === DOMAIN_FACTORY_CODE ||
                                    factory.fId.substr(0, INTERFACE_FACTORY_CODE.length) === INTERFACE_FACTORY_CODE ||
                                    factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hf.log(`error`, `EventStreamComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        EventStreamComposite: function EventStreamComposite () {
            /* ----- Private Variables ------------- */
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
            let _streamEmitter = new Rx.Subject();
            /* converting event stream emitter as a subject to an observable */
            let _outgoingStream = _streamEmitter.asObservable();
            /* creating factory incoming and outgoing event stream */
            let _incomingStream = Rx.Observable.never();

            let _divertedOutgoingStream = Rx.Observable.never();
            let _divertedIncomingStream = Rx.Observable.never();
            /* ----- Private FUnctions ------------- */
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
                    if (Hf.isSchema({
                        eventId: `string`
                    }).of(payload)) {
                        const {
                            eventId,
                            value,
                            cancelled
                        } = Hf.fallback({
                            cancelled: false
                        }).of(payload);
                        if (_arbiter.hasOwnProperty(eventId)) {
                            /**
                             * @description - Called on cancellation to assign/regsiter a canceller callback.
                             *
                             * @method onCancel
                             * @param {function} canceller
                             * @return void
                             */
                            const onCancel = function onCancel (canceller) {
                                if (!Hf.isFunction(canceller)) {
                                    Hf.log(`error`, `EventStreamComposite._next.onCancel - Input canceller callback is invalid.`);
                                } else {
                                    _arbiter[eventId].canceller = canceller;
                                }
                            };
                            const {
                                eventDirectionalState,
                                completed,
                                waitTime,
                                handler,
                                canceller,
                                relayer
                            } = Hf.fallback({
                                completed: false,
                                waitTime: 0
                            }).of((_arbiter[eventId]));
                            if (eventDirectionalState !== REPEATED_EVENT) {
                                if (eventDirectionalState === REPEATING_EVENT) {
                                    _arbiter[eventId].eventDirectionalState = REPEATED_EVENT;
                                }
                                if (waitTime > 0) {
                                    setTimeout(() => {
                                        const handledValue = Hf.isFunction(handler) ? handler(value, onCancel) : undefined;

                                        if (cancelled && Hf.isFunction(canceller)) {
                                            canceller();
                                        }
                                        if (Hf.isFunction(relayer)) {
                                            relayer(handledValue, cancelled);
                                        }
                                        if (completed) {
                                            _arbiter[eventId] = undefined;
                                            delete _arbiter[eventId];
                                        }
                                    }, waitTime);
                                } else {
                                    const handledValue = Hf.isFunction(handler) ? handler(value, onCancel) : undefined;

                                    if (cancelled && Hf.isFunction(canceller)) {
                                        canceller();
                                    }
                                    if (Hf.isFunction(relayer)) {
                                        relayer(handledValue, cancelled);
                                    }
                                    if (completed) {
                                        _arbiter[eventId] = undefined;
                                        delete _arbiter[eventId];
                                    }
                                }
                            } else {
                                _arbiter[eventId].eventDirectionalState = REPEATING_EVENT;
                            }
                        }
                    } else {
                        Hf.log(`error`, `EventStreamComposite._next - Payload event Id is invalid.`);
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
                Hf.log(`error`, `EventStreamComposite._error - Subscription error. ${errorMessage}`);
            }
            /**
             * @description - On subscription to completion...
             *
             * @method _complete
             * @return void
             * @private
             */
            function _complete () {
                Hf.log(`info`, `Subscription completed.`);
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
                    delay: function delay (ms) {
                        if (!Hf.isInteger(ms)) {
                            Hf.log(`error`, `EventStreamComposite.delay - Input delay time is invalid.`);
                        } else {
                            if (ms < 1) {
                                ms = 1;
                                Hf.log(`warn1`, `EventStreamComposite.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                            }

                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.delay(ms).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.delay(ms).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.delay(ms).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.delay(ms).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.delay - Invalid direction:${direction}.`);
                            }
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
                    debounce: function debounce (ms) {
                        if (!Hf.isInteger(ms)) {
                            Hf.log(`error`, `EventStreamComposite.debounce - Input debounce time is invalid.`);
                        } else {
                            if (ms < 1) {
                                ms = 1;
                                Hf.log(`warn1`, `EventStreamComposite.debounce - Input debounce time should be greater than 0. Reset to 1ms.`);
                            }

                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.debounce(ms).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.debounce(ms).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.debounce(ms).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.debounce(ms).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.debounce - Invalid direction:${direction}.`);
                            }
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates filter.
                     *
                     * @method filter
                     * @param {function} predicate
                     * @return {object}
                     */
                    filter: function filter (predicate) {
                        if (!Hf.isFunction(predicate)) {
                            Hf.log(`error`, `EventStreamComposite.filter - Input filter predicate function is invalid.`);
                        } else {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.filter(predicate).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.filter(predicate).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.filter(predicate).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.filter(predicate).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.filter - Invalid direction:${direction}.`);
                            }
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates map.
                     *
                     * @method map
                     * @param {function} selector
                     * @return {object}
                     */
                    map: function map (selector) {
                        if (!Hf.isFunction(selector)) {
                            Hf.log(`error`, `EventStreamComposite.map - Input map selector function is invalid.`);
                        } else {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.map(selector).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.map(selector).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.map(selector).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.map(selector).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.map - Invalid direction:${direction}.`);
                            }
                        }
                        return operator;
                    },
                    /**
                     * @description - At observable stream, operates flatten and map.
                     *
                     * @method flatMap
                     * @param {function} selector
                     * @param {function} resultSelector
                     * @return {object}
                     */
                    flatMap: function flatMap (selector, resultSelector) {
                        if (!Hf.isFunction(selector)) {
                            Hf.log(`error`, `EventStreamComposite.flatMap - Input flat map selector function is invalid.`);
                        } else if (!Hf.isFunction(resultSelector)) {
                            Hf.log(`error`, `EventStreamComposite.flatMap - Input flat map result selector function is invalid.`);
                        } else {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.flatMap(selector, resultSelector).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.flatMap(selector, resultSelector).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.flatMap(selector, resultSelector).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.flatMap(selector, resultSelector).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.flatMap - Invalid direction:${direction}.`);
                            }
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
                    reduce: function reduce (accumulator, defaultPayload) {
                        if (!Hf.isFunction(accumulator)) {
                            Hf.log(`error`, `EventStreamComposite.reduce - Input reduce accumulator function is invalid.`);
                        } else {
                            if (Hf.isObject(defaultPayload)) {
                                if (Hf.isSchema({
                                    eventId: `string`
                                }).of(defaultPayload)) {
                                    Hf.log(`error`, `EventStreamComposite.reduce - Payload event Id is invalid.`);
                                } else {
                                    switch (direction) { // eslint-disable-line
                                    case INCOMING_DIRECTION:
                                        _incomingStream = _incomingStream.reduce(accumulator, defaultPayload).share();
                                        break;
                                    case OUTGOING_DIRECTION:
                                        _outgoingStream = _outgoingStream.reduce(accumulator, defaultPayload).share();
                                        break;
                                    case DIVERTED_INCOMING_DIRECTION:
                                        _divertedIncomingStream = _divertedIncomingStream.reduce(accumulator, defaultPayload).share();
                                        break;
                                    case DIVERTED_OUTGOING_DIRECTION:
                                        _divertedOutgoingStream = _divertedOutgoingStream.reduce(accumulator, defaultPayload).share();
                                        break;
                                    default:
                                        Hf.log(`error`, `EventStreamComposite.reduce - Invalid direction:${direction}.`);
                                    }
                                }
                            } else {
                                switch (direction) { // eslint-disable-line
                                case INCOMING_DIRECTION:
                                    _incomingStream = _incomingStream.reduce(accumulator).share();
                                    break;
                                case OUTGOING_DIRECTION:
                                    _outgoingStream = _outgoingStream.reduce(accumulator).share();
                                    break;
                                case DIVERTED_INCOMING_DIRECTION:
                                    _divertedIncomingStream = _divertedIncomingStream.reduce(accumulator).share();
                                    break;
                                case DIVERTED_OUTGOING_DIRECTION:
                                    _divertedOutgoingStream = _divertedOutgoingStream.reduce(accumulator).share();
                                    break;
                                default:
                                    Hf.log(`error`, `EventStreamComposite.reduce - Invalid direction:${direction}.`);
                                }
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
                    startWith: function startWith (...payloads) {
                        // FIXME: startWith method not working? Needs testings.
                        if (payloads.every((payload) => {
                            if (!Hf.isSchema({
                                eventId: `string`
                            }).of(payload)) {
                                Hf.log(`error`, `EventStreamComposite.startWith - Payload event Id is invalid.`);
                                return false;
                            }
                            return true;
                        })) {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.startWith(...payloads).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.startWith(...payloads).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.startWith(...payloads).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.startWith(...payloads).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.startWith - Invalid direction:${direction}.`);
                            }
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
                    takeLast: function takeLast (count) {
                        if (!Hf.isInteger(count)) {
                            Hf.log(`error`, `EventStreamComposite.takeLast - Input count number is invalid.`);
                        } else {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.takeLast(count).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.takeLast(count).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.takeLast(count).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.takeLast(count).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.takeLast - Invalid direction:${direction}.`);
                            }
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
                    throttle: function throttle (ms) {
                        if (!Hf.isInteger(ms)) {
                            Hf.log(`error`, `EventStreamComposite.throttle - Input throttle time window is invalid.`);
                        } else {
                            if (ms < 1) {
                                ms = 1;
                                Hf.log(`warn1`, `EventStreamComposite.throttle - Input throttle time should be greater than 0. Reset to 1ms.`);
                            }

                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.throttle(ms).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.throttle(ms).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.throttle(ms).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.throttle(ms).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.throttle - Invalid direction:${direction}.`);
                            }
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
                    backPressure: function backPressure (ms) {
                        if (!Hf.isInteger(ms)) {
                            Hf.log(`error`, `EventStreamComposite.backPressure - Input buffer time window is invalid.`);
                        } else {
                            if (ms < 1) {
                                ms = 1;
                                Hf.log(`warn1`, `EventStreamComposite.backPressure - Input buffer time span should be greater than 0. Reset to 1ms.`);
                            }

                            // FIXME: needs to reimplement flat map the outputs of bufferTime.
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.bufferTime(ms).filter((payloads) => {
                                    return !Hf.isEmpty(payloads);
                                }).flatMap((payload) => payload).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.bufferTime(ms).filter((payloads) => {
                                    return !Hf.isEmpty(payloads);
                                }).flatMap((payload) => payload).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.bufferTime(ms).filter((payloads) => {
                                    return !Hf.isEmpty(payloads);
                                }).flatMap((payload) => payload).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.bufferTime(ms).filter((payloads) => {
                                    return !Hf.isEmpty(payloads);
                                }).flatMap((payload) => payload).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.backPressure - Invalid direction:${direction}.`);
                            }
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
                    timeout: function timeout (timeoutPayload, ms) {
                        if (!Hf.isSchema({
                            eventId: `string`
                        }).of(timeoutPayload)) {
                            Hf.log(`error`, `EventStreamComposite.timeout - Input timeout payload is invalid.`);
                        } else if (!Hf.isInteger(ms)) {
                            Hf.log(`error`, `EventStreamComposite.timeout - Input timeout is invalid.`);
                        } else {
                            if (ms < 1) {
                                ms = 1;
                                Hf.log(`warn1`, `EventStreamComposite.timeout - Input timeout should be greater than 0. Reset to 1ms.`);
                            }

                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.timeout(ms, Rx.Observable.of(timeoutPayload)).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.timeout(ms, Rx.Observable.of(timeoutPayload)).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.timeout(ms, Rx.Observable.of(timeoutPayload)).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.timeout(ms, Rx.Observable.of(timeoutPayload)).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.timeout - Invalid direction:${direction}.`);
                            }
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
                    monitor: function monitor (logger) {
                        if (!Hf.isSchema({
                            logOnNext: `function`
                        }).of(logger)) {
                            Hf.log(`error`, `EventStreamComposite.monitor - Input logger object is invalid.`);
                        } else {
                            const {
                                logOnNext,
                                logOnError,
                                logOnCompleted
                            } = Hf.fallback({
                                /**
                                 * @description - On subscription to error...
                                 *
                                 * @method logOnError
                                 * @param {string} error
                                 * @return void
                                 */
                                logOnError: function logOnError (error) {
                                    Hf.log(`error`, `EventStreamComposite.monitor.logOnError - ${error.message}`);
                                },
                                /**
                                 * @description - On subscription to completion...
                                 *
                                 * @method logOnCompleted
                                 * @return void
                                 */
                                logOnCompleted: function logOnCompleted () {
                                    Hf.log(`info`, `Complete side subscription.`);
                                }
                            }).of(logger);
                            /* using a side observer for monitoring */
                            const sideObserver = Rx.Subscriber.create(
                                logOnNext,
                                logOnError,
                                logOnCompleted
                            );
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _incomingStream = _incomingStream.do(sideObserver).share();
                                break;
                            case OUTGOING_DIRECTION:
                                _outgoingStream = _outgoingStream.do(sideObserver).share();
                                break;
                            case DIVERTED_INCOMING_DIRECTION:
                                _divertedIncomingStream = _divertedIncomingStream.do(sideObserver).share();
                                break;
                            case DIVERTED_OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _divertedOutgoingStream.do(sideObserver).share();
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.monitor - Invalid direction:${direction}.`);
                            }
                        }
                        return operator;
                    },
                    recombine: function recombine () {
                        switch (direction) { // eslint-disable-line
                        case DIVERTED_INCOMING_DIRECTION:
                            _incomingStream = _incomingStream.merge(_divertedIncomingStream).share();
                            break;
                        case DIVERTED_OUTGOING_DIRECTION:
                            _outgoingStream = _outgoingStream.merge(_divertedOutgoingStream).share();
                            Object.keys(_targetRegistrationCache).forEach((fId) => {
                                _targetRegistrationCache[fId].connectStream(_divertedOutgoingStream);
                            });
                            break;
                        default:
                            Hf.log(`warn1`, `EventStreamComposite.recombine - Cannot recombine non diverted direction:${direction}.`);
                        }
                    },
                    /**
                     * @description - At observable stream, operates a diversion on the entire stream.
                     *
                     * @method divert
                     * @param {array} eventIds
                     * @return {object}
                     */
                    divert: function divert (...eventIds) {
                        if (Hf.isEmpty(eventIds)) {
                            Hf.log(`error`, `EventStreamComposite.divert - Factory:${factory.name} input eventId array is empty.`);
                        } else if (eventIds.some((eventId) => !Hf.isString(eventId) || Hf.isEmpty(eventId))) {
                            Hf.log(`error`, `EventStreamComposite.divert - Factory:${factory.name} input event Id is invalid.`);
                        } else {
                            switch (direction) { // eslint-disable-line
                            case INCOMING_DIRECTION:
                                _divertedIncomingStream = _incomingStream.filter((payload) => {
                                    return eventIds.includes(payload.eventId);
                                }).scan((payloads, payload) => {
                                    payloads.push(payload);
                                    return payloads;
                                }, []).flatMap((payload) => payload);
                                // FIXME: needs to filler out diverted events from main incoming stream.
                                // _incomingStream = _incomingStream.filter((payload) => {
                                //     return eventIds.every((eventId) => eventId !== payload.eventId);
                                // }).share();
                                return _createStreamOperatorFor.call(factory, DIVERTED_INCOMING_DIRECTION);
                            case OUTGOING_DIRECTION:
                                _divertedOutgoingStream = _outgoingStream.filter((payload) => {
                                    return eventIds.includes(payload.eventId);
                                }).scan((payloads, payload) => {
                                    payloads.push(payload);
                                    return payloads;
                                }, []).flatMap((payload) => payload);
                                // FIXME: needs to filler out diverted events from main outgoing stream.
                                // _outgoingStream = _outgoingStream.filter((payload) => {
                                //     return eventIds.every((eventId) => eventId !== payload.eventId);
                                // }).share();
                                return _createStreamOperatorFor.call(factory, DIVERTED_OUTGOING_DIRECTION);
                            case `diversion`:
                                Hf.log(`error`, `EventStreamComposite.divert - Cannot divert a diverted stream.`);
                                break;
                            default:
                                Hf.log(`error`, `EventStreamComposite.divert - Invalid direction:${direction}.`);
                            }
                        }
                    }
                };
                return operator;
            }
            /* ----- Public Functions -------------- */
            /**
             * @description - Check if both outgoing and incoming stream are activated.
             *
             * @method isActivated
             * @return {boolean}
             */
            this.isActivated = function isActivated () {
                return _outgoingStreamActivated && _incomingStreamActivated;
            };
            /**
             * @description - Register factory outgoing event stream to an external observer.
             *
             * @method registerStream
             * @return void
             */
            this.registerStream = function registerStream (definition) {
                const factory = this;
                if (!Hf.isSchema({
                    fId: `string`,
                    connectStream: `function`
                }).of(definition)) {
                    Hf.log(`error`, `EventStreamComposite.registerStream - Factory:${factory.name} input stream definition is invalid.`);
                } else {
                    const {
                        fId,
                        connectStream
                    } = definition;

                    _targetRegistrationCache[fId] = {
                        connectStream
                    };
                    connectStream(_outgoingStream);
                }
            };
            /**
             * @description - Apply incoming event stream operators.
             *
             * @method operateIncomingStream
             * @param {object} - operator
             * @return void
             */
            this.operateIncomingStream = function operateIncomingStream (operator) { // eslint-disable-line
                Hf.log(`warn0`, `EventStreamComposite.operateIncomingStream - Method is not implemented by default. Ignore this warning if intended.`);
            };
            /**
             * @description - Apply outgoing event stream operators.
             *
             * @method operateOutgoingStream
             * @param {object} - operator
             * @return void
             */
            this.operateOutgoingStream = function operateOutgoingStream (operator) { // eslint-disable-line
                Hf.log(`warn0`, `EventStreamComposite.operateOutgoingStream - Method is not implemented by default. Ignore this warning if intended.`);
            };
            /**
             * @description - When there is an outgoing event...
             *
             * @method outgoing
             * @param {array} eventIds
             * @return {object}
             */
            this.outgoing = function outgoing (...eventIds) {
                const factory = this;
                if (Hf.isEmpty(eventIds)) {
                    Hf.log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input eventId array is empty.`);
                } else if (eventIds.some((eventId) => !Hf.isString(eventId) || Hf.isEmpty(eventId))) {
                    Hf.log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input event Id is invalid.`);
                } else {
                    eventIds = eventIds.filter((eventId) => {
                        if (_arbiter.hasOwnProperty(eventId)) {
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
                        delay: function delay (ms) {
                            if (!Hf.isInteger(ms)) {
                                Hf.log(`error`, `EventStreamComposite.outgoing.delay - Input wait time is invalid.`);
                            } else {
                                if (ms < 1) {
                                    ms = 1;
                                    Hf.log(`warn1`, `EventStreamComposite.outgoing.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                                }

                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    if (arbiter.hasOwnProperty(eventId)) {
                                        arbiter[eventId].waitTime = ms;
                                        if (arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        arbiter[eventId] = {
                                            eventDirectionalState: OUTGOING_EVENT,
                                            waitTime: ms,
                                            handler: null,
                                            canceller: null,
                                            relayer: null
                                        };
                                    }
                                    return arbiter;
                                }, _arbiter);
                            }
                            return {
                                emit: outgoingOperator.emit,
                                cancelLatest: outgoingOperator.cancelLatest,
                                interval: outgoingOperator.interval
                            };
                        },
                        /**
                         * @description - At event, and at an interval...
                         *
                         * @method outgoing.interval
                         * @param {number} ms - Period in millisecond
                         * @param {number} lifeSpan - Life time counter of the interval, -1 = indefinite
                         * @return {object}
                         */
                        interval: function interval (ms, lifeSpan = -1) {
                            if (!Hf.isInteger(ms)) {
                                Hf.log(`error`, `EventStreamComposite.outgoing.interval - Input period time is invalid.`);
                            } else {
                                lifeSpan = Hf.isNumeric(lifeSpan) ? lifeSpan : -1;

                                if (ms < 1) {
                                    ms = 1;
                                    Hf.log(`warn1`, `EventStreamComposite.outgoing.interval - Input interval period time should be greater than 0. Reset to 1ms.`);
                                }

                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    if (arbiter.hasOwnProperty(eventId)) {
                                        arbiter[eventId].intervalPeriod = ms;
                                        arbiter[eventId].lifeSpan = lifeSpan;
                                        if (arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        arbiter[eventId] = {
                                            eventDirectionalState: OUTGOING_EVENT,
                                            intervalPeriod: ms,
                                            lifeSpan,
                                            handler: null,
                                            canceller: null,
                                            relayer: null
                                        };
                                    }
                                    return arbiter;
                                }, _arbiter);
                            }
                            return {
                                emit: outgoingOperator.emit
                            };
                        },
                        /**
                         * @description - At event, emit a payload with value to a handler with event Id.
                         *
                         * @method outgoing.emit
                         * @param {function} emitter
                         * @return void
                         */
                        emit: function emit (emitter) {
                            eventIds.map((eventId) => {
                                const payload = {
                                    eventId,
                                    cancelled: false,
                                    value: Hf.isFunction(emitter) ? emitter() : undefined
                                };
                                return payload;
                            }).forEach((payload) => {
                                const {
                                    eventId
                                } = payload;
                                if (!_outgoingStreamActivated) {
                                    _unemitPayloads.push(payload);
                                    Hf.log(`warn0`, `EventStreamComposite.outgoing.emit - Emitting payload with eventId:${eventId} before observer activation.`);
                                } else {
                                    if (_arbiter.hasOwnProperty(eventId)) {
                                        const {
                                            waitTime,
                                            intervalPeriod,
                                            lifeSpan
                                        } = Hf.fallback({
                                            waitTime: 0,
                                            intervalPeriod: 0,
                                            lifeSpan: -1
                                        }).of((_arbiter[eventId]));
                                        let lifeSpanCounter = 0;
                                        let interval;

                                        if (_arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }

                                        if (waitTime > 0 && intervalPeriod > 0) {
                                            setTimeout(() => {
                                                interval = setInterval(() => {
                                                    _streamEmitter.next(payload);
                                                    lifeSpanCounter++;
                                                    if (lifeSpan !== -1 && lifeSpanCounter === lifeSpan) {
                                                        clearInterval(interval);
                                                    }
                                                }, intervalPeriod);
                                            }, waitTime);
                                        } else if (waitTime > 0 && intervalPeriod === 0) {
                                            setTimeout(() => {
                                                _streamEmitter.next(payload);
                                            }, waitTime);
                                        } else if (waitTime === 0 && intervalPeriod > 0) {
                                            interval = setInterval(() => {
                                                _streamEmitter.next(payload);
                                                lifeSpanCounter++;
                                                if (lifeSpan !== -1 && lifeSpanCounter === lifeSpan) {
                                                    clearInterval(interval);
                                                }
                                            }, intervalPeriod);
                                        } else {
                                            _streamEmitter.next(payload);
                                        }
                                    } else {
                                        _arbiter[eventId] = {
                                            eventDirectionalState: OUTGOING_EVENT,
                                            handler: null,
                                            canceller: null,
                                            relayer: null
                                        };
                                        _streamEmitter.next(payload);
                                    }
                                    // Hf.log(`info`, `Factory:${factory.name} is emitting eventIds:[${eventIds}].`);
                                }
                            });
                        },
                        /**
                         * @description - Cancel the latest outgoing events...
                         *
                         * @method outgoing.cancelLatest
                         * @return void
                         */
                        cancelLatest: function cancelLatest () {
                            eventIds.map((eventId) => {
                                const payload = {
                                    eventId,
                                    cancelled: true,
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
                                    if (_arbiter.hasOwnProperty(eventId)) {
                                        const {
                                            waitTime,
                                            intervalPeriod
                                        } = Hf.fallback({
                                            waitTime: 0,
                                            intervalPeriod: 0
                                        }).of((_arbiter[eventId]));
                                        if (_arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                        if (waitTime > 0 && intervalPeriod > 0) {
                                            setTimeout(() => {
                                                setInterval(() => {
                                                    _streamEmitter.next(payload);
                                                }, intervalPeriod);
                                            }, waitTime);
                                        } else if (waitTime > 0 && intervalPeriod === 0) {
                                            setTimeout(() => {
                                                _streamEmitter.next(payload);
                                            }, waitTime);
                                        } else if (waitTime === 0 && intervalPeriod > 0) {
                                            setInterval(() => {
                                                _streamEmitter.next(payload);
                                            }, intervalPeriod);
                                        } else {
                                            _streamEmitter.next(payload);
                                        }
                                    } else {
                                        Hf.log(`warn1`, `EventStreamComposite.outgoing.cancelLatest - Cancelling payload with eventId:${eventId} before emitting.`);
                                    }
                                    // Hf.log(`info`, `Factory:${factory.name} is cancelling eventIds:[${eventIds}].`);
                                }
                            });
                        }
                    };
                    return outgoingOperator;
                }
            };
            /**
             * @description - When there is an incoming event...
             *
             * @method incoming
             * @param {array} eventIds
             * @return {object}
             */
            this.incoming = function incoming (...eventIds) {
                const factory = this;
                if (Hf.isEmpty(eventIds)) {
                    Hf.log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input eventId array is empty.`);
                } else if (eventIds.some((eventId) => !Hf.isString(eventId) || Hf.isEmpty(eventId))) {
                    Hf.log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input event Id is invalid.`);
                } else {
                    eventIds = eventIds.filter((eventId) => {
                        if (_arbiter.hasOwnProperty(eventId)) {
                            return _arbiter[eventId].eventDirectionalState !== REPEATED_EVENT;
                        }
                        return true;
                    });
                    const incomingOperator = {
                        /**
                         * @description - At event,  and after delay for some time...
                         *
                         * @method incoming.delay
                         * @param {number} ms
                         * @return {object}
                         */
                        delay: function delay (ms) {
                            if (!Hf.isInteger(ms)) {
                                Hf.log(`error`, `EventStreamComposite.incoming.delay - Input wait time is invalid.`);
                            } else {
                                if (ms < 1) {
                                    ms = 1;
                                    Hf.log(`warn1`, `EventStreamComposite.incoming.delay - Input delay time should be greater than 0. Reset to 1ms.`);
                                }

                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    if (arbiter.hasOwnProperty(eventId)) {
                                        arbiter[eventId].waitTime = ms;
                                        if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                            arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        arbiter[eventId] = {
                                            eventDirectionalState: INCOMING_EVENT,
                                            waitTime: ms,
                                            handler: null,
                                            canceller: null,
                                            relayer: null
                                        };
                                    }
                                    return arbiter;
                                }, _arbiter);
                            }
                            return {
                                asPromised: incomingOperator.asPromised,
                                await: incomingOperator.await,
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
                        asPromised: function asPromised () {
                            if (eventIds.length === 1) {
                                // return new Promise((resolve) => {
                                //     incomingOperator.handle((value) => {
                                //         resolve(value);
                                //     });
                                // });
                                const [ eventId ] = eventIds;
                                return new Promise((resolve) => {
                                    if (_arbiter.hasOwnProperty(eventId)) {
                                        _arbiter[eventId].handler = (value) => resolve(value);
                                        if (_arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                            _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        _arbiter[eventId] = {
                                            eventDirectionalState: INCOMING_EVENT,
                                            handler: (value) => resolve(value),
                                            canceller: null,
                                            relayer: null
                                        };
                                    }
                                });
                            }
                            return eventIds.map((eventId) => {
                                return new Promise((resolve) => {
                                    if (_arbiter.hasOwnProperty(eventId)) {
                                        _arbiter[eventId].handler = (value) => resolve(value);
                                        if (_arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                            _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        _arbiter[eventId] = {
                                            eventDirectionalState: INCOMING_EVENT,
                                            handler: (value) => resolve(value),
                                            canceller: null,
                                            relayer: null
                                        };
                                    }
                                });
                            });
                        },
                        /**
                         * @description - Wait for all events to arrive...
                         *
                         * @method incoming.await
                         * @param {number} ms
                         * @param {function} timeoutError - Time out error callback
                         * @return {object}
                         */
                        await: function _await (ms = 0, timeoutError = () => {}) {
                            if (eventIds.length > 1) {
                                let sideSubscription;
                                let sideStream = Rx.Observable.never();
                                let timeout = null;
                                const awaitedEventId = eventIds.reduce((_awaitedEventId, eventId) => {
                                    return Hf.isEmpty(_awaitedEventId) ? eventId : `${_awaitedEventId},${eventId}`;
                                }, ``);
                                const incomingAWaitOperator = factory.incoming(awaitedEventId);
                                const sideObserver = Rx.Subscriber.create(
                                    /**
                                     * @description - On subscription to next incoming side value...
                                     *
                                     * @method next
                                     * @param {object} awaitedPayloadBundle
                                     * @return void
                                     */
                                    function next (awaitedPayloadBundle) {
                                        const awaitedBundleEventIds = Object.keys(awaitedPayloadBundle).filter((eventId) => !awaitedPayloadBundle[eventId].cancelled);
                                        const cancelledBundleEventIds = Object.keys(awaitedPayloadBundle).filter((eventId) => awaitedPayloadBundle[eventId].cancelled);

                                        if (awaitedBundleEventIds.toString() === eventIds.toString()) {
                                            if (Hf.isNumeric(timeout)) {
                                                clearTimeout(timeout);
                                            }
                                            factory.outgoing(awaitedEventId).emit(() => {
                                                return awaitedBundleEventIds.map((awaitedBundleEventId) => awaitedPayloadBundle[awaitedBundleEventId].value);
                                            });
                                        }

                                        if (!Hf.isEmpty(cancelledBundleEventIds)) {
                                            cancelledBundleEventIds.forEach(() => {
                                                factory.outgoing(awaitedEventId).cancelLatest();
                                            });
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
                                        if (Hf.isNumeric(timeout)) {
                                            clearTimeout(timeout);
                                        }
                                        Hf.log(`error`, `EventStreamComposite.incoming.await.error - Side subscription error. ${errorMessage}`);
                                    },
                                    /**
                                     * @description - On subscription to side completion...
                                     *
                                     * @method complete
                                     * @return void
                                     */
                                    function complete () {
                                        if (Hf.isNumeric(timeout)) {
                                            clearTimeout(timeout);
                                        }
                                        sideSubscription.unsubscribe();
                                        Hf.log(`info`, `Side subscription completed.`);
                                    }
                                );

                                ms = Hf.isNumeric(ms) ? ms : 0;
                                timeoutError = Hf.isFunction(timeoutError) ? timeoutError : () => {};

                                if (ms > 1) {
                                    timeout = setTimeout(() => timeoutError(), ms);
                                }

                                sideStream = _incomingStream.filter((payload) => {
                                    return eventIds.includes(payload.eventId);
                                }).scan((awaitedPayloadBundle, payload) => {
                                    awaitedPayloadBundle[payload.eventId] = {
                                        cancelled: payload.cancelled,
                                        value: payload.value
                                    };
                                    return awaitedPayloadBundle;
                                }, {}).share();

                                sideSubscription = sideStream.subscribe(sideObserver);

                                return {
                                    // asPromised: incoming.asPromised,
                                    handle: incomingAWaitOperator.handle,
                                    forward: incomingAWaitOperator.forward
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
                        handle: function handle (handler) {
                            if (!Hf.isFunction(handler)) {
                                Hf.log(`error`, `EventStreamComposite.incoming.handle - Factory:${factory.name} input handler is invalid.`);
                            } else {
                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    if (arbiter.hasOwnProperty(eventId)) {
                                        arbiter[eventId].handler = handler;
                                        if (arbiter[eventId].eventDirectionalState === OUTGOING_EVENT) {
                                            arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        arbiter[eventId] = {
                                            eventDirectionalState: INCOMING_EVENT,
                                            handler,
                                            canceller: null,
                                            relayer: null
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
                                    relay: function relay (...relayEventIds) {
                                        if (Hf.isEmpty(relayEventIds)) {
                                            Hf.log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input event Id array is empty.`);
                                        } else if (relayEventIds.some((relayEventId) => !Hf.isString(relayEventId) || Hf.isEmpty(relayEventId))) {
                                            Hf.log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input event Id is invalid.`);
                                        } else {
                                            relayEventIds = relayEventIds.filter((relayEventId) => {
                                                if (eventIds.includes(relayEventId)) {
                                                    /* relaying the same eventIds will cause infinite loop error */
                                                    Hf.log(`warn1`, `EventStreamComposite.incoming.handle.relay - Cannot relay the same eventId:${relayEventId}.`);
                                                    return false;
                                                }
                                                return true;
                                            });
                                            _arbiter = eventIds.reduce((arbiter, eventId) => {
                                                arbiter[eventId].eventDirectionalState = RELAY_EVENT;
                                                arbiter[eventId].relayer = (handledValue, cancelled) => {
                                                    if (!cancelled) {
                                                        factory.outgoing(...relayEventIds).emit(() => handledValue);
                                                    } else {
                                                        factory.outgoing(...relayEventIds).cancelLatest();
                                                    }
                                                    // Hf.log(`info`, `Factory:${factory.name} is relaying eventIds:[${relayEventIds}].`);
                                                };
                                                return arbiter;
                                            }, _arbiter);
                                        }
                                    },
                                    /**
                                     * @description - At any event, complete and end the event with Id.
                                     *
                                     * @method incoming.handle.complete
                                     * @return void
                                     */
                                    complete: function complete () {
                                        _arbiter = eventIds.reduce((arbiter, eventId) => {
                                            arbiter[eventId].completed = true;
                                            return arbiter;
                                        }, _arbiter);
                                        // Hf.log(`info`, `Factory:${factory.name} is completing eventIds:[${eventIds}].`);
                                    }
                                };
                            }
                        },
                        /**
                         * @description - At event, repeat event of unhandled payload as a new event.
                         *
                         * @method incoming.repeat
                         * @return {object}
                         */
                        repeat: function repeat () {
                            // TODO: use Rx.Observable.repeat?
                            _arbiter = eventIds.reduce((arbiter, eventId) => {
                                if (arbiter.hasOwnProperty(eventId)) {
                                    arbiter[eventId].eventDirectionalState = REPEATING_EVENT;
                                    arbiter[eventId].handler = (value) => value;
                                    arbiter[eventId].relayer = (handledValue, cancelled) => {
                                        if (!cancelled) {
                                            factory.outgoing(eventId).emit(() => handledValue);
                                        } else {
                                            factory.outgoing(eventId).cancelLatest();
                                        }
                                        // Hf.log(`info`, `Factory:${factory.name} is repeating eventIds:[${eventId}].`);
                                    };
                                } else {
                                    arbiter[eventId] = {
                                        eventDirectionalState: REPEATING_EVENT,
                                        handler: (value) => value,
                                        canceller: null,
                                        relayer: (handledValue, cancelled) => {
                                            if (!cancelled) {
                                                factory.outgoing(eventId).emit(() => handledValue);
                                            } else {
                                                factory.outgoing(eventId).cancelLatest();
                                            }
                                            // Hf.log(`info`, `Factory:${factory.name} is repeating eventIds:[${eventId}].`);
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
                         * @return {void}
                         */
                        forward: function forward (...forwardEventIds) {
                            if (Hf.isEmpty(forwardEventIds)) {
                                Hf.log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input eventId array is empty.`);
                            } else if (forwardEventIds.some((forwardEventId) => !Hf.isString(forwardEventId) || Hf.isEmpty(forwardEventId))) {
                                Hf.log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input event Id is invalid.`);
                            } else {
                                forwardEventIds = forwardEventIds.filter((forwardEventId) => {
                                    if (eventIds.includes(forwardEventId)) {
                                        /* forwarding the same eventIds will cause infinite loop error */
                                        Hf.log(`warn1`, `EventStreamComposite.incoming.forward - Cannot forward the same eventId:${forwardEventId}.`);
                                        return false;
                                    }
                                    return true;
                                });
                                incomingOperator.handle((value) => value).relay(...forwardEventIds);
                            }
                        }
                    };
                    return incomingOperator;
                }
            };
            /**
             * @description - Start the incoming event stream subscription.
             *
             * @method activateIncomingStream
             * @param {object} option
             * @return void
             */
            this.activateIncomingStream = function activateIncomingStream (option = {}) {
                const factory = this;
                let {
                    forceBufferingOnAllIncomingStreams,
                    bufferTimeSpan,
                    bufferTimeShift
                } = Hf.fallback({
                    forceBufferingOnAllIncomingStreams: false,
                    bufferTimeSpan: 1,
                    bufferTimeShift: 1
                }).of(option);

                if (!_incomingStreamActivated) {
                    if (!Hf.isDefined(_observer)) {
                        /* creating factory event stream observer */
                        _observer = Rx.Subscriber.create(
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
                            Hf.log(`warn1`, `EventStreamComposite.activateIncomingStream - Input buffer time span option should be greater than 0. Reset to 1ms.`);
                        }
                        if (bufferTimeShift < 1) {
                            bufferTimeShift = 1;
                            Hf.log(`warn1`, `EventStreamComposite.activateIncomingStream - Input buffer time shift option should be greater than 0. Reset to 1ms.`);
                        }
                        _incomingSubscription = _incomingStream.bufferTime(bufferTimeSpan, bufferTimeShift).filter((payloads) => {
                            return !Hf.isEmpty(payloads);
                        }).flatMap((payload) => payload).subscribe(_observer);
                    } else {
                        _incomingSubscription = _incomingStream.subscribe(_observer);
                    }
                    _incomingStreamActivated = true;
                } else {
                    Hf.log(`warn0`, `EventStreamComposite.activateIncomingStream - Incoming event stream subscription is already activated.`);
                }
            };
            /**
             * @description - Start the outgoing event stream subscription.
             *
             * @method activateOutgoingStream
             * @param {object} option
             * @return void
             */
            this.activateOutgoingStream = function activateOutgoingStream (option = {}) {
                const factory = this;
                let {
                    forceBufferingOnAllOutgoingStreams,
                    bufferTimeSpan,
                    bufferTimeShift
                } = Hf.fallback({
                    forceBufferingOnAllOutgoingStreams: false,
                    bufferTimeSpan: 1,
                    bufferTimeShift: 1
                }).of(option);

                if (!_outgoingStreamActivated) {
                    if (!Hf.isDefined(_observer)) {
                        /* creating factory event stream observer */
                        _observer = Rx.Subscriber.create(
                            _next,
                            _error,
                            _complete
                        );
                    }
                    /* first do operations on the outgoing event stream */
                    factory.operateOutgoingStream(_createStreamOperatorFor.call(factory, OUTGOING_DIRECTION));
                    /* then do outgoing event stream subscriptions */
                    if (forceBufferingOnAllOutgoingStreams) {
                        if (bufferTimeSpan < 1) {
                            bufferTimeSpan = 1;
                            Hf.log(`warn1`, `EventStreamComposite.activateOutgoingStream - Input buffer time span option should be greater than 0. Reset to 1ms.`);
                        }
                        if (bufferTimeShift < 1) {
                            bufferTimeShift = 1;
                            Hf.log(`warn1`, `EventStreamComposite.activateOutgoingStream - Input buffer time shift option should be greater than 0. Reset to 1ms.`);
                        }
                        _outgoingSubscription = _outgoingStream.bufferTime(bufferTimeSpan, bufferTimeShift).filter((payloads) => {
                            return !Hf.isEmpty(payloads);
                        }).flatMap((payload) => payload).subscribe(_observer);
                    } else {
                        _outgoingSubscription = _outgoingStream.subscribe(_observer);
                    }
                    _outgoingStreamActivated = true;

                    /* emit all the un-emitted payloads that were pushed to queue before activation */
                    _unemitPayloads.forEach((unemitPayload) => {
                        const {
                            eventId,
                            value
                        } = unemitPayload;
                        // FIXME: unemitPayloads are being emitted multiple times.
                        factory.outgoing(eventId).emit(() => value);
                    });
                    Hf.clear(_unemitPayloads);
                } else {
                    Hf.log(`warn0`, `EventStreamComposite.activateOutgoingStream - Outgoing event stream subscription is already activated.`);
                }
            };
            /**
             * @description - Stop the incoming event stream by disposing subscription.
             *
             * @method deactivateIncomingStream
             * @return void
             */
            this.deactivateIncomingStream = function deactivateIncomingStream () {
                if (_incomingStreamActivated) {
                    _incomingSubscription.unsubscribe();
                    _incomingSubscription = undefined;
                    _observer = undefined;
                    _incomingStream = undefined;
                    _divertedIncomingStream = undefined;

                    Hf.clear(_arbiter);
                    Hf.clear(_targetRegistrationCache);

                    _incomingStream = Rx.Observable.never();
                    _divertedIncomingStream = Rx.Observable.never();

                    _incomingStreamActivated = false;
                } else {
                    Hf.log(`warn0`, `EventStreamComposite.deactivateIncomingStream - Incoming event stream subscription is not activated.`);
                }
            };
            /**
             * @description - Stop the outgoing event stream by disposing subscription.
             *
             * @method deactivateOutgoingStream
             * @return void
             */
            this.deactivateOutgoingStream = function deactivateOutgoingStream () {
                if (_outgoingStreamActivated) {
                    _streamEmitter.complete();
                    _outgoingSubscription.unsubscribe();
                    _outgoingSubscription = undefined;
                    _observer = undefined;
                    _streamEmitter = undefined;
                    _outgoingStream = undefined;
                    _divertedOutgoingStream = undefined;

                    Hf.clear(_arbiter);
                    Hf.clear(_targetRegistrationCache);
                    Hf.clear(_unemitPayloads);

                    _streamEmitter = new Rx.Subject();
                    /* converting event stream emitter as a subject to an observable */
                    _outgoingStream = _streamEmitter.asObservable();
                    _divertedOutgoingStream = Rx.Observable.never();

                    _outgoingStreamActivated = false;
                } else {
                    Hf.log(`warn0`, `EventStreamComposite.deactivateOutgoingStream - Outgoing event stream subscription is not activated.`);
                }
            };
            /**
             * @description - Do subscription on the external incoming event stream sources.
             *
             * @method observe
             * @param {array} sources
             * @return {object}
             */
            this.observe = function observe (...sources) {
                const factory = this;
                if (Hf.isEmpty(sources)) {
                    Hf.log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source array is empty.`);
                } else if (sources.some((source) => {
                    return !Hf.isSchema({
                        name: `string`,
                        registerStream: `function`
                    }).of(source);
                })) {
                    Hf.log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source objects are invalid.`);
                } else {
                    sources.map((source) => {
                        /**
                         * @description -
                         *
                         * @method connectStream
                         * @return void
                         */
                        const connectStream = function (sourceOutgoingStream) {
                            if (!Hf.isDefined(sourceOutgoingStream)) {
                                Hf.log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source objects are invalid.`);
                            } else {
                                /* merge all external incoming event streams into one */
                                _incomingStream = Rx.Observable.merge(sourceOutgoingStream, _incomingStream).share();
                            }
                        };
                        source.registerStream({
                            fId: factory.fId,
                            connectStream: connectStream.bind(source)
                        });
                    });

                    return _createStreamOperatorFor.call(factory, INCOMING_DIRECTION);
                }
            };
        }
    }
});
