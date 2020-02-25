/* eslint quotes: 0 */

'use strict'; // eslint-disable-line

import('./src/client/domains/client-domain').then(({
    default: ClientDomain
}) => {
    ClientDomain('client-domain').start('root', () => {
        console.log('-------Welcome to Hello World Example (Client)-------');
    }, {
        useHydration: true
    });
}).catch(console.error.bind(console));
