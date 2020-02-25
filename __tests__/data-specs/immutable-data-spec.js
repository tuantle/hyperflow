/**
 *
 * ImmutableData Spec Tests.
 *
 * @description - Test specs for ImmutableData module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import ImmutableData from '../../libs/data/immutable-data';

export function runTests () {
    test(`--------- Running ImmutableData Spec Tests ---------`, (assert) => {
        assert.end();
    });
    // test(`ImmutableData should be defined as an object.`, (assert) => {
    //     const data = ImmutableData();
    //     assert.equal(typeof data, `object`);
    //     assert.end();
    // });
    // test(`ImmutableData should be able to read in a plain object.`, (assert) => {
    //     const obj = {
    //         data1: {
    //             a: `a`,
    //             b: {
    //                 b1: `b1`,
    //                 b2: `b2`
    //             }
    //         },
    //         data2: {
    //             a: `a`,
    //             b: [ 1, 2, 3, 4 ]
    //         }
    //     };
    //
    //     const data = ImmutableData();
    //     const cursor = data.read(obj, `obj`).asImmutable(true).select(`obj`);
    //     assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(obj));
    //     assert.end();
    // });
    // test(`ImmutableData should be able to handle circular reference.`, (assert) => {
    //     let obj = {};
    //     obj.data = obj;
    //
    //     console.log(obj)
    //     const data = ImmutableData();
    //     const cursor = data.read(obj, `obj`).asImmutable(true).select(`obj`);
    //     assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(obj));
    //     assert.end();
    // });
    // test(`ImmutableData should be able to read in a custom object.`, (assert) => {
    //     const objA = {
    //         a: `a`,
    //         b: {
    //             b1: `b1`,
    //             b2: `b2`
    //         },
    //         c: [ 1, 2, 3 ]
    //     };
    //     const objB = {
    //         a: {
    //             value: `a`
    //         },
    //         b: {
    //             value: {
    //                 b1: `b1`,
    //                 b2: `b2`
    //             }
    //         },
    //         c: {
    //             value: [ 1, 2, 3 ]
    //         }
    //     };
    //     const data = ImmutableData();
    //     const cursor = data.read(objB, `obj`).asImmutable(true).select(`obj`);
    //     assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(objA));
    //     assert.end();
    // });
    // test(`ImmutableData should be able to select a cursor.`, (assert) => {
    //     const obj = {
    //         data1: {
    //             a: `a`,
    //             b: {
    //                 b1: `b1`,
    //                 b2: `b2`
    //             }
    //         },
    //         data2: {
    //             a: `a`,
    //             b: [ 1, 2 ]
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursorB = data.select(`obj.data1.b`);
    //     const cursorC = data.select(`obj.data2.b`);
    //     assert.equal(JSON.stringify(cursorB.toObject()), JSON.stringify(obj.data1.b));
    //     assert.equal(JSON.stringify(cursorC.toObject()[0]), JSON.stringify(obj.data2.b[0]));
    //     assert.equal(JSON.stringify(cursorC.toObject()[1]), JSON.stringify(obj.data2.b[1]));
    //     assert.end();
    // });
    // test(`ImmutableData cursor accessor methods should work as expected.`, (assert) => {
    //     const obj = {
    //         data1: {
    //             a: `a`,
    //             b: {
    //                 b1: `b1`,
    //                 b2: `b2`
    //             }
    //         },
    //         data2: {
    //             a: `a`,
    //             b: [ 1, 2 ]
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj.data1`);
    //     let accessor = cursor.getAccessor();
    //
    //     assert.equal(accessor.a, `a`);
    //     assert.equal(accessor.b.b1, `b1`);
    //
    //     assert.end();
    // });
    // test(`ImmutableData strongly typed descriptor should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: `a`,
    //             stronglyTyped: true
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj`);
    //     let accessor = cursor.getAccessor();
    //
    //     accessor.a = `b`;
    //     assert.equal(cursor.getAccessor().a, `b`);
    //     accessor.a = 1;
    //     assert.equal(cursor.getAccessor().a, `b`);
    //
    //     assert.end();
    // });
    // test(`ImmutableData required descriptor should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: `a`,
    //             required: true
    //         },
    //         b: {
    //             value: ``,
    //             required: true
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj`);
    //     let accessor = cursor.getAccessor();
    //
    //     accessor.a = `b`;
    //     assert.equal(cursor.getAccessor().a, `b`);
    //
    //     assert.end();
    // });
    test(`ImmutableData one of values descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                stronglyTyped: false,
                oneOf: [ `a`, `b`, `c`, 123 ]
            }
        };
        const data = ImmutableData().read(obj, `obj`).asImmutable(true);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = 123;
        assert.equal(cursor.getAccessor().a, 123);
        accessor.a = 10;
        assert.equal(cursor.getAccessor().a, 123);

        assert.end();
    });
    // test(`ImmutableData bounded descriptor should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: 12,
    //             bounded: [ 10, 13 ],
    //             stronglyTyped: false
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj`);
    //     let accessor = cursor.getAccessor();
    //
    //     accessor.a = 10;
    //     assert.equal(cursor.getAccessor().a, 10);
    //     accessor.a = 13;
    //     assert.equal(cursor.getAccessor().a, 13);
    //     accessor.a = 14;
    //     assert.equal(cursor.getAccessor().a, 13);
    //
    //     assert.end();
    // });
    // test(`ImmutableData one of types descriptor should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: `abc`,
    //             oneTypeOf: [
    //                 `string`,
    //                 `boolean`
    //             ]
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj`);
    //     let accessor = cursor.getAccessor();
    //
    //     accessor.a = `b`;
    //     assert.equal(cursor.getAccessor().a, `b`);
    //     accessor.a = true;
    //     assert.equal(cursor.getAccessor().a, true);
    //     accessor.a = 10;
    //     assert.equal(cursor.getAccessor().a, true);
    //
    //     assert.end();
    // });
    // test(`ImmutableData combined set of constrainable descriptors should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: `a`,
    //             required: true,
    //             oneOf: [ `A`, `a`, 1, 2, 3 ],
    //             oneTypeOf: [ `string`, `number` ],
    //             bounded: [ 1, 3 ]
    //             // FIXME: oneOf violation alert is being called twice with bounded constraint.
    //         }
    //     };
    //     const data = ImmutableData().read(obj, `obj`).asImmutable(true);
    //     const cursor = data.select(`obj`);
    //     let accessor = cursor.getAccessor();
    //
    //     // FIXME: write tests for this.
    //
    //     assert.end();
    // });
    test(`ImmutableData immutability should work as expected.`, (assert) => {
        const obj = {
            state: {
                a: 1,
                b: {
                    b1: ``,
                    b2: ``
                }
            }
        };
        const data = ImmutableData().read(obj, `obj`).asImmutable();
        const cursor = data.select(`obj.state`);
        let [
            currentAccessor,
            nextAccessor
        ] = [ cursor.getAccessor(), cursor.getAccessor() ];

        assert.equal(currentAccessor === nextAccessor, true);

        currentAccessor.b.b1 = `b1`;
        nextAccessor = cursor.getAccessor();

        assert.equal(currentAccessor === nextAccessor, false);
        assert.same(currentAccessor, {
            a: 1,
            b: {
                b1: ``,
                b2: ``
            }
        });
        assert.same(nextAccessor, {
            a: 1,
            b: {
                b1: `b1`,
                b2: ``
            }
        });

        currentAccessor = nextAccessor;
        currentAccessor.b.b1 = `b1`;
        nextAccessor = cursor.getAccessor();

        assert.equal(currentAccessor === nextAccessor, true);

        assert.same(currentAccessor, {
            a: 1,
            b: {
                b1: `b1`,
                b2: ``
            }
        });
        assert.same(nextAccessor, {
            a: 1,
            b: {
                b1: `b1`,
                b2: ``
            }
        });

        // console.log(JSON.stringify(currentAccessor, null, `\t`))
        // console.log(JSON.stringify(nextAccessor, null, `\t`))
        assert.end();
    });
}
