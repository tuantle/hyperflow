/**
 *
 * Test Agent Factory Spec Tests.
 *
 * @description - Test specs for test agent factory module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

import TestAgent from '../../src/factories/test-agent-factory';

import Domain from '../../src/factories/domain-factory';

// import TapeTestRunnerComposite from '../../libs/composites/test-runners/tape-test-runner-composite';

import JestTestRunnerComposite from '../../libs/composites/test-runners/jest-test-runner-composite';

export function runTests () {
    const TestDomain = Domain.augment({
        setup (done) {
            const domain = this;

            domain.incoming(`start-test`).handle(() => {
                domain.outgoing(`event-emit-hello-world`).emit(() => `Hello world!`);
            });

            done();
        }
    });
    const DomainTestAgent = TestAgent.augment({
        composites: [
            JestTestRunnerComposite
        ],
        $init () {
            const tAgent = this;
            tAgent.register({
                subjects: [
                    TestDomain(`test-domain`)
                ]
            });
        },
        setup (done) {
            const tAgent = this;

            // tAgent.verify(`TestDomain should be able to emit an outgoing stream.`, (assert, end) => {
            //     tAgent.outgoing(`start-test`).emit();
            //     tAgent.incoming(`event-emit-hello-world`).handle((msg) => {
            //         assert.equal(msg, `Hello world!`);
            //         end(assert.end);
            //     });
            //     assert.timeoutAfter(10000);
            // });
            tAgent.verify(`TestDomain should be able to emit an outgoing stream.`, (expect, end) => {
                tAgent.outgoing(`start-test`).emit();
                tAgent.incoming(`event-emit-hello-world`).handle((msg) => {
                    expect.equal(msg, `Hello world!`);
                    end(() => null);
                });
            });
            done();
        }
    });
    const domainTestAgent = DomainTestAgent(`domain-test-agent`);

    domainTestAgent.run();
}
