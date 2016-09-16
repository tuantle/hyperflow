/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app test agent.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import Hflow from 'hyperflow';

import { CounterDomainTestFixture } from './counter-domain-test-fixture';

// import { CounterStoreTestFixture } from './counter-store-test-fixture';

import event from '../events/counter-event';

/**
 * @description - Counter app test agent module.
 *
 * @module CounterTestAgent
 */
const CounterTestAgent = Hflow.Agent.augment({
    $init: function $init () {
        const agent = this;
        agent.register({
            fixtures: [
                CounterDomainTestFixture({
                    name: `${agent.name}-domain-test-fixture`
                })
                // CounterStoreTestFixture({
                //     name: `${agent.name}-store-test-fixture`
                // })
            ]
        });
    }
});
export { CounterTestAgent };
