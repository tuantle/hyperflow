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
 * @module StoreFactory
 * @description - A state data store factory.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load StateReducerComposite and StateReconfigurationComposite */
import StateReducerComposite from './composites/state-reducer-composite';
import StateReconfigurationComposite from './composites/state-reconfiguration-composite';

/* load Composer */
import Composer from '../composer';

/* load CommonElement */
import CommonElement from '../elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/* factory Ids */
import {
    STORE_FACTORY_CODE
} from './factory-code';

/**
 * @description - An app state data store factory module.
 *
 * @module StoreFactory
 */
export default Composer({
    composites: [
        EventStreamComposite,
        StateReducerComposite,
        StateReconfigurationComposite
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
                    return `${STORE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    StoreFactory: function StoreFactory () {
        /* ----- Private Variables ------------- */
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize store.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `StoreFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Setup store event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `StoreFactory.setup - Input done function is invalid.`);
            } else {
                done();
            }
        };
        /**
         * @description - Teardown store event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (!Hf.isFunction(done)) {
                Hf.log(`error`, `StoreFactory.teardown - Input done function is invalid.`);
            } else {
                done();
            }
        };
    }
});
