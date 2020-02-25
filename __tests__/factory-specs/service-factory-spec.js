/**
 *
 * Service Factory Spec Tests.
 *
 * @description - Test specs for service factory modules.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import test from 'tape';

import Service from '../../src/factories/service-factory';

export function runTests () {
    const TestService = Service.augment({
    });
    const service = TestService(`test-service`);

    test(`--------- Running ServiceFactory Spec Tests ---------`, (assert) => {
        assert.end();
    });
    test(`ServiceFactory should be able to augment a service product.`, (assert) => {
        assert.equal(typeof TestService, `function`);
        assert.equal(typeof service, `object`);
        assert.end();
    });
}
