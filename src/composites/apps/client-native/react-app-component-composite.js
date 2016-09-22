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
 * @description - A React app component composite for native environment.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/**
 * @description - A React native app component composite module.
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
            if (Hflow.DEVELOPMENT) {
                if (!Hflow.isSchema({
                    name: `string`,
                    getTopDomain: `function`
                }).of(app)) {
                    Hflow.log(`error`, `ReactAppComponentComposite.$init - App is invalid. Cannot apply composite.`);
                }
            }
        },
        /**
         * @description - Wrap and convert app to a standalone component.
         *
         * @method toStandaloneComponent
         * @param {object} property
         * @param {object} option
         * @return {object}
         */
        toStandaloneComponent: function toStandaloneComponent (property, option = {}) { // eslint-disable-line
            // TODO: Does not have implementation yet.
        },
        /**
         * @description - Get the composed app top interface component from domain interface.
         *
         * @method getTopComponent
         * @return {object|function}
         */
        getTopComponent: function getTopComponent () {
            const app = this;
            const domain = app.getTopDomain();
            if (!Hflow.isSchema({
                name: `string`,
                getInterface: `function`
            }).of(domain)) {
                Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - App:${app.name} domain is invalid.`);
            } else {
                const intf = domain.getInterface();
                if (!Hflow.isSchema({
                    getComponentLib: `function`,
                    toComponent: `function`
                }).of(intf)) {
                    Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - App:${app.name} top domain:${domain.name} interface is invalid.`);
                } else {
                    const {
                        React
                    } = intf.getComponentLib();
                    if (!Hflow.isSchema({
                        createClass: `function`
                    }).of(React)) {
                        Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - React is invalid.`);
                    } else {
                        const Component = intf.toComponent(); // eslint-disable-line
                        const topComponent = React.createClass({
                            render: function render () {
                                return (
                                    <Component/>
                                );
                            }
                        });
                        if (!Hflow.isFunction(topComponent)) {
                            Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - Unable to initialize a React app top component.`);
                        } else {
                            return topComponent;
                        }
                    }
                }
            }
        }
    }
});