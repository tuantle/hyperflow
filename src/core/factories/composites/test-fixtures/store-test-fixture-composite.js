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
 * @module StoreTestFixtureComposite
 * @description - A store test fixture composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../../elements/common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../../factory-code';

/* delay all data stream from store by 1s as default */
const DELAY_STORE_IN_MS = 1000;

/**
 * @description - A store test fixture composite module.
 *
 * @module StoreTestFixtureComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that provider is valid for this composite.
         *
         * @method $initStoreTestFixtureComposite
         * @return void
         */
        $initStoreTestFixtureComposite: function $initStoreTestFixtureComposite () {
            const fixture = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
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
                    Hflow.log(`error`, `StoreTestFixtureComposite.$init - Fixture is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        StoreTestFixtureComposite: function StoreTestFixtureComposite () {
            /* ----- Private Variables ------------- */
            /* flag indicates start method has called */
            let _started = false;
            /* store test subject */
            let _store;
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
             * @description - Register a testable store.
             *
             * @method register
             * @param {object} definition - Test fixture registration definition for store.
             * @return void
             */
            this.register = function register (definition) {
                const fixture = this;
                if (!Hflow.isSchema({
                    testSubject: `object`
                }).of(definition)) {
                    Hflow.log(`error`, `StoreTestFixtureComposite.register - Input definition object is invalid.`);
                } else {
                    const {
                        testSubject: store
                    } = definition;
                    if (Hflow.isObject(store)) {
                        if (!Hflow.isSchema({
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
                            Hflow.log(`error`, `StoreTestFixtureComposite.register - Input store is invalid.`);
                        } else if (Hflow.isObject(_store)) {
                            Hflow.log(`warn1`, `StoreTestFixtureComposite.register - Test fixture:${fixture.name} registered store:${store.name}.`);
                        } else {
                            _store = store;
                            /* setup event stream observation duplex between store and test fixture */
                            _store.observe(fixture);
                            fixture.observe(_store).delay(DELAY_STORE_IN_MS);
                            Hflow.log(`info`, `Test fixture:${fixture.name} registered store:${store.name}.`);
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
                    Hflow.log(`error`, `StoreTestFixtureComposite.start - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        fixture.activateIncomingStream();
                        fixture.setup(() => {
                            if (!Hflow.isObject(_store)) {
                                Hflow.log(`error`, `StoreTestFixtureComposite.start - Test fixture:${fixture.name} is not registered with a store.`);
                            } else {
                                _store.activateIncomingStream();
                                _store.setup(() => {
                                    _store.activateOutgoingStream();
                                    Hflow.log(`info`, `Test fixture:${fixture.name} activated store:${_store.name}.`);
                                });
                            }
                            fixture.activateOutgoingStream();
                            _started = true;
                            done();
                        });
                    } else {
                        fixture.restart(option);
                        Hflow.log(`warn1`, `StoreTestFixtureComposite.start - Test fixture:${fixture.name} is already started. Restarting...`);
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
                    Hflow.log(`error`, `StoreTestFixtureComposite.stop - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        Hflow.log(`warn1`, `StoreTestFixtureComposite.stop - Test fixture:${fixture.name} is already stopped.`);
                    } else {
                        fixture.teardown(() => {
                            if (Hflow.isObject(_store)) {
                                _store.teardown(() => {
                                    _store.deactivateIncomingStream();
                                    _store.deactivateOutgoingStream();
                                    Hflow.log(`info`, `Test fixture:${fixture.name} deactivated store:${_store.name}.`);
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
