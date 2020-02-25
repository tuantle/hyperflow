/**
 *
 * Domain Factory Spec Tests.
 *
 * @description - Test specs for domain factory modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import Domain from '../../src/factories/domain-factory';

export function runTests () {
    const TestDomain = Domain.augment({
    });
    const domain = TestDomain(`test-domain`);

    test(`--------- Running DomainFactory Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`DomainFactory should be able to augment a domain product.`, (assert) => {
        assert.equal(typeof TestDomain, `function`);
        assert.equal(typeof domain, `object`);
        assert.end();
    });
}
