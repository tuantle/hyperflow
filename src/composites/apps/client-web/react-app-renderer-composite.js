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
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/**
 * @description - A React client app renderer composite module.
 *
 * @module ReactAppRendererComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactAppRendererComposite
         * @return void
         */
        $initReactAppRendererComposite: function $initReactAppRendererComposite () {
            const app = this;
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    name: `string`,
                    getRenderer: `function`,
                    getTopComponent: `function`
                }).of(app)) {
                    Hflow.log(`error`, `ReactAppRendererComposite.$init - App is invalid. Cannot apply composite.`);
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
            const appComponent = app.getTopComponent();
            if (!(Hflow.isObject(appComponent) || Hflow.isFunction(appComponent))) {
                Hflow.log(`error`, `ReactAppRendererComposite.renderToTarget - React component is invalid.`);
            } else {
                const elId = app.name;
                const ReactDOMRenderer = app.getRenderer();
                if (!Hflow.isSchema({
                    render: `function`
                }).of(ReactDOMRenderer)) {
                    Hflow.log(`error`, `ReactAppRendererComposite.renderToTarget - React renderer is invalid.`);
                } else {
                    ReactDOMRenderer.render(appComponent, document.getElementById(elId));
                }
            }
        }
    }
});