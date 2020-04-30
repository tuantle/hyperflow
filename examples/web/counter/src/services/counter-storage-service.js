'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import WebStorageServiceComposite from 'hyperflow/libs/composites/services/web-storage-service-composite';

import EVENT from '../events/counter-event';

export default Hf.Service.augment({
    composites: [ WebStorageServiceComposite ],
    $init () {
        const service = this;

        service.from(`local-storage`, `counter`).isSchema({
            count: `number`,
            offset: `number`
        }).then((checks) => {
            if(!checks.every((check) => check)) {
                service.from(`local-storage`, `counter`).write({
                    count: 0,
                    offset: 1
                });
            }
        });
    },
    setup (done) {
        const service = this;
        service.incoming(EVENT.REQUEST.DATAREAD).handle(() => {
            service.from(`local-storage`, `counter`)
                .read()
                .then((results) => service.outgoing(EVENT.RESPONSE.TO.DATAREAD.OK).emit(() => results[0]))
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAREAD.ERROR).emit();
                    console.warn(`CounterStorageService - Unable to read from local storage. ${error.message}`);
                });
        });
        service.incoming(EVENT.REQUEST.DATAWRITE).handle((bundle) => {
            service.from(`local-storage`, `counter`)
                .write(bundle)
                .then(() => service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.OK).emit())
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.ERROR).emit();
                    console.warn(`CounterStorageService - Unable to write from local storage. ${error.message}`);
                });
        });
        done();
    }
});
