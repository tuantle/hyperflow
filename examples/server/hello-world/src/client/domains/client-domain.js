'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ClientInterface from '../interfaces/client-interface';

// import ClientStorageService from '../services/client-storage-service';

import AppDomain from '../../app/domains/app-domain';

// import EVENT from '../../common/event';

export default Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            interface: ClientInterface(`client-interface`),
            // services: [ ClientStorageService(`client-storage-service`) ],
            childDomains: [ AppDomain(`app-domain`) ]
        });
    },
    setup (done) {
        done();
    }
});
