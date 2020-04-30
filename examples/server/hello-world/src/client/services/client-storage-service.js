'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import WebStorageServiceComposite from 'hyperflow/libs/composites/services/web-storage-service-composite';

import EVENT from '../../common/event';

export default Hf.Service.augment({
    composites: [ WebStorageServiceComposite ],
    $init () {
        const service = this;

        service.from(`local-storage`, `hello-world`).isSchema({
            language: `string`
        }).then((checks) => {
            if(!checks.every((check) => check)) {
                service.from(`local-storage`, `hello-world`).write({
                    language: `english`
                });
            }
        });
    },
    setup (done) {
        const service = this;
        service.incoming(EVENT.REQUEST.DATAREAD).handle(() => {
            service.from(`local-storage`, `hello-world`)
                .read()
                .then((results) => service.outgoing(EVENT.RESPONSE.TO.DATAREAD.OK).emit(() => results[0]))
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAREAD.ERROR).emit();
                    console.warn(`AppStorageService - Unable to read from local storage. ${error.message}`);
                });
        });
        service.incoming(EVENT.REQUEST.DATAWRITE).handle((bundle) => {
            service.from(`local-storage`, `hello-world`)
                .write(bundle)
                .then(() => service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.OK).emit())
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.ERROR).emit();
                    console.warn(`AppStorageService - Unable to write from local storage. ${error.message}`);
                });
        });
        done();
    }
});
