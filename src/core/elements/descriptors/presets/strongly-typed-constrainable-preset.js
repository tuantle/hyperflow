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
 * @description - Create a constrainable descriptor for strongly typed value.
 *
 * @method stronglyTypedPreset
 * @return {object}
 */
const stronglyTypedPreset = () => {
    return {
        stronglyTyped: {
            condition: null,
            /**
             * @description - Ensures strongly typed and that new and old values are the same type.
             *
             * @method constrainer
             * @return {object}
             */
            constrainer () {
                const context = this;
                const oldValueType = Hf.typeOf(context.oldValue);
                const newValueType = Hf.typeOf(context.newValue);
                const result = {
                    verified: true,
                    reject () {
                        Hf.log(`warn1`, `stronglyTyped - Value of key:${context.key} is strongly typed to ${oldValueType}.`);
                    }
                };
                if (oldValueType === `null` || newValueType === `null`) {
                    result.verified = true;
                    Hf.log(`warn0`, `stronglyTyped - Ignoring type constraint of key:${context.key} as it is null or being set to null.`);
                } else {
                    result.verified = oldValueType === newValueType;
                }
                return result;
            }
        }
    };
};
export default stronglyTypedPreset;
