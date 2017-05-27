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
 * @module DomainFactory
 * @description - A domain factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* factory Ids */
import {
    DOMAIN_FACTORY_CODE,
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE,
    INTERFACE_FACTORY_CODE
} from './factory-code';


/* slow mode buffer timings */
const SLOW_MODE_BUFFER_TIME_SPAN_IN_MS = 450;
const SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS = 450;

/* delay all data stream from service by 2ms as default */
// FIXME: needs to know why this delay is needed!
const DELAY_SERVICE_IN_MS = 2;

/* time waiting for factory setup/teardown to complete */
const DEFAULT_SETUP_WAIT_TIME_IN_MS = 10000;
const DEFAULT_TEARDOWN_WAIT_TIME_IN_MS = 10000;

/**
 * @description - A domain factory module.
 *
 * @module DomainFactory
 */
export default Composer({
    composites: [
        EventStreamComposite
    ],
    state: {
        name: {
            value: `unnamed`,
            stronglyTyped: true,
            required: true
        },
        fId: {
            computable: {
                contexts: [
                    `name`
                ],
                compute () {
                    return `${DOMAIN_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    DomainFactory: function DomainFactory () {
        /* ----- Private Variables ------------- */
        /* flag indicates start method has called */
        let _started = false;
        /* domain interface and store */
        let _intf;
        let _store;
        /* services */
        let _services = [];
        /* child and peer domains */
        let _childDomains = [];
        let _peerDomains = [];
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize interface, store, and child domains to this domain.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `DomainFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup domain event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.setup - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Teardown domain event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.teardown - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Check if domain has started.
         *
         * @method hasStarted
         * @return {boolean}
         */
        this.hasStarted = function hasStarted () {
            return _started;
        };
        /**
         * @description - Get domain interface.
         *
         * @method getInterface
         * @return {object}
         */
        this.getInterface = function getInterface () {
            const domain = this;
            if (!Hf.isObject(_intf)) {
                Hf.log(`warn0`, `DomainFactory.getInterface - Domain:${domain.name} is not registered with an interface.`);
            } else {
                return _intf;
            }
        };
        /**
         * @description - Get domain store.
         *
         * @method getStore
         * @return {object}
         */
        this.getStore = function getStore () {
            const domain = this;
            if (!Hf.isObject(_store)) {
                Hf.log(`warn0`, `DomainFactory.getStore - Domain:${domain.name} is not registered with a store.`);
            } else {
                return _store;
            }
        };
        /**
         * @description - Get domain services.
         *
         * @method getServices
         * @param {array} serviceNames
         * @return {array}
         */
        this.getServices = function getServices (...serviceNames) {
            let services = [];
            if (!Hf.isEmpty(_services)) {
                if (!Hf.isEmpty(serviceNames)) {
                    if (!serviceNames.every((name) => Hf.isString(name))) {
                        Hf.log(`error`, `DomainFactory.getServices - Input service name is invalid.`);
                    } else if (!serviceNames.every((name) => _services.hasOwnProperty(name))) {
                        Hf.log(`error`, `DomainFactory.getServices - Service is not found.`);
                    } else {
                        services = services.concat(Hf.collect(...serviceNames).from(_services));
                    }
                } else {
                    services = _services;
                }
            }
            return services;
        };
        /**
         * @description - Register child domains, store and interface.
         *
         * @method register
         * @param {object} definition - Domain registration definition for interface (required), child domains, and store.
         * @return void
         */
        this.register = function register (definition) {
            const domain = this;
            if (!Hf.isSchema({
                intf: `object|undefined`,
                store: `object|undefined`,
                services: `array|undefined`,
                peerDomains: `array|undefined`,
                childDomains: `array|undefined`
            }).of(definition)) {
                Hf.log(`error`, `DomainFactory.register - Input definition is invalid.`);
            } else {
                const {
                    intf,
                    store,
                    services,
                    peerDomains,
                    childDomains
                } = definition;
                if (Hf.isObject(intf)) {
                    if (!Hf.isSchema({
                        fId: `string`,
                        name: `string`,
                        composedOf: `function`,
                        reflectStateOf: `function`,
                        setup: `function`,
                        teardown: `function`,
                        observe: `function`,
                        activateIncomingStream: `function`,
                        activateOutgoingStream: `function`,
                        deactivateIncomingStream: `function`,
                        deactivateOutgoingStream: `function`,
                        getInterfaceComposites: `function`
                    }).of(intf) || intf.fId.substr(0, INTERFACE_FACTORY_CODE.length) !== INTERFACE_FACTORY_CODE) {
                        Hf.log(`error`, `DomainFactory.register - Input interface is invalid.`);
                    } else if (Hf.isObject(_intf)) {
                        Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered interface:${_intf.name}.`);
                    } else {
                        _intf = intf;
                        Hf.log(`info`, `Domain:${domain.name} registered interface:${_intf.name}.`);
                    }
                }
                if (Hf.isObject(store)) {
                    if (!Hf.isObject(_intf)) {
                        Hf.log(`warn0`, `DomainFactory.register - Cannot register store:${store.name} without first register an interface.`);
                    } else {
                        if (!Hf.isSchema({
                            fId: `string`,
                            name: `string`,
                            setup: `function`,
                            teardown: `function`,
                            observe: `function`,
                            activateIncomingStream: `function`,
                            activateOutgoingStream: `function`,
                            deactivateIncomingStream: `function`,
                            deactivateOutgoingStream: `function`
                        }).of(store) || store.fId.substr(0, STORE_FACTORY_CODE.length) !== STORE_FACTORY_CODE) {
                            Hf.log(`error`, `DomainFactory.register - Input store is invalid.`);
                        } else if (Hf.isObject(_store)) {
                            Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered store:${_store.name}.`);
                        } else {
                            _store = store;
                            Hf.log(`info`, `Domain:${domain.name} registered store:${_store.name}.`);
                        }
                    }
                }
                if (Hf.isObject(_store) && Hf.isObject(_intf)) {
                    /* interface is now stateful and reflecting its state with a store */
                    _intf.reflectStateOf(_store);
                }
                if (Hf.isArray(services)) {
                    if (!services.every((service) => {
                        return Hf.isSchema({
                            fId: `string`,
                            name: `string`,
                            setup: `function`,
                            teardown: `function`,
                            observe: `function`,
                            activateIncomingStream: `function`,
                            activateOutgoingStream: `function`,
                            deactivateIncomingStream: `function`,
                            deactivateOutgoingStream: `function`
                        }).of(service) && service.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE;
                    })) {
                        Hf.log(`error`, `DomainFactory.register - Input services are invalid.`);
                    } else {
                        _services = _services.concat(services.filter((service) => {
                            if (_services.includes(service.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered service:${service.name}.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered service:${service.name}.`);
                            return true;
                        }));
                    }
                }
                if (Hf.isArray(childDomains)) {
                    if (!childDomains.every((childDomain) => {
                        return Hf.isSchema({
                            fId: `string`,
                            name: `string`,
                            start: `function`,
                            stop: `function`,
                            observe: `function`,
                            getInterface: `function`
                        }).of(childDomain) && childDomain.fId.substr(0, DOMAIN_FACTORY_CODE.length) === DOMAIN_FACTORY_CODE;
                    })) {
                        Hf.log(`error`, `DomainFactory.register - Input children domains are invalid.`);
                    } else {
                        _childDomains = _childDomains.concat(childDomains.filter((childDomain) => {
                            if (domain.name === childDomain.name) {
                                Hf.log(`warn1`, `DomainFactory.register - Cannot register domain:${childDomain.name} as a child of itself.`);
                                return false;
                            } else if (_peerDomains.includes(childDomain.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Child domain:${childDomain.name} is already registered as a peer.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered child domain:${childDomain.name}.`);
                            return true;
                        }));
                        if (Hf.isObject(_intf)) {
                            _intf.composedOf(
                                ..._childDomains.map((childDomain) => childDomain.getInterface()).filter((compositeIntf) => Hf.isObject(compositeIntf))
                            );
                        }
                    }
                }
                if (Hf.isArray(peerDomains)) {
                    if (!peerDomains.every((peerDomain) => {
                        return Hf.isSchema({
                            fId: `string`,
                            name: `string`,
                            start: `function`,
                            stop: `function`,
                            observe: `function`,
                            getInterface: `function`
                        }).of(peerDomain) && peerDomain.fId.substr(0, DOMAIN_FACTORY_CODE.length) === DOMAIN_FACTORY_CODE;
                    })) {
                        Hf.log(`error`, `DomainFactory.register - Input peer domains are invalid.`);
                    } else {
                        _peerDomains = _peerDomains.concat(peerDomains.filter((peerDomain) => {
                            if (domain.name === peerDomain.name) {
                                Hf.log(`warn1`, `DomainFactory.register - Cannot register domain:${peerDomain.name} as a peer of itself.`);
                                return false;
                            } else if (_childDomains.includes(peerDomain.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Peer domain:${peerDomain.name} is already registered as a child.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered peer domain:${peerDomain.name}.`);
                            return true;
                        }));
                    }
                }
            }
        };
        /**
         * @description - Start domain.
         *
         * @method start
         * @param {function} done
         * @param {object} option
         * @return void
         */
        this.start = function start (done, option = {}) {
            const domain = this;
            const {
                enableSlowRunMode,
                waitTime
            } = Hf.fallback({
                enableSlowRunMode: false,
                waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
            }).of(option);

            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.start - Input done function is invalid.`);
            } else {
                if (!_started) {
                    const domainSetupTimeout = setTimeout(() => {
                        Hf.log(`warn1`, `DomainFactory.start - Domain:${domain.name} is taking longer than ${waitTime}ms to setup.`);
                    }, waitTime);

                    Hf.log(`info`, `Starting domain:${domain.name}...`);

                    /* setup event stream with domain observing interface */
                    if (Hf.isObject(_intf)) {
                        domain.observe(_intf);
                    }
                    /* setup event stream observation duplex between domain and store */
                    if (Hf.isObject(_store)) {
                        domain.observe(_store);
                        _store.observe(domain);

                        /* setup event stream with interface observing store */
                        if (Hf.isObject(_intf)) {
                            _intf.observe(_store);
                        }
                    }
                    /* setup event stream observation duplex between domain and servies */
                    if (!Hf.isEmpty(_services)) {
                        domain.observe(..._services).delay(DELAY_SERVICE_IN_MS);
                        _services.forEach((service) => service.observe(domain));
                    }
                    /* setup event stream observation duplex between domain and children */
                    if (!Hf.isEmpty(_childDomains)) {
                        domain.observe(..._childDomains);
                        _childDomains.forEach((childDomain) => childDomain.observe(domain));
                    }
                    /* setup event stream observation duplex between domain and peers */
                    if (!Hf.isEmpty(_peerDomains)) {
                        let index = 0;
                        while (index < _peerDomains.length - 1) {
                            _peerDomains[index].observe(..._peerDomains.slice(index + 1));
                            _peerDomains.slice(index + 1).forEach((peerDomain) => peerDomain.observe(_peerDomains[index])); // eslint-disable-line
                            index++;
                        }
                        domain.observe(..._peerDomains);
                        _peerDomains.forEach((peerDomain) => peerDomain.observe(domain));
                    }

                    domain.setup(() => {
                        /* first activate parent domain incoming stream */
                        domain.activateIncomingStream({
                            forceBufferingOnAllIncomingStreams: enableSlowRunMode,
                            bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                            bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                        });

                        /*  then startup child domains... */
                        if (!Hf.isEmpty(_childDomains)) {
                            _childDomains.forEach((childDomain) => {
                                const childDomainStartingTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `DomainFactory.start - Child domain:${childDomain.name} is taking longer than ${waitTime}ms to start.`);
                                }, waitTime);
                                childDomain.start(() => clearTimeout(childDomainStartingTimeout), option);
                            });
                        }

                        /* then startup peer domains... */
                        if (!Hf.isEmpty(_peerDomains)) {
                            _peerDomains.forEach((peerDomain) => {
                                const peerDomainStartingTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `DomainFactory.start -  Peer domain:${peerDomain.name} is taking longer than ${waitTime}ms to start.`);
                                }, waitTime);
                                peerDomain.start(() => clearTimeout(peerDomainStartingTimeout), option);
                            });
                        }

                        /* then activate parent to child interfaces... */
                        if (Hf.isObject(_intf)) {
                            /* helper function to activate all child interfaces event stream */
                            const deepInterfaceActivateStream = function deepInterfaceActivateStream (intf) {
                                if (Hf.isObject(intf)) {
                                    const intfSetupTimeout = setTimeout(() => {
                                        Hf.log(`warn1`, `DomainFactory.start - Interface:${intf.name} is taking longer than ${waitTime}ms to setup.`);
                                    }, waitTime);
                                    intf.setup(() => {
                                        intf.activateIncomingStream({
                                            forceBufferingOnAllIncomingStreams: enableSlowRunMode,
                                            bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                            bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                        });
                                        intf.getInterfaceComposites().forEach((compositeIntf) => deepInterfaceActivateStream(compositeIntf));
                                        intf.activateOutgoingStream({
                                            forceBufferingOnAllOutgoingStreams: enableSlowRunMode,
                                            bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                            bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                        });
                                        Hf.log(`info`, `Activated interface:${intf.name}.`);
                                        clearTimeout(intfSetupTimeout);
                                    });
                                } else {
                                    Hf.log(`warn0`, `DomainFactory.start - DomainFactory.start.deepInterfaceActivateStream - Input interface is invalid.`);
                                }
                            };
                            deepInterfaceActivateStream(_intf);
                        } else {
                            Hf.log(`warn0`, `DomainFactory.start - Domain:${domain.name} is not registered with an interface.`);
                        }

                        /* then activate store... */
                        if (Hf.isObject(_store)) {
                            const storeSetupTimeout = setTimeout(() => {
                                Hf.log(`warn1`, `DomainFactory.start - Store:${_store.name} is taking longer than ${waitTime}ms to setup.`);
                            }, waitTime);

                            _store.setup(() => {
                                _store.activateIncomingStream({
                                    forceBufferingOnAllIncomingStreams: enableSlowRunMode,
                                    bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                    bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                });
                                _store.activateOutgoingStream({
                                    forceBufferingOnAllOutgoingStreams: enableSlowRunMode,
                                    bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                    bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                });
                                Hf.log(`info`, `Activated store:${_store.name}.`);
                                clearTimeout(storeSetupTimeout);
                            });
                        }

                        /* then activate services... */
                        if (!Hf.isEmpty(_services)) {
                            _services.forEach((service) => {
                                const serviceSetupTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `DomainFactory.start - Service:${service.name} is taking longer than ${waitTime}ms to setup.`);
                                }, waitTime);
                                service.setup(() => {
                                    service.activateIncomingStream({
                                        forceBufferingOnAllIncomingStreams: enableSlowRunMode,
                                        bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                        bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                    });
                                    service.activateOutgoingStream({
                                        forceBufferingOnAllOutgoingStreams: enableSlowRunMode,
                                        bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                        bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                    });
                                    Hf.log(`info`, `Activated service:${service.name}.`);
                                    clearTimeout(serviceSetupTimeout);
                                });
                            });
                        }

                        /* then finally activate domain... */
                        domain.activateOutgoingStream({
                            forceBufferingOnAllOutgoingStreams: enableSlowRunMode,
                            bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                            bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                        });

                        _started = true;

                        Hf.log(`info`, `Domain:${domain.name} has started.`);
                        clearTimeout(domainSetupTimeout);
                        done();
                    });
                } else { // eslint-disable-line
                    Hf.log(`warn1`, `DomainFactory.start - Domain:${domain.name} is already started. Restarting...`);
                    domain.restart(done, option);
                }
            }
        };
        /**
         * @description - Stop domain.
         *
         * @method stop
         * @param {function} done
         * @param {object} option
         * @return void
         */
        this.stop = function stop (done, option = {}) {
            const {
                waitTime,
                resetStoreState,
                resetAllServiceStates
            } = Hf.fallback({
                resetStoreState: true,
                resetAllServiceStates: true,
                waitTime: DEFAULT_TEARDOWN_WAIT_TIME_IN_MS
            }).of(option);

            const domain = this;
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.stop - DomainFactory.stop - Input done function is invalid.`);
            } else {
                if (!_started) {
                    Hf.log(`warn1`, `DomainFactory.stop - DomainFactory.stop - Domain:${domain.name} is already stopped.`);
                } else {
                    const domainTeardownTimeout = setTimeout(() => {
                        Hf.log(`warn1`, `DomainFactory.stop - Domain:${domain.name} is taking longer than ${waitTime}ms to teardown.`);
                    }, waitTime);

                    Hf.log(`info`, `Stopping domain:${domain.name}...`);
                    domain.teardown(() => {
                        /* first stop child domains... */
                        if (!Hf.isEmpty(_childDomains)) {
                            _childDomains.forEach((childDomain) => {
                                const childDomainStoppingTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `Child domain:${childDomain.name} is taking longer than ${waitTime}ms to stop.`);
                                }, waitTime);
                                childDomain.stop(() => clearTimeout(childDomainStoppingTimeout), option);
                            });
                        }

                        /* then peer domains... */
                        if (!Hf.isEmpty(_peerDomains)) {
                            _peerDomains.forEach((peerDomain) => {
                                const peerDomainStoppingTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `Peer domain:${peerDomain.name} is taking longer than ${waitTime}ms to stop.`);
                                }, waitTime);
                                peerDomain.stop(() => clearTimeout(peerDomainStoppingTimeout), option);
                            });
                        }

                        /* then stop child to parent interfaces... */
                        if (Hf.isObject(_intf)) {
                            /* helper function to deactivate all child interfaces event stream */
                            const deepInterfaceDeactivateStream = function deepInterfaceDeactivateStream (intf) {
                                if (Hf.isObject(intf)) {
                                    const intfTeardownTimeout = setTimeout(() => {
                                        Hf.log(`warn1`, `DomainFactory.stop - Interface:${intf.name} is taking longer than ${waitTime}ms to teardown.`);
                                    }, waitTime);

                                    intf.teardown(() => {
                                        intf.getInterfaceComposites().forEach((compositeIntf) => deepInterfaceDeactivateStream(compositeIntf));
                                        // TODO: compositeIntf does not or should not have incoming event stream activated.
                                        intf.deactivateIncomingStream();
                                        intf.deactivateOutgoingStream();
                                        // TODO: Un-reflect state from store?
                                        Hf.log(`info`, `Deactivated interface:${intf.name}.`);
                                        clearTimeout(intfTeardownTimeout);
                                    });
                                } else {
                                    Hf.log(`warn0`, `DomainFactory.stop - DomainFactory.stop.deepInterfaceDeactivateStream - Input interface is invalid.`);
                                }
                            };
                            deepInterfaceDeactivateStream(_intf);
                        }

                        /* then store... */
                        if (Hf.isObject(_store)) {
                            const storeTeardownTimeout = setTimeout(() => {
                                Hf.log(`warn1`, `DomainFactory.stop - Store:${_store.name} is taking longer than ${waitTime}ms to teardown.`);
                            }, waitTime);
                            _store.teardown(() => {
                                _store.deactivateIncomingStream();
                                _store.deactivateOutgoingStream();
                                if (resetStoreState && Hf.isFunction(_store.reset)) {
                                    /* reset store state */
                                    _store.reset();
                                }
                                Hf.log(`info`, `Deactivated store:${_store.name}.`);
                                clearTimeout(storeTeardownTimeout);
                            });
                        }

                        /* then services... */
                        if (!Hf.isEmpty(_services)) {
                            _services.forEach((service) => {
                                const serviceTeardownTimeout = setTimeout(() => {
                                    Hf.log(`warn1`, `DomainFactory.stop - Service:${service.name} is taking longer than ${waitTime}ms to teardown.`);
                                }, waitTime);
                                service.teardown(() => {
                                    service.deactivateIncomingStream();
                                    service.deactivateOutgoingStream();
                                    if (resetAllServiceStates && Hf.isFunction(service.reset)) {
                                        /* reset service state */
                                        service.reset();
                                    }
                                    Hf.log(`info`, `Deactivated service:${service.name}.`);
                                    clearTimeout(serviceTeardownTimeout);
                                });
                            });
                        }

                        /* then finally parent domain. */
                        domain.deactivateIncomingStream();
                        domain.deactivateOutgoingStream();

                        _started = false;

                        Hf.log(`info`, `Domain:${domain.name} has stopped.`);
                        clearTimeout(domainTeardownTimeout);
                        done();
                    });
                }
            }
        };
        /**
         * @description - Restart domain.
         *
         * @method restart
         * @param {function} done,
         * @param {object} option,
         * @return void
         */
        this.restart = function restart (done, option = {}) {
            const domain = this;
            const {
                waitTime
            } = Hf.fallback({
                waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
            }).of(option);

            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.restart - Input done function is invalid.`);
            } else {
                const domainStoppingTimeout = setTimeout(() => {
                    Hf.log(`warn1`, `DomainFactory.restart - Domain:${domain.name} is taking longer than ${waitTime} seconds to stop and restart.`);
                }, waitTime);

                domain.stop(() => {
                    clearTimeout(domainStoppingTimeout);
                    domain.start(done, option);
                }, option);
            }
        };
    }
});
