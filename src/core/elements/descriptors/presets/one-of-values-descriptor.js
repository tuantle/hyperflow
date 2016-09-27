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
 * @module oneOfValues
 * @description - One of values constrainable descriptor.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../../common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - Create a constrainable descriptor for the one of values.
 *
 * @method oneOfValues
 * @param {array} values
 * @return {object}
 */
const oneOfValues = function oneOfValues (values) {
    if (!Hflow.isArray(values) || Hflow.isEmpty(values)) {
        Hflow.log(`error`, `oneOf - Input values are invalid.`);
    } else if (!values.every((value) => Hflow.isString(value) || Hflow.isNumeric(value))) {
        Hflow.log(`error`, `oneOf - Value must be either numeric or string.`);
    } else {
        /**
         * @description - Ensures value (can be a number or string) is one of values.
         *
         * @method oneOf
         * @return {object}
         */
        return function oneOf () {
            const context = this;
            const result = {
                verified: true,
                reject: function reject () {
                    Hflow.log(`warn1`, `oneOf - Property key:${context.key} value is not one of ${values}`);
                }
            };
            if (Hflow.isArray(context.newValue)) {
                const newValues = context.newValue;
                result.verified = newValues.every((newValue) => values.some((value) => newValue === value));
            } else if (Hflow.isString(context.newValue) || Hflow.isNumeric(context.newValue)) {
                result.verified = values.some((value) => context.newValue === value);
            } else {
                result.verified = false;
            }
            return result;
        };
    }
};
export default oneOfValues;
