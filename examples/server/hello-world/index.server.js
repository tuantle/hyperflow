/* eslint quotes: 0 */
require('@babel/register')({
    comments: false,
    sourceMaps: 'inline',
    only: [
        './src',
        './node_modules/hyperflow'
    ]
});

/* load & start server domain */
const ServerDomain = require('./src/server/domains/server-domain').default;

ServerDomain(`server-domain`).start('root', () => {
    console.log('-------Welcome to Hello World Example (Server)-------');
});
