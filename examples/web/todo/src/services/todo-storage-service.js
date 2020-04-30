'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import WebStorageServiceComposite from 'hyperflow/libs/composites/services/web-storage-service-composite';

import EVENT from '../events/todo-event';

export default Hf.Service.augment({
    composites: [ WebStorageServiceComposite ],
    $init () {
        const service = this;

        service.from(`local-storage`, `todo`).isSchema({
            setting: {
                filters: [ `string` ],
                currentFilter: `string`
            },
            tasks: [ `object` ]
        }).then((checks) => {
            if(!checks.every((check) => check)) {
                service.from(`local-storage`, `todo`).write({
                    setting: {
                        filters: [ `all`, `active`, `completed` ],
                        currentFilter: `all`
                    },
                    tasks: []
                });
            }
        });
    },
    setup (done) {
        const service = this;
        service.incoming(EVENT.REQUEST.DATAREAD).handle((pathId) => {
            service.from(`local-storage`, pathId)
                .read()
                .then((results) => service.outgoing(EVENT.RESPONSE.TO.DATAREAD.OK).emit(() => results[0]))
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAREAD.ERROR).emit();
                    console.warn(`TodoStorageService - Unable to read from local storage. ${error.message}`);
                });
        });
        service.incoming(EVENT.REQUEST.DATAWRITE).handle(({
            bundle,
            pathId
        }) => {
            service.from(`local-storage`, pathId)
                .write(bundle)
                .then(() => service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.OK).emit())
                .catch((error) => {
                    service.outgoing(EVENT.RESPONSE.TO.DATAWRITE.ERROR).emit();
                    console.warn(`TodoStorageService - Unable to write from local storage. ${error.message}`);
                });
        });
        done();
    }
});
