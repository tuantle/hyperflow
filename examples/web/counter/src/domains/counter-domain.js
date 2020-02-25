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
            store: CounterStore(`counter-store`),
            interface: CounterInterface(`counter-view`),
            services: [
                CounterStorageService(`counter-storage-service`)
            ]
        });
    },
    setup (done) {
        const domain = this;
        domain.outgoing(EVENT.REQUEST.DATAREAD).emit();
        domain.incoming(EVENT.RESPONSE.TO.DATAREAD.OK).forward(EVENT.DO.INIT_STORE);
        domain.incoming(EVENT.ON.COUNT).handle((multiplier) => (store) => ({
            undoable: true,
            undoTimeIndexOffset: -1,
            count: store.count + multiplier * store.offset
        })).relay(EVENT.DO.COUNT);
        domain.incoming(EVENT.ON.UNDO).forward(EVENT.DO.UNDO_LAST_COUNT);
        domain.incoming(EVENT.ON.CHANGE_OFFSET).forward(EVENT.DO.CHANGE_OFFSET);
        domain.incoming(EVENT.AS.STORE_MUTATED).forward(EVENT.REQUEST.DATAWRITE);
        done();
    }
});
export default CounterDomain;
