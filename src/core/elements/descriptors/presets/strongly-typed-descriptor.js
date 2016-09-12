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
 * @module stronglyTyped
 * @description - Strongly typed constrainable descriptor.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from '../../common-element';

/* create Hflow object */
const Hflow = CommonElement();

/**
 * @description - Ensures strongly typed and that new and old values are the same type.
 *
 * @method stronglyTyped
 * @return {object}
 */
const stronglyTyped = function stronglyTyped () {
    const context = this;
    const oldValueType = Hflow.typeOf(context.oldValue);
    const newValueType = Hflow.typeOf(context.newValue);
    const result = {
        verified: true,
        reject: function reject () {
            Hflow.log(`warn1`, `stronglyTyped - Value of key:${context.key} is strongly typed to ${oldValueType}.`);
        }
    };
    if (oldValueType === `undefined` || oldValueType === `null`) {
        result.verified = true;
        Hflow.log(`warn1`, `stronglyTyped - Ignoring type constraint of key:${context.key} as it is ${oldValueType}.`);
    } else {
        result.verified = oldValueType === newValueType;
    }
    return result;
};
export default stronglyTyped;
