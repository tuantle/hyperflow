/**
 *
 * DataElement Spec Tests.
 *
 * @description - Test specs for DataElement module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import DataElement from '../../../src/core/elements/data-element';
import CommonElement from '../../../src/core/elements/common-element';

export function runTests () {
    const common = CommonElement(); // eslint-disable-line

    test(`DataElement should be defined as an object.`, (assert) => {
        const data = DataElement();
        assert.equal(typeof data, `object`);
        assert.end();
    });
    test(`DataElement should be able to read in a plain object.`, (assert) => {
        const obj = {
            data1: {
                a: `a`,
                b: {
                    b1: `b1`,
                    b2: `b2`
                }
            },
            data2: {
                a: `a`,
                b: [ 1, 2, 3, 4 ]
            }
        };

        const data = DataElement();
        const cursor = data.read(obj, `obj`).select(`obj`);
        assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(obj));
        assert.end();
    });
    // test(`DataElement should be able to handle circular reference.`, (assert) => {
    //     let obj = {};
    //     obj.data = obj;
    //
    //     console.log(obj)
    //     const data = DataElement();
    //     const cursor = data.read(obj, `obj`).select(`obj`);
    //     // assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(obj));
    //     assert.end();
    // });
    test(`DataElement should be able to read in a custom object.`, (assert) => {
        const objA = {
            a: `a`,
            b: {
                b1: `b1`,
                b2: `b2`
            },
            c: [ 1, 2, 3 ]
        };
        const objB = {
            a: {
                value: `a`
            },
            b: {
                value: {
                    b1: `b1`,
                    b2: `b2`
                }
            },
            c: {
                value: [ 1, 2, 3 ]
            }
        };
        const data = DataElement();
        const cursor = data.read(objB, `obj`).select(`obj`);
        assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(objA));
        assert.end();
    });
    test(`DataElement should be able to select a cursor.`, (assert) => {
        const obj = {
            data1: {
                a: `a`,
                b: {
                    b1: `b1`,
                    b2: `b2`
                }
            },
            data2: {
                a: `a`,
                b: [ 1, 2 ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursorB = data.select(`obj.data1.b`);
        const cursorC = data.select(`obj.data2.b`);
        assert.equal(JSON.stringify(cursorB.toObject()), JSON.stringify(obj.data1.b));
        assert.equal(JSON.stringify(cursorC.toObject()[0]), JSON.stringify(obj.data2.b[0]));
        assert.equal(JSON.stringify(cursorC.toObject()[1]), JSON.stringify(obj.data2.b[1]));
        assert.end();
    });
    test(`DataElement cursor accessor methods should work as expected.`, (assert) => {
        const obj = {
            data1: {
                a: `a`,
                b: {
                    b1: `b1`,
                    b2: `b2`
                }
            },
            data2: {
                a: `a`,
                b: [ 1, 2 ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj.data1`);
        let accessor = cursor.getAccessor();

        assert.equal(accessor.a, `a`);
        assert.equal(accessor.b.b1, `b1`);

        assert.end();
    });
    test(`DataElement strongly typed descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                stronglyTyped: true
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = 1;
        assert.equal(cursor.getAccessor().a, `b`);

        assert.end();
    });
    test(`DataElement required descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                required: true
            },
            b: {
                value: ``,
                required: true
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a = null;
        assert.equal(cursor.getAccessor().a, `a`);
        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);

        assert.end();
    });
    test(`DataElement one of values descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                oneOf: [ `a`, `b`, `c`, 123 ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
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
    test(`DataElement bounded descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: 12,
                bounded: [ 10, 13 ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a = 10;
        assert.equal(cursor.getAccessor().a, 10);
        accessor.a = 13;
        assert.equal(cursor.getAccessor().a, 13);
        accessor.a = 14;
        assert.equal(cursor.getAccessor().a, 13);

        assert.end();
    });
    test(`DataElement one of types descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `abc`,
                oneTypeOf: [
                    `string`,
                    `boolean`
                ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = true;
        assert.equal(cursor.getAccessor().a, true);
        accessor.a = 10;
        assert.equal(cursor.getAccessor().a, true);

        assert.end();
    });
    test(`DataElement combined set of constrainable descriptors should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                stronglyTyped: true,
                required: true,
                oneOf: [ `A`, `a`, 1, 2, 3 ],
                oneTypeOf: [ `string`, `number` ],
                bounded: [ 1, 3 ]
                // FIXME: oneOf violation alert is being called twice with bounded constraint.
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        // FIXME: write tests for this.

        assert.end();
    });
    test(`DataElement immutability should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: {
                    a0: [ `1`, `2`, `3` ],
                    a1: `a1`
                }
            },
            b: {
                value: null
            },
            c: {
                value: null
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        let accessor = cursor.getAccessor();

        accessor.a.a1 = `A1`;

        assert.equal(accessor.a.a1, `a1`);
        assert.equal(cursor.getAccessor().a.a1, `A1`);
        assert.notEqual(accessor, cursor.getAccessor());

        let bObj = {
            b1: `b1`,
            b2: `b2`,
            b3: `b3`
        };
        let cObj = [ 1, 2, 3, 4 ];
        accessor.c = cObj;

        bObj.b4 = `b4`;
        accessor.b = bObj;

        cObj.push(4);
        accessor.c = cObj;

        accessor = cursor.getAccessor();

        accessor.a.a0[0] = 0;

        console.log(accessor.c === cursor.getAccessor().c);

        console.log(JSON.stringify(accessor, null, ` `));
        console.log(`---`);
        console.log(JSON.stringify(cursor.getAccessor(), null, ` `));

        assert.end();
    });
}
