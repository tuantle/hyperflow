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
 * @module TestAgentFactory
 * @description - A generic test agent factory module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isFunction,
    isArray,
    isNonEmptyObject,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    fallback,
    log
} from '../../libs/utils/common-util';

import Composer from '../composer';

import EventStreamComposite from '../../libs/composites/event-stream-composite';

/* time waiting for factory setup/teardown to complete */
const DEFAULT_SETUP_WAIT_TIME_IN_MS = 10000;
const DEFAULT_TEARDOWN_WAIT_TIME_IN_MS = 10000;

export default Composer({
    composites: [
        EventStreamComposite
    ],
    static: {
        type: `test-agent`
    },
    TestAgentFactory () {
        let _running = false;
        let _subjectCache = {};
        let _unitTests = [];

        /**
         * @description - Initialize service.
         *
         * @method $init
         * @return void
         */
        this.$init = function () {
            log(`warn0`, `TestAgentFactory.$init - Method is not implemented by default.`);
        };

        /**
         * @description - Perform unit testing...
         *
         * @method verify
         * @param {string} description
         * @param {function} tester
         * @return void
         */
        this.verify = function (description = ``, tester) { // eslint-disable-line
            log(`error`, `TestAgentFactory.verify - Method is not implemented by default. Implementation required.`);
        };

        /**
         * @description - Check if agent is running.
         *
         * @method isRunning
         * @return {boolean}
         */
        this.isRunning = function () {
            return _running;
        };

        /**
         * @description - Check if test agent has a registered subject.
         *
         * @method hasSubject
         * @param {string} subjectName
         * @return {object}
         */
        this.hasSubject = function (subjectName) {
            if (ENV.DEVELOPMENT) {
                if (!isString(subjectName)) {
                    log(`error`, `TestAgentFactory.hasSubject - Input subject name is invalid.`);
                }
            }

            return _subjectCache.hasOwnProperty(subjectName);
        };

        /**
         * @description - Get registered subjects.
         *
         * @method getSubjects
         * @param {array} subjectNames
         * @return {array}
         */
        this.getSubjects = function (...subjectNames) {
            let subjects = [];

            if (isNonEmptyObject(_subjectCache)) {
                if (isNonEmptyArray(subjectNames)) {
                    if (ENV.DEVELOPMENT) {
                        if (!subjectNames.every((subjectName) => isString(subjectName))) {
                            log(`error`, `TestAgentFactory.getSubjects - Input subject name is invalid.`);
                        } else if (!subjectNames.every((subjectName) => _subjectCache.hasOwnProperty(subjectName))) {
                            log(`error`, `TestAgentFactory.getSubjects - Subject is not found.`);
                        }
                    }

                    subjects = Object.entries(_subjectCache).filter(([ subjectName, service ]) => { // eslint-disable-line
                        return subjectNames.includes(subjectName);
                    }).map(([ subjectName, subject ]) => subject);  // eslint-disable-line
                } else {
                    subjects = Object.values(_subjectCache);
                }
            }

            return subjects;
        };

        /**
         * @description - Register testable domain, interface, service, or store subjects.
         *
         * @method register
         * @param {object} definition - Test agent registration definition for domain, interface, service, or store subjects.
         * @return {object}
         */
        this.register = function (definition) {
            const tAgent = this;

            if (ENV.DEVELOPMENT) {
                // if (tAgent.isInitialized()) {
                //     log(`error`, `TestAgentFactory.register - Test agent:${tAgent.name} registration cannot be call after initialization.`);
                // }
                if (tAgent.isStreamActivated()) {
                    log(`error`, `TestAgentFactory.register - Test agent:${tAgent.name} registration cannot be call after event stream activation.`);
                }
                if (!isSchema({
                    subjects: `array|undefined`
                }).of(definition)) {
                    log(`error`, `TestAgentFactory.register - Input definition is invalid.`);
                }
            }

            const {
                subjects
            } = definition;

            if (isArray(subjects)) {
                if (ENV.DEVELOPMENT) {
                    if (!subjects.every((subject) => {
                        return isSchema({
                            name: `string`,
                            type: `string`,
                            setup: `function`,
                            teardown: `function`,
                            observe: `function`,
                            activateIncomingStream: `function`,
                            activateOutgoingStream: `function`,
                            deactivateIncomingStream: `function`,
                            deactivateOutgoingStream: `function`
                        }).of(subject) &&
                        (subject.type === `domain` || subject.type === `store` || subject.type === `interface` || subject.type === `service`);
                    })) {
                        log(`error`, `TestAgentFactory.register - Input subjects are invalid.`);
                    }
                }

                _subjectCache = subjects.reduce((__subjectCache, subject) => {
                    if (__subjectCache.hasOwnProperty(subject.name)) {
                        log(`warn1`, `TestAgentFactory.register - Test agent:${tAgent.name} already has subject:${subject.name} registered.`);
                    }

                    __subjectCache[subject.name] = subject;
                    log(`info1`, `Agent:${tAgent.name} registered subject:${subject.name}.`);

                    return __subjectCache;
                }, _subjectCache);
            }

            return tAgent;
        };

        /**
         * @description - Add unit test.
         *
         * @method addUnitTest
         * @param {function} unitTest
         * @return void
         */
        this.addUnitTest = function (unitTest) {
            const tAgent = this;

            if (ENV.DEVELOPMENT) {
                if (tAgent.isRunning()) {
                    log(`error`, `TapeTestRunnerComposite.addUnitTest - Test agent ${tAgent.name} is already running.`);
                }
                if (!isFunction(unitTest)) {
                    log(`error`, `TestAgentFactory.addUnitTest - Input unit test function is invalid.`);
                }
            }

            _unitTests.push(unitTest);
        };

        /**
         * @description - Run the subjects.
         *
         * @method run
         * @param {object} option
         * @return void
         */
        this.run = function (option = {
            slowRunMode: false,
            setupWaitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS,
            teardownWaitTime: DEFAULT_TEARDOWN_WAIT_TIME_IN_MS
        }) {
            const tAgent = this;

            if (ENV.DEVELOPMENT) {
                // if (!tAgent.isInitialized()) {
                //     log(`error`, `TestAgentFactory.run - Test agent:${tAgent.name} cannot run before initialization.`);
                // }
                if (tAgent.isStreamActivated()) {
                    log(`error`, `TestAgentFactory.run - Test agent:${tAgent.name} cannot run after event stream activation.`);
                }
            }

            const {
                setupWaitTime,
                teardownWaitTime,
                timeout
            } = fallback({
                slowRunMode: false,
                setupWaitTime: DEFAULT_SETUP_WAIT_TIME_IN_MS,
                teardownWaitTime: DEFAULT_TEARDOWN_WAIT_TIME_IN_MS
            }).of(option);

            if (isEmpty(_subjectCache)) {
                log(`warn1`, `TestAgentFactory.run - Test agent:${tAgent.name} is not registered with a subject.`);
            }

            Object.values(_subjectCache).forEach((subject) => {
                tAgent.observe(subject).delay(1);
                subject.observe(tAgent).delay(1);
            });

            tAgent.setup(() => {
                tAgent.activateIncomingStream(option);
                Object.values(_subjectCache).forEach((subject) => {
                    switch (subject.type) {
                    case `domain`:
                        const domain = subject;
                        if (!domain.hasStarted()) {
                            domain.start(() => null, {
                                waitTime: setupWaitTime,
                                ...option
                            });
                        } else {
                            domain.restart(() => null, {
                                waitTime: setupWaitTime,
                                ...option
                            });
                            log(`warn1`, `TestAgentFactory.run - Test domain:${domain.name} is already running. Restarting...`);
                        }
                        break;
                    case `interface`:
                        const intf = subject;
                        const intfTimeoutId = setTimeout(() => {
                            log(`warn1`, `TestAgentFactory.run - Interface:${intf.name} is taking longer than ${setupWaitTime}ms to setup.`);
                            if (isFunction(timeout)) {
                                timeout(intf.name);
                            }
                        }, setupWaitTime);
                        intf.setup(() => {
                            intf.activateIncomingStream(option);
                            intf.activateOutgoingStream(option);
                            log(`info1`, `Activated interface:${intf.name}.`);
                            clearTimeout(intfTimeoutId);
                        });
                        break;
                    case `store`:
                        const store = subject;
                        const storeTimeoutId = setTimeout(() => {
                            log(`warn1`, `TestAgentFactory.run - Store:${store.name} is taking longer than ${setupWaitTime}ms to setup.`);
                            if (isFunction(timeout)) {
                                timeout(store.name);
                            }
                        }, setupWaitTime);

                        subject.setup(() => {
                            store.activateIncomingStream(option);
                            store.activateOutgoingStream(option);
                            log(`info1`, `Activated store:${store.name}.`);
                            clearTimeout(storeTimeoutId);
                        });
                        break;
                    case `service`:
                        const service = subject;
                        const serviceTimeoutId = setTimeout(() => {
                            log(`warn1`, `TestAgentFactory.run - Service:${service.name} is taking longer than ${setupWaitTime}ms to setup.`);
                            if (isFunction(timeout)) {
                                timeout(service.name);
                            }
                        }, setupWaitTime);

                        service.setup(() => {
                            service.activateIncomingStream(option);
                            service.activateOutgoingStream(option);
                            log(`info1`, `Activated service:${service.name}.`);
                            clearTimeout(serviceTimeoutId);
                        });
                        break;
                    default:
                        break;
                    }
                });
            });

            tAgent.activateOutgoingStream(option);

            log(`info1`, `Running test agent:${tAgent.name}...`);

            _running = true;

            const runAsyncUnitTests = async () => {
                const asyncUnitTests = await _unitTests.map((unitTest) => {
                    return new Promise((resolve) => {
                        unitTest((end) => {
                            if (ENV.DEVELOPMENT) {
                                if (!isFunction(end)) {
                                    log(`error`, `TestAgentFactory.run - Input unit test end function is invalid.`);
                                }
                            }
                            resolve();
                            end();
                        });
                    });
                });

                Promise.all(asyncUnitTests).then(() => {
                    log(`info1`, `Finished running test agent:${tAgent.name}.`);
                    _running = false;

                    Object.values(_subjectCache).forEach((subject) => {
                        switch (subject.type) {
                        case `domain`:
                            const domain = subject;
                            if (domain.hasStarted()) {
                                domain.stop(() => null, {
                                    waitTime: teardownWaitTime,
                                    ...option
                                });
                            }
                            break;
                        case `interface`:
                            const intf = subject;
                            const intfTimeoutId = setTimeout(() => {
                                log(`warn1`, `TestAgentFactory.run - Interface:${intf.name} is taking longer than ${teardownWaitTime}ms to teardown.`);
                                if (isFunction(timeout)) {
                                    timeout(intf.name);
                                }
                            }, teardownWaitTime);

                            intf.teardown(() => {
                                intf.deactivateIncomingStream();
                                intf.deactivateOutgoingStream();
                                log(`info1`, `Deactivated interface:${intf.name}.`);
                                clearTimeout(intfTimeoutId);
                            });
                            break;
                        case `store`:
                            const store = subject;
                            const storeTimeoutId = setTimeout(() => {
                                log(`warn1`, `TestAgentFactory.run - Store:${store.name} is taking longer than ${teardownWaitTime}ms to teardown.`);
                                if (isFunction(timeout)) {
                                    timeout(store.name);
                                }
                            }, teardownWaitTime);
                            store.teardown(() => {
                                store.deactivateIncomingStream();
                                store.deactivateOutgoingStream();
                                log(`info1`, `Deactivated store:${store.name}.`);
                                clearTimeout(storeTimeoutId);
                            });
                            break;
                        case `service`:
                            const service = subject;
                            const serviceTimeoutId = setTimeout(() => {
                                log(`warn1`, `TestAgentFactory.run - Service:${service.name} is taking longer than ${teardownWaitTime}ms to teardown.`);
                                if (isFunction(timeout)) {
                                    timeout(service.name);
                                }
                            }, teardownWaitTime);

                            service.teardown(() => {
                                service.deactivateIncomingStream();
                                service.deactivateOutgoingStream();
                                log(`info1`, `Deactivated service:${service.name}.`);
                                clearTimeout(serviceTimeoutId);
                            });
                            break;
                        default:
                            break;
                        }
                    });

                    tAgent.deactivateIncomingStream();
                    tAgent.deactivateOutgoingStream();
                });
            };

            runAsyncUnitTests();
        };
    }
});
