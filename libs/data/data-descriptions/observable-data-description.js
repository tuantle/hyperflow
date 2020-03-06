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
 * @module ObservableDataDescription
 * @description -  An obserevable data description that allows an object property to emit
 *                 change events.
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
    isEmpty,
    isSchema,
    clear,
    compose,
    fallback,
    reveal,
    forEach,
    log
} from '../../utils/common-util';

/* load RxJs dependency */
import {
    Subscriber as RxSubscriber,
    Observable as RxObservable
} from 'rxjs';

/**
 * @description - A emitter data description prototypes.
 *
 * ObservableDataDescriptionPrototype
 */
const ObservableDataDescriptionPrototype = Object.create({}).prototype = {
    /**
     * @description - Check if subscriber is in subscription list.
     *
     * @method hasSubscriber
     * @param {string} handerKey
     * @return {boolean}
     */
    hasSubscriber (handerKey) {
        const observable = this;
        const eventId = `${observable._id}.${handerKey}`;

        return Object.prototype.hasOwnProperty.call(observable._description.subscriber, eventId);
    },

    /**
     * @description - Check if condition is in condition list.
     *
     * @method hasCondition
     * @param {string} conditionKey
     * @return {boolean}
     */
    hasCondition (conditionKey) {
        const observable = this;

        return Object.prototype.hasOwnProperty.call(observable._description.condition, conditionKey);
    },

    /**
     * @description - Get obvervable data stream.
     *
     * @method getStream
     * @return {object}
     */
    getStream () {
        const observable = this;

        if (ENV.DEVELOPMENT) {
            if (!observable._description.assigned) {
                log(`error`, `ObservableDataDescription.getStream - DataDescription as no assignment.`);
            }
        }

        return observable._stream;
    },

    /**
     * @description - Add a new subscriber to subscriber list.
     *
     * @method addSubscriber
     * @param {function} handler - Subscriber callback function.
     * @param {string} handerKey
     * @return void
     */
    addSubscriber (handler, handerKey) {
        if (ENV.DEVELOPMENT) {
            if (!isFunction(handler)) {
                log(`error`, `ObservableDataDescription.addSubscriber - Input subscription handler function is invalid.`);
            } else if (!isString(handerKey)) {
                log(`error`, `ObservableDataDescription.addSubscriber - Input subscription handler key is invalid.`);
            }
        }

        const observable = this;
        const eventId = `${observable._id}.${handerKey}`;

        if (!observable.hasSubscriber(eventId)) {
            observable._description.subscriber[eventId] = handler;
        }
    },

    /**
     * @description - Remove a subscriber from subscriber list.
     *
     * @method removeSubscriber
     * @param {string} handerKey
     * @return void
     */
    removeSubscriber (handerKey) {
        if (ENV.DEVELOPMENT) {
            if (!isString(handerKey)) {
                log(`error`, `ObservableDataDescription.removeSubscriber - Input subscriber handler key is invalid.`);
            }
        }

        const observable = this;
        const eventId = `${observable._id}.${handerKey}`;

        if (observable.hasSubscriber(eventId)) {
            delete observable._description.subscriber[eventId];
            // observable._description.subscriber[eventId] = undefined;
        }
    },

    /**
     * @description - Add a new condition to condition list.
     *
     * @method addCondition
     * @param {function} trigger - Trigger callback function.
     * @param {string} conditionKey
     * @return void
     */
    addCondition (trigger, conditionKey) {
        if (ENV.DEVELOPMENT) {
            if (!isFunction(trigger)) {
                log(`error`, `ObservableDataDescription.addCondition - Input condition trigger function is invalid.`);
            } else if (!isString(conditionKey)) {
                log(`error`, `ObservableDataDescription.addCondition - Input condition key is invalid.`);
            }
        }

        const observable = this;
        const eventId = `${observable._id}.${conditionKey}`;

        if (!observable.hasCondition(eventId)) {
            observable._description.condition[eventId] = trigger;
        }
    },

    /**
     * @description - Remove a condition from condition list.
     *
     * @method removeCondition
     * @param {string} conditionKey
     * @return void
     */
    removeCondition (conditionKey) {
        if (ENV.DEVELOPMENT) {
            if (!isString(conditionKey)) {
                log(`error`, `ObservableDataDescription.removeCondition - Input condition key is invalid.`);
            }
        }

        const observable = this;
        const eventId = `${observable._id}.${conditionKey}`;

        if (observable.hasCondition(eventId)) {
            delete observable._description.condition[eventId];
            // observable._description.condition[eventId] = undefined;
        }
    },

    /**
     * @description - Assign an observable description.
     *
     * @method assign
     * @param {object} descPreset - A data description preset object.
     * @return {object}
     */
    assign (descPreset) {
        if (ENV.DEVELOPMENT) {
            if (!isSchema({
                key: `string|number`
            }).of(descPreset)) {
                log(`error`, `ObservableDataDescription.assign - Input data description preset object is invalid.`);
            }
        }

        const observable = this;
        const {
            key,
            condition,
            subscriber
        } = fallback({
            condition: {},
            subscriber: {}
        }, () => {
            log(`warn1`, `ObservableDataDescription.assign - Input data description preset is invalid.`);
        }).of(descPreset);

        if (observable._description.assigned) {
            observable.unassign();
        }

        if (!isEmpty(condition)) {
            forEach(condition, (trigger, conditionKey) => {
                observable.addCondition(trigger, conditionKey);
            });
        }

        if (!isEmpty(subscriber)) {
            forEach(subscriber, (handler, handlerKey) => {
                observable.addSubscriber(handler, handlerKey);
            });
        }

        observable._observer = RxSubscriber.create(
            /**
             * @description - On subscription to next incoming payload...
             *
             * @method next
             * @param {object} payload
             * @return void
             */
            function next (payload) {
                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        eventId: `string`
                    }).of(payload)) {
                        log(`error`, `ObservableDataDescription.next - Payload event Id is invalid.`);
                    }
                }

                const {
                    eventId,
                    value
                } = payload;
                if (Object.prototype.hasOwnProperty.call(observable._description.subscriber, eventId)) {
                    const handler = observable._description.subscriber[eventId];
                    handler(value);
                }
            },
            /**
             * @description - On subscription to error...
             *
             * @method error
             * @param {string} error
             * @return void
             */
            function error (errorMessage) {
                log(`error`, `ObservableDataDescription.error - Subscription error. ${errorMessage}`);
            },
            /**
             * @description - On subscription to completion...
             *
             * @method complete
             * @return void
             */
            function complete () {
                log(`info0`, `Subscription completed.`);
            }
        );

        return {
            /**
             * @description - The target object to get this observable property.
             *
             * @method assign.to
             * @param {object|array} target - Target object.
             * @return void
             */
            to (target) {
                if (ENV.DEVELOPMENT) {
                    if (!(isObject(target) || isArray(target))) {
                        log(`error`, `ObservableDataDescription.assign.to - Input target is invalid.`);
                    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
                        log(`error`, `ObservableDataDescription.assign.to - Property key:${key} is not defined.`);
                    }
                }

                observable._description.assigned = true;
                observable._description.key = key;
                observable._description.proxy = target;
                observable._description.orgDesc = Object.getOwnPropertyDescriptor(target, key);

                observable._stream = RxObservable.create((streamEmitter) => {
                    /* create the condition property for the assigned object */
                    Object.defineProperty(observable._description.proxy, key, {
                        get () {
                            if (Object.prototype.hasOwnProperty.call(observable._description.orgDesc, `get`)) {
                                return observable._description.orgDesc.get();
                            }
                            return observable._description.orgDesc.value;
                        },
                        set (value) {
                            if (Object.prototype.hasOwnProperty.call(observable._description.orgDesc, `set`)) {
                                observable._description.orgDesc.set(value);
                            } else {
                                observable._description.orgDesc.value = value;
                            }

                            try {
                                if (Object.prototype.hasOwnProperty.call(observable._description.orgDesc, `get`)) {
                                    streamEmitter.next(observable._description.orgDesc.get());
                                } else {
                                    streamEmitter.next(value);
                                }
                            } catch (error) {
                                streamEmitter.error(error);
                            }
                        },
                        configurable: true,
                        enumerable: true
                    });
                }).map((value) => {
                    const defaultPayload = {
                        eventId: `${observable._id}`,
                        value
                    };
                    if (!isEmpty(observable._description.condition)) {
                        return Object.keys(observable._description.condition).reduce((payload, eventId) => {
                            let context = {};
                            const trigger = observable._description.condition[eventId];

                            context[key] = value;
                            if (trigger.call(context)) {
                                payload = {
                                    eventId,
                                    value
                                };
                            }

                            return payload;
                        }, defaultPayload);
                    }
                    return defaultPayload;
                });

                observable._subscription = observable._stream.subscribe(observable._observer);
            }
        };
    },

    /**
     * @description - Unassign an observable description.
     *
     * @method unassign
     * @return void
     */
    unassign () {
        const observable = this;

        if (observable._description.assigned) {
            const key = observable._description.key;

            observable._observer.complete();
            observable._subscription.unsubscribe();

            /* delete current property */
            delete observable._description.proxy[key];
            // observable._description.proxy[key] = undefined;

            /* restore original property with it data description */
            if (Object.prototype.hasOwnProperty.call(observable._description.orgDesc, `get`) ||
                Object.prototype.hasOwnProperty.call(observable._description.orgDesc, `set`)) {
                Object.defineProperty(observable._description.proxy, key, {
                    get: observable._description.orgDesc.get,
                    set: observable._description.orgDesc.set,
                    configurable: observable._description.orgDesc.configurable,
                    enumerable: observable._description.orgDesc.enumerable
                });
            } else {
                observable._description.proxy[key] = observable._description.orgDesc.value;
            }

            observable._description.assigned = false;
            observable._description.orgDesc = undefined;
            observable._description.proxy = undefined;
            observable._description.key = undefined;
            observable._stream = undefined;
            observable._observer = undefined;
            observable._subscription = undefined;
            clear(observable._description.condition);
            clear(observable._description.subscriber);
        }
    }
};

/**
 * @description - An observable data description module.
 *
 * @module ObservableDataDescription
 * @param {string} id - data description Id.
 * @return {object}
 */
export default function ObservableDataDescription (id) {
    if (ENV.DEVELOPMENT) {
        if (!isString(id)) {
            log(`error`, `ObservableDataDescription - Input data description Id is invalid.`);
        }
    }

    const dataDescription = Object.create(ObservableDataDescriptionPrototype, {
        _id: {
            value: id,
            writable: false,
            configurable: false,
            enumerable: false
        },
        _stream: {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: false
        },
        _observer: {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: false
        },
        _subscription: {
            value: undefined,
            writable: true,
            configurable: true,
            enumerable: false
        },
        _description: {
            value: {
                assigned: false,
                key: undefined,
                orgDesc: undefined,
                // TODO: Used es6 Proxy.
                proxy: undefined,
                subscriber: {},
                condition: {}
            },
            writable: true,
            configurable: true,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(dataDescription)) {
            log(`error`, `ObservableDataDescription - Unable to create a obserevable data description instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return compose(reveal, Object.freeze)(dataDescription);
}
