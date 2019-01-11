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
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../../hyperflow';

/**
 * @description - Create a constrainable descriptor for the bounding range.
 *
 * @method boundedPreset
 * @param {number} lowerBound
 * @param {number} upperBound
 * @return {function}
 */
const boundedPreset = function boundedPreset (_lowerBound, _upperBound) {
    // TODO: Add +infinity and -infinity to lower & upper bound range values.
    if (Hf.DEVELOPMENT) {
        if (!Hf.isNumeric(_lowerBound) && !Hf.isNumeric(_upperBound)) {
            Hf.log(`error`, `bounded - Input bouding range values are invalid.`);
        }
    }

    return {
        bounded: {
            condition: [ _lowerBound, _upperBound ],
            /**
             * @description - Ensures value (can be a number or string) is bounded within a range.
             *  If a string, the string length is bounded.
             *
             * @method bounded
             * @return {object}
             */
            constrainer: function bounded (condition) {
                const context = this;
                const [
                    lowerBound,
                    upperBound
                ] = condition;
                const result = {
                    verified: true,
                    reject: function reject () {
                        if (Hf.isString(context.newValue)) {
                            Hf.log(`warn1`, `bounded - Property key:${context.key} length is not in a bounded range of ${lowerBound} to ${upperBound}`);
                        } else {
                            Hf.log(`warn1`, `bounded - Property key:${context.key} is not in a bounded range of ${lowerBound} to ${upperBound}`);
                        }
                    }
                };
                if (Hf.isNumeric(context.newValue)) {
                    if (context.newValue < lowerBound || context.newValue > upperBound) {
                        result.verified = false;
                    }
                }
                if (Hf.isString(context.newValue)) {
                    if (context.newValue.length < lowerBound || context.newValue.length > upperBound) {
                        result.verified = false;
                    }
                }
                return result;
            }
        }
    };
};
export default boundedPreset;
