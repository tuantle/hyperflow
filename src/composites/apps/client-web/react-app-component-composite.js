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
 * @module ReactAppComponentComposite
 * @description - A React app component composite for client web environment.
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
 * @description - A React client web component composite module.
 *
 * @module ReactAppComponentComposite
 * @return {object}
 */
export default CompositeElement({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactAppComponentComposite
         * @return void
         */
        $initReactAppComponentComposite: function $initReactAppComponentComposite () {
            const app = this;
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    name: `string`,
                    getTopDomain: `function`
                }).of(app)) {
                    Hf.log(`error`, `ReactAppComponentComposite.$init - App is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Get the composed app top interface component from domain interface.
         *
         * @method getTopComponent
         * @param {object} option
         * @return {object|function}
         */
        getTopComponent: function getTopComponent (option = {}) {
            const app = this;
            const {
                doConvertToStandaloneComponent
            } = Hf.fallback({
                doConvertToStandaloneComponent: false
            }).of(option);
            const domain = app.getTopDomain();
            if (!Hf.isSchema({
                name: `string`,
                getInterface: `function`
            }).of(domain)) {
                Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - App:${app.name} domain is invalid.`);
            } else {
                const intf = domain.getInterface();
                if (!Hf.isSchema({
                    toComponent: `function`,
                    getComponentLib: `function`
                }).of(intf)) {
                    Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - App:${app.name} top domain:${domain.name} interface is invalid.`);
                } else {
                    const {
                        React
                    } = intf.getComponentLib();
                    if (!Hf.isSchema({
                        createElement: `function`
                    }).of(React)) {
                        Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - React is invalid.`);
                    } else {
                        if (doConvertToStandaloneComponent) {
                            const StandaloneComponent = intf.toComponent(app, {
                                ...option,
                                doRenderToTarget: false
                            });
                            if (!Hf.isFunction(StandaloneComponent)) {
                                Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - Unable to initialize a React app standalone component.`);
                            } else {
                                return React.createElement(StandaloneComponent);
                            }
                        } else {
                            const TopComponent = intf.toComponent();
                            if (!Hf.isFunction(TopComponent)) {
                                Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - Unable to initialize a React app top component.`);
                            } else {
                                return React.createElement(TopComponent);
                            }
                        }
                    }
                }
            }
        }
    }
});
