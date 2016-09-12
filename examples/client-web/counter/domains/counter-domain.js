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
        domain.outgoing(`request-for-data-read`).emit();
        domain.incoming(`response-to-data-read-success`).forward(`do-init`);
        domain.incoming(`on-count`).handle((multiplier) => {
            return function modifyCount (state) {
                const newCount = state.count + multiplier * state.offset;
                return {
                    count: newCount >= 0 ? newCount : 0
                };
            };
        }).relay(`request-for-count-mutation`);
        domain.incoming(`on-undo`).forward(`do-undo-last-count-mutation`);
        domain.incoming(`on-change-offset`).forward(`request-for-offset-mutation`);
        domain.incoming(
            `response-with-mutated-count`,
            `response-with-mutated-offset`
        ).forward(`request-for-data-write`);
        done();
    }
});
export { CounterDomain };
