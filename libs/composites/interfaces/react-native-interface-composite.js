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
 * @module ReactNativeComponentComposite
 * @description - A React Native component interface factory composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

import ReactNative from 'react-native';

import {
    ENV,
    isNonEmptyString,
    isFunction,
    isObject,
    isSchema,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

export default Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactNativeComponentComposite
         * @return void
         */
        $initReactNativeComponentComposite () {
            const intf = this;
            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    incoming: `function`,
                    outgoing: `function`,
                    getInterfacedComponent: `function`
                }).of(intf) || intf.type !== `interface`) {
                    log(`error`, `ReactNativeComponentComposite.$init - Interface is invalid. Cannot apply composite.`);
                }
            }
        },

        /**
         * @description - Render app top level component to the target environment.
         *
         * @method renderToTarget
         * @param {string} targetId
         * @param {object} option
         * @return null
         */
        renderToTarget (targetId, option = {}) {
            const intf = this;
            const Component = intf.getInterfacedComponent(option);

            if (ENV.DEVELOPMENT) {
                if (!intf.isStreamActivated()) {
                    log(`error`, `ReactNativeComponentComposite.renderToTarget - Interface:${intf.name} render to target cannot be call before event stream activation.`);
                }
                if (!isNonEmptyString(targetId)) {
                    log(`error`, `ReactNativeComponentComposite.renderToTarget - Interface:${intf.name} React Native app key is invalid.`);
                }
                if (!(isFunction(Component) || isObject(Component))) {
                    log(`error`, `ReactNativeComponentComposite.renderToTarget - Interface:${intf.name} React Native component is invalid.`);
                }
            }

            ReactNative.AppRegistry.registerComponent(targetId, () => Component);

            log(`info1`, `Rendering to target Id:${targetId} for interface:${intf.name}.`);

            return null;
        }
    }
});
