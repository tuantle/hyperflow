/**
 *
 * Event STream Composite Spec Tests.
 *
 * @description - Test specs for factory event stream composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 */
'use strict'; // eslint-disable-line

// import test from 'tape';

import Composer from '../../../../src/core/composer';
import EventStreamComposite from '../../../../src/core/factories/composites/event-stream-composite';

/* factory Ids */
import {
    FIXTURE_FACTORY_CODE
} from '../../../../src/core/factories/factory-code';

const Factory = Composer({
    composites: [
        EventStreamComposite
    ],
    state: {
        fId: {
            computable: {
                contexts: [
                    `name`
                ],
                compute () {
                    return `${FIXTURE_FACTORY_CODE}-${this.name}`;
                }
            }
        }
    },
    Factory: function Factory () {
        this.connectStream = function connectStream (source, duplex = false) {
            this.observe(source).delay(10);
            if (duplex) {
                source.observe(this);
            }
        };
    }
});
const factoryA = Factory.augment({
    state: {
        name: `factoryA`
    },
    // operateIncomingStream: function operateIncomingStream (operator) {
    //     operator.divert(`event1`, `event2`).monitor({
    //         logOnNext: (payload) => console.log(`Monitor factory A incoming event stream id:${payload.eventId} -- ${payload.value}`)
    //     }).recombine();
    // },
    // operateOutgoingStream: function operateOutgoingStream (operator) {
    //     operator.divert(`event3`).map((payload) => {
    //         return {
    //             eventId: `event3`,
    //             value: payload.value[0] + payload.value[1]
    //         };
    //     }).monitor({
    //         logOnNext: (payload) => {
    //             console.log(`Monitor factory A outgoing event stream id:${payload.eventId} -- ${payload.value}`);
    //         }
    //     }).recombine();
    // },
    setup: function setup (done) {
        const factory = this;
        factory.incoming(
            `event1`,
            `event2`
        ).await().forward(`event3`);
        factory.incoming(
            `event4`,
        ).handle((result) => console.log(result)).complete();
        factory.incoming(`event5`).repeat();
        factory.incoming(`event6`).forward(
            `event7`,
            `event8`
        );
        // factory.incoming(
        //     `event9`,
        //     `event10`
        // ).await().handle((results) => {
        //     console.log(results);
        //     console.log(`It is Working!!!`);
        // });

        factory.incoming(`cancellable-eventA`).forward(`forwarded-cancellable-eventA`);
        factory.incoming(`cancellable-eventB`).forward(`forwarded-cancellable-eventB`);

        factory.incoming(`event-final`).handle((value) => console.log(value));

        done();
    }
})();
const factoryB = Factory.augment({
    state: {
        name: `factoryB`
    },
    setup: function setup (done) {
        const factory = this;
        factory.outgoing(`event1`).emit(() => `1`);
        factory.outgoing(`event4`).emit(() => `4a`);
        factory.outgoing(`event5`).emit(() => `5`);
        factory.outgoing(`event6`).emit(() => `From B`);
        done();
    }
})();
const factoryC = Factory.augment({
    state: {
        name: `factoryC`
    },
    setup: function setup (done) {
        const factory = this;
        factory.outgoing(`event2`).emit(() => `2`);
        factory.outgoing(`event4`).emit(() => `4b`);
        factory.outgoing(`event6`).emit(() => `From C`);
        done();
    }
})();
const factoryD = Factory.augment({
    state: {
        name: `factoryD`
    },
    // operateIncomingStream: function operateIncomingStream (operator) {
    //     operator.divert(`event3`).map((payload) => {
    //         return {
    //             eventId: `event3`,
    //             value: payload.value[0] + payload.value[1]
    //         };
    //     }).monitor({
    //         logOnNext: (payload) => console.log(`Monitor factory D incoming event stream id:${payload.eventId} -- ${payload.value}`)
    //     }).recombine();
    // },
    setup: function setup (done) {
        const factory = this;
        factory.incoming(`event3`).handle((results) => {
            console.log(results);
        });
        factory.incoming(`event5`).handle((value) => {
            console.log(value);
            done();
        });
        factory.incoming(`event7`).forward(`event9`);
        factory.incoming(`event8`).forward(`event10`);
        factory.outgoing(`event-final`).emit(() => `DONE!`);

        factory.incoming(
            `forwarded-cancellable-eventA`,
            `forwarded-cancellable-eventB`
        ).await().handle((values, onCancel) => {
            let intervalA;
            let intervalB;
            if (values) {
                let iA = 0;
                let iB = 0;
                const [
                    valueA,
                    valueB
                ] = values;
                intervalA = setInterval(() => {
                    for (let x = 0; x < 9; x++) {
                        console.log(`A-${iA++}`);
                    }
                    if (iA > 99) {
                        clearInterval(intervalA);
                        console.log(valueA);
                    }
                }, 1);
                intervalB = setInterval(() => {
                    for (let x = 0; x < 9; x++) {
                        console.log(`B-${iB++}`);
                    }
                    if (iB > 99) {
                        clearInterval(intervalB);
                        console.log(valueB);
                    }
                }, 1);
            }

            onCancel(() => {
                clearInterval(intervalA);
                console.log(`A cancelled!!!`);
                clearInterval(intervalB);
                console.log(`B cancelled!!!`);
            });

            // const timeout = setTimeout(() => {
            //     console.log(value);
            // }, 10000);
            //
            // onCancel(() => {
            //     clearTimeout(timeout);
            //     console.log(`cancelled!!!`);
            // });
        });
    }
})();

export function runTests () {
    factoryA.connectStream(factoryB);
    factoryA.connectStream(factoryC);
    factoryA.connectStream(factoryD, true);

    factoryA.setup(() => {
        factoryA.activateOutgoingStream();
        factoryD.setup(() => {
            factoryD.activateOutgoingStream();
        });
        factoryD.activateIncomingStream();
        factoryB.setup(() => {
            factoryB.activateOutgoingStream();
        });
        factoryC.setup(() => {
            factoryC.activateOutgoingStream();

            factoryC.outgoing(`cancellable-eventA`).delay(1000).emit(() => `A completed!!!`);
            factoryC.outgoing(`cancellable-eventB`).delay(2000).emit(() => `B completed!!!`);

            factoryC.outgoing(`cancellable-eventA`).delay(2010).cancelLatest();
        });
    });
    factoryA.activateIncomingStream();
}
