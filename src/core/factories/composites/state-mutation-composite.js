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
 * @module StateMutationComposite
 * @description - A persistent state mutation with reducer/reconfiguration composite module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import CommonElement from '../../elements/common-element';

import CompositeElement from '../../elements/composite-element';

/* factory Ids */
import {
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

const Hf = CommonElement();

export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateMutationComposite
         * @return void
         */
        $initStateMutationComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    reduceState: `function`,
                    reconfigState: `function`,
                    getStateAsObject: `function`
                }).of(factory) || !(factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hf.log(`error`, `StateMutationComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Reset state to initial default.
         *
         * @method reset
         * @param {object} option
         * @return void
         */
        // reset (option = {
        //     forceMutationEvent: false,
        //     suppressMutationEvent: false,
        //     delayMutationEvent: 0
        // }) {
        //     const factory = this;
        //     const {
        //         forceMutationEvent,
        //         suppressMutationEvent,
        //         delayMutationEvent
        //     } = Hf.fallback({
        //         forceMutationEvent: false,
        //         suppressMutationEvent: false,
        //         delayMutationEvent: 0
        //     });
        //
        //     // TODO: needs re-implementation
        // },
        /**
         * @description -  Reduce and update state on state change/mutation.
         *
         * @method reduce
         * @param {object|function} reducer
         * @param {object} option
         * @return {boolean}
         */
        reduce (reducer, option = {
            forceMutationEvent: false,
            suppressMutationEvent: false,
            delayMutationEvent: 0
        }) {
            const factory = this;
            const {
                forceMutationEvent,
                suppressMutationEvent,
                delayMutationEvent
            } = Hf.fallback({
                forceMutationEvent: false,
                suppressMutationEvent: false,
                delayMutationEvent: 0
            }).of(option);
            const currentState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});
            let mutated = false;

            if (Hf.isFunction(reducer)) {
                mutated = factory.reduceState(reducer(currentState));
            } else if (Hf.isObject(reducer)) {
                mutated = factory.reduceState(reducer);
            }

            if (forceMutationEvent || (mutated && !suppressMutationEvent)) {
                const newState = Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});
                const stateMutationEventId = !forceMutationEvent ? `as-state-mutated` : `as-state-forced-to-mutate`;

                /* emitting a mutation event to interface */
                if (delayMutationEvent > 0) {
                    factory.outgoing(
                        stateMutationEventId,
                        `do-sync-reflected-state`
                    ).delay(delayMutationEvent).emit(() => newState);
                } else {
                    factory.outgoing(
                        stateMutationEventId,
                        `do-sync-reflected-state`
                    ).emit(() => newState);
                }
            }
            return mutated;
        },
        /**
         * @description -  Reconfig and update state.
         *
         * @method reconfig
         * @param {object|function} reconfiguration
         * @param {object} option
         * @return void
         */
        reconfig (reconfiguration, option = {
            forceMutationEvent: false,
            suppressMutationEvent: false,
            delayMutationEvent: 0
        }) {
            const factory = this;
            const {
                forceMutationEvent,
                suppressMutationEvent,
                delayMutationEvent
            } = Hf.fallback({
                forceMutationEvent: false,
                suppressMutationEvent: false,
                delayMutationEvent: 0
            }).of(option);
            const currentState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});

            if (Hf.isFunction(reconfiguration)) {
                factory.reconfigState(reconfiguration(currentState));
            } else if (Hf.isObject(reconfiguration)) {
                factory.reconfigState(reconfiguration);
            }

            if (forceMutationEvent || !suppressMutationEvent) {
                const newState = Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});
                const stateMutationEventId = !forceMutationEvent ? `as-state-mutated` : `as-state-forced-to-mutate`;

                /* emitting a mutation event to interface */
                if (delayMutationEvent > 0) {
                    factory.outgoing(
                        stateMutationEventId,
                        `do-sync-reflected-state`
                    ).delay(delayMutationEvent).emit(() => newState);
                } else {
                    factory.outgoing(
                        stateMutationEventId,
                        `do-sync-reflected-state`
                    ).emit(() => newState);
                }
            }
        }
    }
});
