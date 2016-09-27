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
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../elements/common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

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
export default CompositeElement({
    // TODO: Needs more testing. Possible bug in resert and recall methods.
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateTimeTraversalComposite
         * @return void
         */
        $initStateTimeTraversalComposite: function $initStateTimeTraversalComposite () {
            const factory = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    mutateState: `function`,
                    getStateCursor: `function`,
                    getStateAsObject: `function`,
                    updateStateAccessor: `function`
                }).of(factory) || !(factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.$init - Factory is invalid. Cannot apply composite.`);
                } else {
                    const cursor = factory.getStateCursor();
                    if (!Hflow.isSchema({
                        hasItem: `function`,
                        recallContentItem: `function`
                    }).of(cursor)) {
                        Hflow.log(`error`, `StateTimeTraversalComposite.$init - Factory state curcor is invalid. Cannot apply composite.`);
                    }
                }
            }
        },
        /**
         * @description - Time traverse to the previous state mutation from time history at path Id.
         *                Head state cursor changes back to the previous timeIndex.
         *
         * @method timeTraverse
         * @param {string|array} pathId
         * @param {number} timeIndexOffset
         * @return void
         */
        timeTraverse: function timeTraverse (pathId, timeIndexOffset) {
            const factory = this;
            const cursor = factory.getStateCursor();
            pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
            if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
                Hflow.log(`error`, `StateTimeTraversalComposite.timeTraverse - Input pathId is invalid.`);
            } else {
                const key = pathId[0];

                if (!cursor.hasItem(key)) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.timeTraverse - Data item key:${key} is not defined.`);
                } else if (!Hflow.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.timeTraverse - Input time index offset must be non-zero and negative.`);
                } else {
                    const {
                        timestamp,
                        content
                    } = cursor.recallContentItem(key, timeIndexOffset);
                    if (Hflow.isDefined(content) && Hflow.isNumeric(timestamp)) {
                        let mutator = Hflow.retrieve(pathId, `.`, true).from(content);
                        if (factory.mutateState(mutator)) {
                            factory.updateStateAccessor();
                            /* emitting a mutation event to interface */
                            factory.outgoing(`as-state-mutated`).emit(() => {
                                return Hflow.mix(factory.getStateAsObject(), {
                                    exclusion: {
                                        keys: [
                                            `name`,
                                            `fId`
                                        ]
                                    }
                                }).with({});
                            });
                            Hflow.log(`info`, `Time traversing to previous state at timestamp:${timestamp} of key:${key}.`);
                        }
                    } else {
                        Hflow.log(`warn1`, `StateTimeTraversalComposite.timeTraverse - Unable to time traverse to undefined state of key:${key} at time index.`);
                    }
                }
            }
        },
        /**
         * @description - Traverse and recall the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recall
         * @param {string|array} pathId
         * @param {number} timeIndexOffset
         * @return {object}
         */
        recall: function recall (pathId, timeIndexOffset) {
            const factory = this;
            const cursor = factory.getStateCursor();
            pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
            if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
                Hflow.log(`error`, `StateTimeTraversalComposite.recall - Input pathId is invalid.`);
            } else {
                const key = pathId[0];

                if (!cursor.hasItem(key)) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.recall - Data item key:${key} is not defined.`);
                } else if (!Hflow.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.recall - Input time index offset must be non-zero and negative.`);
                } else {
                    const {
                        timestamp,
                        content
                    } = cursor.recallContentItem(key, timeIndexOffset);
                    if (Hflow.isDefined(content) && Hflow.isNumeric(timestamp)) {
                        Hflow.log(`info`, `Recalling previous state at timestamp:${timestamp} of key:${key}.`);
                        return Hflow.retrieve(pathId, `.`, true).from(content);
                    } else { // eslint-disable-line
                        Hflow.log(`warn1`, `StateTimeTraversalComposite.recall - Unable to recall an undefined state of key:${key} at time index.`);
                    }
                }
            }
        },
        /**
         * @description - Traverse and recall all the previous state mutation from time history.
         *                Head state cursor does not change.
         *
         * @method recallAll
         * @param {string|array} pathId
         * @return {array}
         */
        recallAll: function recallAll (pathId) {
            const factory = this;
            const cursor = factory.getStateCursor();
            pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
            if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
                Hflow.log(`error`, `StateTimeTraversalComposite.recallAll - Input pathId is invalid.`);
            } else {
                const key = pathId[0];
                if (!cursor.hasItem(key)) {
                    Hflow.log(`error`, `StateTimeTraversalComposite.recallAll - Data item key:${key} is not defined.`);
                } else {
                    const contentHistoryItems = cursor.recallAllContentItems(key);
                    if (Hflow.isArray(contentHistoryItems)) {
                        Hflow.log(`info`, `Recalling all previous states of key:${key}.`);
                        return contentHistoryItems.map((contentHistory) => {
                            let _contentHistory = Hflow.retrieve(pathId, `.`, true).from(contentHistory.content);
                            _contentHistory.timestamp = contentHistory.timestamp;
                            return _contentHistory;
                        });
                    } else { // eslint-disable-line
                        Hflow.log(`warn1`, `StateTimeTraversalComposite.recallAll - Unable to recall all previous states of key:${key}.`);
                    }
                }
            }
        }
    }
});
