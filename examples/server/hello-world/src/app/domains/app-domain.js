'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import AppViewInterface from '../interfaces/app-view-interface';

import AppHttpsService from '../services/app-https-service';

import constant from '../../common/constant';

import EVENT from '../events/app-event';

const {
    SERVER_IPADDRESS,
    SERVER_PORT
} = constant;

const AppDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            intf: AppViewInterface({
                name: `app-view`
            }),
            services: [
                AppHttpsService({
                    name: `app-https-service`,
                    path: {
                        root: `/`
                    },
                    server: {
                        ipAddress: SERVER_IPADDRESS,
                        port: SERVER_PORT
                    }
                })
            ]
        });
    },
    setup (done) {
        const domain = this;
        domain.incoming(EVENT.ON.RENDER_MARKUP_TO_STRING).handle((renderedMarkup) => {
            domain.incoming(EVENT.REQUEST.RENDERED_MARKUP).handle(() => renderedMarkup).relay(EVENT.RESPONSE.WITH.RENDERED_MARKUP);
        });
        domain.incoming(EVENT.DO.BROADCAST_SECURED_API).forward(EVENT.BROADCAST.SECURED_API);
        done();
    }
});

export default AppDomain;
