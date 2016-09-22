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
 * @module DomainTestFixtureComposite
 * @description - A domain test fixture composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE,
    DOMAIN_FACTORY_CODE
} from '../../factory-code';

/* delay all data stream from domain by 1s as default */
const DELAY_DOMAIN_IN_MS = 1000;

/**
 * @description - A domain test fixture composite module.
 *
 * @module DomainTestFixtureComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that provider is valid for this composite.
         *
         * @method $initDomainTestFixtureComposite
         * @return void
         */
        $initDomainTestFixtureComposite: function $initDomainTestFixtureComposite () {
            const fixture = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    fId: `string`,
                    name: `string`,
                    start: `function`,
                    stop: `function`,
                    setup: `function`,
                    teardown: `function`,
                    observe: `function`,
                    activateIncomingStream: `function`,
                    activateOutgoingStream: `function`,
                    deactivateIncomingStream: `function`,
                    deactivateOutgoingStream: `function`
                }).of(fixture) || fixture.fId.substr(0, FIXTURE_FACTORY_CODE.length) !== FIXTURE_FACTORY_CODE) {
                    Hflow.log(`error`, `DomainTestFixtureComposite.$init - Fixture is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        DomainTestFixtureComposite: function DomainTestFixtureComposite () {
            /* ----- Private Variables ------------- */
            /* flag indicates start method has called */
            let _started = false;
            /* domain test subject */
            let _domain;
            /* ----- Public Functions -------------- */
            /**
             * @description - Check if fixture has started.
             *
             * @method hasStarted
             * @return {boolean}
             */
            this.hasStarted = function hasStarted () {
                return _started;
            };
            /**
             * @description - Register a testable domain.
             *
             * @method register
             * @param {object} definition - Test fixture registration definition for domain.
             * @return void
             */
            this.register = function register (definition) {
                const fixture = this;
                if (!Hflow.isSchema({
                    testSubject: `object`
                }).of(definition)) {
                    Hflow.log(`error`, `DomainTestFixtureComposite.register - Input definition object is invalid.`);
                } else {
                    const {
                        testSubject: domain
                    } = definition;
                    if (Hflow.isObject(domain)) {
                        if (!Hflow.isSchema({
                            fId: `string`,
                            name: `string`,
                            start: `function`,
                            stop: `function`,
                            observe: `function`
                        }).of(domain) || domain.fId.substr(0, DOMAIN_FACTORY_CODE.length) !== DOMAIN_FACTORY_CODE) {
                            Hflow.log(`error`, `DomainTestFixtureComposite.register - Input domain is invalid.`);
                        } else if (Hflow.isObject(_domain)) {
                            Hflow.log(`warn1`, `DomainTestFixtureComposite.register - Test fixture:${fixture.name} registered domain:${domain.name}.`);
                        } else {
                            _domain = domain;
                            /* setup event stream observation duplex between domain and test fixture */
                            _domain.observe(fixture);
                            fixture.observe(_domain).delay(DELAY_DOMAIN_IN_MS);
                            Hflow.log(`info`, `Test fixture:${fixture.name} registered domain:${domain.name}.`);
                        }
                    }
                }
            };
            /**
             * @description - Start test fixture.
             *
             * @method start
             * @param {object} option
             * @param {function} done
             * @return void
             */
            this.start = function start (option = {}, done) {
                const fixture = this;

                // TODO: Implement use case for fixture start option.
                option = Hflow.isObject(option) ? option : {};

                if (!Hflow.isFunction(done)) {
                    Hflow.log(`error`, `DomainTestFixtureComposite.start - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        fixture.activateIncomingStream();
                        fixture.setup(() => {
                            if (!Hflow.isObject(_domain)) {
                                Hflow.log(`error`, `DomainTestFixtureComposite.start - Test fixture:${fixture.name} is not registered with a domain.`);
                            } else {
                                _domain.start(() => {
                                    Hflow.log(`info`, `Domain:${_domain.name} has started.`);
                                });
                            }
                            fixture.activateOutgoingStream();
                            _started = true;
                            done();
                        });
                    } else {
                        fixture.restart(option, done);
                        Hflow.log(`warn1`, `DomainTestFixtureComposite.start - Test fixture:${fixture.name} is already started. Restarting...`);
                    }
                }
            };
            /**
             * @description - Stop test fixture.
             *
             * @method stop
             * @param {function} done
             * @return void
             */
            this.stop = function stop (done) {
                const fixture = this;
                if (!Hflow.isFunction(done)) {
                    Hflow.log(`error`, `DomainTestFixtureComposite.stop - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        Hflow.log(`warn1`, `DomainTestFixtureComposite.stop - Test fixture:${fixture.name} is already stopped.`);
                    } else {
                        fixture.teardown(() => {
                            if (Hflow.isObject(_domain)) {
                                _domain.stop(() => {
                                    Hflow.log(`info`, `Domain:${_domain.name} has stopped.`);
                                });
                            }
                            fixture.deactivateIncomingStream();
                            fixture.deactivateOutgoingStream();
                            _started = false;
                            done();
                        });
                    }
                }
            };
        }
    }
});