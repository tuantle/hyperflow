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

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* load CommonElement */
import CommonElement from '../elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/* factory Ids */
import {
    DOMAIN_FACTORY_CODE,
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE,
    INTERFACE_FACTORY_CODE
} from './factory-code';

/* delay all data stream from store by 10ms as default */
const DELAY_STORE_IN_MS = 10;

/* delay all data stream from service by 10ms as default */
const DELAY_SERVICE_IN_MS = 10;

/* delay all data stream from interface by 10ms as default */
const DEBOUNCE_INTERFACE_IN_MS = 10;

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
                        services = services.concat(Hf.collect(_services, ...serviceNames));
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
            if (!Hf.isObject(definition) || Hf.isEmpty(definition)) {
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
                        Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered interface:${intf.name}.`);
                    } else {
                        _intf = intf;
                        /* setup event stream with domain observing interface */
                        domain.observe(_intf).debounce(DEBOUNCE_INTERFACE_IN_MS);
                        Hf.log(`info`, `Domain:${domain.name} registered interface:${intf.name}.`);
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
                            Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered store:${store.name}.`);
                        } else {
                            _store = store;
                            /* setup event stream observation duplex between domain and store */
                            domain.observe(_store).delay(DELAY_STORE_IN_MS);
                            _store.observe(domain);
                            Hf.log(`info`, `Domain:${domain.name} registered store:${store.name}.`);
                        }
                    }
                }
                if (Hf.isObject(_store) && Hf.isObject(_intf)) {
                    /* setup event stream with interface observing store */
                    // _intf.observe(_store).delay(DELAY_STORE_IN_MS);
                    _intf.observe(_store);
                    /* interface is now un-pure and mirror its state with a store */
                    _intf.reflectStateOf(_store);
                    Hf.log(`info`, `Interface:${intf.name} reflecting store:${_store.name}.`);
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
                            if (_services.some((_service) => _service.name === service.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Domain:${domain.name} already registered service:${service.name}.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered service:${service.name}.`);
                            return true;
                        }));
                        /* setup event stream observation duplex between domain and servies */
                        domain.observe(..._services).delay(DELAY_SERVICE_IN_MS);
                        _services.forEach((service) => service.observe(domain));
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
                            } else if (_peerDomains.some((peerDomain) => peerDomain.name === childDomain.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Child domain:${childDomain.name} is already registered as a peer.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered child domain:${childDomain.name}.`);
                            return true;
                        }));
                        if (Hf.isObject(_intf)) {
                            _intf.composedOf(
                                ..._childDomains.map((childDomain) => childDomain.getInterface())
                                                .filter((compositeIntfintf) => Hf.isObject(compositeIntfintf))
                            );
                        }
                        /* setup event stream observation duplex between domain and children */
                        domain.observe(..._childDomains);
                        _childDomains.forEach((childDomain) => childDomain.observe(domain));
                    }
                }
                if (Hf.isArray(peerDomains)) {
                    let index = 0;
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
                            } else if (_childDomains.some((childDomain) => childDomain.name === peerDomain.name)) {
                                Hf.log(`warn1`, `DomainFactory.register - Peer domain:${peerDomain.name} is already registered as a child.`);
                                return false;
                            }
                            Hf.log(`info`, `Domain:${domain.name} registered peer domain:${peerDomain.name}.`);
                            return true;
                        }));

                        while (index < peerDomains.length) {
                            const peerDomain = peerDomains[index];
                            peerDomains[index] = domain;
                            peerDomain.register({
                                peerDomains
                            });
                            peerDomains[index] = peerDomain;
                            index += 1;
                        }
                        /* setup event stream observation duplex between domain and peers */
                        domain.observe(..._peerDomains);
                        _peerDomains.forEach((peerDomain) => peerDomain.observe(domain));
                    }
                }
            }
        };
        /**
         * @description - Start domain.
         *
         * @method start
         * @param {object} option
         * @param {function} done
         * @return void
         */
        this.start = function start (option = {}, done) {
            const domain = this;

            // FIXME: Need to rethink the start up sequence as delay is needed after domain observes services or store.
            // TODO: Implement use case for domain start option.
            option = Hf.isObject(option) ? option : {};

            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.start - Input done function is invalid.`);
            } else {
                if (!_started) {
                    domain.activateIncomingStream();
                    domain.setup(() => {
                        /* first start up with child domains... */
                        if (!Hf.isEmpty(_childDomains)) {
                            _childDomains.forEach((childDomain) => childDomain.start(option, () => {
                                Hf.log(`info`, `Child domain:${childDomain.name} has started.`);
                            }));
                        }
                        /* then peer domains... */
                        if (!Hf.isEmpty(_peerDomains)) {
                            _peerDomains.forEach((peerDomain) => peerDomain.start(option, () => {
                                Hf.log(`info`, `Peer domain:${peerDomain.name} has started.`);
                            }));
                        }
                        /* then services... */
                        if (!Hf.isEmpty(_services)) {
                            _services.forEach((service) => {
                                service.activateIncomingStream();
                                service.setup(() => {
                                    service.activateOutgoingStream();
                                    Hf.log(`info`, `Domain:${domain.name} activated service:${service.name}.`);
                                });
                            });
                        }
                        /* then store... */
                        if (Hf.isObject(_store)) {
                            _store.activateIncomingStream();
                            _store.setup(() => {
                                _store.activateOutgoingStream();
                                Hf.log(`info`, `Domain:${domain.name} activated store:${_store.name}.`);
                            });
                        }
                        /* then with parent to child interfaces... */
                        if (Hf.isObject(_intf)) {
                            /* helper function to activate all child interfaces event stream */
                            const deepInterfaceActivateStream = function deepInterfaceActivateStream (intf) {
                                if (Hf.isObject(intf)) {
                                    // TODO: compositeIntf does not need to activate incoming event stream.
                                    intf.activateIncomingStream();
                                    intf.setup(() => {
                                        intf.getInterfaceComposites().forEach((compositeIntf) => deepInterfaceActivateStream(compositeIntf));
                                        intf.activateOutgoingStream();
                                        Hf.log(`info`, `Domain:${domain.name} activated interface:${intf.name}.`);
                                    });
                                } else {
                                    Hf.log(`warn0`, `DomainFactory.start.deepInterfaceActivateStream - Input interface is invalid.`);
                                }
                            };
                            deepInterfaceActivateStream(_intf);
                        } else {
                            Hf.log(`warn0`, `DomainFactory.start - Domain:${domain.name} is not registered with an interface.`);
                        }
                        /* then finally parent domain. */
                        domain.activateOutgoingStream();
                        _started = true;
                        done();
                    });
                } else {
                    domain.restart(option, done);
                    Hf.log(`warn1`, `DomainFactory.start - Domain:${domain.name} is already started. Restarting...`);
                }
            }
        };
        /**
         * @description - Stop domain.
         *
         * @method stop
         * @param {function} done
         * @return void
         */
        this.stop = function stop (done) {
            // TODO: Needs to test domain.stop
            const domain = this;
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.stop - Input done function is invalid.`);
            } else {
                if (!_started) {
                    Hf.log(`warn1`, `DomainFactory.stop - Domain:${domain.name} is already stopped.`);
                } else {
                    domain.teardown(() => {
                        /* first stop child domains... */
                        if (!Hf.isEmpty(_childDomains)) {
                            _childDomains.forEach((childDomain) => childDomain.stop(() => {
                                Hf.log(`info`, `Child domain:${childDomain.name} has stopped.`);
                            }));
                        }

                        /* then peer domains... */
                        if (!Hf.isEmpty(_peerDomains)) {
                            _peerDomains.forEach((peerDomain) => peerDomain.stop(() => {
                                Hf.log(`info`, `Peer domain:${peerDomain.name} has stopped.`);
                            }));
                        }

                        /* then stop child to parent interfaces... */
                        if (Hf.isObject(_intf)) {
                            /* helper function to deactivate all child interfaces event stream */
                            const deepInterfaceDeactivateStream = function deepInterfaceDeactivateStream (intf) {
                                if (Hf.isObject(intf)) {
                                    intf.teardown(() => {
                                        intf.getInterfaceComposites().forEach((compositeIntf) => deepInterfaceDeactivateStream(compositeIntf));
                                        // TODO: compositeIntf does not or should not have incoming event stream activated.
                                        intf.deactivateIncomingStream();
                                        intf.deactivateOutgoingStream();
                                        // TODO: Un-reflect state from store?
                                        Hf.log(`info`, `Domain:${domain.name} deactivated interface:${intf.name}.`);
                                    });
                                } else {
                                    Hf.log(`warn0`, `DomainFactory.stop.deepInterfaceDeactivateStream - Input interface is invalid.`);
                                }
                            };
                            deepInterfaceDeactivateStream(_intf);
                        }

                        /* then store... */
                        if (Hf.isObject(_store)) {
                            _store.teardown(() => {
                                _store.deactivateIncomingStream();
                                _store.deactivateOutgoingStream();
                                Hf.log(`info`, `Domain:${domain.name} deactivated store:${_store.name}.`);
                            });
                        }

                        /* then services... */
                        if (!Hf.isEmpty(_services)) {
                            _services.forEach((service) => {
                                service.teardown(() => {
                                    service.deactivateIncomingStream();
                                    service.deactivateOutgoingStream();
                                    Hf.log(`info`, `Domain:${domain.name} deactivated service:${service.name}.`);
                                });
                            });
                        }

                        /* then finally parent domain. */
                        domain.deactivateIncomingStream();
                        domain.deactivateOutgoingStream();

                        _started = false;
                        done();
                    });
                }
            }
        };
        /**
         * @description - Restart domain.
         *
         * @method restart
         * @param {object} option,
         * @param {function} done
         * @return void
         */
        this.restart = function restart (option = {}, done) {
            const domain = this;

            // TODO: Implement use case for domain start option.
            option = Hf.isObject(option) ? option : {};

            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `DomainFactory.restart - Input done function is invalid.`);
            } else {
                domain.stop(() => {
                    domain.start(option, done);
                });
            }
        };
    }
});
