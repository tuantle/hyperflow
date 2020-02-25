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

import Store from '../../src/factories/store-factory';

import ImmutableStateComposite from '../../libs/composites/states/immutable-state-composite';

export function runTests () {
    let mutated = false;
    const TestStore = Store.augment({
        composites: [
            ImmutableStateComposite
            // {
            //     composite: ImmutableStateComposite,
            //     option: {
            //         maxMutationReferalDepth: -1,
            //         mutationHistorySize: 32,
            //         disableDatImmutablity: false,
            //         disableDataDescriptions: false
            //     }
            // }
        ],
        static: {
            a: `a`,
            b: `b`,
            c: `c`
        },
        state: {
            str: `abc`,
            obj: {
                a: `a`,
                b: `b`,
                c: `c`
            },
            objx: {},
            objy: {
                value: `abc`,
                oneOf: [ `abc`, `cba` ]
            },
            list: []
        }
    });
    const store = TestStore(`test-store`);
    // console.log(store.getStateAsObject())

    test(`--------- Running StoreFactory Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`StoreFactory should be able to augment a store product.`, (assert) => {
        assert.equal(typeof TestStore, `function`);
        assert.equal(typeof store, `object`);
        assert.end();
    });
    test(`An augmented store should be able to define its static & state.`, (assert) => {
        assert.same([
            store.a,
            store.b,
            store.c
        ], [ `a`, `b`, `c` ]);
        assert.equal(store.str, `abc`);
        assert.same(store.obj, {
            a: `a`,
            b: `b`,
            c: `c`
        });
        assert.same(store.list, []);
        assert.end();
    });
    test(`An augmented store should be able to mutate its state.`, (assert) => {
        mutated = store.mutate({
            list: [ `a`, `b`, `c` ]
        }, {
            reconfig: true
        });

        assert.same(store.list, [ `a`, `b`, `c` ]);
        assert.equal(mutated, true);

        mutated = store.mutate({
            list: [ `a`, `b`, `c` ]
        }, {
            reconfig: false
        });

        assert.same(store.list, [ `a`, `b`, `c` ]);
        assert.equal(mutated, false);

        mutated = store.mutate({
            str: `ABC`,
            obj: {
                a: `A`
            },
            objx: {
                x: `x`,
                y: `y`,
                z: `z`
            },
            list: [ `A`, `B`, `C` ]
        }, {
            reconfig: true
        });

        assert.same({
            str: store.str,
            obj: store.obj,
            list: store.list
        }, {
            str: `ABC`,
            obj: {
                a: `A`,
                b: `b`,
                c: `c`
            },
            list: [ `A`, `B`, `C` ]
        });
        assert.equal(mutated, true);

        mutated = store.mutate({
            objx: {
                x: `x`,
                y: `y`
            },
            list: [ `A`, `B` ]
        }, {
            reconfig: true
        });
        assert.same({
            str: store.str,
            obj: store.obj,
            objx: store.objx,
            list: store.list
        }, {
            str: `ABC`,
            obj: {
                a: `A`,
                b: `b`,
                c: `c`
            },
            objx: {
                x: `x`,
                y: `y`
            },
            list: [ `A`, `B` ]
        });
        // console.log({
        //     objx: JSON.stringify(store.objx),
        //     list: JSON.stringify(store.list)
        // });
        // console.log(store.getStateAsObject());
        assert.equal(mutated, true);

        assert.end();
    });

    test(`An augmented store should be able to reset to its initial state.`, (assert) => {
        store.reset();
        assert.equal(store.str, `abc`);
        assert.same(store.obj, {
            a: `a`,
            b: `b`,
            c: `c`
        });
        assert.same(store.list, []);
        assert.end();
    });
}
