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
 * @module InterfaceTestFixtureComposite
 * @description - An interface test fixture composite.
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
    INTERFACE_FACTORY_CODE
} from '../../factory-code';

/* delay all data stream from intf by 1s as default */
const DELAY_INTERFACE_IN_MS = 1000;

/**
 * @description - An interface test fixture composite module.
 *
 * @module InterfaceTestFixtureComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that provider is valid for this composite.
         *
         * @method $initInterfaceTestFixtureComposite
         * @return void
         */
        $initInterfaceTestFixtureComposite: function $initInterfaceTestFixtureComposite () {
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
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.$init - Fixture is invalid. Cannot apply composite.`);
                }
            }
        }
    },
    enclosure: {
        InterfaceTestFixtureComposite: function InterfaceTestFixtureComposite () {
            /* ----- Private Variables ------------- */
            /* flag indicates start method has called */
            let _started = false;
            /* interface test subject */
            let _intf;
            let _componentLib;
            let _componentRenderer;
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
             * @description - Get the composed app top interface component from intf.
             *
             * @method getTopComponent
             * @return {object|function}
             */
            this.getTopComponent = function getTopComponent () {
                Hflow.log(`warn0`, `InterfaceTestFixtureComposite.getTopComponent - Method is not implemented by default.`);
            };
            /**
             * @description - Get this fixture as a top level intf.
             *
             * @method getTopDomain
             * @return {object}
             */
            this.getTopDomain = function getTopDomain () {
                const fixture = this;
                return fixture;
            };
            /**
             * @description - Render test fixture top level component to the target env.
             *
             * @method renderToTarget
             * @return {void|string}
             */
            this.renderToTarget = function renderToTarget () {
                Hflow.log(`warn0`, `InterfaceTestFixtureComposite.renderToTarget - Method is not implemented by default.`);
            };
            /**
             * @description - Get test fixture component renderer.
             *
             * @method getComponentRenderer
             * @return {object}
             */
            this.getComponentRenderer = function getComponentRenderer () {
                if (!Hflow.isObject(_componentRenderer)) {
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.getComponentRenderer - Test fixture is not registered with a component renderer.`);
                } else {
                    return _componentRenderer;
                }
            };
            /**
             * @description - Get test fixture component toolkit or library for building & rendering interfaces.
             *
             * @method getComponentLib
             * @return {object}
             */
            this.getComponentLib = function getComponentLib () {
                if (!Hflow.isObject(_componentLib)) {
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.getComponentLib - Test fixture is not registered with a component library.`);
                } else {
                    return _componentLib;
                }
            };
            /**
             * @description - Register a testable intf.
             *
             * @method register
             * @param {object} definition - Test fixture registration definition for interface.
             * @return void
             */
            this.register = function register (definition) {
                const fixture = this;
                if (!Hflow.isSchema({
                    testSubject: `object`,
                    componentLib: `object`,
                    componentRenderer: `object`
                }).of(definition)) {
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.register - Input definition object is invalid.`);
                } else {
                    const {
                        testSubject: intf,
                        componentLib,
                        componentRenderer
                    } = definition;
                    _componentLib = componentLib;
                    _componentRenderer = componentRenderer;
                    if (Hflow.isObject(intf)) {
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
                        }).of(intf) || intf.fId.substr(0, INTERFACE_FACTORY_CODE.length) !== INTERFACE_FACTORY_CODE) {
                            Hflow.log(`error`, `InterfaceTestFixtureComposite.register - Input interface is invalid.`);
                        } else if (Hflow.isObject(_intf)) {
                            Hflow.log(`warn1`, `InterfaceTestFixtureComposite.register - Test fixture:${fixture.name} registered interface:${intf.name}.`);
                        } else {
                            _intf = intf;
                            /* setup event stream observation duplex between interface and test fixture */
                            _intf.observe(fixture);
                            fixture.observe(_intf).delay(DELAY_INTERFACE_IN_MS);
                            Hflow.log(`info`, `Test fixture:${fixture.name} registered interface:${intf.name}.`);
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
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.start - Input done function is invalid.`);
                } else {
                    // TODO: Needs implementation.
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
                    Hflow.log(`error`, `InterfaceTestFixtureComposite.stop - Input done function is invalid.`);
                } else {
                    if (!_started) {
                        Hflow.log(`warn1`, `InterfaceTestFixtureComposite.stop - Test fixture:${fixture.name} is already stopped.`);
                    } else {
                        fixture.teardown(() => {
                            if (Hflow.isObject(_intf)) {
                                _intf.teardown(() => {
                                    _intf.deactivateIncomingStream();
                                    _intf.deactivateOutgoingStream();
                                    Hflow.log(`info`, `Test fixture:${fixture.name} deactivated intf:${_intf.name}.`);
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
