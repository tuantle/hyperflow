/**
 *
 * CommonElement Spec Tests.
 *
 * @description - Test specs for common common utils functions.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
`use strict`; // eslint-disable-line

import test from 'tape';

import CommonElement from '../../../src/core/elements/common-element';

export function runTests () {
    const common = CommonElement();
    test(`common element should be defined as an object.`, (assert) => {
        assert.equal(typeof common, `object`);
        assert.end();
    });
    test(`CommonElement isInteger should correctly check if value is an integer.`, (assert) => {
        assert.equal(common.isInteger(1234), true);
        assert.equal(common.isInteger(-1234), true);
        assert.equal(common.isInteger(3.14), false);
        assert.equal(common.isInteger(`99,999`), false);
        assert.equal(common.isInteger(`#abcdef`), false);
        assert.equal(common.isInteger(`1.2.3`), false);
        assert.equal(common.isInteger(``), false);
        assert.equal(common.isInteger(NaN), false);
        assert.end();
    });
    test(`CommonElement isFloat should correctly check if value is a float.`, (assert) => {
        assert.equal(common.isFloat(3.14), true);
        assert.equal(common.isFloat(-3.14), true);
        assert.equal(common.isFloat(`99,999`), false);
        assert.equal(common.isFloat(`#abcdef`), false);
        assert.equal(common.isFloat(`1.2.3`), false);
        assert.equal(common.isFloat(``), false);
        assert.equal(common.isFloat(NaN), false);
        assert.end();
    });
    test(`CommonElement isNumeric should correctly check if value is a number.`, (assert) => {
        assert.equal(common.isNumeric(-1), true);
        assert.equal(common.isNumeric(-1.5), true);
        assert.equal(common.isNumeric(0), true);
        assert.equal(common.isNumeric(0.42), true);
        assert.equal(common.isNumeric(0x89f), true);
        assert.equal(common.isNumeric(`99,999`), false);
        assert.equal(common.isNumeric(`#abcdef`), false);
        assert.equal(common.isNumeric(`1.2.3`), false);
        assert.equal(common.isNumeric(``), false);
        assert.equal(common.isNumeric(NaN), false);
        assert.end();
    });
    test(`CommonElement isString should correctly check if value is a string.`, (assert) => {
        assert.equal(common.isString(`This is a String.`), true);
        assert.equal(common.isString(1234), false);
        assert.equal(common.isString({}), false);
        assert.equal(common.isString([]), false);
        assert.end();
    });
    test(`CommonElement isBoolean should correctly check if value is a boolean.`, (assert) => {
        assert.equal(common.isBoolean(`true`), true);
        assert.equal(common.isBoolean(`false`), true);
        assert.equal(common.isBoolean(true), true);
        assert.equal(common.isBoolean(false), true);
        assert.end();
    });
    test(`CommonElement isDefined should correctly check if value is defined.`, (assert) => {
        assert.equal(common.isDefined({}), true);
        assert.equal(common.isDefined(undefined), false);
        assert.end();
    });
    test(`CommonElement isFunction should correctly check if value is a function.`, (assert) => {
        assert.equal(common.isFunction(function () {}), true);
        assert.end();
    });
    test(`CommonElement isDate should correctly check if value is a date.`, (assert) => {
        assert.equal(common.isDate(new Date()), true);
        assert.end();
    });
    test(`CommonElement isArray/isObject should correctly check if value is an array/object.`, (assert) => {
        assert.equal(common.isObject({}), true);
        assert.equal(common.isArray([]), true);
        assert.end();
    });
    test(`CommonElement isSchema should correctly check and compare an object to a schema.`, (assert) => {
        const schemaA = {
            fnA: `function`,
            a: {
                b: `number`,
                c: `string`
            }
        };
        const schemaB = {
            a: `array|number`,
            b: `array`
        };
        const schemaC = {
            a: [
                `number`
            ],
            b: [{
                c: `number`,
                d: `string`
            }]
        };
        const objA = {
            fnA: function fnA () {},
            fnB: function fnB () {},
            a: {
                b: 123,
                c: `abc`
            }
        };
        const objB = {
            a: 123,
            b: [],
            fnC: function fnC () {}
        };
        const objC1 = {
            a: [ 1, 2, 3 ],
            b: [{
                c: 0,
                d: `d0`
            }, {
                c: 1,
                d: `d1`
            }]
        };
        const objC2 = {
            a: [ 1, 2, 3 ],
            b: [{
                c: `d`,
                d: 0
            }, `b` ]
        };

        assert.equal(common.isSchema(schemaA).of(objA), true);
        assert.equal(common.isSchema(schemaB).of(objB), true);
        assert.equal(common.isSchema(schemaC).of(objC1), true);
        assert.equal(common.isSchema(schemaC).of(objC2), false);
        assert.end();
    });
    test(`CommonElement isEmpty should correctly check if object is empty.`, (assert) => {
        assert.equal(common.isEmpty({}), true);
        assert.equal(common.isEmpty({
            data: 1234
        }), false);
        assert.end();
    });
    test(`CommonElement typeOf should correctly check value type.`, (assert) => {
        assert.equal(common.typeOf({}), `object`);
        assert.equal(common.typeOf([]), `array`);
        assert.equal(common.typeOf(``), `string`);
        assert.equal(common.typeOf(1234), `number`);
        assert.equal(common.typeOf(null), `null`);
        assert.end();
    });
    test(`CommonElement clear should correctly clear an object or array.`, (assert) => {
        const obj = {
            data: 1234
        };
        const array = [ 1, 2, 3, 4 ];

        common.clear(obj);
        common.clear(array);
        assert.equal(common.isEmpty(obj), true);
        assert.equal(array.length === 0, true);
        assert.end();
    });
    test(`CommonElement compose should correctly compose two for more functions.`, (assert) => {
        function fnA (x) {
            return x + 1;
        }
        function fnB (x) {
            return x * x;
        }
        function fnC (x) {
            return x * fnA(x);
        }
        const fnABC = common.compose(fnA, fnB, fnC);
        assert.equal(fnABC(12), 28730);
        assert.end();
    });
    test(`CommonElement collect should correctly pluck propteries from an object or array.`, (assert) => {
        const obj = {
            data1: {
                a: `a`,
                b: `b`
            },
            data2: {
                a: `a`,
                b: `b`
            },
            data3: {
                a: `a`,
                b: `b`
            }
        };
        const results = common.collect(obj, `data1.a`, `data2.a`, `data3.a`);
        assert.equal(results.length, 3);
        assert.equal(results[1], `a`);
        assert.end();
    });
    test(`CommonElement clone should correctly clone an object or array.`, (assert) => {
        const array = [ 1, 2, 3, 4, `a`, `b`, `c` ];
        const obj = {
            data1: {
                a: `a`,
                b: 123
            },
            data2: {
                a: `b`,
                b: 456
            }
        };
        const clonedArray = common.clone(array);
        const clonedObj = common.clone(obj);

        let objA = { a: 1 };
        let objB = common.clone(objA);
        objB.a = 2;

        assert.equal(array[5] === clonedArray[5], true);
        assert.equal(clonedObj.data1.a, `a`);
        assert.equal(clonedObj.data2.b, 456);
        assert.equal(objA.a !== objB.a, true);
        assert.end();
    });
    test(`CommonElement retrieve should correctly retrieve a property of an object.`, (assert) => {
        const obj = {
            dataA0: `dataA0`,
            dataA1: {
                data10: `data10`
            },
            dataAB: {
                dataAB0: [ 1, 2, 3, 4 ],
                dataAB1: [ `a`, `b`, `c`, {
                    a: `A1`,
                    b: `b`
                }]
            }
        };
        const valueA = common.retrieve(`dataA1.data10`, `.`).from(obj);
        const valueB = common.retrieve(`dataAB.dataAB1.3.a`, `.`).from(obj);
        const valueC = common.retrieve(`dataAB.dataAB1.3.b`, `.`, true).from(obj);
        assert.equal(valueA, `data10`);
        assert.equal(valueB, `A1`);
        assert.equal(valueC.dataAB.dataAB1[3].b, `b`);
        assert.end();
    });
    test(`CommonElement fallback should be able to do fallback.`, (assert) => {
        const defaultObj = {
            a: `a`,
            b: {
                c: 1234
            },
            d: [ 1, 2, 3, 4 ]
        };
        const objA = {
            a: undefined,
            b: {
                c: ``
            },
            d: [ 1, 2, 3, 4 ]
        };
        const result = common.fallback(defaultObj).of(Object.freeze(objA));
        // console.log(JSON.stringify(result, null, `\t`));
        assert.equal(result.b.c, 1234);
        assert.equal(result.a, `a`);
        assert.end();
    });
    test(`CommonElement mutate should be able to mutate an object by a reference mutator object.`, (assert) => {
        const obj = {
            foo: {
                bar: 3
            },
            bar: [{
                a: `a`,
                foo: [ 1, 2, 3 ]
            }]
        };
        const mutatorA = {
            foo: {
                bar: 4
            },
            bar: [{
                a: `A`,
                b: `b`,
                foo: [ 5, 2, 3 ]
            }]
        };
        const mutatorB = {
            foo: [ 4, 5, 6 ]
        };
        // const mutatorC = {
        //     bar: [{
        //         a: `b`
        //     }]
        // };
        const resultA = common.mutate(obj).by(mutatorA);
        const resultB = common.mutate(obj).atPathBy(mutatorB, `bar.0.foo`);
        // const resultC = common.mutate(obj).by(mutatorC);

        assert.equal(resultA.foo.bar, 4);
        assert.equal(resultA.bar[0].a, `A`);
        assert.equal(resultA.bar[0].foo.length, 3);
        assert.equal(resultA.bar[0].foo[0], 5);
        assert.equal(resultB.foo.bar, 3);
        assert.equal(resultB.bar[0].a, `a`);
        assert.equal(resultB.bar[0].foo.length, 3);
        assert.equal(resultB.bar[0].foo[0], 4);
        // console.log(JSON.stringify(obj, null, `\t`));
        // console.log(JSON.stringify(resultA, null, `\t`));
        // console.log(JSON.stringify(resultB, null, `\t`));
        assert.end();
    });
    test(`CommonElement merge should be able to deep merge 2 objects.`, (assert) => {
        const objA = {
            foo: {
                bar: 3
            },
            array: [{
                a: `a`,
                data: [ 1, 2, 3 ]
            }]
        };
        const objB = {
            foo: {
                baz: 4
            },
            c: `c`,
            array: [{
                a: `a`,
                data: [ 4, 5, 6 ]
            }, {
                b: `b`
            }]
        };
        const result = common.merge(objA).with(objB);
        assert.equal(result.array[0].data.length, 6);
        assert.equal(result.array[1].b, `b`);
        assert.end();
    });
    test(`CommonElement reveal should be able to reveal a an object.`, (assert) => {
        const fnA = function () {
            const a = `a`;
            this.getA = function () {
                return a;
            };
            this.getUpperCaseA = function () {
                return this.getA().toUpperCase();
            };
        };
        const obj = common.reveal(fnA);

        assert.equal(obj.getUpperCaseA(), `A`);
        assert.end();
    });
    test(`CommonElement mix should be able to do mixin for 2 objects.`, (assert) => {
        const fnX = function () {
            const a = `a`;

            this.getA = function () {
                return a;
            };
            this.getUpperCaseA = function () {
                return this.getA().toUpperCase();
            };
        };
        const fnY = function () {
            const a = `b`;

            this.getB = function () {
                return a;
            };
        };
        const fnCX = function () {
            const c = {};

            fnX.call(c);
            return c;
        };
        const fnCY = function () {
            const c = {};

            fnY.call(c);
            return c;
        };
        const fnZ = common.mix(fnCX()).with(fnCY());

        assert.equal(fnZ.getA(), `a`);
        assert.equal(fnZ.getB(), `b`);
        assert.end();
    });
    test(`CommonElement arrayToString and stringToArray should work.`, (assert) => {
        const a = [ `Hello`, `world,`, `how`, `are`, `you?` ];
        const b = `Hello/world,/how/are/you?`;
        const resultA = common.arrayToString(a, `/`);
        const resultB = common.stringToArray(b, `/`);
        assert.equal(resultA, b);
        assert.equal(resultB.toString(), a.toString());
        assert.end();
    });
    test(`CommonElement camelcaseToUnderscore and underscoreToCamelcase should work.`, (assert) => {
        const a = `this_is_a_var`;
        const b = `thisIsAVar`;
        const resultA = common.underscoreToCamelcase(a);
        const resultB = common.camelcaseToUnderscore(b);
        assert.equal(resultA, b);
        assert.equal(resultB, a);
        assert.end();
    });
    test(`CommonElement forEach should be able to iterate object and array.`, (assert) => {
        const obj = {
            a: `a`,
            b: `b`,
            c: `c`
        };
        common.forEach(obj, function (error, value, key) {
            if (!error) {
                assert.equal(value, obj[key]);
            }
        }, null);
        const array = [ 1, 2, 3 ];
        common.forEach(array, (error, value, index) => {
            if (!error) {
                assert.equal(value, array[index]);
            }
        });
        assert.end();
    });
}
