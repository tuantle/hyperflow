/* eslint quotes: 0 */
require('./env');

require('@babel/register')({
    comments: false,
    sourceMaps: 'inline',
    only: [
        './src',
        './node_modules/hyperflow/src'
    ]
});

/* load & start server app */
const HelloWorldServerApp = require('./src/app/hello-world-server-app').default;

HelloWorldServerApp.start();
