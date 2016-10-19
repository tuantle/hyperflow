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
 * @module StateReducerComposite
 * @description - A persistent state reducer composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/* factory Ids */
import {
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

/**
 * @description - A persistent state reducer composite module.
 *
 * @module StateReducerComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateReducerComposite
         * @return void
         */
        $initStateReducerComposite: function $initStateReducerComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    mutateState: `function`,
                    getStateAsObject: `function`,
                    updateStateAccessor: `function`
                }).of(factory) || !(factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hf.log(`error`, `StateReducerComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Pretend state has mutated and send out a force state mutation event.
         *
         * @method forceMutationEvent
         * @return void
         */
        forceMutationEvent: function forceMutationEvent () {
            const factory = this;
            factory.outgoing(`as-state-mutated`).emit(() => {
                return Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});
            });
        },
        /**
         * @description -  Reduce and update state accessor on state change/mutation.
         *
         * @method reduce
         * @param {object|function} mutator
         * @return void
         */
        reduce: function reduce (mutator) {
            const factory = this;
            let mutated = false;
            const currentState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});

            if (Hf.isFunction(mutator)) {
                mutated = factory.mutateState(mutator(currentState));
            } else if (Hf.isObject(mutator)) {
                mutated = factory.mutateState(mutator);
            }
            if (mutated) {
                factory.updateStateAccessor();
                /* emitting a mutation event to interface */
                factory.outgoing(`as-state-mutated`).emit(() => {
                    return Hf.mix(factory.getStateAsObject(), {
                        exclusion: {
                            keys: [
                                `name`,
                                `fId`
                            ]
                        }
                    }).with({});
                });
            }
            return mutated;
        },
        /**
         * @description -  Reduce and update state accessor on state change/mutation at pathId.
         *
         * @method reduceAtPath
         * @param {object|function} mutator
         * @param {string|array} pathId - Path of the property to retrieve.
         * @return void
         */
        reduceAtPath: function reduceAtPath (mutator, pathId) {
            const factory = this;
            pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
            if (!(Hf.isArray(pathId) && !Hf.isEmpty(pathId))) {
                Hf.log(`error`, `StateReducerComposite.reduceAtPath - Input pathId is invalid.`);
            } else {
                let mutated = false;
                const currentState = Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});

                if (Hf.isFunction(mutator)) {
                    mutated = factory.mutateStateAtPath(mutator(currentState), pathId);
                } else if (Hf.isObject(mutator)) {
                    mutated = factory.mutateStateAtPath(mutator, pathId);
                }
                if (mutated) {
                    factory.updateStateAccessor();
                    /* emitting a mutation event to interface */
                    factory.outgoing(`as-state-mutated`).emit(() => {
                        return Hf.mix(factory.getStateAsObject(), {
                            exclusion: {
                                keys: [
                                    `name`,
                                    `fId`
                                ]
                            }
                        }).with({});
                    });
                }
                return mutated;
            }
        }
    }
});
