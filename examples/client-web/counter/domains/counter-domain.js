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

import event from '../events/counter-event';

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
        domain.outgoing(event.request.dataRead).emit();
        domain.incoming(event.response.to.dataRead.ok).forward(event.do.init);
        domain.incoming(event.on.count).handle((multiplier) => {
            return function modifyCount (state) {
                const newCount = state.count + multiplier * state.offset;
                return {
                    count: newCount >= 0 ? newCount : 0
                };
            };
        }).relay(event.do.countMutation);
        domain.incoming(event.on.undo).forward(event.do.undoLastCountMutation);
        domain.incoming(event.on.changeOffset).forward(event.do.offsetMutation);
        domain.incoming(
            event.as.countMutated,
            event.as.offsetMutated
        ).forward(event.request.dataWrite);
        done();
    }
});
export { CounterDomain };
