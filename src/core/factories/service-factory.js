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
 * @module ServiceFactory
 * @description - A generic service factory module..
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
    SERVICE_FACTORY_CODE
} from './factory-code';

/**
 * @description - A service factory module.
 *
 * @module ServiceFactory
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
                    return `${SERVICE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    ServiceFactory: function ServiceFactory () {
        /* ----- Private Variables ------------- */
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hflow.log(`warn0`, `ServiceFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup service event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `ServiceFactory.setup - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Teardown service event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (!Hflow.isFunction(done)) {
                Hflow.log(`error`, `ServiceFactory.teardown - Input done function is invalid.`);
            } else {
                done();
            }
        };
    }
});
