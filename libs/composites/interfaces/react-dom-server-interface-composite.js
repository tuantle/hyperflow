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
 * @module ReactDOMServerComponentComposite
 * @description - A React DOM server component interface factory composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

import React from 'react';

import ReactDOMServer from 'react-dom/server';

import {
    ENV,
    // isNonEmptyString,
    isFunction,
    isObject,
    isSchema,
    fallback,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

export default Composite({
    template: {
        /**
         * @description - Initialized and check that factory is valid for this composite.
         *
         * @method $initReactDOMServerComponentComposite
         * @return void
         */
        $initReactDOMServerComponentComposite () {
            const intf = this;
            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`,
                    incoming: `function`,
                    outgoing: `function`,
                    getInterfacedComponent: `function`
                }).of(intf) || intf.type !== `interface`) {
                    log(`error`, `ReactDOMServerComponentComposite.$init - Interface is invalid. Cannot apply composite.`);
                }
            }
        },

        /**
         * @description - Render app top level component to the target environment.
         *
         * @method renderToTarget
         * @param {string} targetId
         * @param {object} option
         * @return [stream|string]
         */
        renderToTarget (targetId, option = {
            useStaticMarkup: false,
            useNodeStream: false
        }) {
            const intf = this;
            const Component = intf.getInterfacedComponent(option);

            if (ENV.DEVELOPMENT) {
                if (!intf.isStreamActivated()) {
                    log(`error`, `ReactDOMServerComponentComposite.renderToTarget - Interface:${intf.name} render to target cannot be call before event stream activation.`);
                }
                // if (!isNonEmptyString(targetId)) {
                //     log(`error`, `ReactDOMServerComponentComposite.renderToTarget - Interface:${intf.name} target Id key is invalid.`);
                // }
                if (!(isFunction(Component) || isObject(Component))) {
                    log(`error`, `ReactDOMServerComponentComposite.renderToTarget - Interface:${intf.name} React component is invalid.`);
                }
            }

            const {
                useStaticMarkup,
                useNodeStream
            } = fallback({
                useStaticMarkup: false,
                useNodeStream: false
            }).of(option);
            let render;

            if (useStaticMarkup) {
                render = useNodeStream ? ReactDOMServer.renderToStaticNodeStream : ReactDOMServer.renderToStaticMarkup;
            } else {
                render = useNodeStream ? ReactDOMServer.renderToNodeStream : ReactDOMServer.renderToString;
            }

            log(`info1`, `Rendering to target Id:${targetId} for interface:${intf.name}.`);

            const html = render(
                <Component/>
            );

            intf.outgoing(`on-component-${intf.name}-render-to-target`).emit(() => html);

            return html;
        }
    }
});
