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
 * @module AgentFactory
 * @description - A generic test agent factory module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load Composer */
import Composer from '../composer';

/* load CommonElement */
import CommonElement from '../elements/common-element';

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE
} from './factory-code';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - A test agent factory module.
 *
 * @module AgentFactory
 */
export default Composer({
    state: {
        name: {
            value: `unnamed`,
            stronglyTyped: true,
            required: true
        }
    },
    AgentFactory: function AgentFactory () {
        /* ----- Private Variables ------------- */
        let _fixtures = [];
        /* ----- Public Functions -------------- */
        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function $init () {
            Hf.log(`warn0`, `AgentFactory.$init - Method is not implemented by default.`);
        };
        /**
         * @description - Register testable domain, interface, service, or store fixtures.
         *
         * @method register
         * @param {object} definition - Test agent registration definition for domain, interface, service, or store fixtures.
         * @return void
         */
        this.register = function register (definition) {
            const agent = this;
            if (!Hf.isSchema({
                fixtures: [ `object` ]
            }).of(definition)) {
                Hf.log(`error`, `AgentFactory.register - Input definition is invalid.`);
            } else {
                const {
                    fixtures
                } = definition;
                if (!fixtures.every((fixture) => {
                    return Hf.isSchema({
                        fId: `string`,
                        name: `string`,
                        hasStarted: `function`,
                        start: `function`,
                        restart: `function`,
                        setup: `function`,
                        teardown: `function`,
                        observe: `function`,
                        activateIncomingStream: `function`,
                        activateOutgoingStream: `function`,
                        deactivateIncomingStream: `function`,
                        deactivateOutgoingStream: `function`
                    }).of(fixture) && fixture.fId.substr(0, FIXTURE_FACTORY_CODE.length) === FIXTURE_FACTORY_CODE;
                })) {
                    Hf.log(`error`, `AgentFactory.register - Input fixtures are invalid.`);
                } else {
                    _fixtures = _fixtures.concat(fixtures.filter((fixture) => {
                        if (_fixtures.some((_fixture) => _fixture.name === fixture.name)) {
                            Hf.log(`warn1`, `AgentFactory.register - Test fixture:${fixture.name} is already registered.`);
                        }
                        Hf.log(`info`, `Test agent:${agent.name} registered fixture:${fixture.name}.`);
                        return true;
                    }));
                }
            }
        };
        /**
         * @description - Run the test agent.
         *
         * @method run
         * @param {object} option
         * @return void
         */
        this.run = function run (option = {}) {
            const agent = this;

            // TODO: Implement use case for agent run option.
            option = Hf.isObject(option) ? option : {};

            if (Hf.isEmpty(_fixtures)) {
                Hf.log(`error`, `AgentFactory.run - Test agent:${agent.name} is not registered with a test fixture.`);
            } else {
                _fixtures.forEach((fixture) => {
                    if (!fixture.hasStarted()) {
                        fixture.start(option, () => {
                            Hf.log(`info`, `Running test fixture:${fixture.name}...`);
                        });
                    } else {
                        fixture.restart(option, () => {
                            Hf.log(`info`, `Rerunning test fixture:${fixture.name}...`);
                        });
                        Hf.log(`warn1`, `AgentFactory.run - Test fixture:${fixture.name} is already running. Restarting...`);
                    }
                });
            }
        };
    }
});
