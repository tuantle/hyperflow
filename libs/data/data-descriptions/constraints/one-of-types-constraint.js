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
    typeOf,
    isString,
    isArray,
    isNonEmptyArray,
    log
} from '../../../utils/common-util';

/**
 * @description - Create a constrainable description for the one of types.
 *
 * @method oneOfTypesConstraint
 * @param {array} types
 * @return {object}
 */
const oneOfTypesConstraint = (_types) => {
    if (ENV.DEVELOPMENT) {
        if (!isArray(_types) || !isNonEmptyArray(_types)) {
            log(`error`, `oneTypeOf - Input types are invalid.`);
        } else if (!_types.every((type) => isString(type))) {
            log(`error`, `oneTypeOf - Type value must be string.`);
        }
    }

    return {
        oneTypeOf: {
            condition: _types,
            /**
             * @description - Ensures value is one of types.
             *
             * @method constrainer
             * @return {object}
             */
            constrainer (types) {
                const context = this;
                const oldValueType = typeOf(context.oldValue);
                const newValueType = typeOf(context.newValue);
                const result = {
                    verified: true,
                    reject () {
                        log(`warn1`, `oneTypeOf - Property key:${context.key} value:${context.newValue} is not one type of ${types}`);
                    }
                };
                result.verified = types.includes(oldValueType) && types.includes(newValueType);
                return result;
            }
        }
    };
};
export default oneOfTypesConstraint;
