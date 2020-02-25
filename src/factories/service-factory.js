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
 * @module ServiceFactory
 * @description - A generic service factory module..
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isFunction,
    log
} from '../../libs/utils/common-util';

import Composer from '../composer';

import EventStreamComposite from '../../libs/composites/event-stream-composite';

export default Composer({
    composites: [
        EventStreamComposite
    ],
    static: {
        type: `service`
    },
    ServiceFactory () {
        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            log(`warn0`, `ServiceFactory.$init - Method is not implemented by default.`);
        };

        /**
         * @description - Reset service.
         *
         * @method reset
         * @param {object} option
         * @return void
         */
        this.reset = function (option) { // eslint-disable-line
            log(`warn0`, `ServiceFactory.reset - Method is not implemented by default.`);
        };

        /**
         * @description - Setup service event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `ServiceFactory.setup - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Teardown service event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `ServiceFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };
    }
});
