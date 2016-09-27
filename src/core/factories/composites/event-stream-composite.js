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
 */
'use strict'; // eslint-disable-line

/* load Rx dependency */
import Rx from 'rx';

/* load tranducer dependency */
import Transducer from 'transducers-js';

import CompositeElement from '../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../elements/common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE,
    DOMAIN_FACTORY_CODE,
    INTERFACE_FACTORY_CODE,
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

const INCOMING_EVENT = 0;
const OUTGOING_EVENT = 1;
const RELAY_EVENT = 2;
const REPEATING_EVENT = 3;
const REPEATED_EVENT = 4;
const LOOPBACK_EVENT = 5;

/* default initial delay to all incoming event stream */
// const DEFAULT_INCOMING_EVENT_STREAM_DELAY_IN_MS = 10;

/**
 * @description - A reactive event stream composite module.
 *
 * @module EventStreamComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized composite.
         *
         * @method $initEventStreamComposite
         * @return void
         */
        $initEventStreamComposite: function $initEventStreamComposite () {
            const factory = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    fId: `string`,
                    name: `string`
                }).of(factory) || !(factory.fId.substr(0, FIXTURE_FACTORY_CODE.length) === FIXTURE_FACTORY_CODE ||
                                    factory.fId.substr(0, DOMAIN_FACTORY_CODE.length) === DOMAIN_FACTORY_CODE ||
                                    factory.fId.substr(0, INTERFACE_FACTORY_CODE.length) === INTERFACE_FACTORY_CODE ||
                                    factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hflow.log(`error`, `EventStreamComposite.$init - Factory is invalid. Cannot apply composite.`);
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

            let _incomingSubscription;
            let _outgoingSubscription;
            /* creating factory event stream emitter */
            let _streamEmitter = new Rx.Subject();
            /* creating factory incoming and outgoing event stream */
            let _incomingStream = Rx.Observable.never();
            /* converting event stream emitter as a subject to an observable */
            let _outgoingStream = _streamEmitter.asObservable();

            /* creating factory event stream observer */
            const _observer = Rx.Observer.create(
                /**
                 * @description - On subscription to next incoming payload...
                 *
                 * @method onNext
                 * @param {object} payload
                 * @return void
                 */
                function onNext (payload) {
                    if (Hflow.isSchema({
                        eventId: `string`
                    }).of(payload)) {
                        const {
                            eventId,
                            value
                        } = payload;
                        if (_arbiter.hasOwnProperty(eventId)) {
                            const {
                                eventDirectionalState,
                                completed,
                                waitTime,
                                handler,
                                relayer
                            } = Hflow.fallback({
                                completed: false,
                                waitTime: 0
                            }).of((_arbiter[eventId]));
                            if (eventDirectionalState !== REPEATED_EVENT) {
                                if (eventDirectionalState === REPEATING_EVENT) {
                                    _arbiter[eventId].eventDirectionalState = REPEATED_EVENT;
                                }
                                if (waitTime > 0) {
                                    setTimeout(() => {
                                        const handledValue = Hflow.isFunction(handler) ? handler(value) : undefined;
                                        if (Hflow.isFunction(relayer)) {
                                            relayer(handledValue);
                                        }
                                        if (completed) {
                                            _arbiter[eventId] = undefined;
                                            delete _arbiter[eventId];
                                        }
                                    }, waitTime);
                                } else {
                                    const handledValue = Hflow.isFunction(handler) ? handler(value) : undefined;
                                    if (Hflow.isFunction(relayer)) {
                                        relayer(handledValue);
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
                        Hflow.log(`error`, `EventStreamComposite.onNext - Payload event Id is invalid.`);
                    }
                },
                /**
                 * @description - On subscription to error...
                 *
                 * @method onError
                 * @param {string} error
                 * @return void
                 */
                function onError (error) {
                    Hflow.log(`error`, `EventStreamComposite.onError - Subscription error. ${error.message}`);
                },
                /**
                 * @description - On subscription to completion...
                 *
                 * @method onCompleted
                 * @return void
                 */
                function onCompleted () {
                    Hflow.log(`info`, `Subscription completed.`);
                }
            );

            /* a queue for payloads emitted before activation */
            let _unemitPayloads = [];

            /* ----- Private FUnctions ------------- */
            /**
             * @description - Helper function to create stream operator object.
             *
             * @method _createStreamOperatorFor
             * @param {string} direction
             * @return {object}
             */
            function _createStreamOperatorFor (direction) {
                if (!Hflow.isString(direction)) {
                    Hflow.log(`error`, `EventStreamComposite._createStreamOperatorFor - Input event stream direction is invalid.`);
                } else {
                    const operator = {
                        /**
                         * @description - At observable stream, operates delay.
                         *
                         * @method delay
                         * @param {number} ms - Time in millisecond
                         * @return {object}
                         */
                        delay: function delay (ms) {
                            if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.delay - Input delay time is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.delay(ms).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.delay(ms).share();
                                    break;
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
                            if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.debounce - Input debounce time is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.debounce(ms).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.debounce(ms).share();
                                    break;
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
                            if (!Hflow.isFunction(predicate)) {
                                Hflow.log(`error`, `EventStreamComposite.filter - Input filter predicate function is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.filter(predicate).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.filter(predicate).share();
                                    break;
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
                            if (!Hflow.isFunction(selector)) {
                                Hflow.log(`error`, `EventStreamComposite.map - Input map selector function is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.select(selector).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.select(selector).share();
                                    break;
                                }
                            }
                            return operator;
                        },
                        /**
                         * @description - At observable stream, operates flatten and map.
                         *
                         * @method flatMap
                         * @param {function} selector
                         * @return {object}
                         */
                        flatMap: function flatMap (selector) {
                            if (!Hflow.isFunction(selector)) {
                                Hflow.log(`error`, `EventStreamComposite.flatMap - Input flat map selector function is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.selectMany(selector).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.selectMany(selector).share();
                                    break;
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
                            if (!Hflow.isFunction(accumulator)) {
                                Hflow.log(`error`, `EventStreamComposite.reduce - Input reduce accumulator function is invalid.`);
                            } else {
                                if (Hflow.isObject(defaultPayload)) {
                                    if (Hflow.isSchema({
                                        eventId: `string`
                                    }).of(defaultPayload)) {
                                        Hflow.log(`error`, `EventStreamComposite.reduce - Payload event Id is invalid.`);
                                    } else {
                                        switch (direction) { // eslint-disable-line
                                        case `incoming`:
                                            _incomingStream = _incomingStream.reduce(accumulator, defaultPayload).share();
                                            break;
                                        case `outgoing`:
                                            _outgoingStream = _outgoingStream.reduce(accumulator, defaultPayload).share();
                                            break;
                                        }
                                    }
                                } else {
                                    switch (direction) { // eslint-disable-line
                                    case `incoming`:
                                        _incomingStream = _incomingStream.reduce(accumulator).share();
                                        break;
                                    case `outgoing`:
                                        _outgoingStream = _outgoingStream.reduce(accumulator).share();
                                        break;
                                    }
                                }
                            }
                            return operator;
                        },
                        /**
                         * @description - At observable stream, operates a transducer on the entire stream.
                         *
                         * @method transduce
                         * @param {function} selector
                         * @param {function} predicate
                         * @return {object}
                         */
                        transduce: function transduce (selector, predicate) {
                            if (!Hflow.isFunction(selector)) {
                                Hflow.log(`error`, `EventStreamComposite.transduce - Input map selector function is invalid.`);
                            } else if (!Hflow.isFunction(predicate)) {
                                Hflow.log(`error`, `EventStreamComposite.transduce - Input filter predicate function is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.transduce(Transducer.comp(
                                        Transducer.map(selector),
                                        Transducer.filter(predicate)
                                    )).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.transduce(Transducer.comp(
                                        Transducer.map(selector),
                                        Transducer.filter(predicate)
                                    )).share();
                                    break;
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
                                if (!Hflow.isSchema({
                                    eventId: `string`
                                }).of(payload)) {
                                    Hflow.log(`error`, `EventStreamComposite.startWith - Payload event Id is invalid.`);
                                    return false;
                                }
                                return true;
                            })) {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.startWith(...payloads).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.startWith(...payloads).share();
                                    break;
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
                            if (!Hflow.isInteger(count)) {
                                Hflow.log(`error`, `EventStreamComposite.takeLast - Input count number is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.takeLast(count).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.takeLast(count).share();
                                    break;
                                }
                            }
                            return operator;
                        },
                        /**
                         * @description - At observable stream, operates a timeout on the entire stream.
                         *
                         * @method timeout
                         * @param {object} timeoutPayload
                         * @param {numeric} ms
                         * @return {object}
                         */
                        timeout: function timeout (timeoutPayload, ms) {
                            if (!Hflow.isSchema({
                                eventId: `string`
                            }).of(timeoutPayload)) {
                                Hflow.log(`error`, `EventStreamComposite.timeout - Input timeout payload is invalid.`);
                            } else if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.timeout - Input timeout is invalid.`);
                            } else {
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.timeout(ms, Rx.Observable.just(timeoutPayload)).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.timeout(ms, Rx.Observable.just(timeoutPayload)).share();
                                    break;
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
                        monitor: function monitor (logger = {}) {
                            if (!Hflow.isSchema({
                                logOnNext: `function`
                            }).of(logger)) {
                                Hflow.log(`error`, `EventStreamComposite.monitor - Input logger object is invalid.`);
                            } else {
                                const {
                                    logOnNext,
                                    logOnError,
                                    logOnComplete
                                } = Hflow.fallback({
                                    /**
                                     * @description - On subscription to error...
                                     *
                                     * @method logOnError
                                     * @param {string} error
                                     * @return void
                                     */
                                    logOnError: function logOnError (error) {
                                        Hflow.log(`error`, `EventStreamComposite.monitor.logOnError - ${error.message}`);
                                    },
                                    /**
                                     * @description - On subscription to completion...
                                     *
                                     * @method logOnComplete
                                     * @return void
                                     */
                                    logOnComplete: function logOnComplete () {
                                        Hflow.log(`info`, `Complete side subscription.`);
                                    }
                                }).of(logger);
                                /* using a side observer for monitoring */
                                const sideObserver = Rx.Observer.create(
                                    logOnNext,
                                    logOnError,
                                    logOnComplete
                                );
                                switch (direction) { // eslint-disable-line
                                case `incoming`:
                                    _incomingStream = _incomingStream.tap(sideObserver).share();
                                    break;
                                case `outgoing`:
                                    _outgoingStream = _outgoingStream.tap(sideObserver).share();
                                    break;
                                }
                            }
                            return operator;
                        }
                    };
                    return operator;
                }
            }

            /* ----- Public Functions -------------- */
            /**
             * @description - Get factory outgoing event stream.
             *
             * @method getStream
             * @return {object}
             */
            this.getStream = function getStream () {
                return _outgoingStream;
            };
            /**
             * @description - Apply incoming event stream operators.
             *
             * @method operateIncomingStream
             * @param {object} - operator
             * @return void
             */
            this.operateIncomingStream = function operateIncomingStream (operator) { // eslint-disable-line
                Hflow.log(`warn0`, `EventStreamComposite.operateIncomingStream - Method is not implemented by default. Ignore this warning if intended.`);
            };
            /**
             * @description - Apply outgoing event stream operators.
             *
             * @method operateOutgoingStream
             * @param {object} - operator
             * @return void
             */
            this.operateOutgoingStream = function operateOutgoingStream (operator) { // eslint-disable-line
                Hflow.log(`warn0`, `EventStreamComposite.operateOutgoingStream - Method is not implemented by default. Ignore this warning if intended.`);
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
                if (Hflow.isEmpty(eventIds)) {
                    Hflow.log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input eventId array is empty.`);
                } else if (eventIds.some((eventId) => !Hflow.isString(eventId))) {
                    Hflow.log(`error`, `EventStreamComposite.outgoing - Factory:${factory.name} input event Id is invalid.`);
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
                            if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.outgoing.delay - Input wait time is invalid.`);
                            } else {
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
                                            relayer: null
                                        };
                                    }
                                    return arbiter;
                                }, _arbiter);
                            }
                            return {
                                emit: outgoingOperator.emit,
                                interval: outgoingOperator.interval
                            };
                        },
                        /**
                         * @description - At event, and at an interval...
                         *
                         * @method outgoing.interval
                         * @param {number} ms - Period in millisecond
                         * @return {object}
                         */
                        interval: function interval (ms) {
                            if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.outgoing.interval - Input period time is invalid.`);
                            } else {
                                _arbiter = eventIds.reduce((arbiter, eventId) => {
                                    if (arbiter.hasOwnProperty(eventId)) {
                                        arbiter[eventId].intervalPeriod = ms;
                                        if (arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                    } else {
                                        arbiter[eventId] = {
                                            eventDirectionalState: OUTGOING_EVENT,
                                            intervalPeriod: ms,
                                            handler: null,
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
                                    value: Hflow.isFunction(emitter) ? emitter() : undefined
                                };
                                return payload;
                            }).forEach((payload) => {
                                const {
                                    eventId
                                } = payload;
                                if (!_outgoingStreamActivated) {
                                    if (!_unemitPayloads.some((unemitPayload) => unemitPayload.eventId === eventId)) {
                                        _unemitPayloads.push(payload);
                                    }
                                    Hflow.log(`warn0`, `EventStreamComposite.outgoing.emit - Emitting payload with eventId:${eventId} before observer activation.`);
                                } else {
                                    if (_arbiter.hasOwnProperty(eventId)) {
                                        const {
                                            waitTime,
                                            intervalPeriod
                                        } = Hflow.fallback({
                                            waitTime: 0,
                                            intervalPeriod: 0
                                        }).of((_arbiter[eventId]));
                                        if (_arbiter[eventId].eventDirectionalState === INCOMING_EVENT) {
                                            _arbiter[eventId].eventDirectionalState = LOOPBACK_EVENT;
                                        }
                                        if (waitTime > 0 && intervalPeriod > 0) {
                                            setTimeout(() => {
                                                setInterval(() => {
                                                    _streamEmitter.onNext(payload);
                                                }, intervalPeriod);
                                            }, waitTime);
                                        } else if (waitTime > 0 && intervalPeriod <= 0) {
                                            setTimeout(() => {
                                                _streamEmitter.onNext(payload);
                                            }, waitTime);
                                        } else if (waitTime <= 0 && intervalPeriod > 0) {
                                            setInterval(() => {
                                                _streamEmitter.onNext(payload);
                                            }, intervalPeriod);
                                        } else {
                                            _streamEmitter.onNext(payload);
                                        }
                                    } else {
                                        _arbiter[eventId] = {
                                            eventDirectionalState: OUTGOING_EVENT,
                                            handler: null,
                                            relayer: null
                                        };
                                        _streamEmitter.onNext(payload);
                                    }
                                    Hflow.log(`info`, `Factory:${factory.name} is emitting eventIds:[${eventIds}].`);
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
                if (Hflow.isEmpty(eventIds)) {
                    Hflow.log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input eventId array is empty.`);
                } else if (eventIds.some((eventId) => !Hflow.isString(eventId))) {
                    Hflow.log(`error`, `EventStreamComposite.incoming - Factory:${factory.name} input event Id is invalid.`);
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
                            if (!Hflow.isInteger(ms)) {
                                Hflow.log(`error`, `EventStreamComposite.incoming.delay - Input wait time is invalid.`);
                            } else {
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
                                const eventId = eventIds[0];
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
                         * @return {object}
                         */
                        await: function await () {
                            if (eventIds.length > 1) {
                                let sideSubscription;
                                const awaitedEventId = eventIds.reduce((_awaitedEventId, eventId) => {
                                    return Hflow.isEmpty(_awaitedEventId) ? eventId : `${_awaitedEventId}-&-${eventId}`;
                                }, ``);
                                const incomingAWaitOperator = factory.incoming(awaitedEventId);
                                const sideObserver = Rx.Observer.create(
                                    /**
                                     * @description - On subscription to next incoming side value...
                                     *
                                     * @method onNext
                                     * @param {object} payloadBundle
                                     * @return void
                                     */
                                    function onNext (payloadBundle) {
                                        if (Object.keys(payloadBundle).length === eventIds.length) {
                                            factory.outgoing(awaitedEventId).emit(() => Hflow.collect(payloadBundle, ...eventIds));
                                        }
                                    },
                                    /**
                                     * @description - On subscription to side error...
                                     *
                                     * @method onError
                                     * @param {string} error
                                     * @return void
                                     */
                                    function onError (error) {
                                        Hflow.log(`error`, `EventStreamComposite.incoming.await.onError - Side subscription error. ${error.message}`);
                                    },
                                    /**
                                     * @description - On subscription to side completion...
                                     *
                                     * @method onCompleted
                                     * @return void
                                     */
                                    function onCompleted () {
                                        sideSubscription.dispose();
                                        Hflow.log(`info`, `Side subscription completed.`);
                                    }
                                );
                                sideSubscription = _incomingStream.filter((payload) => {
                                    return eventIds.some((eventId) => eventId === payload.eventId);
                                }).scan((payloadBundle, payload) => {
                                    payloadBundle[payload.eventId] = payload.value;
                                    return payloadBundle;
                                }, {}).share().subscribe(sideObserver);

                                return {
                                    handle: incomingAWaitOperator.handle,
                                    forward: incomingAWaitOperator.forward
                                };
                            }
                            return {
                                handle: incomingOperator.handle,
                                repeat: incomingOperator.repeat,
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
                            if (!Hflow.isFunction(handler)) {
                                Hflow.log(`error`, `EventStreamComposite.incoming.handle - Factory:${factory.name} input handler is invalid.`);
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
                                        if (Hflow.isEmpty(relayEventIds)) {
                                            Hflow.log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input event Id array is empty.`);
                                        } else if (relayEventIds.some((relayEventId) => !Hflow.isString(relayEventId))) {
                                            Hflow.log(`error`, `EventStreamComposite.incoming.handle.relay - Factory:${factory.name} input event Id is invalid.`);
                                        } else {
                                            relayEventIds = relayEventIds.filter((relayEventId) => {
                                                if (eventIds.some((eventId) => eventId === relayEventId)) {
                                                    /* relaying the same eventIds will cause infinite loop error */
                                                    Hflow.log(`warn1`, `EventStreamComposite.incoming.handle.relay - Cannot relay the same eventId:${relayEventId}.`);
                                                    return false;
                                                }
                                                return true;
                                            });
                                            _arbiter = eventIds.reduce((arbiter, eventId) => {
                                                arbiter[eventId].eventDirectionalState = RELAY_EVENT;
                                                arbiter[eventId].relayer = (handledValue) => {
                                                    factory.outgoing(...relayEventIds).emit(() => handledValue);
                                                    Hflow.log(`info`, `Factory:${factory.name} is relaying eventIds:[${relayEventIds}].`);
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
                                        Hflow.log(`info`, `Factory:${factory.name} is completing eventIds:[${eventIds}].`);
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
                                    arbiter[eventId].relayer = (handledValue) => {
                                        factory.outgoing(eventId).emit(() => handledValue);
                                        Hflow.log(`info`, `Factory:${factory.name} is repeating eventIds:[${eventId}].`);
                                    };
                                } else {
                                    arbiter[eventId] = {
                                        eventDirectionalState: REPEATING_EVENT,
                                        handler: (value) => value,
                                        relayer: (handledValue) => {
                                            factory.outgoing(eventId).emit(() => handledValue);
                                            Hflow.log(`info`, `Factory:${factory.name} is repeating eventIds:[${eventId}].`);
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
                            if (Hflow.isEmpty(forwardEventIds)) {
                                Hflow.log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input eventId array is empty.`);
                            } else if (forwardEventIds.some((forwardEventId) => !Hflow.isString(forwardEventId))) {
                                Hflow.log(`error`, `EventStreamComposite.incoming.forward - Factory:${factory.name} input event Id is invalid.`);
                            } else {
                                forwardEventIds = forwardEventIds.filter((forwardEventId) => {
                                    if (eventIds.some((eventId) => eventId === forwardEventId)) {
                                        /* forwarding the same eventIds will cause infinite loop error */
                                        Hflow.log(`warn1`, `EventStreamComposite.incoming.forward - Cannot forward the same eventId:${forwardEventId}.`);
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
             * @return void
             */
            this.activateIncomingStream = function activateIncomingStream () {
                const factory = this;
                if (!_incomingStreamActivated) {
                    /* first do operations on the incoming event stream */
                    factory.operateIncomingStream(_createStreamOperatorFor(`incoming`));
                    /* then do incoming event stream subscriptions */
                    _incomingSubscription = _incomingStream.subscribe(_observer);

                    _incomingStreamActivated = true;
                } else {
                    Hflow.log(`warn0`, `EventStreamComposite.activateIncomingStream - Incoming event stream subscription is already activated.`);
                }
            };
            /**
             * @description - Start the outgoing event stream subscription.
             *
             * @method activateOutgoingStream
             * @return void
             */
            this.activateOutgoingStream = function activateOutgoingStream () {
                const factory = this;
                if (!_outgoingStreamActivated) {
                    /* first do operations on the outgoing event stream */
                    factory.operateOutgoingStream(_createStreamOperatorFor(`outgoing`));
                    /* then do outgoing event stream subscriptions */
                    _outgoingSubscription = _outgoingStream.subscribe(_observer);

                    _outgoingStreamActivated = true;

                    /* emit all the un-emitted payloads that were pushed to queue before activation */
                    _unemitPayloads.forEach((unemitPayload) => {
                        const {
                            eventId,
                            value
                        } = unemitPayload;
                        factory.outgoing(eventId).emit(() => value);
                    });
                    Hflow.clear(_unemitPayloads);
                } else {
                    Hflow.log(`warn0`, `EventStreamComposite.activateOutgoingStream - Outgoing event stream subscription is already activated.`);
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
                    _incomingSubscription.dispose();
                    _incomingSubscription = undefined;
                    _incomingStreamActivated = false;
                } else {
                    Hflow.log(`warn0`, `EventStreamComposite.deactivateIncomingStream - Incoming event stream subscription is not activated.`);
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
                    _streamEmitter.onCompleted();
                    _outgoingSubscription.dispose();
                    _outgoingSubscription = undefined;
                    _outgoingStreamActivated = false;
                } else {
                    Hflow.log(`warn0`, `EventStreamComposite.deactivateOutgoingStream - Outgoing event stream subscription is not activated.`);
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
                if (Hflow.isEmpty(sources)) {
                    Hflow.log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source array is empty.`);
                } else if (sources.some((source) => {
                    return !Hflow.isSchema({
                        name: `string`,
                        getStream: `function`
                    }).of(source);
                })) {
                    Hflow.log(`error`, `EventStreamComposite.observe - Factory:${factory.name} input source objects are invalid.`);
                } else {
                    /* merge all external incoming event streams into one */
                    _incomingStream = Rx.Observable.merge(sources.map((source) => {
                        Hflow.log(`info`, `Factory:${factory.name} is observing source:${source.name}.`);
                        // TODO: undefine check for returning stream from getStream?
                        return source.getStream();
                    }).concat([
                        _incomingStream
                    ]));
                    return _createStreamOperatorFor(`incoming`);
                }
            };
        }
    }
});
