/**
 *
 * Hyperflow CommonUtil Spec Tests.
 *
 * @description - Test specs for hyperflow common utility functions.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
`use strict`; // eslint-disable-line

/* eslint no-process-env: 0 */

import test from 'tape';

import {
    typeOf,
    isInteger,
    isFloat,
    isNumeric,
    isString,
    isBoolean,
    isDefined,
    isNull,
    isFunction,
    isGenerator,
    isIterator,
    isObject,
    isArray,
    isDate,
    isRegEx,
    isNonEmptyString,
    isNonEmptyObject,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    arrayToString,
    stringToArray,
    camelcaseToDash,
    dashToCamelcase,
    underscoreToCamelcase,
    camelcaseToUnderscore,
    clear,
    clone,
    compose,
    mutate,
    merge,
    fallback,
    retrieve,
    collect,
    mix,
    // freeze,
    reveal,
    forEach,
    log,
    getLogHistories
} from '../../libs/utils/common-util';

process.env.LOGGING_WARN0 = true;

export function runTests () {
    test(`--------- Running CommonUtil Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`CommonUtil isInteger should correctly check if value is an integer.`, (assert) => {
        assert.equal(isInteger(1234), true);
        assert.equal(isInteger(-1234), true);
        assert.equal(isInteger(3.14), false);
        assert.equal(isInteger(`99,999`), false);
        assert.equal(isInteger(`#abcdef`), false);
        assert.equal(isInteger(`1.2.3`), false);
        assert.equal(isInteger(``), false);
        assert.equal(isInteger(NaN), false);
        assert.end();
    });
    test(`CommonUtil isFloat should correctly check if value is a float.`, (assert) => {
        assert.equal(isFloat(3.14), true);
        assert.equal(isFloat(-3.14), true);
        assert.equal(isFloat(`99,999`), false);
        assert.equal(isFloat(`#abcdef`), false);
        assert.equal(isFloat(`1.2.3`), false);
        assert.equal(isFloat(``), false);
        assert.equal(isFloat(NaN), false);
        assert.end();
    });
    test(`CommonUtil isNumeric should correctly check if value is a number.`, (assert) => {
        assert.equal(isNumeric(-1), true);
        assert.equal(isNumeric(-1.5), true);
        assert.equal(isNumeric(0), true);
        assert.equal(isNumeric(0.42), true);
        assert.equal(isNumeric(0x89f), true);
        assert.equal(isNumeric(`99,999`), false);
        assert.equal(isNumeric(`#abcdef`), false);
        assert.equal(isNumeric(`1.2.3`), false);
        assert.equal(isNumeric(``), false);
        assert.equal(isNumeric(NaN), false);
        assert.end();
    });
    test(`CommonUtil isString should correctly check if value is a string.`, (assert) => {
        assert.equal(isString(`This is a String.`), true);
        assert.equal(isString(1234), false);
        assert.equal(isString({}), false);
        assert.equal(isString([]), false);
        assert.end();
    });
    test(`CommonUtil isNonEmptyString should correctly check if value is a string and not empty.`, (assert) => {
        assert.equal(isNonEmptyString(`This is a String.`), true);
        assert.equal(isNonEmptyString(``), false);
        assert.equal(isNonEmptyString(1234), false);
        assert.end();
    });
    test(`CommonUtil isBoolean should correctly check if value is a boolean.`, (assert) => {
        assert.equal(isBoolean(`true`), true);
        assert.equal(isBoolean(`false`), true);
        assert.equal(isBoolean(true), true);
        assert.equal(isBoolean(false), true);
        assert.end();
    });
    test(`CommonUtil isDefined should correctly check if value is defined.`, (assert) => {
        assert.equal(isDefined({}), true);
        assert.equal(isDefined(undefined), false);
        assert.end();
    });
    test(`CommonUtil isNull should correctly check if value is null.`, (assert) => {
        assert.equal(isNull(123), false);
        assert.equal(isNull(undefined), false);
        assert.equal(isNull(null), true);
        assert.end();
    });
    test(`CommonUtil isFunction should correctly check if value is a function.`, (assert) => {
        assert.equal(isFunction(function () {}), true);
        assert.equal(isFunction(() => {}), true);
        assert.equal(isFunction(1234), false);
        assert.end();
    });
    test(`CommonUtil isGenerator should correctly check if value is a generator.`, (assert) => {
        assert.equal(isGenerator(function () {}), false);
        assert.equal(isGenerator(() => {}), false);
        assert.equal(isGenerator(function *() {
            yield `a`;
        }), true);
        assert.equal(isGenerator(1234), false);
        assert.end();
    });
    test(`CommonUtil isIterator should correctly check if value is an iterator.`, (assert) => {
        const gen = function *() {
            yield `a`;
        };
        assert.equal(isIterator(function () {}), false);
        assert.equal(isIterator(() => {}), false);
        assert.equal(isIterator({}), false);
        assert.equal(isIterator([]), true);
        assert.equal(isIterator(gen()), true);
        assert.equal(isIterator(1234), false);
        assert.end();
    });
    test(`CommonUtil isDate should correctly check if value is a date.`, (assert) => {
        assert.equal(isDate(new Date()), true);
        assert.equal(isDate(1234), false);
        assert.end();
    });
    test(`CommonUtil isRegEx should correctly check if value is a regex.`, (assert) => {
        assert.equal(isRegEx(/ab+c/), true);
        assert.equal(isRegEx(new RegExp(`ab+c`)), true);
        assert.equal(isRegEx(`ab+c`), false);
        assert.end();
    });
    test(`CommonUtil isArray/isObject should correctly check if value is an array/object.`, (assert) => {
        assert.equal(isObject({}), true);
        assert.equal(isArray([]), true);
        assert.equal(isObject(1234), false);
        assert.equal(isArray(1234), false);
        assert.end();
    });
    test(`CommonUtil isNonEmptyArray/isNonEmptyObject should correctly check if value is an array/object and not empty.`, (assert) => {
        assert.equal(isNonEmptyObject({
            a: 1
        }), true);
        assert.equal(isNonEmptyArray([ 1, 2, 3, 4 ]), true);
        assert.equal(isNonEmptyObject({}), false);
        assert.equal(isNonEmptyArray([]), false);
        assert.end();
    });
    test(`CommonUtil isSchema should correctly check and compare an object to a schema.`, (assert) => {
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
            fnA () {},
            fnB () {},
            a: {
                b: 123,
                c: `abc`
            }
        };
        const objB = {
            a: 123,
            b: [],
            fnC () {}
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

        assert.equal(isSchema(schemaA).of(objA), true);
        assert.equal(isSchema(schemaB).of(objB), true);
        assert.equal(isSchema(schemaC).of(objC1), true);
        assert.equal(isSchema(schemaC).of(objC2), false);
        assert.end();
    });
    test(`CommonUtil isEmpty should correctly check if object is empty.`, (assert) => {
        assert.equal(isEmpty({}), true);
        assert.equal(isEmpty({
            data: 1234
        }), false);
        assert.end();
    });
    test(`CommonUtil typeOf should correctly check value type.`, (assert) => {
        assert.equal(typeOf({}), `object`);
        assert.equal(typeOf([]), `array`);
        assert.equal(typeOf(``), `string`);
        assert.equal(typeOf(1234), `number`);
        assert.equal(typeOf(null), `null`);
        assert.end();
    });
    test(`CommonUtil clear should correctly clear an object or array.`, (assert) => {
        const obj = {
            data: 1234
        };
        const array = [ 1, 2, 3, 4 ];

        clear(obj);
        clear(array);
        assert.equal(isEmpty(obj), true);
        assert.equal(array.length === 0, true);
        assert.end();
    });
    test(`CommonUtil compose should correctly compose two for more functions.`, (assert) => {
        function fnA (x) {
            return x + 1;
        }
        function fnB (x) {
            return x * x;
        }
        function fnC (x) {
            return x * fnA(x);
        }
        const fnABC = compose(fnA, fnB, fnC);
        assert.equal(fnABC(12), 28730);
        assert.end();
    });
    test(`CommonUtil collect should correctly pluck propteries from an object or array.`, (assert) => {
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
        const results = collect(`data1.a`, `data2.a`, `data3.a`).from(obj);
        assert.equal(results.length, 3);
        assert.equal(results[1], `a`);
        assert.end();
    });
    test(`CommonUtil clone should correctly clone an object or array.`, (assert) => {
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
        const clonedArray = clone(array);
        const clonedObj = clone(obj);

        let objA = { a: 1 };
        let objB = clone(objA);
        objB.a = 2;

        assert.equal(array[5] === clonedArray[5], true);
        assert.equal(clonedObj.data1.a, `a`);
        assert.equal(clonedObj.data2.b, 456);
        assert.equal(objA.a !== objB.a, true);
        assert.end();
    });
    test(`CommonUtil retrieve should correctly retrieve a property of an object.`, (assert) => {
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
        const valueA = retrieve(`dataA1.data10`, `.`).from(obj);
        const valueB = retrieve(`dataAB.dataAB1.3.a`, `.`).from(obj);
        const valueC = retrieve(`dataAB.dataAB1.3.b`, `.`, true).from(obj);
        assert.equal(valueA, `data10`);
        assert.equal(valueB, `A1`);
        assert.equal(valueC.dataAB.dataAB1[3].b, `b`);
        assert.end();
    });
    test(`CommonUtil fallback should be able to do fallback.`, (assert) => {
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
        const result = fallback(defaultObj).of(Object.freeze(objA));
        assert.equal(result.b.c, 1234);
        assert.equal(result.a, `a`);
        assert.end();
    });
    test(`CommonUtil mutate should be able to mutate an object by a reference mutator object.`, (assert) => {
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
                foo: [ 5, 2, 3 ]
            }]
        };
        const mutatorB = {
            foo: [ 4, 5, 6 ]
        };
        // const mutatorC = {
        //     foo: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
        // };
        // const mutatorD = {
        //     foo: {
        //         bar: [ 1, 2, 3 ],
        //         fooBar: `fooBar`
        //     }
        // };
        const resultA = mutate(obj).by(mutatorA);
        const resultB = mutate(obj).atPathBy(mutatorB, `bar.0.foo`);
        // const resultC = mutate(obj, {
        //     reconfig: true
        // }).atPathBy(mutatorC, `bar.0.foo`);
        // const resultD = mutate(obj, {
        //     reconfig: true
        // }).atPathBy(mutatorD, `foo`);
        //
        // console.log(JSON.stringify(resultC))
        // console.log(JSON.stringify(resultD))

        assert.equal(resultA.foo.bar, 4);
        assert.equal(resultA.bar[0].a, `A`);
        assert.equal(resultA.bar[0].foo.length, 3);
        assert.equal(resultA.bar[0].foo[0], 5);
        assert.equal(resultB.foo.bar, 3);
        assert.equal(resultB.bar[0].a, `a`);
        assert.equal(resultB.bar[0].foo.length, 3);
        assert.equal(resultB.bar[0].foo[0], 4);
        assert.end();
    });
    test(`CommonUtil merge should be able to deep merge 2 objects.`, (assert) => {
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
        const result = merge(objA).with(objB);
        assert.equal(result.array[0].data.length, 6);
        assert.equal(result.array[1].b, `b`);
        assert.end();
    });
    test(`CommonUtil reveal should be able to reveal a an object.`, (assert) => {
        const fnA = function () {
            const a = `a`;
            this.getA = function () {
                return a;
            };
            this.getUpperCaseA = function () {
                return this.getA().toUpperCase();
            };
        };
        const obj = reveal(fnA);

        assert.equal(obj.getUpperCaseA(), `A`);
        assert.end();
    });
    test(`CommonUtil mix should be able to do mixin for 2 objects.`, (assert) => {
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
        const fnZ = mix(fnCX()).with(fnCY());

        assert.equal(fnZ.getA(), `a`);
        assert.equal(fnZ.getB(), `b`);

        // const fnW = mix(fnX).with(fnY);
        //
        // assert.equal(fnW.getA(), `a`);
        // assert.equal(fnW.getB(), `b`);

        assert.end();
    });
    test(`CommonUtil arrayToString and stringToArray should work.`, (assert) => {
        const a = [ `Hello`, `world,`, `how`, `are`, `you?` ];
        const b = `Hello/world,/how/are/you?`;
        const resultA = arrayToString(a, `/`);
        const resultB = stringToArray(b, `/`);
        assert.equal(resultA, b);
        assert.equal(resultB.toString(), a.toString());
        assert.end();
    });
    test(`CommonUtil camelcaseToUnderscore and underscoreToCamelcase should work.`, (assert) => {
        const a = `this_is_a_var`;
        const b = `thisIsAVar`;
        const resultA = underscoreToCamelcase(a);
        const resultB = camelcaseToUnderscore(b);
        assert.equal(resultA, b);
        assert.equal(resultB, a);
        assert.end();
    });
    test(`CommonUtil camelcaseToDash and dashToCamelcase should work.`, (assert) => {
        const a = `this-is-a-var`;
        const b = `thisIsAVar`;
        const resultA = dashToCamelcase(a);
        const resultB = camelcaseToDash(b);
        assert.equal(resultA, b);
        assert.equal(resultB, a);
        assert.end();
    });
    test(`CommonUtil forEach should be able to iterate object and array.`, (assert) => {
        const obj = {
            a: `a`,
            b: `b`,
            c: `c`
        };
        forEach(obj, (error, value, key) => {
            if (!error) {
                assert.equal(value, obj[key]);
            }
        }, null);
        const array = [ 1, 2, 3 ];
        forEach(array, (error, value, index) => {
            if (!error) {
                assert.equal(value, array[index]);
            }
        });
        assert.end();
    });
    test(`CommonUtil log and getLogHistories should be able to log and record.`, (assert) => {
        log(`info0`, `Logging info0.`);
        log(`info1`, `Logging info1.`);
        log(`warn0`, `Logging warn0.`);
        log(`warn1`, `Logging warn1.`);
        log(`debug`, `Logging debug.`);

        assert.equal(getLogHistories(`info0`)[0].message, `INFO-0: Logging info0.`);
        assert.equal(getLogHistories(`info1`)[0].message, `INFO-1: Logging info1.`);
        assert.equal(getLogHistories(`warn0`)[0].message, `WARN-0: Logging warn0.`);
        assert.equal(getLogHistories(`warn1`)[0].message, `WARN-1: Logging warn1.`);
        assert.equal(getLogHistories(`debug`)[0].message, `DEBUG: Logging debug.`);
        assert.end();
    });
}
