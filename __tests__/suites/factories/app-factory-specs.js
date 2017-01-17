/**
 *
 * App Factory Spec Tests.
 *
 * @description - Test specs for app factory modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import React from 'react';

import ReactDOMServer from 'react-dom/server';

import test from 'tape';

import AppFactory from '../../../src/core/factories/app-factory';
import DomainFactory from '../../../src/core/factories/domain-factory';
import ServiceFactory from '../../../src/core/factories/service-factory';
import StoreFactory from '../../../src/core/factories/store-factory';
import IntfFactory from '../../../src/core/factories/interface-factory';

import IntfComponentComposite from '../../../src/composites/interfaces/react-component-composite';
import AppRendererComposite from '../../../src/composites/apps/server/react-app-component-composite';
import AppComponentComposite from '../../../src/composites/apps/server/react-app-renderer-composite';

export function runTests () {
    test(`AppFactory should work with all its features.`, (assert) => {
        const TestStoreA = StoreFactory.augment({
            setup: function setup (done) {
                setTimeout(() => {
                    done();
                }, 20000);
            }
        });
        const TestInterfaceA = IntfFactory.augment({
            composites: [
                IntfComponentComposite
            ],
            setup: function setup (done) {
                done();
            },
            render: function render () {
                const component = this;
                const {
                    name
                } = component.props;
                return (
                    <html>
                        <head>
                            <meta charSet = 'UTF-8'/>
                            <title>Testing</title>
                        </head>
                        <body>
                            <div className = { name }>
                            </div>
                        </body>
                    </html>
                );
            }
        });
        const TestInterfaceB = IntfFactory.augment({
            composites: [
                IntfComponentComposite
            ],
            setup: function setup (done) {
                done();
            },
            render: function render () {
                return (
                    <h1> Child Interface B </h1>
                );
            }
        });
        const TestInterfaceC = IntfFactory.augment({
            composites: [
                IntfComponentComposite
            ],
            setup: function setup (done) {
                done();
            },
            render: function render () {
                return (
                    <h1> Child Interface C </h1>
                );
            }
        });
        const TestServiceA = ServiceFactory.augment({
            setup: function setup (done) {
                done();
            }
        });
        const TestServiceB = ServiceFactory.augment({
            setup: function setup (done) {
                done();
            }
        });
        const TestPeerDomain = DomainFactory.augment({
            $init: function $init () {
                const domain = this;
                domain.register({
                    services: [
                        TestServiceB({
                            name: `test-service-b`
                        })
                    ]
                });
            },
            setup: function setup (done) {
                done();
            }
        });
        const TestChildDomainA = DomainFactory.augment({
            $init: function $init () {
                const domain = this;
                domain.register({
                    intf: TestInterfaceB({
                        name: `test-view-b`
                    })
                });
            },
            setup: function setup (done) {
                done();
            }
        });
        const TestChildDomainB = DomainFactory.augment({
            $init: function $init () {
                const domain = this;
                domain.register({
                    intf: TestInterfaceC({
                        name: `test-view-c`
                    })
                });
            }
        });
        const TestDomain = DomainFactory.augment({
            $init: function $init () {
                const domain = this;
                domain.register({
                    store: TestStoreA({
                        name: `test-store-a`
                    }),
                    intf: TestInterfaceA({
                        name: `test-view-a`
                    }),
                    services: [
                        TestServiceA({
                            name: `test-service-a`
                        })
                    ],
                    peerDomains: [
                        TestPeerDomain({
                            name: `test-peer-domain`
                        })
                    ],
                    childDomains: [
                        TestChildDomainA({
                            name: `test-child-domain-a`
                        }),
                        TestChildDomainB({
                            name: `test-child-domain-b`
                        })
                    ]
                });
            },
            setup: function setup (done) {
                done();
            }
        });
        const testApp = AppFactory.augment({
            composites: [
                AppRendererComposite,
                AppComponentComposite
            ],
            $init: function $init () {
                const app = this;
                app.register({
                    domain: TestDomain({
                        name: app.name
                    }),
                    component: {
                        library: {
                            React
                        },
                        renderer: ReactDOMServer
                    }
                });
            }
        })({
            name: `TestApp`
        });

        testApp.start();
        // setTimeout(() => {
        //     testApp.stop();
        // }, 2000);

        setTimeout(() => {
            testApp.start();
        }, 4000);

        assert.end();
    });
}
