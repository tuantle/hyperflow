'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import Koa from 'koa';

import Router from 'koa-better-router';

import BodyParser from 'koa-better-body';

import Logger from 'koa-logger';

import Cors from 'kcors';

import Compress from 'koa-compress';

import CacheControl from 'koa-cache-control';

import Conditional from 'koa-conditional-get';

import ETag from 'koa-etag';

// import https from 'https';

import zlib from 'zlib';

import constant from '../../common/constant';

import EVENT from '../events/app-event';

const securedAPI = Router().loadMethods();

const {
    HTTP_OK_CODE
} = constant;

const AppHttpsService = Hf.Service.augment({
    state: {
        private: {
            value: {
                appKey: ``,
                appCert: ``
            },
            stronglyTyped: true
        },
        path: {
            value: {
                root: `/`
            },
            stronglyTyped: true
        },
        server: {
            value: {
                ipAddress: `localhost`,
                port: 443
            },
            stronglyTyped: true
        }
    },
    $init () {
        const service = this;
        const httpsServer = new Koa();

        httpsServer.keys = [
            `${service.name}-https-server-key`
        ];

        httpsServer.use(BodyParser({
            multipart: false,
            jsonLimit: `1mb`,
            formLimit: `8mb`
        }));
        httpsServer.use(Cors());
        httpsServer.use(Logger());
        httpsServer.use(Compress({
            threshold: 2048,
            flush: zlib.Z_SYNC_FLUSH
        }));
        httpsServer.use(CacheControl({
            maxAge: 86400,
            public: true
        }));
        httpsServer.use(Conditional());
        httpsServer.use(ETag());

        httpsServer.use(securedAPI.middleware());

        /* start the server */
        httpsServer.listen(service.server.port);
        Hf.log(`info1`, `AppHttpsService - Server started at http://${service.server.ipAddress}:${service.server.port}.`);

        // https.createServer({
        //     key: service.private.appKey,
        //     cert: service.private.appCert
        // }, httpsServer.callback()).listen(service.server.port);
        // Hf.log(`info1`, `AppHttpsService - Server started at https://${service.server.ipAddress}:${service.server.port}.`);
    },
    setup (done) {
        const service = this;

        /* broacast secured api */
        service.outgoing(EVENT.DO.BROADCAST_SECURED_API).emit(() => securedAPI);

        /* api get root route */
        securedAPI.get(
            service.path.root,
            async (ctx) => {
                service.outgoing(EVENT.REQUEST.RENDERED_MARKUP).emit();

                const response = {
                    status: HTTP_OK_CODE,
                    body: await service.incoming(EVENT.RESPONSE.WITH.RENDERED_MARKUP).asPromised()
                };

                ctx.response = Object.assign(
                    ctx.response,
                    response
                );
            }
        );

        done();
    }
});

export default AppHttpsService;
