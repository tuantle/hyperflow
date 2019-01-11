/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app storage service.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/counter-event';

const CounterStorageService = Hf.Service.augment({
    composites: [
        Hf.Storage.WebStorageComposite
    ],
    $init: function $init () {
        const service = this;
        service.fetch(
            `counter`
        ).write({
            bundle: {
                counter: {
                    count: 0,
                    offset: 1
                }
            },
            touchRoot: true
        });
    },
    getProvider: function getProvider () {
        if (!(`localStorage` in window && window[`localStorage`] !== null)) {
            Hf.log(`error`, `CounterStorageService.getProvider - Local storage feature is not unsupported.`);
        }
        return {
            storage: window.localStorage
        };
    },
    setup: function setup (done) {
        const service = this;
        service.incoming(EVENT.REQUEST.DATAREAD).handle(() => {
            service.fetch(
                `counter`
            ).read().then((results) => {
                service.outgoing(EVENT.RESPONSE.TO.DATAREAD.OK).emit(() => results[0]);
            }).catch((error) => {
                service.outgoing(EVENT.RESPONSE.TO.DATAREAD.ERROR).emit();
                Hf.log(`warn1`, `CounterStorageService - Unable to read from local storage. ${error.message}`);
            });
        });
        service.incoming(EVENT.REQUEST.DATAWRITE).handle((counter) => {
            service.fetch(
                `counter`
            ).write({
                bundle: counter
            }).then(() => {
                service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.OK).emit();
            }).catch((error) => {
                service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.ERROR).emit();
                Hf.log(`warn1`, `CounterStorageService - Unable to write from local storage. ${error.message}`);
            });
        });
        done();
    }
});
export default CounterStorageService;
