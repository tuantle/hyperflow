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
 * @module required
 * @description - Required constrainable descriptor.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../../common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - Create a constrainable descriptor for required value.
 *
 * @method requiredPreset
 * @return {object}
 */
const requiredPreset = function requiredPreset () {
    return {
        required: {
            condition: null,
            /**
             * @description - Ensures value is not null or undefined or empty.
             *
             * @method required
             * @return {object}
             */
            constrainer: function required () {
                const context = this;
                const result = {
                    verified: true,
                    reject: function reject () {
                        Hflow.log(`warn1`, `required - Required property key:${context.key} cannot be not null or undefined or empty.`);
                    }
                };
                if (Hflow.isString(context.newValue) || Hflow.isObject(context.newValue) || Hflow.isArray(context.newValue)) {
                    result.verified = !Hflow.isEmpty(context.newValue);
                } else {
                    result.verified = context.newValue !== null;
                }
                return result;
            }
        }
    };
};
export default requiredPreset;
