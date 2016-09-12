/**
 *
 * Composer Spec Tests.
 *
 * @description - Test specs for composite element and composer modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import Composer from '../../src/core/composer';

export function runTests () {
    test(`Composer should be able to compose a factory.`, (assert) => {
        const FactoryBase = Composer({
            state: {
                message: `Hello World!`
            },
            Factory: function Factory () {
                this.getMessage = function getMessage () {
                    return this.message;
                };
            }
        });
        const Factory = FactoryBase.augment({
            getMessageUpperCase: function getMessageUpperCase () {
                return this.getMessage().toUpperCase();
            }
        });
        const product = Factory();
        assert.equal(product.getMessage(), `Hello World!`);
        assert.equal(product.getMessageUpperCase(), `HELLO WORLD!`);
        assert.end();
    });
}
