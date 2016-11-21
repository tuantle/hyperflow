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
 * @module ServiceTestFixtureComposite
 * @description - A service test fixture composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../../elements/common-element';

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE,
    SERVICE_FACTORY_CODE
} from '../../factory-code';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/* delay all data stream from service by 1s as default */
const DELAY_SERVICE_IN_MS = 1000;

/**
 * @description - A service test fixture composite module.
 *
 * @module ServiceTestFixtureComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that provider is valid for this composite.
         *
         * @method $initServiceTestFixtureComposite
         * @return void
         */
        $initServiceTestFixtureComposite: function $initServiceTestFixtureComposite () {
            const fixture = this;
            if (Hf.DEVELOPMENT) {
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
                }).of(fixture) || fixture.fId.substr(0, FIXTURE_FACTORY_CODE.length) !== FIXTURE_FACTORY_CODE) {
                    Hf.log(`error`, `ServiceTestFixtureComposite.$init - Fixture is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        ServiceTestFixtureComposite: function ServiceTestFixtureComposite () {
            /* ----- Private Variables ------------- */
            /* flag indicates start method has called */
            let _started = false;
            /* service test subject */
            let _service;
            /* ----- Public Functions -------------- */
            /**
             * @description - Register a testable service.
             *
             * @method register
             * @param {object} definition - Test fixture registration definition for service.
             * @return void
             */
            this.register = function register (definition) {
                const fixture = this;
                if (!Hf.isSchema({
                    testSubject: `object`
                }).of(definition)) {
                    Hf.log(`error`, `ServiceTestFixtureComposite.register - Input definition object is invalid.`);
                } else {
                    const {
                        testSubject: service
                    } = definition;
                    if (Hf.isObject(service)) {
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
                        }).of(service) || service.fId.substr(0, SERVICE_FACTORY_CODE.length) !== SERVICE_FACTORY_CODE) {
                            Hf.log(`error`, `ServiceTestFixtureComposite.register - Input service is invalid.`);
                        } else if (Hf.isObject(_service)) {
                            Hf.log(`warn1`, `ServiceTestFixtureComposite.register - Test fixture:${fixture.name} registered service:${service.name}.`);
                        } else {
                            _service = service;
                            /* setup event stream observation duplex between service and test fixture */
                            _service.observe(fixture);
                            fixture.observe(_service).delay(DELAY_SERVICE_IN_MS);
                            Hf.log(`info`, `Test fixture:${fixture.name} registered service:${service.name}.`);

                            _service = service;
                            Hf.log(`info`, `Test fixture:${fixture.name} registered service:${service.name}.`);
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
                option = Hf.isObject(option) ? option : {};

                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `ServiceTestFixtureComposite.start - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        fixture.activateIncomingStream();
                        fixture.setup(() => {
                            if (!Hf.isObject(_service)) {
                                Hf.log(`error`, `ServiceTestFixtureComposite.start - Test fixture:${fixture.name} is not registered with a service.`);
                            } else {
                                _service.activateIncomingStream();
                                _service.setup(() => {
                                    _service.activateOutgoingStream();
                                    Hf.log(`info`, `Test fixture:${fixture.name} activated service:${_service.name}.`);
                                });
                            }
                            fixture.activateOutgoingStream();
                            _started = true;
                            done();
                        });
                    } else {
                        fixture.restart(option);
                        Hf.log(`warn1`, `ServiceTestFixtureComposite.start - Test fixture:${fixture.name} is already started. Restarting...`);
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
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `ServiceTestFixtureComposite.stop - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        Hf.log(`warn1`, `ServiceTestFixtureComposite.stop - Test fixture:${fixture.name} is already stopped.`);
                    } else {
                        fixture.teardown(() => {
                            if (Hf.isObject(_service)) {
                                _service.teardown(() => {
                                    _service.deactivateIncomingStream();
                                    _service.deactivateOutgoingStream();
                                    Hf.log(`info`, `Test fixture:${fixture.name} deactivated service:${_service.name}.`);
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
