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

import event from '../events/counter-event';

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
        store.incoming(event.do.init).handle((value) => {
            if (store.reduce({
                count: value.count,
                offset: value.offset
            })) {
                Hflow.log(`info`, `Store initialized.`);
            }
        });
        store.incoming(event.do.offsetMutation).handle((value) => {
            if (store.reduce({
                offset: value
            })) {
                store.outgoing(event.as.offsetMutated).emit(() => {
                    return { offset: store.offset };
                });
                Hflow.log(`info`, `Store mutated`);
            }
        });
        store.incoming(event.do.countMutation).handle((modifyCount) => {
            if (store.reduce(modifyCount)) {
                store.outgoing(event.as.countMutated).emit(() => {
                    return {
                        count: store.count
                    };
                });
                Hflow.log(`info`, `Store mutated.`);
            }
        });
        store.incoming(event.do.undoLastCountMutation).handle(() => {
            store.timeTraverse(`count`, -1);
            // Hflow.log(`info`, JSON.stringify(store.recallAll(`count`), null, `\t`));
        });
        done();
    }
});
export { CounterStore };
