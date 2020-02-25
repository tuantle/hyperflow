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
    isString,
    isObject,
    isArray,
    isEmpty,
    log
} from '../../../utils/common-util';

/**
 * @description - Create a constrainable description for required value.
 *
 * @method requiredConstraint
 * @return {object}
 */
const requiredConstraint = () => {
    return {
        required: {
            condition: null,
            /**
             * @description - Ensures value is not null or undefined or empty.
             *
             * @method constrainer
             * @return {object}
             */
            constrainer () {
                const context = this;
                const result = {
                    verified: true,
                    reject () {
                        log(`warn1`, `required - Required property key:${context.key} cannot be not null or undefined or empty.`);
                    }
                };
                if (isString(context.newValue) || isObject(context.newValue) || isArray(context.newValue)) {
                    result.verified = !isEmpty(context.newValue);
                } else {
                    result.verified = context.newValue !== null && context.newValue !== undefined;
                }
                return result;
            }
        }
    };
};
export default requiredConstraint;
