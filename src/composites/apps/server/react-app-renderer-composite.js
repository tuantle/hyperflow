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
 * @description - A React app renderer composite for server environment.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import CommonElement from '../../../core/elements/common-element';

import CompositeElement from '../../../core/elements/composite-element';

const Hf = CommonElement();

export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactAppRendererComposite
         * @return void
         */
        $initReactAppRendererComposite () {
            const app = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    getTopDomain: `function`,
                    getComponentRenderer: `function`,
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
        renderToTarget () {
            const app = this;
            const AppComponent = app.getTopComponent();

            if (Hf.DEVELOPMENT) {
                if (!(Hf.isObject(AppComponent) || Hf.isFunction(AppComponent))) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React component is invalid.`);
                }
            }

            const ReactDOMRenderer = app.getComponentRenderer();

            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    renderToString: `function`
                }).of(ReactDOMRenderer)) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React renderer is invalid.`);
                }
            }

            const domain = app.getTopDomain();

            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    outgoing: `function`
                }).of(domain)) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - App:${app.name} domain is invalid.`);
                }
            }

            const renderedMarkup = ReactDOMRenderer.renderToString(AppComponent);

            if (Hf.DEVELOPMENT) {
                if (!Hf.isNonEmptyString(renderedMarkup)) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React rendered markup is invalid.`);
                }
            }

            domain.outgoing(`on-render-markup-to-string`).emit(() => renderedMarkup);
        }
    }
});
