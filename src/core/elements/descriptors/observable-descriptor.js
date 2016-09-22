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
 * @module ObservableDescriptor
 * @description -  An obserevable descriptor that allows an object property to emit
 *                 change events.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load RxJs dependency */
import Rx from 'rx';

/* load CommonElement */
import CommonElement from '../common-element';

/* create Hflow object */
const Hflow = CommonElement();

/**
 * @description - A emitter descriptor prototypes.
 *
 * ObservableDescriptorPrototype
 */
const ObservableDescriptorPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Check if subscriber is in subscription list.
     *
     * @method hasSubscriber
     * @param {string} handerKey
     * @return {boolean}
     */
    hasSubscriber: function hasSubscriber (handerKey) {
        const observable = this;
        const eventId = `${observable._id}.${handerKey}`;

        return observable._description.subscriber.hasOwnProperty(eventId);
    },
    /**
     * @description - Check if condition is in condition list.
     *
     * @method hasCondition
     * @param {string} conditionKey
     * @return {boolean}
     */
    hasCondition: function hasCondition (conditionKey) {
        const observable = this;

        return observable._description.condition.hasOwnProperty(conditionKey);
    },
    /**
     * @description - Get obvervable data stream.
     *
     * @method getStream
     * @return {object}
     */
    getStream: function getStream () {
        const observable = this;

        if (!observable._description.assigned) {
            Hflow.log(`error`, `ObservableDescriptor.getStream - Descriptor as no assignment.`);
        } else {
            return observable._stream;
        }
    },
    /**
     * @description - Add a new subscriber to subscriber list.
     *
     * @method addSubscriber
     * @param {function} handler - Subscriber callback function.
     * @param {string} handerKey
     * @return void
     */
    addSubscriber: function addSubscriber (handler, handerKey) {
        if (!Hflow.isFunction(handler)) {
            Hflow.log(`error`, `ObservableDescriptor.addSubscriber - Input subscription handler function is invalid.`);
        } else if (!Hflow.isString(handerKey)) {
            Hflow.log(`error`, `ObservableDescriptor.addSubscriber - Input subscription handler key is invalid.`);
        } else {
            const observable = this;
            const eventId = `${observable._id}.${handerKey}`;

            if (!observable.hasSubscriber(eventId)) {
                observable._description.subscriber[eventId] = handler;
            }
        }
    },
    /**
     * @description - Remove a subscriber from subscriber list.
     *
     * @method removeSubscriber
     * @param {string} handerKey
     * @return void
     */
    removeSubscriber: function removeSubscriber (handerKey) {
        if (!Hflow.isString(handerKey)) {
            Hflow.log(`error`, `ObservableDescriptor.removeSubscriber - Input subscriber handler key is invalid.`);
        } else {
            const observable = this;
            const eventId = `${observable._id}.${handerKey}`;

            if (observable.hasSubscriber(eventId)) {
                observable._description.subscriber[eventId] = undefined;
                delete observable._description.subscriber[eventId];
            }
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
    addCondition: function addCondition (trigger, conditionKey) {
        if (!Hflow.isFunction(trigger)) {
            Hflow.log(`error`, `ObservableDescriptor.addCondition - Input condition trigger function is invalid.`);
        } else if (!Hflow.isString(conditionKey)) {
            Hflow.log(`error`, `ObservableDescriptor.addCondition - Input condition key is invalid.`);
        } else {
            const observable = this;
            const eventId = `${observable._id}.${conditionKey}`;

            if (!observable.hasCondition(eventId)) {
                observable._description.condition[eventId] = trigger;
            }
        }
    },
    /**
     * @description - Remove a condition from condition list.
     *
     * @method removeCondition
     * @param {string} conditionKey
     * @return void
     */
    removeCondition: function removeCondition (conditionKey) {
        if (!Hflow.isString(conditionKey)) {
            Hflow.log(`error`, `ObservableDescriptor.removeCondition - Input condition key is invalid.`);
        } else {
            const observable = this;
            const eventId = `${observable._id}.${conditionKey}`;

            if (observable.hasCondition(eventId)) {
                observable._description.condition[eventId] = undefined;
                delete observable._description.condition[eventId];
            }
        }
    },
    /**
     * @description - Assign an observable description.
     *
     * @method assign
     * @param {object} descObj - A descriptor setup object.
     * @return {object}
     */
    assign: function assign (descObj) {
        if (!Hflow.isSchema({
            key: `string|number`
        }).of(descObj)) {
            Hflow.log(`error`, `ObservableDescriptor.assign - Input descriptor setup object is invalid.`);
        } else {
            const observable = this;
            const {
                key,
                condition,
                subscriber
            } = Hflow.fallback({
                condition: {},
                subscriber: {}
            }).of(descObj);

            if (observable._description.assigned) {
                observable.unassign();
            }

            if (!Hflow.isEmpty(condition)) {
                Hflow.forEach(condition, (trigger, conditionKey) => {
                    observable.addCondition(trigger, conditionKey);
                });
            }

            if (!Hflow.isEmpty(subscriber)) {
                Hflow.forEach(subscriber, (handler, handlerKey) => {
                    observable.addSubscriber(handler, handlerKey);
                });
            }

            observable._observer = Rx.Observer.create(
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
                        if (observable._description.subscriber.hasOwnProperty(eventId)) {
                            const handler = observable._description.subscriber[eventId];
                            handler(value);
                        }
                    } else {
                        Hflow.log(`error`, `ObservableDescriptor.onNext - Payload event Id is invalid.`);
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
                    Hflow.log(`error`, `ObservableDescriptor.onError - Subscription error. ${error.message}`);
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

            return {
                /**
                 * @description - The target object to get this observable property.
                 *
                 * @method assign.to
                 * @param {object|array} target - Target object.
                 * @return void
                 */
                to: function to (target) {
                    if (Hflow.isObject(target) || Hflow.isArray(target)) {
                        if (target.hasOwnProperty(key)) {
                            observable._description.assigned = true;
                            observable._description.key = key;
                            observable._description.proxy = target;
                            observable._description.orgDesc = Object.getOwnPropertyDescriptor(target, key);

                            observable._stream = Rx.Observable.create((observer) => {
                                /* create the condition property for the assigned object */
                                Object.defineProperty(observable._description.proxy, key, {
                                    get: function get () {
                                        if (observable._description.orgDesc.hasOwnProperty(`get`)) {
                                            return observable._description.orgDesc.get();
                                        }
                                        return observable._description.orgDesc.value;
                                    },
                                    set: function set (value) {
                                        if (observable._description.orgDesc.hasOwnProperty(`set`)) {
                                            observable._description.orgDesc.set(value);
                                        } else {
                                            observable._description.orgDesc.value = value;
                                        }

                                        try {
                                            if (observable._description.orgDesc.hasOwnProperty(`get`)) {
                                                observer.onNext(observable._description.orgDesc.get());
                                            } else {
                                                observer.onNext(value);
                                            }
                                        } catch (error) {
                                            observer.onError(error);
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
                                if (!Hflow.isEmpty(observable._description.condition)) {
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
                        } else {
                            Hflow.log(`error`, `ObservableDescriptor.assign.to - Property key:${key} is not defined.`);
                        }
                    } else {
                        Hflow.log(`error`, `ObservableDescriptor.assign.to - Input target is invalid.`);
                    }
                }
            };
        }
    },
    /**
     * @description - Unassign an observable description.
     *
     * @method unassign
     * @return void
     */
    unassign: function unassign () {
        const observable = this;

        if (observable._description.assigned) {
            const key = observable._description.key;

            observable._observer.onComplete();
            observable._subscription.dispose();

            /* delete current property */
            observable._description.proxy[key] = undefined;
            delete observable._description.proxy[key];

            /* restore original property with it descriptor */
            if (observable._description.orgDesc.hasOwnProperty(`get`) || observable._description.orgDesc.hasOwnProperty(`set`)) {
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
            Hflow.clear(observable._description.condition);
            Hflow.clear(observable._description.subscriber);
        }
    }
};

/**
 * @description - An observable descriptor module.
 *
 * @module ObservableDescriptor
 * @param {string} id - Descriptor Id.
 * @return {object}
 */
export default function ObservableDescriptor (id) {
    if (!Hflow.isString(id)) {
        Hflow.log(`error`, `ObservableDescriptor - Input descriptor Id is invalid.`);
    } else {
        const descriptor = Object.create(ObservableDescriptorPrototype, {
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

        if (!Hflow.isObject(descriptor)) {
            Hflow.log(`error`, `ObservableDescriptor - Unable to create a computable descriptor instance.`);
        } else {
            const revealFrozen = Hflow.compose(Hflow.reveal, Object.freeze);
            /* reveal only the public properties and functions */
            return revealFrozen(descriptor);
        }
    }
}