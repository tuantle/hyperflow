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
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isNumeric,
    isString,
    log
} from '../../../utils/common-util';

/**
 * @description - Create a constrainable description for the bounding range.
 *
 * @method boundedConstraint
 * @param {number} lowerBound
 * @param {number} upperBound
 * @return {function}
 */
const boundedConstraint = (_lowerBound, _upperBound) => {
    // TODO: Add +infinity and -infinity to lower & upper bound range values.
    if ((ENV.DEVELOPMENT)) {
        if (!isNumeric(_lowerBound) && !isNumeric(_upperBound)) {
            log(`error`, `bounded - Input bouding range values are invalid.`);
        }
    }

    return {
        bounded: {
            condition: [ _lowerBound, _upperBound ],
            /**
             * @description - Ensures value (can be a number or string) is bounded within a range.
             *  If a string, the string length is bounded.
             *
             * @method constrainer
             * @return {object}
             */
            constrainer (condition) {
                const context = this;
                const [
                    lowerBound,
                    upperBound
                ] = condition;
                const result = {
                    verified: true,
                    reject () {
                        if (isString(context.newValue)) {
                            log(`warn1`, `bounded - Property key:${context.key} length is not in a bounded range of ${lowerBound} to ${upperBound}`);
                        } else {
                            log(`warn1`, `bounded - Property key:${context.key} is not in a bounded range of ${lowerBound} to ${upperBound}`);
                        }
                    }
                };
                if (isNumeric(context.newValue)) {
                    if (context.newValue < lowerBound || context.newValue > upperBound) {
                        result.verified = false;
                    }
                }
                if (isString(context.newValue)) {
                    if (context.newValue.length < lowerBound || context.newValue.length > upperBound) {
                        result.verified = false;
                    }
                }
                return result;
            }
        }
    };
};
export default boundedConstraint;
