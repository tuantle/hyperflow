'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import Koa from 'koa';

import Router from 'koa-better-router';

import BodyParser from 'koa-better-body';

import Logger from 'koa-logger';

import Serve from 'koa-static';

import Cors from 'kcors';

import Compress from 'koa-compress';

import CacheControl from 'koa-cache-control';

import Conditional from 'koa-conditional-get';

import ETag from 'koa-etag';

// import https from 'https';

import zlib from 'zlib';

import CONSTANT from '../../common/constant';

import EVENT from '../../common/event';

const securedAPI = Router().loadMethods();

const {
    SERVER_IPADDRESS,
    SERVER_PORT,
    HTTP_OK_CODE
} = CONSTANT;

const AppHttpsService = Hf.Service.augment({
    static: {
        private: {
            appKey: ``,
            appCert: ``
        },
        path: {
            root: `/`
        },
        server: {
            ipAddress: SERVER_IPADDRESS,
            port: SERVER_PORT
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
        httpsServer.use(Serve(`.`));
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
        console.log(`AppHttpsService - Server URL http://${service.server.ipAddress}:${service.server.port}.`);

        // https.createServer({
        //     key: service.private.appKey,
        //     cert: service.private.appCert
        // }, httpsServer.callback()).listen(service.server.port);
        // console.log(`AppHttpsService - Server URL https://${service.server.ipAddress}:${service.server.port}.`);
    },
    setup (done) {
        const service = this;

        /* broacast secured api */
        service.outgoing(EVENT.DO.BROADCAST_SECURED_API).emit(() => securedAPI);

        /* api get root route */
        securedAPI.get(
            service.path.root,
            async (ctx) => {
                service.outgoing(EVENT.REQUEST.RENDERED_TARGET).emit();

                const renderedTarget = await service.incoming(EVENT.RESPONSE.WITH.RENDERED_TARGET).asPromised();
                const response = {
                    status: HTTP_OK_CODE,
                    body: `
                        <!DOCTYPE html>
                        <html lang="en" dir="ltr">
                            <head>
                                <meta charSet='UTF-8'/>
                                <title>Hello World Example</title>
                                <link rel="icon" href="/dist/favicon.ico?v=2" type="image/x-icon" />
                                <link rel="shortcut icon" href="/dist/favicon.ico?v=2" type="image/x-icon" />
                                <style id="jss-server-side">${renderedTarget.css}</style>
                                <script type="text/javascript" src="/dist/client.bundle.js" async></script>
                            </head>
                            <body>
                                <div id="root">${renderedTarget.html}</div>
                            </body>
                        </html>
                    `
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
