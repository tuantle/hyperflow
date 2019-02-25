'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import CounterStore from '../stores/counter-store';

import CounterStorageService from '../services/counter-storage-service';

import CounterInterface from '../interfaces/counter-interface';

import EVENT from '../events/counter-event';

const CounterDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            store: CounterStore({
                name: `counter-store`
            }),
            intf: CounterInterface({
                name: `counter-view`
            }),
            services: [
                CounterStorageService({
                    name: `counter-storage-service`
                })
            ]
        });
    },
    setup (done) {
        const domain = this;
        domain.outgoing(EVENT.REQUEST.DATAREAD).emit();
        domain.incoming(EVENT.RESPONSE.TO.DATAREAD.OK).forward(EVENT.DO.INIT);
        domain.incoming(EVENT.ON.COUNT).handle((multiplier) => (state) => {
            return {
                undoable: true,
                undoTimeIndexOffset: -1,
                count: state.count + multiplier * state.offset
            };
        }).relay(EVENT.DO.COUNT_MUTATION);
        domain.incoming(EVENT.ON.UNDO).forward(EVENT.DO.UNDO_LAST_COUNT_MUTATION);
        domain.incoming(EVENT.ON.CHANGE_OFFSET).forward(EVENT.DO.OFFSET_MUTATION);
        domain.incoming(
            EVENT.AS.COUNT_MUTATED,
            EVENT.AS.OFFSET_MUTATED
        ).forward(EVENT.REQUEST.DATAWRITE);
        done();
    }
});
export default CounterDomain;
