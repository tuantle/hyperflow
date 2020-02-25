/* eslint quotes: 0 */

'use strict'; // eslint-disable-line

import('./src/calculator-app').then(({
    default: app
}) => {
    app.start('root', () => {
        console.log('-------Welcome to Calculator Example-------');
    });
}).catch(console.error.bind(console));
