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
 * @description - A persistent state mutation composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../elements/composite-element';

/* load CommonElement */
import CommonElement from '../../elements/common-element';

/* factory Ids */
import {
    SERVICE_FACTORY_CODE,
    STORE_FACTORY_CODE
} from '../factory-code';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - A persistent state mutation with reducer/reconfiguration composite module.
 *
 * @module StateMutationComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateMutationComposite
         * @return void
         */
        $initStateMutationComposite: function $initStateMutationComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    resetState: `function`,
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
         * @return void
         */
        reset: function reset () {
            const factory = this;
            factory.resetState();

            const resetedState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});
            factory.outgoing(`as-state-mutated`).emit(() => resetedState);
            factory.outgoing(`do-sync-reflected-state`).emit(() => resetedState);
        },
        /**
         * @description -  Reduce and update state on state change/mutation.
         *
         * @method reduce
         * @param {object|function} reducer
         * @param {object} option
         * @return {boolean}
         */
        reduce: function reduce (reducer, option = {}) {
            const factory = this;
            const {
                forceMutationEvent,
                suppressMutationEvent,
                mutationEventDelayInMS
            } = Hf.fallback({
                forceMutationEvent: false,
                suppressMutationEvent: false,
                mutationEventDelayInMS: 0
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
                /* emitting a mutation event to interface */
                if (mutationEventDelayInMS > 0) {
                    factory.outgoing(`as-state-mutated`).delay(mutationEventDelayInMS).emit(() => newState);
                    factory.outgoing(`do-sync-reflected-state`).delay(mutationEventDelayInMS).emit(() => newState);
                } else {
                    factory.outgoing(`as-state-mutated`).emit(() => newState);
                    factory.outgoing(`do-sync-reflected-state`).emit(() => newState);
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
        reconfig: function reconfig (reconfiguration, option = {}) {
            const factory = this;
            const {
                suppressMutationEvent,
                mutationEventDelayInMS
            } = Hf.fallback({
                suppressMutationEvent: false,
                mutationEventDelayInMS: 0
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

            if (!suppressMutationEvent) {
                const newState = Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});

                /* emitting a mutation event to interface */
                if (mutationEventDelayInMS > 0) {
                    factory.outgoing(`as-state-mutated`).delay(mutationEventDelayInMS).emit(() => newState);
                    factory.outgoing(`do-sync-reflected-state`).delay(mutationEventDelayInMS).emit(() => newState);
                } else {
                    factory.outgoing(`as-state-mutated`).emit(() => newState);
                    factory.outgoing(`do-sync-reflected-state`).emit(() => newState);
                }
            }
        }
    }
});
