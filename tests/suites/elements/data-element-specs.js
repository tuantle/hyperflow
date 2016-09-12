/**
 *
 * DataElement Spec Tests.
 *
 * @description - Test specs for data element module.
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

    test(`data element should be defined as an object.`, (assert) => {
        const data = DataElement();
        assert.equal(typeof data, `object`);
        assert.end();
    });
    test(`data element should be able to read in a plain object.`, (assert) => {
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
    // test(`data element should be able to handle circular reference.`, (assert) => {
    //     let obj = {};
    //     obj.data = obj;
    //
    //     console.log(obj)
    //     const data = DataElement();
    //     const cursor = data.read(obj, `obj`).select(`obj`);
    //     // assert.equal(JSON.stringify(cursor.toObject()), JSON.stringify(obj));
    //     assert.end();
    // });
    test(`data element should be able to read in a custom object.`, (assert) => {
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
    test(`data element should be able to select a cursor.`, (assert) => {
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
    test(`data element cursor accessor methods should work as expected.`, (assert) => {
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
        const accessor = cursor.getAccessor();

        assert.equal(accessor.a, `a`);
        assert.equal(accessor.b.b1, `b1`);

        assert.end();
    });
    test(`data element strongly typed descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                stronglyTyped: true
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        const accessor = cursor.getAccessor();

        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = 1;
        assert.equal(cursor.getAccessor().a, `b`);

        assert.end();
    });
    test(`data element one of types descriptor should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: `a`,
                oneTypeOf: [
                    `string`,
                    `boolean`
                ]
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        const accessor = cursor.getAccessor();

        accessor.a = `b`;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = 1;
        assert.equal(cursor.getAccessor().a, `b`);
        accessor.a = true;
        assert.equal(cursor.getAccessor().a, true);
        accessor.a = 1;
        assert.equal(cursor.getAccessor().a, true);

        assert.end();
    });
    // test(`data element constrainable descriptor should work as expected.`, (assert) => {
    //     const obj = {
    //         a: {
    //             value: `a`,
    //             stronglyTyped: true
    //         },
    //         b: {
    //             value: `b`,
    //             required: true
    //         },
    //         c: {
    //             value: 12,
    //             bounded: [ 11, 13 ]
    //         },
    //         d: {
    //             value: 1,
    //             oneOf: [ `A`, `a`, 1, 2 ],
    //             stronglyTyped: true
    //         },
    //         e: {
    //             value: `aaaa`,
    //             stronglyTyped: true,
    //             required: true,
    //             oneOf: [ `AA`, `aaa` ],
    //             bounded: [ 2, 3 ]
    //             // FIXME: oneOf violation alert is being called twice with bounded constraint.
    //         },
    //         f: {
    //             value: [ 2, 2, 3 ],
    //             oneOf: [ 2, 3, 5 ],
    //             stronglyTyped: true
    //         },
    //         g: {
    //             value: {
    //                 a: {
    //                     b: [ 1 ]
    //                 }
    //             },
    //             stronglyTyped: true
    //         }
    //     };
    //     const data = DataElement();
    //     data.read(obj, `obj`);
    //     const cursor = data.select(`obj`);
    //     const accessor = cursor.getAccessor();
    //
    //     accessor.g[`a`].b.push(2);
    //     // accessor.g.b = 3;
    //
    //     // accessor.f = [ 2, 2 ];
    //     // accessor.f.push(4);
    //
    //     console.log(JSON.stringify(cursor.getContentItem(`f`)));
    //     console.log(JSON.stringify(cursor.getContentItem(`g`)));
    //     console.log(JSON.stringify(accessor));
    //
    //     assert.end();
    // });
    test(`data element immutability should work as expected.`, (assert) => {
        const obj = {
            a: {
                value: {
                    b: {
                        c: {
                            c0: [ `1`, `2`, `3` ],
                            c1: `c1`
                        }
                    }
                }
            }
        };
        const data = DataElement();
        data.read(obj, `obj`);
        const cursor = data.select(`obj`);
        const accessor = cursor.getAccessor();

        accessor.a.b.c.c1 = `C1`;

        assert.equal(accessor.a.b.c.c1, `c1`);
        assert.equal(cursor.getAccessor().a.b.c.c1, `C1`);

        assert.end();
    });
}
