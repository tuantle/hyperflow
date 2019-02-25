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


import CommonElement from '../../common-element';

const Hf = CommonElement();

/**
 * @description - Create a constrainable descriptor for required value.
 *
 * @method requiredPreset
 * @return {object}
 */
const requiredPreset = () => {
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
                        Hf.log(`warn1`, `required - Required property key:${context.key} cannot be not null or undefined or empty.`);
                    }
                };
                if (Hf.isString(context.newValue) || Hf.isObject(context.newValue) || Hf.isArray(context.newValue)) {
                    result.verified = !Hf.isEmpty(context.newValue);
                } else {
                    result.verified = context.newValue !== null && context.newValue !== undefined;
                }
                return result;
            }
        }
    };
};
export default requiredPreset;
