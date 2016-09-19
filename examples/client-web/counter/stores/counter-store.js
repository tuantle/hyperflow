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

import { Hflow } from 'hyperflow';

import EVENT from '../events/counter-event';

const CounterStore = Hflow.Store.augment({
    composites: [
        Hflow.State.TimeTraversalComposite
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
                count: value.count,
                offset: value.offset
            })) {
                Hflow.log(`info`, `Store initialized.`);
            }
        });
        store.incoming(EVENT.DO.OFFSET_MUTATION).handle((value) => {
            if (store.reduce({
                offset: value
            })) {
                store.outgoing(EVENT.AS.OFFSET_MUTATED).emit(() => {
                    return { offset: store.offset };
                });
                Hflow.log(`info`, `Store mutated`);
            }
        });
        store.incoming(EVENT.DO.COUNT_MUTATION).handle((modifyCount) => {
            if (store.reduce(modifyCount)) {
                store.outgoing(EVENT.AS.COUNT_MUTATED).emit(() => {
                    return {
                        count: store.count
                    };
                });
                Hflow.log(`info`, `Store mutated.`);
            }
        });
        store.incoming(EVENT.DO.UNDO_LAST_COUNT_MUTATION).handle(() => {
            store.timeTraverse(`count`, -1);
        });
        done();
    }
});
export { CounterStore };
