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
    isString,
    isNumeric,
    isArray,
    isNonEmptyArray,
    log
} from '../../../utils/common-util';

/**
 * @description - Create a constrainable description for the one of values.
 *
 * @method oneOfValuesConstraint
 * @param {array} values
 * @return {object}
 */
const oneOfValuesConstraint = (_values) => {
    if (ENV.DEVELOPMENT) {
        if (!isArray(_values) || !isNonEmptyArray(_values)) {
            log(`error`, `oneOf - Input values are invalid.`);
        } else if (!_values.every((value) => isString(value) || isNumeric(value))) {
            log(`error`, `oneOf - Value must be either number or string.`);
        }
    }

    return {
        oneOf: {
            condition: _values,
            /**
             * @description - Ensures value (can be a number or string) is one of values.
             *
             * @method constrainer
             * @return {object}
             */
            constrainer (values) {
                const context = this;
                const result = {
                    verified: true,
                    reject () {
                        log(`warn1`, `oneOf - Property key:${context.key} value:${context.newValue} is not one of ${values}`);
                    }
                };
                if (isArray(context.newValue)) {
                    const newValues = context.newValue;
                    result.verified = newValues.every((newValue) => values.includes(newValue));
                } else if (isString(context.newValue) || isNumeric(context.newValue)) {
                    result.verified = values.includes(context.newValue);
                } else {
                    result.verified = false;
                }
                return result;
            }
        }
    };
};
export default oneOfValuesConstraint;
