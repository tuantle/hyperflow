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
import StateReducerComposite from '../../../src/core/factories/composites/state-reducer-composite';
import StateReconfigurationComposite from '../../../src/core/factories/composites/state-reconfiguration-composite';
import StateTimeTraversalComposite from '../../../src/core/factories/composites/state-time-traversal-composite';

export function runTests () {
    test(`StoreFactory should work with all its features.`, (assert) => {
        const TestStore = StoreFactory.augment({
            composites: [
                StateReducerComposite,
                StateReconfigurationComposite,
                StateTimeTraversalComposite
            ],
            state: {
                // a: {
                //     value: [],
                //     stronglyTyped: true
                // },
                // b: {
                //     value: null
                // },
                c: {
                    value: {
                        c1: null,
                        c2: [ 1, 2, 3 ]
                    },
                    stronglyTyped: true
                }
            }
        });
        const store = TestStore();

        // let a = [ 1, 2, 3 ];
        // store.reduce({
        //     a
        // });
        //
        // a.push(4);
        // store.reconfig({
        //     a
        // });
        //
        // a.push(5);
        // store.reconfig({
        //     a
        // });
        //
        // if (store.reduce({
        //     a
        // })) {
        //     console.log(`NOOO`);
        // }
        //
        // a[4] = `A`;
        // a.push(`B`);
        // store.reconfig({
        //     a
        // });
        //
        // a[5] = `C`;
        // if (store.reduce({
        //     a
        // })) {
        //     console.log(`YESS`);
        // }
        //
        // if (store.reduce({
        //     a
        // })) {
        //     console.log(`NOOO`);
        // }

        // (store.reconfig({
        //     c: [ 1, 2 ]
        // });

        store.reconfig({
            c: {
                c1: {
                    a: `a`
                }
            }
        });
        store.reconfig({
            c: {
                c1: {
                    a: `a`,
                    b: `b`
                }
            }
        });

        // console.log(JSON.stringify(store.a, null, `\t`));
        // console.log(JSON.stringify(store.getStateCursor().recallAllContentItems(`a`), null, `\t`));

        // console.log(JSON.stringify(store.b, null, `\t`));
        // console.log(JSON.stringify(store.getStateCursor().recallAllContentItems(`b`), null, `\t`));

        console.log(JSON.stringify(store, null, `\t`));
        assert.end();
    });
}
