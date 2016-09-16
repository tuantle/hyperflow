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

import event from '../events/counter-event';

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

        fixture.test((assert) => {
            fixture.incoming(event.request.for.dataRead).handle(() => {
                assert.pass(`Handled ${event.request.for.dataRead}`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should emit a request for data read.`);

        fixture.test((assert) => {
            fixture.outgoing(event.response.to.successful.dataRead).emit();
            fixture.incoming(event.do.init).handle(() => {
                assert.pass(`Handled ${event.do.init}.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should forward initialization when receiving a data read success response.`);

        fixture.test((assert) => {
            fixture.outgoing(event.on.count).emit(() => 1);
            fixture.incoming(event.request.for.countMutation).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 1,
                    offset: 1
                }).count, 2, `Handled ${event.on.count} increment.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that mutate count up state.`);

        fixture.test((assert) => {
            fixture.outgoing(event.on.count).emit(() => -1);
            fixture.incoming(event.request.for.countMutation).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 2,
                    offset: 1
                }).count, 1, `Handled ${event.on.count} decrement.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that mutate count down state.`);

        fixture.test((assert) => {
            fixture.outgoing(event.on.count).emit(() => -1);
            fixture.incoming(event.request.for.countMutation).handle((modifyCount) => {
                assert.equal(modifyCount({
                    count: 0,
                    offset: 1
                }).count, 0, `Handled ${event.on.count} decrement at or above 0 only.`);
                assert.end();
            });
            assert.timeoutAfter(2000);
        }, `CounterDomain should return a mutation function that does not mutate count state < 0.`);
        done();
    }
});
export { CounterDomainTestFixture };
