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
 * @module ReactRendererComposite
 * @description - A React renderer composite for native environment.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/**
 * @description - A React native renderer composite module.
 *
 * @module ReactRendererComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactRendererComposite
         * @return void
         */
        $initReactRendererComposite: function $initReactRendererComposite () {
            const app = this;
            if (!Hflow.isSchema({
                name: `string`,
                getTopComponent: `function`,
                getComponentRenderer: `function`
            }).of(app)) {
                Hflow.log(`error`, `ReactRendererComposite.$init - App is invalid. Cannot apply composite.`);
            }
        },
        /**
         * @description - Render app top level component to the native environment.
         *
         * @method renderToTarget
         * @return void
         */
        renderToTarget: function renderToTarget () {
            const app = this;
            const appComponent = app.getTopComponent();
            if (!(Hflow.isObject(appComponent) || Hflow.isFunction(appComponent))) {
                Hflow.log(`error`, `ReactRendererComposite.renderToTarget - React component is invalid.`);
            } else {
                const ReactNativeRenderer = app.getComponentRenderer();
                if (!Hflow.isSchema({
                    AppRegistry: {
                        registerComponent: `function`
                    }
                }).of(ReactNativeRenderer)) {
                    Hflow.log(`error`, `ReactRendererComposite.renderToTarget - React renderer is invalid.`);
                } else {
                    ReactNativeRenderer.AppRegistry.registerComponent(app.name, () => appComponent);
                }
            }
        }
    }
});
