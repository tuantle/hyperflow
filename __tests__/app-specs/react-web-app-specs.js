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

import Domain from '../../src/factories/domain-factory';

import Store from '../../src/factories/store-factory';

import Interface from '../../src/factories/interface-factory';

import Service from '../../src/factories/service-factory';

import ReactComponentInterfaceComposite from '../../libs/composites/interfaces/react-component-interface-composite';

import ReactDOMServerInterfaceComposite from '../../libs/composites/interfaces/react-dom-server-interface-composite';

import test from 'tape';

export function runTests () {
    test(`--------- Running Domain, Store, Interface, Service Factories Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`Domain, Store, Interface, Service Factories should work with all their features.`, (assert) => {
        const TestComponentA = (props) => {
            const {
                msg
            } = props;
            const [ TestViewB, TestViewC ] = props.getChildInterfacedComponents(`test-view-b`, `test-view-c`);

            return (
                <html>
                    <head>
                        <meta charSet = 'UTF-8'/>
                        <title>Testing</title>
                    </head>
                    <body>
                        <h1>{ msg }</h1>
                        <div>
                            <TestViewB/>
                            <TestViewC/>
                        </div>
                    </body>
                </html>
            );
        };
        const TestComponentB = () => {
            return (
                <h1> Child Interface B </h1>
            );
        };
        const TestComponentC = () => {
            return (
                <h1> Child Interface C </h1>
            );
        };
        const TestStoreA = Store.augment({
            state: {
                msg: `Hello World!!!`
            },
            setup (done) {
                done();
            }
        });
        const TestInterfaceA = Interface.augment({
            composites: [ ReactComponentInterfaceComposite, ReactDOMServerInterfaceComposite ],
            $init () {
                const intf = this;

                intf.register({
                    component: TestComponentA
                });
            },
            setup (done) {
                done();
            }
        });
        const TestInterfaceB = Interface.augment({
            composites: [ ReactComponentInterfaceComposite, ReactDOMServerInterfaceComposite ],
            $init () {
                const intf = this;

                intf.register({
                    component: TestComponentB
                });
            },
            setup (done) {
                done();
            }
        });
        const TestInterfaceC = Interface.augment({
            composites: [ ReactComponentInterfaceComposite, ReactDOMServerInterfaceComposite ],
            $init () {
                const intf = this;

                intf.register({
                    component: TestComponentC
                });
            },
            setup (done) {
                done();
            }
        });
        const TestServiceA = Service.augment({
            setup (done) {
                done();
            }
        });
        const TestServiceB = Service.augment({
            setup (done) {
                done();
            }
        });
        const TestPeerDomain = Domain.augment({
            $init () {
                const domain = this;

                domain.register({
                    services: [ TestServiceB(`test-service-b`) ]
                });
            },
            setup (done) {
                done();
            }
        });
        const TestChildDomainA = Domain.augment({
            $init () {
                const domain = this;

                domain.register({
                    interface: TestInterfaceB(`test-view-b`)
                });
            },
            setup (done) {
                done();
            }
        });
        const TestChildDomainB = Domain.augment({
            $init () {
                const domain = this;

                domain.register({
                    interface: TestInterfaceC(`test-view-c`)
                });
            }
        });
        const TestDomain = Domain.augment({
            $init () {
                const domain = this;

                domain.register({
                    store: TestStoreA(`test-store-a`),
                    interface: TestInterfaceA(`test-view-a`),
                    services: [ TestServiceA(`test-service-a`) ],
                    peerDomains: [ TestPeerDomain(`test-peer-domain`) ],
                    childDomains: [
                        TestChildDomainA(`test-child-domain-a`),
                        TestChildDomainB(`test-child-domain-b`)
                    ]
                });
            },
            setup (done) {
                const domain = this;

                domain.incoming(`on-render-markup-to-string`).handle((renderedMarkup) => {
                    console.log(renderedMarkup);
                });
                done();
            }
        });
        const testApp = TestDomain(`TestApp`);

        testApp.start(() => {
            assert.end();
        }, {
            renderToTarget: true
        });
        setTimeout(() => {
            testApp.stop(() => null);
        }, 2000);
    });
}
