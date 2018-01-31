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
 * @module ServiceFactory
 * @description - A generic service factory module..
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/* load EventStreamComposite */
import EventStreamComposite from './composites/event-stream-composite';

/* load Composer */
import Composer from '../composer';

/* factory Ids */
import {
    SERVICE_FACTORY_CODE
} from './factory-code';

export default Composer({
    composites: [
        EventStreamComposite
    ],
    state: {
        name: {
            value: `unnamed`,
            required: true
        },
        fId: {
            computable: {
                contexts: [
                    `name`
                ],
                compute () {
                    return `${SERVICE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    ServiceFactory: function ServiceFactory () {
        /* ----- Private Variables ------------- */
        /* child services */
        let _childServices = [];
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `ServiceFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Get service children.
         *
         * @method getChildServices
         * @param {array} serviceNames
         * @return {array}
         */
        this.getChildServices = function getChildServices (...serviceNames) {
            let childServices = [];
            if (!Hf.isEmpty(_childServices)) {
                if (!Hf.isEmpty(serviceNames)) {
                    if (Hf.DEVELOPMENT) {
                        if (!serviceNames.every((name) => Hf.isString(name))) {
                            Hf.log(`error`, `ServiceFactory.getChildServices - Input service name is invalid.`);
                        } else if (!serviceNames.every((name) => _childServices.hasOwnProperty(name))) {
                            Hf.log(`error`, `ServiceFactory.getChildServices - Service is not found.`);
                        }
                    }

                    childServices = childServices.concat(Hf.collect(...serviceNames).from(_childServices));
                } else {
                    childServices = _childServices;
                }
            }
            return childServices;
        };
        /**
         * @description - Register child services.
         *
         * @method register
         * @param {object} definition - Service registration definition for child services.
         * @return {object}
         */
        this.register = function register (definition) {
            const service = this;

            // TODO: Throw error if called outside of $init.
            if (Hf.DEVELOPMENT) {
                if (!Hf.isSchema({
                    childServices: `array|undefined`
                }).of(definition)) {
                    Hf.log(`error`, `ServiceFactory.register - Input definition is invalid.`);
                }
            }

            const {
                childServices
            } = definition;

            if (Hf.isArray(childServices)) {
                if (Hf.DEVELOPMENT) {
                    if (!childServices.every((childService) => {
                        return Hf.isSchema({
                            fId: `string`,
                            name: `string`
                            // setup: `function`,
                            // teardown: `function`,
                            // observe: `function`,
                            // activateIncomingStream: `function`,
                            // activateOutgoingStream: `function`,
                            // deactivateIncomingStream: `function`,
                            // deactivateOutgoingStream: `function`
                        }).of(childService) && childService.fId.substr(0, SERVICE_FACTORY_CODE.length) === SERVICE_FACTORY_CODE;
                    })) {
                        Hf.log(`error`, `ServiceFactory.register - Input child services are invalid.`);
                    }
                }

                _childServices = _childServices.concat(childServices.filter((childService) => {
                    if (service.name === childService.name) {
                        Hf.log(`warn1`, `ServiceFactory.register - Cannot register service:${childService.name} as a child of itself.`);
                        return false;
                    }
                    Hf.log(`info1`, `Service:${service.name} registered child service:${childService.name}.`);
                    return true;
                }));
            }
            return service;
        };
        /**
         * @description - Setup service event stream.
         *
         * @method setup
         * @param {function} done
         * @return void
         */
        this.setup = function setup (done) { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `ServiceFactory.setup - Input done function is invalid.`);
                }
            }

            done();
        };
        /**
         * @description - Teardown service event stream.
         *
         * @method teardown
         * @param {function} done
         * @return void
         */
        this.teardown = function teardown (done) { // eslint-disable-line
            if (Hf.DEVELOPMENT) {
                if (!Hf.isFunction(done)) {
                    Hf.log(`error`, `ServiceFactory.teardown - Input done function is invalid.`);
                }
            }

            done();
        };
    }
});
