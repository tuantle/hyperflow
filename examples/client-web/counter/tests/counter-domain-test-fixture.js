/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter test fixture for app domain.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import Hflow from 'hyperflow';

import { CounterDomain } from '../domains/counter-domain';

/**
 * @description - Counter app domain test fixture module.
 *
 * @module CounterDomainTestFixture
 */
const CounterDomainTestFixture = Hflow.Fixture.augment({
    composites: [
        Hflow.Test.DomainFixtureComposite,
        Hflow.Test.TapeRunnerComposite
    ],
    $init: function $init () {
        const fixture = this;
        fixture.register({
            testSubject: CounterDomain({
                name: `counter`
            })
        });
    },
    setup: function setup (done) {
        const fixture = this;

        // domain.incoming(`on-change-offset`).forward(`request-for-offset-update`);
        // domain.incoming(
        //     `response-with-updated-count`,
        //     `response-with-updated-offset`
        // ).forward(`request-for-data-write`);

        fixture.test((assert) => {
            fixture.incoming(`request-for-data-read`).handle(() => {
                assert.pass(`Handled request-for-data-read`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should emit a request for data read.`);

        fixture.test((assert) => {
            fixture.outgoing(`response-to-data-read-success`).emit();
            fixture.incoming(`do-init`).handle(() => {
                assert.pass(`Handled do-init.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should forward initialization when receiving a data read success response.`);

        fixture.test((assert) => {
            fixture.outgoing(`on-count`).emit(() => 1);
            fixture.incoming(`request-for-count-mutation`).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 1,
                    offset: 1
                }).count, 2, `Handled on-count increment.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that mutate count up state.`);

        fixture.test((assert) => {
            fixture.outgoing(`on-count`).emit(() => -1);
            fixture.incoming(`request-for-count-mutation`).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 2,
                    offset: 1
                }).count, 1, `Handled on-count decrement.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that mutate count down state.`);

        fixture.test((assert) => {
            fixture.outgoing(`on-count`).emit(() => -1);
            fixture.incoming(`request-for-count-mutation`).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 0,
                    offset: 1
                }).count, 0, `Handled on-count decrement at or above 0 only.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that does not mutate count state < 0.`);
        done();
    }
});
export { CounterDomainTestFixture };
