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
 * @module oneOfTypes
 * @description - One of types constrainable descriptor.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../../common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - Create a constrainable descriptor for the one of types.
 *
 * @method oneOfTypes
 * @param {array} types
 * @return {object}
 */
const oneOfTypes = function oneOfTypes (types) {
    if (!Hflow.isArray(types) || Hflow.isEmpty(types)) {
        Hflow.log(`error`, `oneTypeOf - Input types are invalid.`);
    } else if (!types.every((type) => Hflow.isString(type))) {
        Hflow.log(`error`, `oneTypeOf - Type value must be string.`);
    } else {
        /**
         * @description - Ensures value is one of types.
         *
         * @method oneTypeOf
         * @return {object}
         */
        return function oneTypeOf () {
            const context = this;
            const oldValueType = Hflow.typeOf(context.oldValue);
            const newValueType = Hflow.typeOf(context.newValue);
            const result = {
                verified: true,
                reject: function reject () {
                    Hflow.log(`warn1`, `oneTypeOf - Property key:${context.key} value is not one type of ${types}`);
                }
            };
            result.verified = types.some((type) => (oldValueType === type)) && types.some((type) => (newValueType === type));
            return result;
        };
    }
};
export default oneOfTypes;
