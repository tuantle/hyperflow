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
 * @module FixtureFactory
 * @description - A generic test fixture factory module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* load CommonElement */
import CommonElement from '../elements/common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE
} from './factory-code';

/**
 * @description - A generic test fixture factory module.
 *
 * @module TestkitFactory
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
                    return `${FIXTURE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    FixtureFactory: function FixtureFactory () {
        /* ----- Private Variables ------------- */
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hflow.log(`warn0`, `FixtureFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup fixture event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `FixtureFactory.setup - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Teardown fixture event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `FixtureFactory.teardown - Input done function is invalid.`);
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
            return false;
        };
        /**
         * @description - Register testable domain, interface, service, or store.
         *
         * @method register
         * @param {object} definition - Test fixture registration definition for domain, interface, service, or store.
         * @return void
         */
        this.register = function register (definition) { // eslint-disable-line
            Hflow.log(`error`, `FixtureFactory.register - Method is not implemented by default. Implementation required.`);
        };
        /**
         * @description - Start the test fixture.
         *
         * @method start
         * @param {object} option
         * @param {function} done
         * @return void
         */
        this.start = function start (option = {}, done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `FixtureFactory.start - Input done function is invalid.`);
            } else {
                // TODO: Implement use case for fixture start option.
                option = Hflow.isObject(option) ? option : {};
                done();
            }
        };
        /**
         * @description - Stop the test fixture.
         *
         * @method stop
         * @param {function} done
         * @return void
         */
        this.stop = function stop (done) {
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `FixtureFactory.start - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Restart test fixture.
         *
         * @method restart
         * @param {object} option
         * @param {function} done
         * @return void
         */
        this.restart = function restart (option = {}, done) {
            const fixture = this;

            // TODO: Implement use case for fixture start option.
            option = Hflow.isObject(option) ? option : {};

            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `FixtureFactory.restart - Input done function is invalid.`);
            } else {
                fixture.stop(() => {
                    fixture.start(option, done);
                });
            }
        };
        /**
         * @description - Perform unit testing...
         *
         * @method test
         * @param {function} tester
         * @param {string} description
         * @return void
         */
        this.test = function test (tester, description = ``) { // eslint-disable-line
            Hflow.log(`error`, `FixtureFactory.stop - Method is not implemented by default. Implementation required.`);
        };
    }
});
