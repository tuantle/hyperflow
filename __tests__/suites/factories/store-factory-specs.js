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

import StoreFactory from '../../../src/core/factories/store-factory';
import StateTimeTraversalComposite from '../../../src/core/factories/composites/state-time-traversal-composite';

export function runTests () {
    test(`StoreFactory should work with all its features.`, (assert) => {
        const TestStore = StoreFactory.augment({
            composites: [
                StateTimeTraversalComposite
            ],
            state: {
                catalog: {
                    value: {
                        data: null,
                        platformGroups: null
                    },
                    stronglyTyped: true
                }
            }
        });
        const store = TestStore();
        let mutated = false;

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

        // console.log(JSON.stringify(store.catalog, null, `\t`));

        store.reconfigAtPath({
            games: {
                x: {
                    id: 95
                }
            }
        }, `catalog.platformGroups.0`);

        store.reconfigAtPath({
            games: {
                x: {
                    id: 95
                },
                y: {
                    id: 105
                }
            }
        }, `catalog.platformGroups.0`);

        console.log(JSON.stringify(store.catalog, null, `\t`));

        // mutated = store.reduce({
        //     catalog: {
        //         gameCount: 3,
        //         platformGroups: [
        //             {
        //                 ids: [
        //                     {
        //                         id: 10
        //                     },
        //                     {
        //                         id: 20
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
        //                         id: 95
        //                     }
        //                 }
        //             }
        //         ]
        //     }
        // });
        // console.log(mutated);
        console.log(JSON.stringify(store.getStateCursor().recallAllContentItems(`catalog`), null, `\t`));
        assert.end();
    });
}
