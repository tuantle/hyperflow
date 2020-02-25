/* eslint quotes: 0 */

'use strict'; // eslint-disable-line

import('./src/counter-app').then(({
    default: app
}) => {
    app.start('root', () => {
        console.log('-------Welcome to Counter Example-------');
    });
}).catch(console.error.bind(console));
