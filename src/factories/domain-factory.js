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
 * @module DomainFactory
 * @description - A domain factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isNonEmptyString,
    isString,
    isFunction,
    isObject,
    isArray,
    isNonEmptyObject,
    isNonEmptyArray,
    isSchema,
    fallback,
    log
} from '../../libs/utils/common-util';

import Composer from '../composer';

import EventStreamComposite from '../../libs/composites/event-stream-composite';

/* slow mode buffer timings */
const SLOW_MODE_BUFFER_TIME_SPAN_IN_MS = 500;
const SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS = 500;

/* time waiting for factory setup/teardown to complete */
const DEFAULT_SETUP_WAIT_TIME_IN_MS = 10000;
const DEFAULT_TEARDOWN_WAIT_TIME_IN_MS = 10000;

export default Composer({
    composites: [
        EventStreamComposite
    ],
    static: {
        type: `domain`
    },
    DomainFactory () {
        /* flag indicates start method has called */
        let _started = false;
        /* domain interface and store */
        let _intf;
        let _store;
        /* service cache */
        let _serviceCache = {};
        /* child and peer domain caches */
        let _childDomainCache = {};
        let _peerDomainCache = {};

        /**
         * @description - Initialize interface, store, and child domains to this domain.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            log(`warn0`, `DomainFactory.$init - Method is not implemented by default.`);
        };

        /**
         * @description - Setup domain event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function (done) { // eslint-disable-line
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `DomainFactory.setup - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Teardown domain event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function (done) { // eslint-disable-line
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `DomainFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Check if domain has a registered interface.
         *
         * @method hasInterface
         * @return {object}
         */
        this.hasInterface = function () {
            return isObject(_intf);
        };

        /**
         * @description - Check if domain has a registered store.
         *
         * @method hasStore
         * @return {object}
         */
        this.hasStore = function () {
            return isObject(_store);
        };

        /**
         * @description - Check if domain has a registered service.
         *
         * @method hasService
         * @param {string} serviceName
         * @return {object}
         */
        this.hasService = function (serviceName) {
            if (ENV.DEVELOPMENT) {
                if (!isString(serviceName)) {
                    log(`error`, `DomainFactory.hasService - Input service name is invalid.`);
                }
            }

            return Object.prototype.hasOwnProperty.call(_serviceCache, serviceName);
        };

        /**
         * @description - Check if domain has a registered child domain.
         *
         * @method hasChildDomain
         * @param {string} domainName
         * @return {object}
         */
        this.hasChildDomain = function (domainName) {
            if (ENV.DEVELOPMENT) {
                if (!isString(domainName)) {
                    log(`error`, `DomainFactory.hasChildDomain - Input domain name is invalid.`);
                }
            }

            return Object.prototype.hasOwnProperty.call(_childDomainCache, domainName);
        };

        /**
         * @description - Check if domain has a registered peer domain.
         *
         * @method hasPeerDomain
         * @param {string} domainName
         * @return {object}
         */
        this.hasPeerDomain = function (domainName) {
            if (ENV.DEVELOPMENT) {
                if (!isString(domainName)) {
                    log(`error`, `DomainFactory.hasPeerDomain - Input domain name is invalid.`);
                }
            }

            return Object.prototype.hasOwnProperty.call(_peerDomainCache, domainName);
        };

        /**
         * @description - Check if domain has started.
         *
         * @method hasStarted
         * @return {boolean}
         */
        this.hasStarted = function () {
            return _started;
        };

        /**
         * @description - Get domain interface.
         *
         * @method getInterface
         * @return {object}
         */
        this.getInterface = function () {
            const domain = this;

            if (ENV.DEVELOPMENT) {
                if (!isObject(_intf)) {
                    log(`warn0`, `DomainFactory.getInterface - Domain:${domain.name} is not registered with an interface.`);
                }
            }

            return _intf;
        };

        /**
         * @description - Get domain store.
         *
         * @method getStore
         * @return {object}
         */
        this.getStore = function () {
            const domain = this;

            if (ENV.DEVELOPMENT) {
                if (!isObject(_store)) {
                    log(`warn0`, `DomainFactory.getStore - Domain:${domain.name} is not registered with a store.`);
                }
            }
            return _store;
        };

        /**
         * @description - Get domain registered services.
         *
         * @method getServices
         * @param {array} serviceNames
         * @return {array}
         */
        this.getServices = function (...serviceNames) {
            let services = [];

            if (isNonEmptyObject(_serviceCache)) {
                if (isNonEmptyArray(serviceNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!serviceNames.every((serviceName) => isString(serviceName))) {
                            log(`error`, `DomainFactory.getServices - Input service name is invalid.`);
                        } else if (!serviceNames.every((serviceName) => Object.prototype.hasOwnProperty.call(_serviceCache, serviceName))) {
                            log(`error`, `DomainFactory.getServices - Service is not found.`);
                        }
                    }

                    services = Object.entries(_serviceCache).filter(([ serviceName, service ]) => { // eslint-disable-line
                        return serviceNames.includes(serviceName);
                    }).map(([ serviceName, service ]) => service);  // eslint-disable-line
                } else {
                    services = Object.values(_serviceCache);
                }
            }

            return services;
        };

        /**
         * @description - Get registered child domains.
         *
         * @method getChildDomains
         * @param {array} domainNames
         * @return {array}
         */
        this.getChildDomains = function (...domainNames) {
            let childDomains = [];

            if (isNonEmptyObject(_childDomainCache)) {
                if (isNonEmptyArray(domainNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!domainNames.every((domainName) => isString(domainName))) {
                            log(`error`, `DomainFactory.getChildDomains - Input domain name is invalid.`);
                        } else if (!domainNames.every((domainName) => Object.prototype.hasOwnProperty.call(_childDomainCache, domainName))) {
                            log(`error`, `DomainFactory.getChildDomains - Domain is not found.`);
                        }
                    }

                    childDomains = Object.entries(_childDomainCache).filter(([ domainName, childDomain ]) => { // eslint-disable-line
                        return domainNames.includes(domainName);
                    }).map(([ domainName, childDomain ]) => childDomain);  // eslint-disable-line
                } else {
                    childDomains = Object.values(_childDomainCache);
                }
            }

            return childDomains;
        };

        /**
         * @description - Get registered peer domains.
         *
         * @method getPeerDomains
         * @param {array} domainNames
         * @return {array}
         */
        this.getPeerDomains = function (...domainNames) {
            let peerDomains = [];

            if (isNonEmptyObject(_peerDomainCache)) {
                if (isNonEmptyArray(domainNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!domainNames.every((domainName) => isString(domainName))) {
                            log(`error`, `DomainFactory.getPeerDomains - Input domain name is invalid.`);
                        } else if (!domainNames.every((domainName) => Object.prototype.hasOwnProperty.call(_peerDomainCache, domainName))) {
                            log(`error`, `DomainFactory.getPeerDomains - Domain is not found.`);
                        }
                    }

                    peerDomains = Object.entries(_peerDomainCache).filter(([ domainName, peerDomain ]) => { // eslint-disable-line
                        return domainNames.includes(domainName);
                    }).map(([ domainName, peerDomain ]) => peerDomain);  // eslint-disable-line
                } else {
                    peerDomains = Object.values(_peerDomainCache);
                }
            }

            return peerDomains;
        };

        /**
         * @description - Register child/peers domains, services, store and interface.
         *
         * @method register
         * @param {object} definition - Domain registration definition for interface (required), child domains, and store.
         * @return {object}
         */
        this.register = function (definition) {
            const domain = this;

            if (ENV.DEVELOPMENT) {
                // if (domain.isInitialized()) {
                //     log(`error`, `DomaninFactory.register - Domain:${domain.name} registration cannot be call after initialization.`);
                // }
                if (domain.isStreamActivated()) {
                    log(`error`, `DomaninFactory.register - Domain:${domain.name} registration cannot be call after event stream activation.`);
                }
                if (!isSchema({
                    interface: `object|undefined`,
                    store: `object|undefined`,
                    services: `array|undefined`,
                    peerDomains: `array|undefined`,
                    childDomains: `array|undefined`
                }).of(definition)) {
                    log(`error`, `DomainFactory.register - Input definition is invalid.`);
                }
            }

            const {
                interface: intf,
                store,
                services,
                peerDomains,
                childDomains
            } = definition;

            if (isObject(intf)) {
                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        name: `string`,
                        type: `string`,
                        setup: `function`,
                        teardown: `function`,
                        observe: `function`,
                        activateIncomingStream: `function`,
                        activateOutgoingStream: `function`,
                        deactivateIncomingStream: `function`,
                        deactivateOutgoingStream: `function`,
                        renderToTarget: `function`
                    }).of(intf) || intf.type !== `interface`) {
                        log(`error`, `DomainFactory.register - Input interface is invalid.`);
                    } else if (isObject(_intf)) {
                        log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered interface:${_intf.name}.`);
                    }
                }

                _intf = intf;

                if (isObject(_store)) {
                    _intf.register({
                        store: _store
                    });
                }

                log(`info1`, `Domain:${domain.name} registered interface:${_intf.name}.`);
            }

            if (isObject(store)) {
                if (ENV.DEVELOPMENT) {
                    if (!isSchema({
                        name: `string`,
                        type: `string`,
                        setup: `function`,
                        teardown: `function`,
                        observe: `function`,
                        reset: `function`,
                        activateIncomingStream: `function`,
                        activateOutgoingStream: `function`,
                        deactivateIncomingStream: `function`,
                        deactivateOutgoingStream: `function`,
                        getStateAsObject: `function`
                    }).of(store) || store.type !== `store`) {
                        log(`error`, `DomainFactory.register - Input store is invalid.`);
                    } else if (isObject(_store)) {
                        log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered store:${_store.name}.`);
                    }
                }

                _store = store;

                if (isObject(_intf)) {
                    _intf.register({
                        store: _store
                    });
                }

                log(`info1`, `Domain:${domain.name} registered store:${_store.name}.`);
            }

            if (isArray(services)) {
                if (ENV.DEVELOPMENT) {
                    if (!services.every((service) => {
                        return isSchema({
                            name: `string`,
                            type: `string`,
                            setup: `function`,
                            teardown: `function`,
                            observe: `function`,
                            reset: `function`,
                            activateIncomingStream: `function`,
                            activateOutgoingStream: `function`,
                            deactivateIncomingStream: `function`,
                            deactivateOutgoingStream: `function`
                        }).of(service) && service.type === `service`;
                    })) {
                        log(`error`, `DomainFactory.register - Input services are invalid.`);
                    }
                }

                _serviceCache = services.reduce((__serviceCache, service) => {
                    if (Object.prototype.hasOwnProperty.call(__serviceCache, service.name)) {
                        log(`warn1`, `DomainFactory.register - Domain:${domain.name} already has service:${service.name} registered.`);
                    } else {
                        __serviceCache[service.name] = service;
                        log(`info1`, `Domain:${domain.name} registered service:${service.name}.`);
                    }
                    return __serviceCache;
                }, _serviceCache);
            }

            if (isArray(childDomains)) {
                if (ENV.DEVELOPMENT) {
                    if (!childDomains.every((childDomain) => {
                        return isSchema({
                            name: `string`,
                            type: `string`,
                            start: `function`,
                            stop: `function`,
                            observe: `function`,
                            getInterface: `function`
                        }).of(childDomain) && childDomain.type === `domain`;
                    })) {
                        log(`error`, `DomainFactory.register - Input child domains are invalid.`);
                    }
                }

                _childDomainCache = childDomains.reduce((__childDomainCache, childDomain) => {
                    if (domain.name === childDomain.name) {
                        log(`warn1`, `DomainFactory.register - Cannot register domain:${childDomain.name} as a child of itself.`);
                    } else if (Object.prototype.hasOwnProperty.call(__childDomainCache, childDomain.name)) {
                        log(`warn1`, `DomainFactory.register - Domain:${domain.name} already has child domain:${childDomain.name} registered.`);
                    } else {
                        __childDomainCache[childDomain.name] = childDomain;
                        log(`info1`, `Domain:${domain.name} registered child domain:${childDomain.name}.`);
                    }
                    return __childDomainCache;
                }, _childDomainCache);
            }

            if (isObject(_intf) && isNonEmptyObject(_childDomainCache)) {
                _intf.register({
                    childInterfaces: Object.values(_childDomainCache).filter((childDomain) => childDomain.hasInterface()).map((childDomain) => childDomain.getInterface())
                });
            }

            if (isArray(peerDomains)) {
                if (ENV.DEVELOPMENT) {
                    if (!peerDomains.every((peerDomain) => {
                        return isSchema({
                            name: `string`,
                            type: `string`,
                            start: `function`,
                            stop: `function`,
                            observe: `function`,
                            getInterface: `function`
                        }).of(peerDomain) && peerDomain.type === `domain`;
                    })) {
                        log(`error`, `DomainFactory.register - Input peer domains are invalid.`);
                    }
                }

                _peerDomainCache = peerDomains.reduce((__peerDomainCache, peerDomain) => {
                    if (domain.name === peerDomain.name) {
                        log(`warn1`, `DomainFactory.register - Cannot register domain:${peerDomain.name} as a peer of itself.`);
                    } else if (Object.prototype.hasOwnProperty.call(__peerDomainCache, peerDomain.name)) {
                        log(`warn1`, `DomainFactory.register - Domain:${domain.name} already has peer domain:${peerDomain.name} registered.`);
                    } else {
                        __peerDomainCache[peerDomain.name] = peerDomain;
                        log(`info1`, `Domain:${domain.name} registered peer domain:${peerDomain.name}.`);
                    }
                    return __peerDomainCache;
                }, _peerDomainCache);
            }
            return domain;
        };

        /**
         * @description - Start domain.
         *
         * @method start
         * @param {string} targetId
         * @param {function} done
         * @param {object} option
         * @return void
         */
        this.start = function (targetId, done, option = {
            renderToTarget: true,
            slowRunMode: false,
            waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
        }) {
            const domain = this;

            if (ENV.DEVELOPMENT) {
                // if (!domain.isInitialized()) {
                //     log(`error`, `DomainFactory.start - Domain:${domain.name} start cannot be call before initialization.`);
                // }
                if (domain.isStreamActivated()) {
                    log(`error`, `DomainFactory.start - Domain:${domain.name} start cannot be call after event stream activation..`);
                }
                if (!isNonEmptyString(targetId)) {
                    log(`error`, `DomainFactory.start - Domain:${domain.name} target Id key is invalid.`);
                }
                if (!isFunction(done)) {
                    log(`error`, `DomainFactory.start - Input done function is invalid.`);
                }
            }

            const {
                renderToTarget,
                slowRunMode,
                waitTime,
                timeout
            } = fallback({
                renderToTarget: true,
                slowRunMode: false,
                waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
            }).of(option);
            const services = Object.values(_serviceCache);
            const childDomains = Object.values(_childDomainCache);
            const peerDomains = Object.values(_peerDomainCache);

            if (!domain.hasStarted()) {
                if (ENV.DEVELOPMENT) {
                    if (!isObject(_intf) && isObject(_store)) {
                        log(`warn1`, `DomainFactory.start - Domain:${domain.name} has store:${_store.name} resistered without an interface.`);
                    }
                }

                const domainTimeoutId = setTimeout(() => {
                    log(`warn1`, `DomainFactory.start - Domain:${domain.name} is taking longer than ${waitTime}ms to setup.`);
                    if (isFunction(timeout)) {
                        timeout(domain.name);
                    }
                }, waitTime);

                log(`info1`, `Starting domain:${domain.name}...`);

                /* setup event stream observation duplex between domain and servies and children of services */
                if (isNonEmptyArray(services)) {
                    // TODO: why the 1ms delay is needed here?
                    domain.observe(...services).delay(1);
                    services.forEach((service) => service.observe(domain));
                }

                /* setup event stream with domain observing interface */
                if (isObject(_intf)) {
                    domain.observe(_intf);
                }
                /* setup event stream observation duplex between domain and store */
                if (isObject(_store)) {
                    domain.observe(_store);
                    _store.observe(domain);

                    /* setup event stream with interface observing store */
                    if (isObject(_intf)) {
                        _intf.observe(_store);
                    }
                }

                /* setup event stream observation duplex between domain and children */
                if (isNonEmptyArray(childDomains)) {
                    domain.observe(...childDomains);
                    childDomains.forEach((childDomain) => childDomain.observe(domain));
                }

                /* setup event stream observation duplex between domain and peers */
                if (isNonEmptyArray(peerDomains)) {
                    let index = 0;

                    while (index < peerDomains.length - 1) {
                        peerDomains[index].observe(...peerDomains.slice(index + 1));
                        peerDomains.slice(index + 1).forEach((peerDomain) => peerDomain.observe(peerDomains[index])); // eslint-disable-line
                        index++;
                    }
                    domain.observe(...peerDomains);
                    peerDomains.forEach((peerDomain) => peerDomain.observe(domain));
                }

                domain.setup(() => {
                    /* first activate parent domain incoming stream */
                    domain.activateIncomingStream({
                        forceBufferingOnAllIncomingStreams: slowRunMode,
                        bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                        bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                    });

                    /*  then startup child domains... */
                    if (isNonEmptyArray(childDomains)) {
                        childDomains.forEach((childDomain) => {
                            const childDomainTimeoutId = setTimeout(() => {
                                log(`warn1`, `DomainFactory.start - Child domain:${childDomain.name} is taking longer than ${waitTime}ms to start.`);
                                if (isFunction(timeout)) {
                                    timeout(childDomain.name);
                                }
                            }, waitTime);
                            childDomain.start(targetId, () => clearTimeout(childDomainTimeoutId), {
                                ...option,
                                renderToTarget: false
                            });
                        });
                    }

                    /* then startup peer domains... */
                    if (isNonEmptyArray(peerDomains)) {
                        peerDomains.forEach((peerDomain) => {
                            const peerDomainTimeoutId = setTimeout(() => {
                                log(`warn1`, `DomainFactory.start -  Peer domain:${peerDomain.name} is taking longer than ${waitTime}ms to start.`);
                                if (isFunction(timeout)) {
                                    timeout(peerDomain.name);
                                }
                            }, waitTime);
                            peerDomain.start(targetId, () => clearTimeout(peerDomainTimeoutId), {
                                ...option,
                                renderToTarget: false
                            });
                        });
                    }

                    /* then activate services... */
                    if (isNonEmptyArray(services)) {
                        services.forEach((service) => {
                            const serviceTimeoutId = setTimeout(() => {
                                log(`warn1`, `DomainFactory.start - Service:${service.name} is taking longer than ${waitTime}ms to setup.`);
                                if (isFunction(timeout)) {
                                    timeout(service.name);
                                }
                            }, waitTime);

                            service.setup(() => {
                                service.activateIncomingStream({
                                    forceBufferingOnAllIncomingStreams: slowRunMode,
                                    bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                    bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                });
                                service.activateOutgoingStream({
                                    bufferOutgoingStreams: slowRunMode,
                                    bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                    bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                                });
                                log(`info1`, `Activated service:${service.name}.`);
                                clearTimeout(serviceTimeoutId);
                            });
                        });
                    }

                    /* then activate parent to child interfaces... */
                    if (isObject(_intf)) {
                        const intfTimeoutId = setTimeout(() => {
                            log(`warn1`, `DomainFactory.start - Interface:${_intf.name} is taking longer than ${waitTime}ms to setup.`);
                            if (isFunction(timeout)) {
                                timeout(_intf.name);
                            }
                        }, waitTime);

                        _intf.setup(() => {
                            _intf.activateIncomingStream({
                                forceBufferingOnAllIncomingStreams: slowRunMode,
                                bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                            });
                            _intf.activateOutgoingStream({
                                bufferOutgoingStreams: slowRunMode,
                                bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                            });
                            log(`info1`, `Activated interface:${_intf.name}.`);
                            clearTimeout(intfTimeoutId);
                        });
                    } else {
                        log(`warn0`, `DomainFactory.start - Domain:${domain.name} is not registered with an interface.`);
                    }

                    /* then activate store... */
                    if (isObject(_store)) {
                        const storeTimeoutId = setTimeout(() => {
                            log(`warn1`, `DomainFactory.start - Store:${_store.name} is taking longer than ${waitTime}ms to setup.`);
                            if (isFunction(timeout)) {
                                timeout(_store.name);
                            }
                        }, waitTime);

                        _store.setup(() => {
                            _store.activateIncomingStream({
                                forceBufferingOnAllIncomingStreams: slowRunMode,
                                bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                            });
                            _store.activateOutgoingStream({
                                bufferOutgoingStreams: slowRunMode,
                                bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                                bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                            });
                            log(`info1`, `Activated store:${_store.name}.`);
                            clearTimeout(storeTimeoutId);
                        });
                    }

                    /* then finally activate domain... */
                    domain.activateOutgoingStream({
                        bufferOutgoingStreams: slowRunMode,
                        bufferTimeSpan: SLOW_MODE_BUFFER_TIME_SPAN_IN_MS,
                        bufferTimeShift: SLOW_MODE_BUFFER_TIME_SHIFT_IN_MS
                    });

                    _started = true;

                    log(`info1`, `Domain:${domain.name} has started.`);
                    clearTimeout(domainTimeoutId);

                    done();

                    if (renderToTarget && isObject(_intf)) {
                        _intf.renderToTarget(targetId, option);
                    }
                });
            } else {
                domain.restart(done, option);
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
        this.stop = function (done, option = {
            resetStore: true,
            resetServices: true,
            waitTime: DEFAULT_TEARDOWN_WAIT_TIME_IN_MS
        }) {
            const domain = this;

            if (ENV.DEVELOPMENT) {
                // if (!domain.isInitialized()) {
                //     log(`error`, `DomainFactory.stop - Domain:${domain.name} stop cannot be call before initialization.`);
                // }
                if (!domain.isStreamActivated()) {
                    log(`error`, `DomainFactory.stop - Domain:${domain.name} stop cannot be call before event stream activation..`);
                }
                if (!isFunction(done)) {
                    log(`error`, `DomainFactory.stop - DomainFactory.stop - Input done function is invalid.`);
                }
            }

            const {
                resetStore,
                resetServices,
                waitTime,
                timeout
            } = fallback({
                resetStore: true,
                resetServices: true,
                waitTime: DEFAULT_TEARDOWN_WAIT_TIME_IN_MS
            }).of(option);
            const services = Object.values(_serviceCache);
            const childDomains = Object.values(_childDomainCache);
            const peerDomains = Object.values(_peerDomainCache);

            if (domain.hasStarted()) {
                const domainTimeoutId = setTimeout(() => {
                    log(`warn1`, `DomainFactory.stop - Domain:${domain.name} is taking longer than ${waitTime}ms to teardown.`);
                    if (isFunction(timeout)) {
                        timeout(domain.name);
                    }
                }, waitTime);

                log(`info1`, `Stopping domain:${domain.name}...`);
                domain.teardown(() => {
                    /* first stop child domains... */
                    if (isNonEmptyArray(childDomains)) {
                        childDomains.forEach((childDomain) => {
                            const childDomainTimeoutId = setTimeout(() => {
                                log(`warn1`, `Child domain:${childDomain.name} is taking longer than ${waitTime}ms to stop.`);
                                if (isFunction(timeout)) {
                                    timeout(childDomain.name);
                                }
                            }, waitTime);
                            childDomain.stop(() => clearTimeout(childDomainTimeoutId), option);
                        });
                    }

                    /* then peer domains... */
                    if (isNonEmptyArray(peerDomains)) {
                        peerDomains.forEach((peerDomain) => {
                            const peerDomainTimeoutId = setTimeout(() => {
                                log(`warn1`, `Peer domain:${peerDomain.name} is taking longer than ${waitTime}ms to stop.`);
                                if (isFunction(timeout)) {
                                    timeout(peerDomain.name);
                                }
                            }, waitTime);
                            peerDomain.stop(() => clearTimeout(peerDomainTimeoutId), option);
                        });
                    }

                    /* then stop child to parent interfaces... */
                    if (isObject(_intf)) {
                        const intfTimeoutId = setTimeout(() => {
                            log(`warn1`, `DomainFactory.stop - Interface:${_intf.name} is taking longer than ${waitTime}ms to teardown.`);
                            if (isFunction(timeout)) {
                                timeout(_intf.name);
                            }
                        }, waitTime);

                        _intf.teardown(() => {
                            _intf.deactivateIncomingStream();
                            _intf.deactivateOutgoingStream();
                            log(`info1`, `Deactivated interface:${_intf.name}.`);
                            clearTimeout(intfTimeoutId);
                        });
                    }

                    /* then store... */
                    if (isObject(_store)) {
                        const storeTimeoutId = setTimeout(() => {
                            log(`warn1`, `DomainFactory.stop - Store:${_store.name} is taking longer than ${waitTime}ms to teardown.`);
                            if (isFunction(timeout)) {
                                timeout(_store.name);
                            }
                        }, waitTime);
                        _store.teardown(() => {
                            _store.deactivateIncomingStream();
                            _store.deactivateOutgoingStream();
                            if (resetStore && isFunction(_store.reset)) {
                                /* reset store state */
                                _store.reset();
                            }
                            log(`info1`, `Deactivated store:${_store.name}.`);
                            clearTimeout(storeTimeoutId);
                        });
                    }

                    /* then services... */
                    if (isNonEmptyArray(services)) {
                        services.forEach((service) => {
                            const serviceTimeoutId = setTimeout(() => {
                                log(`warn1`, `DomainFactory.stop - Service:${service.name} is taking longer than ${waitTime}ms to teardown.`);
                                if (isFunction(timeout)) {
                                    timeout(service.name);
                                }
                            }, waitTime);

                            service.teardown(() => {
                                service.deactivateIncomingStream();
                                service.deactivateOutgoingStream();
                                if (resetServices && isFunction(service.reset)) {
                                    /* reset service state */
                                    service.reset();
                                }
                                log(`info1`, `Deactivated service:${service.name}.`);
                                clearTimeout(serviceTimeoutId);
                            });
                        });
                    }

                    /* then finally parent domain. */
                    domain.deactivateIncomingStream();
                    domain.deactivateOutgoingStream();

                    _started = false;

                    log(`info1`, `Domain:${domain.name} has stopped.`);
                    clearTimeout(domainTimeoutId);
                    done();
                });
            }
        };

        /**
         * @description - Restart domain.
         *
         * @method restart
         * @param {string} targetId
         * @param {function} done,
         * @param {object} option,
         * @return void
         */
        this.restart = function (targetId, done, option = {
            waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
        }) {
            const domain = this;
            const {
                waitTime,
                timeout
            } = fallback({
                waitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS
            }).of(option);

            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `DomainFactory.restart - Input done function is invalid.`);
                }
            }

            const domainTimeoutId = setTimeout(() => {
                log(`warn1`, `DomainFactory.restart - Domain:${domain.name} is taking longer than ${waitTime} seconds to stop and restart.`);
                if (isFunction(timeout)) {
                    timeout(domain.name);
                }
            }, waitTime);

            domain.stop(() => {
                clearTimeout(domainTimeoutId);
                domain.start(targetId, done, option);
            }, option);
        };
    }
});
