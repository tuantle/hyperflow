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
        store.incoming(`do-init`).handle((value) => {
            if (store.reduce({
                count: value.count,
                offset: value.offset
            })) {
                Hflow.log(`info`, `Store initialized.`);
            }
        });
        store.incoming(`request-for-offset-mutation`).handle((value) => {
            if (store.reduce({
                offset: value
            })) {
                store.outgoing(`response-with-mutated-offset`).emit(() => {
                    return { offset: store.offset };
                });
                Hflow.log(`info`, `Store mutated`);
            }
        });
        store.incoming(`request-for-count-mutation`).handle((modifyCount) => {
            if (store.reduce(modifyCount)) {
                store.outgoing(`response-with-mutated-count`).emit(() => {
                    return {
                        count: store.count
                    };
                });
                Hflow.log(`info`, `Store mutated.`);
            }
        });
        store.incoming(`do-undo-last-count-mutation`).handle(() => {
            store.timeTraverse(`count`, -1);
            // Hflow.log(`info`, JSON.stringify(store.recallAll(`count`), null, `\t`));
        });
        done();
    }
});
export { CounterStore };
