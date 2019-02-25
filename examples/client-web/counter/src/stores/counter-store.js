'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/counter-event';

const CounterStore = Hf.Store.augment({
    composites: [
        Hf.State.TimeTraversalComposite
    ],
    state: {
        undoable: false,
        undoTimeIndexOffset: -1,
        count: 0,
        offset: 1
    },
    setup (done) {
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
            if (store.undoable) {
                if (store.timeTraverse(`count`, store.undoTimeIndexOffset)) {
                    if (store.reduce({
                        undoTimeIndexOffset: store.undoTimeIndexOffset - 3,
                        undoable: true
                    })) {
                        Hf.log(`info1`, `Store mutated`);
                    }
                } else {
                    if (store.reduce({
                        undoable: false,
                        undoTimeIndexOffset: -1
                    })) {
                        store.flush();
                        Hf.log(`info1`, `Store mutated`);
                    }
                }
            }
        });
        done();
    }
});
export default CounterStore;
