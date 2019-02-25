'use strict'; // eslint-disable-line

import Hf from 'hyperflow';

import { CounterDomainTestFixture } from './counter-domain-test-fixture';

// import { CounterStoreTestFixture } from './counter-store-test-fixture';

import event from '../events/counter-event';

const CounterTestAgent = Hf.Agent.augment({
    $init () {
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
