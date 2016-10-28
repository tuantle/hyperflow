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
 * @module StateReconfigurationComposite
 * @description - A persistent state reconfiguration composite.
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
 * @description - A persistent state reconfigtor composite module.
 *
 * @module StateReconfigurationComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initStateReconfigurationComposite
         * @return void
         */
        $initStateReconfigurationComposite: function $initStateReconfigurationComposite () {
            const factory = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    fId: `string`,
                    name: `string`,
                    outgoing: `function`,
                    reconfigState: `function`,
                    reconfigStateAtPath: `function`,
                    getStateAsObject: `function`,
                    updateStateAccessor: `function`
                }).of(factory) || !(factory.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE ||
                                    factory.fId.substr(0, STORE_FACTORY_CODE.length) === STORE_FACTORY_CODE)) {
                    Hf.log(`error`, `StateReconfigurationComposite.$init - Factory is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description -  Reconfig and update state.
         *
         * @method reconfig
         * @param {object|function} reconfigtor
         * @return void
         */
        reconfig: function reconfig (reconfigtor) {
            const factory = this;
            const currentState = Hf.mix(factory.getStateAsObject(), {
                exclusion: {
                    keys: [
                        `name`,
                        `fId`
                    ]
                }
            }).with({});

            if (Hf.isFunction(reconfigtor)) {
                factory.reconfigState(reconfigtor(currentState));
            } else if (Hf.isObject(reconfigtor)) {
                factory.reconfigState(reconfigtor);
            }
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
        },
        /**
         * @description -  Reconfig and update state at pathId.
         *
         * @method reconfigAtPath
         * @param {object|function} reconfigtor
         * @param {string|array} pathId - Path of the state property to reconfig.
         * @return void
         */
        reconfigAtPath: function reconfigAtPath (reconfigtor, pathId) {
            const factory = this;
            pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
            if (!Hf.isNonEmptyArray(pathId)) {
                Hf.log(`error`, `StateReconfigurationComposite.reconfigAtPath - Input pathId is invalid.`);
            } else {
                const currentState = Hf.mix(factory.getStateAsObject(), {
                    exclusion: {
                        keys: [
                            `name`,
                            `fId`
                        ]
                    }
                }).with({});

                if (Hf.isFunction(reconfigtor)) {
                    factory.reconfigStateAtPath(reconfigtor(currentState), pathId);
                } else if (Hf.isObject(reconfigtor)) {
                    factory.reconfigStateAtPath(reconfigtor, pathId);
                }
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
        }
    }
});
