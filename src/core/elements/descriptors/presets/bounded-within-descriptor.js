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
 * @module boundedWithin
 * @description - Bounded within constrainable descriptor.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../../common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - Create a constrainable descriptor for the bounding range.
 *
 * @method boundedWithin
 * @param {number} lowerBound
 * @param {number} upperBound
 * @return {function}
 */
const boundedWithin = function boundedWithin (lowerBound, upperBound) {
    // TODO: Add +infinity and -infinity to lower & upper bound range values.
    if (!Hflow.isNumeric(lowerBound) && !Hflow.isNumeric(upperBound)) {
        Hflow.log(`error`, `boundedWithin - Input bouding range values are invalid.`);
    } else {
        /**
         * @description - Ensures value (can be a number or string) is bounded within a range.
         *  If a string, the string length is bounded.
         *
         * @method bounded
         * @return {object}
         */
        return function bounded () {
            const context = this;
            const result = {
                verified: true,
                reject: function reject () {
                    if (Hflow.isString(context.newValue)) {
                        Hflow.log(`warn1`, `bounded - Property key:${context.key} length is not in a bounded range of ${lowerBound} to ${upperBound}`);
                    } else {
                        Hflow.log(`warn1`, `bounded - Property key:${context.key} is not in a bounded range of ${lowerBound} to ${upperBound}`);
                    }
                }
            };
            if (Hflow.isNumeric(context.newValue)) {
                if (context.newValue < lowerBound || context.newValue > upperBound) {
                    result.verified = false;
                }
            }
            if (Hflow.isString(context.newValue)) {
                if (context.newValue.length < lowerBound || context.newValue.length > upperBound) {
                    result.verified = false;
                }
            }
            return result;
        };
    }
};
export default boundedWithin;
