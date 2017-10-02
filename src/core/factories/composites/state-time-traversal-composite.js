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
 * @module StateTimeTraversalComposite
 * @description - A persistent state time traversal composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../hyperflow';

/* factory Ids */
import {
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

/**
 * @description - A persistent state time traversal composite module.
 *
 * @module StateTimeTraversalComposite
 * @return {object}
 */
export default Hf.Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateTimeTraversalComposite
         * @return void
         */
        $initStateTimeTraversalComposite: function $initStateTimeTraversalComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    reconfigState: `function`,
                    getStateCursor: `function`,
                    getStateAsObject: `function`
                }).of(factory) || !(factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hf.log(`error`, `StateTimeTraversalComposite.$init - Factory is invalid. Cannot apply composite.`);
                } else {
                    const stateCursor = factory.getStateCursor();
                    if (!Hf.isSchema({
                        hasItem: `function`,
                        recallContentItem: `function`
                    }).of(stateCursor)) {
                        Hf.log(`error`, `StateTimeTraversalComposite.$init - Factory state curcor is invalid. Cannot apply composite.`);
                    }
                }
            }
        },
        /**
         * @description - Clear all state mutation history.
         *
         * @method flush
         * @param {object} option
         * @return void
         */
        flush: function flush (option = {}) {
            const factory = this;

            option = Hf.isObject(option) ? option : {};

            factory.flushState(option);
        },
        /**
         * @description - Time traverse to the previous state mutation from time history at path Id.
         *                Head state cursor changes back to the previous timeIndex.
         *
         * @method timeTraverse
         * @param {string} key
         * @param {number} timeIndexOffset
         * @return void
         */
        timeTraverse: function timeTraverse (key, timeIndexOffset) {
            const factory = this;
            const stateCursor = factory.getStateCursor();
            let reconfiguration = {};

            if (Hf.DEVELOPMENT) {
                if (!stateCursor.hasItem(key)) {
                    Hf.log(`error`, `StateTimeTraversalComposite.timeTraverse - Data item key:${key} is not defined.`);
                } else if (!Hf.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                    Hf.log(`error`, `StateTimeTraversalComposite.timeTraverse - Input time index offset must be non-zero and negative.`);
                }
            }

            const {
                timestamp,
                content
            } = stateCursor.recallContentItem(key, timeIndexOffset);

            if (Hf.DEVELOPMENT) {
                if (!(Hf.isDefined(content) || Hf.isNumeric(timestamp))) {
                    Hf.log(`error`, `StateTimeTraversalComposite.timeTraverse - Unable to time traverse to undefined state of key:${key} at time index.`);
                }
            }

            reconfiguration[key] = content;

            factory.reconfigState(reconfiguration);

            const recalledState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});

            /* emitting a mutation event to interface */
            factory.outgoing(
                `as-state-mutated`,
                `do-sync-reflected-state`
            ).emit(() => recalledState);
            Hf.log(`info0`, `Time traversing to previous state at timestamp:${timestamp} of key:${key}.`);
        },
        /**
         * @description - Traverse and recall the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recall
         * @param {string} key
         * @param {number} timeIndexOffset
         * @return {object}
         */
        recall: function recall (key, timeIndexOffset) {
            const factory = this;
            const stateCursor = factory.getStateCursor();

            if (Hf.DEVELOPMENT) {
                if (!stateCursor.hasItem(key)) {
                    Hf.log(`error`, `StateTimeTraversalComposite.recall - Data item key:${key} is not defined.`);
                } else if (!Hf.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                    Hf.log(`error`, `StateTimeTraversalComposite.recall - Input time index offset must be non-zero and negative.`);
                }
            }

            const {
                timestamp,
                content
            } = stateCursor.recallContentItem(key, timeIndexOffset);

            if (Hf.DEVELOPMENT) {
                if (!(Hf.isDefined(content) || Hf.isNumeric(timestamp))) {
                    Hf.log(`error`, `StateTimeTraversalComposite.recall - Unable to recall an undefined state of key:${key} at time index.`);
                }
            }

            Hf.log(`info0`, `Recalling previous state at timestamp:${timestamp} of key:${key}.`);
            return content;
        },
        /**
         * @description - Traverse and recall all the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recallAll
         * @param {string} key
         * @return {array}
         */
        recallAll: function recallAll (key) {
            const factory = this;
            const stateCursor = factory.getStateCursor();

            if (Hf.DEVELOPMENT) {
                if (!stateCursor.hasItem(key)) {
                    Hf.log(`error`, `StateTimeTraversalComposite.recallAll - Data item key:${key} is not defined.`);
                }
            }

            const contentHistoryItems = stateCursor.recallAllContentItems(key);

            if (Hf.DEVELOPMENT) {
                if (!Hf.isArray(contentHistoryItems)) {
                    Hf.log(`error`, `StateTimeTraversalComposite.recallAll - Unable to recall all previous states of key:${key}.`);
                }
            }

            Hf.log(`info0`, `Recalling all previous states of key:${key}.`);
            return contentHistoryItems;
        }
    }
});
