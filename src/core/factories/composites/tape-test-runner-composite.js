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
 * @module TapeTestRunnerComposite
 * @description - A tape test runner composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

import tape from 'tape';

/* load CompositeElement */
import CompositeElement from '../../elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE
} from '../factory-code';

/**
 * @description - A tape test runner composite module.
 *
 * @module TapeTestRunnerComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initTapeTestRunnerComposite
         * @return void
         */
        $initTapeTestRunnerComposite: function $initTapeTestRunnerComposite () {
            const fixture = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    fId: `string`
                }).of(fixture) || fixture.fId.substr(0, FIXTURE_FACTORY_CODE.length) !== FIXTURE_FACTORY_CODE) {
                    Hflow.log(`error`, `TapeTestRunnerComposite.$init - Fixture is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Perform unit testing...
         *
         * @method test
         * @param {function} tester
         * @param {string} description
         * @return void
         */
        test: function test (tester, description = ``) {
            description = Hflow.isString(description) ? description : ``;

            if (!Hflow.isFunction(tester)) {
                Hflow.log(`error`, `TapeTestRunnerComposite.test - Input test function is invalid.`);
            } else {
                tape(description, tester);
            }
        }
    }
});