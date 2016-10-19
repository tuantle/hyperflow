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
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load CommonElement */
import CommonElement from '../../../core/elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - A React server app renderer composite module.
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
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    getTopDomain: `function`,
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
            const appComponent = app.getTopComponent();
            if (!(Hf.isObject(appComponent) || Hf.isFunction(appComponent))) {
                Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React component is invalid.`);
            } else {
                const ReactDOMRenderer = app.getRenderer();
                if (!Hf.isSchema({
                    renderToString: `function`
                }).of(ReactDOMRenderer)) {
                    Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - React renderer is invalid.`);
                } else {
                    const domain = app.getTopDomain();
                    if (!Hf.isSchema({
                        outgoing: `function`
                    }).of(domain)) {
                        Hf.log(`error`, `ReactAppRendererComposite.renderToTarget - App:${app.name} domain is invalid.`);
                    } else {
                        const renderedMarkup = ReactDOMRenderer.renderToString(appComponent);
                        if (Hf.isString(renderedMarkup) && !Hf.isEmpty(renderedMarkup)) {
                            domain.outgoing(`on-render-markup-to-string`).emit(() => renderedMarkup);
                        } else {
                            Hf.log(`warn1`, `ReactAppRendererComposite.renderToTarget - React rendered markup is invalid.`);
                        }
                    }
                }
            }
        }
    }
});
