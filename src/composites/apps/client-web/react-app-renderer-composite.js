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
 * @module ReactAppRendererComposite
 * @description - A React app renderer composite for client environment.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../hyperflow';

/**
 * @description - A React client app renderer composite module.
 *
 * @module ReactAppRendererComposite
 * @return {object}
 */
export default Hf.Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactAppRendererComposite
         * @return void
         */
        $initReactAppRendererComposite: function $initReactAppRendererComposite () {
            const app = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    name: `string`,
                    getRenderer: `function`,
                    getTopComponent: `function`
                }).of(app)) {
                    Hf.log(`error`, `ReactAppRendererComposite.$init - App is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Render app top level component to the target environment.
         *
         * @method renderToTarget
         * @return void
         */
        renderToTarget: function renderToTarget () {
            const app = this;
            const AppComponent = app.getTopComponent();
            if (!(Hf.isObject(AppComponent) || Hf.isFunction(AppComponent))) {
                Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React component is invalid.`);
            } else {
                const elId = app.name;
                const ReactDOMRenderer = app.getRenderer();
                if (!Hf.isSchema({
                    render: `function`
                }).of(ReactDOMRenderer)) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React renderer is invalid.`);
                } else {
                    ReactDOMRenderer.render(AppComponent, document.getElementById(elId));
                }
            }
        }
    }
});
