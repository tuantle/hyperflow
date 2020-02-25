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
 * @module TapeTestRunnerComposite
 * @description - A tape test runner composite for test agent.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import testRunner from 'tape';

import {
    ENV,
    isFunction,
    isSchema,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

export default Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initTapeTestRunnerComposite
         * @return void
         */
        $initTapeTestRunnerComposite () {
            const tAgent = this;

            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    addUnitTest: `function`
                }).of(tAgent) || tAgent.type !== `test-agent`) {
                    log(`error`, `TapeTestRunnerComposite.$init - Test agent is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Perform unit testing...
         *
         * @method verify
         * @param {string} description
         * @param {function} tester
         * @return void
         */
        verify (description = ``, tester) {
            const tAgent = this;

            if (ENV.DEVELOPMENT) {
                if (!isFunction(tester)) {
                    log(`error`, `TapeTestRunnerComposite.verify - Input tester function is invalid.`);
                }
            }

            tAgent.addUnitTest((end) => {
                if (ENV.DEVELOPMENT) {
                    if (!isFunction(end)) {
                        log(`error`, `TapeTestRunnerComposite.verify - Input unit test end function is invalid.`);
                    }
                }
                testRunner(description, ((assert) => {
                    tester(assert, end);
                }));
            });
        }
    }
});
