/**
 *
 * Composer and Composite Spec Tests.
 *
 * @description - Test specs for composite and composer modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import Composite from '../src/composite';

import Composer from '../src/composer';

export function runTests () {
    const FactoryBase = Composer({
        static: {
            message: `Hello World!`
        },
        Factory () {
            this.getMessage = function () {
                return this.message;
            };
        }
    });
    const FactoryStateComposite = Composite({
        template: {
            getUpperCaseName () {
                return this.getName().toUpperCase();
            }
        },
        enclosure: {
            StateComposite (definition) {
                this.getName = function () {
                    return definition.state.name;
                };
            }
        }
    });
    const Factory = FactoryBase.augment({
        composites: [
            FactoryStateComposite
        ],
        state: {
            name: `Mr Jonh`
        },
        $init () {
            console.log(this.isInitialized());
        },
        printMessage () {
            const message = `${this.getUpperCaseName()} says ${this.getMessage()}`;
            console.log(message);
            return message;
        }
    });
    test(`--------- Running Composer & Composite Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`Composer should be able to compose a factory.`, (assert) => {
        assert.equal(typeof FactoryBase, `object`);
        assert.equal(typeof FactoryBase.augment, `function`);
        assert.end();
    });
    test(`Composite should be able to create a factory composite.`, (assert) => {
        assert.equal(typeof FactoryStateComposite, `object`);
        assert.equal(FactoryStateComposite.getTemplate().hasOwnProperty(`getUpperCaseName`), true);
        assert.equal(typeof FactoryStateComposite.getTemplate().getUpperCaseName, `function`);
        assert.end();
    });
    test(`A composed factory with composite should.`, (assert) => {
        const product = Factory(`factory`);
        assert.equal(product.printMessage(), `MR JONH says Hello World!`);
        assert.end();
    });
}
