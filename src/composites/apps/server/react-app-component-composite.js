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
 * @description - A React app component composite for server environment.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load Hflow */
import { Hflow } from 'hyperflow';

/**
 * @description - A React server component composite module.
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
                    getTopDomain: `function`,
                    getComponentLib: `function`
                }).of(app)) {
                    Hflow.log(`error`, `ReactAppComponentComposite.$init - App is invalid. Cannot apply composite.`);
                }
            }
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
                getInterface: `function`
            }).of(domain)) {
                Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - App domain is invalid.`);
            } else {
                const {
                    React
                } = app.getComponentLib();
                if (!Hflow.isSchema({
                    PropTypes: `object`,
                    createClass: `function`,
                    createElement: `function`
                }).of(React)) {
                    Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - React is invalid.`);
                } else {
                    let topComponent;
                    const intf = domain.getInterface();
                    if (!Hflow.isSchema({
                        toComponent: `function`,
                        registerComponentLib: `function`
                    }).of(intf)) {
                        topComponent = React.createClass({
                            propTypes: {
                                name: React.PropTypes.string
                            },
                            getDefaultProps: function getDefaultProps () {
                                return {
                                    name: app.name
                                };
                            },
                            render: function render () {
                                const component = this;
                                return (
                                    <html>
                                        <head>
                                            <meta charSet = "UTF-8"/>
                                        </head>
                                        <body>
                                            <div className = { component.props.name }/>
                                        </body>
                                    </html>
                                );
                            }
                        });
                        Hflow.log(`warn1`, `ReactAppComponentComposite.getTopComponent - App top domain interface is invalid.`);
                    } else {
                        intf.registerComponentLib({
                            React
                        });
                        topComponent = intf.toComponent();
                    }
                    if (!Hflow.isFunction(topComponent)) {
                        Hflow.log(`error`, `ReactAppComponentComposite.getTopComponent - Unable to initialize a React app top component.`);
                    } else {
                        return React.createElement(topComponent);
                    }
                }
            }
        }
    }
});
