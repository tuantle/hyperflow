/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app store.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/counter-event';

const CounterStore = Hf.Store.augment({
    composites: [
        Hf.State.TimeTraversalComposite
    ],
    state: {
        undoable: {
            value: false,
            stronglyTyped: true
        },
        count: {
            value: 0,
            // bounded: [ 0, Infinity ]
            stronglyTyped: true
        },
        offset: {
            value: 1,
            stronglyTyped: true
        }
    },
    setup: function setup (done) {
        const store = this;
        store.incoming(EVENT.DO.INIT).handle((value) => {
            if (store.reduce({
                ...value
            })) {
                Hf.log(`info1`, `Store initialized.`);
            }
        });
        store.incoming(EVENT.DO.OFFSET_MUTATION).handle((offset) => {
            if (store.reduce({
                offset
            })) {
                store.outgoing(EVENT.AS.OFFSET_MUTATED).emit(() => {
                    return {
                        offset: store.offset
                    };
                });
                Hf.log(`info1`, `Store mutated`);
            }
        });
        store.incoming(EVENT.DO.COUNT_MUTATION).handle((mutateCount) => {
            if (store.reduce(mutateCount)) {
                store.outgoing(EVENT.AS.COUNT_MUTATED).emit(() => {
                    return {
                        count: store.count
                    };
                });
                Hf.log(`info1`, `Store mutated.`);
            }
        });
        store.incoming(EVENT.DO.UNDO_LAST_COUNT_MUTATION).handle(() => {
            store.timeTraverse(`count`, -1);
        });
        done();
    }
});
export default CounterStore;
