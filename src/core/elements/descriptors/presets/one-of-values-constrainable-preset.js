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
/* @flow */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../../hyperflow';

/**
 * @description - Create a constrainable descriptor for the one of values.
 *
 * @method oneOfValuesPreset
 * @param {array} values
 * @return {object}
 */
const oneOfValuesPreset = function oneOfValuesPreset (_values) {
    if (!Hf.isArray(_values) || Hf.isEmpty(_values)) {
        Hf.log(`error`, `oneOf - Input values are invalid.`);
    } else if (!_values.every((value) => Hf.isString(value) || Hf.isNumeric(value))) {
        Hf.log(`error`, `oneOf - Value must be either number or string.`);
    } else {
        return {
            oneOf: {
                condition: _values,
                /**
                 * @description - Ensures value (can be a number or string) is one of values.
                 *
                 * @method oneOf
                 * @return {object}
                 */
                constrainer: function oneOf (values) {
                    const context = this;
                    const result = {
                        verified: true,
                        reject: function reject () {
                            Hf.log(`warn1`, `oneOf - Property key:${context.key} value is not one of ${values}`);
                        }
                    };
                    if (Hf.isArray(context.newValue)) {
                        const newValues = context.newValue;
                        result.verified = newValues.every((newValue) => values.includes(newValue));
                    } else if (Hf.isString(context.newValue) || Hf.isNumeric(context.newValue)) {
                        result.verified = values.includes(context.newValue);
                    } else {
                        result.verified = false;
                    }
                    return result;
                }
            }
        };
    }
};
export default oneOfValuesPreset;
