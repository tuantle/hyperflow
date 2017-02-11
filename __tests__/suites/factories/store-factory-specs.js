/**
 *
 * Store Factory Spec Tests.
 *
 * @description - Test specs for store factory modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import { Hf } from '../../../src/hyperflow';

export function runTests () {
    test(`StoreFactory should work with all its features.`, (assert) => {
        const TestStore = Hf.Store.augment({
            composites: [
                Hf.State.TimeTraversalComposite
            ],
            static: {
                fixed: {
                    a: {
                        x: 1
                    },
                    b: 2
                }
            },
            state: {
                really: {
                    value: `nope`,
                    stronglyTyped: true
                },
                test: {
                    value: {
                        a: 1,
                        b: 2
                    },
                    stronglyTyped: true
                },
                catalog: {
                    value: {
                        data: {},
                        gameCount: 0,
                        gameIndex: [ 1, 2, 3 ],
                        platformGroups: []
                    },
                    stronglyTyped: true
                }
            }
        });
        const store = TestStore({
            name: `test-store`
        });
        // let mutated = false;

        store.reconfig({
            catalog: {
                data: {
                    a: [ 1, 2, 3 ],
                    b: {
                        x: 1,
                        y: 2,
                        z: 3
                    }
                },
                platformGroups: [
                    {
                        ids: [
                            {
                                id: 1
                            }
                        ],
                        games: null
                    }
                ]
            }
        });

        store.reconfig({
            catalog: {
                data: {
                    a: [ 1, 2, 3 ],
                    b: {
                        x: 1,
                        y: 2,
                        z: 3
                    }
                },
                platformGroups: [
                    {
                        ids: [
                            {
                                id: 1
                            }
                        ],
                        games: {
                            x: {
                                id: 95
                            },
                            z: {
                                id: 78
                            }
                        }
                    }
                ]
            }
        });
        store.reconfig({
            catalog: {
                data: {
                    a: [ 1, 2, 3 ],
                    b: {
                        x: 1,
                        y: 2,
                        z: 3
                    }
                },
                platformGroups: [
                    {
                        ids: [
                            {
                                id: 1
                            }
                        ],
                        games: {
                            x: {
                                id: 95
                            },
                            y: {
                                id: 78
                            }
                        }
                    }
                ]
            }
        });

        // store.timeTraverse(`catalog`, -1);

        // mutated = store.reduce({
        //     catalog: {
        //         gameCount: 3,
        //         platformGroups: [
        //             {
        //                 ids: [
        //                     {
        //                         id: 10
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        // });
        // console.log(mutated);
        // mutated = store.reduce({
        //     catalog: {
        //         gameCount: 3,
        //         platformGroups: [
        //             {
        //                 games: {
        //                     x: {
        //                         id: 915
        //                     }
        //                 }
        //             }
        //         ]
        //     }
        // });

        // mutated = store.reduce({
        //     really: {
        //         a: 123
        //     }
        // });

        // console.log(mutated);
        console.log(JSON.stringify(store.recallAll(`catalog`), null, `\t`));
        store.flush();
        console.log(JSON.stringify(store.recallAll(`catalog`), null, `\t`));
        // console.log(JSON.stringify(store, null, `\t`));
        assert.end();
    });
}
