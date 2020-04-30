'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ImmutableStateComposite from 'hyperflow/libs/composites/states/immutable-state-composite';

import EVENT from '../events/counter-event';

export default Hf.Store.augment({
    composites: [
        ImmutableStateComposite
    ],
    state: {
        undoable: false,
        undoTimeIndexOffset: -1,
        count: 0,
        offset: 1
    },
    $init () {
        // const store = this;
    },
    setup (done) {
        const store = this;

        store.incoming(EVENT.DO.INIT_STORE).handle(({
            count,
            offset
        }) => {
            if (store.mutate({
                count,
                offset
            })) {
                console.log(`Store initialized.`);
            }
        });

        store.incoming(EVENT.DO.CHANGE_OFFSET).handle((offset) => {
            if (store.mutate({
                offset
            })) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    count: store.count,
                    offset: store.offset
                }));
                console.log(`Store mutated`);
            }
        });

        store.incoming(EVENT.DO.COUNT).handle((mutateCount) => {
            if (store.mutate(mutateCount)) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    count: store.count,
                    offset: store.offset
                }));
                console.log(`Store mutated.`);
            }
        });

        store.incoming(EVENT.DO.UNDO_LAST_COUNT).handle(() => {
            const [ undoable, step ] = store.revertToTimeIndex(`count`, store.undoTimeIndexOffset);
            if (store.mutate({
                undoTimeIndexOffset: store.undoTimeIndexOffset - step,
                undoable
            })) {
                console.log(`Store mutated`);
            }

            if (!undoable) {
                store.mutate({
                    undoTimeIndexOffset: -1
                }, {
                    suppressMutationEvent: true
                });
                store.flush();
            }
        });

        done();
    }
});
