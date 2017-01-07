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
         * @description - Wrap and convert app to a standalone component.
         *
         * @method toStandaloneComponent
         * @param {object} defaultProperty
         * @param {object} option
         * @return {object}
         */
        toStandaloneComponent: function toStandaloneComponent (defaultProperty = {}, option = {}) {
            const app = this;
            const domain = app.getTopDomain();
            if (!Hf.isSchema({
                name: `string`,
                getInterface: `function`
            }).of(domain)) {
                Hf.log(`error`, `ReactAppComponentComposite.toStandaloneComponent - App:${app.name} domain is invalid.`);
            } else {
                const intf = domain.getInterface();
                if (!Hf.isSchema({
                    getComponentLib: `function`,
                    toComponent: `function`
                }).of(intf)) {
                    Hf.log(`error`, `ReactAppComponentComposite.toStandaloneComponent - App:${app.name} top domain:${domain.name} interface is invalid.`);
                } else {
                    const {
                        React
                    } = intf.getComponentLib();
                    if (!Hf.isSchema({
                        createClass: `function`
                    }).of(React)) {
                        Hf.log(`error`, `ReactAppComponentComposite.toStandaloneComponent - React is invalid.`);
                    } else {
                        const Component = intf.toComponent();
                        const topComponent = React.createClass({
                            /**
                             * @description - React method for getting the default prop values.
                             *
                             * @method getDefaultProps
                             * @returns {object}
                             */
                            getDefaultProps: function getDefaultProps () {
                                return Hf.isObject(defaultProperty) ? defaultProperty : {};
                            },
                            /**
                             * @description - React method for setting up component before mounting.
                             *
                             * @method componentWillMount
                             * @returns void
                             */
                            componentWillMount: function componentWillMount () {
                                app.start({
                                    ...option,
                                    doRenderToTarget: false
                                });
                            },
                            /**
                             * @description - React method for tearing down component before unmounting.
                             *
                             * @method componentWillMount
                             * @returns void
                             */
                            componentWillUnMount: function componentWillUnMount () {
                                app.stop();
                            },
                            /**
                             * @description - React method for rendering.
                             *
                             * @method render
                             * @returns {object}
                             */
                            render: function render () {
                                const component = this;
                                return (
                                    <Component { ...component.props }/>
                                );
                            }
                        });
                        if (!Hf.isFunction(topComponent)) {
                            Hf.log(`error`, `ReactAppComponentComposite.toStandaloneComponent - Unable to initialize a React app top component.`);
                        } else {
                            return topComponent;
                        }
                    }
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
                        const topComponent = intf.toComponent();
                        if (!Hf.isFunction(topComponent)) {
                            Hf.log(`error`, `ReactAppComponentComposite.getTopComponent - Unable to initialize a React app top component.`);
                        } else {
                            return React.createElement(topComponent);
                        }
                    }
                }
            }
        }
    }
});
