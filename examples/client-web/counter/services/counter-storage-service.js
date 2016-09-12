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

import { Hflow } from 'hyperflow';

const CounterStorageService = Hflow.Service.augment({
    composites: [
        Hflow.Storage.WebStorageComposite
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
            Hflow.log(`error`, `CounterStorageService.getProvider - Local storage feature is not unsupported.`);
        }
        return {
            storage: window.localStorage
        };
    },
    setup: function setup (done) {
        const service = this;
        service.incoming(`request-for-data-read`).handle(() => {
            service.fetch(
                `counter`
            ).read().then((results) => {
                service.outgoing(`response-to-data-read-success`).emit(() => results[0]);
            }).catch((error) => {
                service.outgoing(`response-to-data-read-serror`).emit();
                Hflow.log(`warn1`, `CounterStorageService - Unable to read from local storage. ${error.message}`);
            });
        });
        service.incoming(`request-for-data-write`).handle((counter) => {
            service.fetch(
                `counter`
            ).write({
                bundle: counter
            }).then(() => {
                service.outgoing(`response-with-data-write-success`).emit();
            }).catch((error) => {
                service.outgoing(`response-with-data-write-error`).emit();
                Hflow.log(`warn1`, `CounterStorageService - Unable to write from local storage. ${error.message}`);
            });
        });
        done();
    }
});
export { CounterStorageService };
