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
 * @module StoreFactory
 * @description - A state data store factory.
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
        type: `store`
    },
    StoreFactory () {
        /**
         * @description - Initialize store.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            log(`warn0`, `StoreFactory.$init - Method is not implemented by default.`);
        };


        /**
         * @description - Get state as a plain object.
         *
         * @method getStateAsObject
         * @return {object}
         */
        this.getStateAsObject = function () {
            log(`error`, `StoreFactory.getStateAsObject - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Reset to initial state.
         *
         * @method resetToInitialState
         * @param {object} option
         * @return void
         */
        this.getInitialStateAsObject = function () {
            log(`error`, `StoreFactory.resetToInitialState - Method is not implemented by default. Implementation required.`);
        };


        /**
         * @description - Clear all state mutation history.
         *
         * @method flush
         * @param {object} option
         * @return void
         */
        this.flush = function (option = {}) { // eslint-disable-line
            log(`error`, `StoreFactory.flush - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Revert to the previous state mutation from time history at path Id.
         *                Head state cursor changes back to the previous timeIndex.
         *
         * @method revertToTimeIndex
         * @param {string} key
         * @param {number} timeIndexOffset
         * @return {bool}
         */
        this.revertToTimeIndex = function (key, timeIndexOffset = -1) { // eslint-disable-line
            log(`error`, `StoreFactory.revertToTimeIndex - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Traverse and recall the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recall
         * @param {string} key
         * @param {number} timeIndexOffset
         * @return {object|null}
         */
        this.recall = function (key, timeIndexOffset) { // eslint-disable-line
            log(`error`, `StoreFactory.recall - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Traverse and recall all the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recallAll
         * @param {string} key
         * @return {array}
         */
        this.recallAll = function (key) { // eslint-disable-line
            log(`error`, `StoreFactory.recallAll - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Reset store.
         *
         * @method reset
         * @param {object} option
         * @return void
         */
        this.reset = function (option) { // eslint-disable-line
            log(`error`, `StoreFactory.reset - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description -  Do state change/mutation.
         *
         * @method mutate
         * @param {object|function} mutator
         * @param {object} option
         * @return {boolean}
         */
        this.mutate = function (mutator, option) { // eslint-disable-line
            log(`error`, `StoreFactory.mutate - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Setup store event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `StoreFactory.setup - Input done function is invalid.`);
                }
            }

            done();
        };

        /**
         * @description - Teardown store event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function (done) {
            if (ENV.DEVELOPMENT) {
                if (!isFunction(done)) {
                    log(`error`, `StoreFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };
    }
});
