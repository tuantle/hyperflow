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

import { Hf } from '../../../src/hyperflow';

import React from 'react';

import ReactDOMServer from 'react-dom/server';

import PropTypes from 'prop-types';

import test from 'tape';

export function runTests () {
    test(`AppFactory should work with all its features.`, (assert) => {
        const TestStoreA = Hf.Store.augment({
            setup (done) {
                setTimeout(() => {
                    done();
                }, 20000);
            }
        });
        const TestInterfaceA = Hf.Interface.augment({
            composites: [
                Hf.React.ComponentComposite
            ],
            setup (done) {
                done();
            },
            render () {
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
        const TestInterfaceB = Hf.Interface.augment({
            composites: [
                Hf.React.ComponentComposite
            ],
            setup (done) {
                done();
            },
            render () {
                return (
                    <h1> Child Interface B </h1>
                );
            }
        });
        const TestInterfaceC = Hf.Interface.augment({
            composites: [
                Hf.React.ComponentComposite
            ],
            setup (done) {
                done();
            },
            render () {
                return (
                    <h1> Child Interface C </h1>
                );
            }
        });
        const TestServiceA = Hf.Service.augment({
            setup (done) {
                done();
            }
        });
        const TestServiceB = Hf.Service.augment({
            setup (done) {
                done();
            }
        });
        const TestPeerDomain = Hf.Domain.augment({
            $init () {
                const domain = this;
                domain.register({
                    services: [
                        TestServiceB({
                            name: `test-service-b`
                        })
                    ]
                });
            },
            setup (done) {
                done();
            }
        });
        const TestChildDomainA = Hf.Domain.augment({
            $init () {
                const domain = this;
                domain.register({
                    intf: TestInterfaceB({
                        name: `test-view-b`
                    })
                });
            },
            setup (done) {
                done();
            }
        });
        const TestChildDomainB = Hf.Domain.augment({
            $init () {
                const domain = this;
                domain.register({
                    intf: TestInterfaceC({
                        name: `test-view-c`
                    })
                });
            }
        });
        const TestDomain = Hf.Domain.augment({
            $init () {
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
            setup (done) {
                done();
            }
        });
        const testApp = Hf.App.augment({
            composites: [
                Hf.React.AppRendererComposite,
                Hf.React.AppComponentComposite
            ],
            $init () {
                const app = this;
                app.register({
                    domain: TestDomain({
                        name: app.name
                    }),
                    component: {
                        lib: {
                            React,
                            PropTypes
                        },
                        renderer: ReactDOMServer
                    },
                    testFicture: {
                        Tape: test
                    }
                });
            }
        })({
            name: `TestApp`
        });

        testApp.start();
        setTimeout(() => {
            testApp.stop();
        }, 2000);

        // setTimeout(() => {
        //     testApp.start();
        // }, 4000);

        assert.end();
    });
}
