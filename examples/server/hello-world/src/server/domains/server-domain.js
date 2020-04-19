'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ServerInterface from '../interfaces/server-interface';

import ServerHttpsService from '../services/server-https-service';

import AppDomain from '../../app/domains/app-domain';

import EVENT from '../../common/event';

const ServerDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            interface: ServerInterface(`server-interface`),
            services: [ ServerHttpsService(`server-https-service`) ],
            childDomains: [ AppDomain(`app-domain`) ]
        });
    },
    setup (done) {
        const domain = this;
        domain.incoming(
            EVENT.DO.BROADCAST_RENDERED_TARGET,
            EVENT.REQUEST.RENDERED_TARGET
        ).await().handle(([ renderedTarget ]) => renderedTarget).relay(EVENT.RESPONSE.WITH.RENDERED_TARGET);
        domain.incoming(EVENT.DO.BROADCAST_SECURED_API).forward(EVENT.BROADCAST.SECURED_API);
        done();
    }
});

export default ServerDomain;
