/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app domain.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import { CounterStore } from '../stores/counter-store';

import { CounterStorageService } from '../services/counter-storage-service';

import { CounterInterface } from '../interfaces/counter-interface';

import EVENT from '../events/counter-event';

/**
 * @description - Counter app domain module.
 *
 * @module CounterDomain
 */
const CounterDomain = Hflow.Domain.augment({
    $init: function $init () {
        const domain = this;
        domain.register({
            store: CounterStore({
                name: `${domain.name}-store`
            }),
            intf: CounterInterface({
                name: `${domain.name}-view`,
                style: {
                    h1: {
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 12,
                        textAlign: `left`,
                        paddingRight: 175
                    },
                    h2: {
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 32,
                        textAlign: `left`
                    }
                }
            }),
            services: [
                CounterStorageService({
                    name: `${domain.name}-storage-service`
                })
            ]
        });
    },
    setup: function setup (done) {
        const domain = this;
        domain.outgoing(EVENT.REQUEST.DATAREAD).emit();
        domain.incoming(EVENT.RESPONSE.TO.DATAREAD.OK).forward(EVENT.DO.INIT);
        domain.incoming(EVENT.ON.COUNT).handle((multiplier) => {
            return function modifyCount (state) {
                const newCount = state.count + multiplier * state.offset;
                return {
                    count: newCount >= 0 ? newCount : 0
                };
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
export { CounterDomain };
