/* eslint quotes: 0 */

'use strict'; // eslint-disable-line

import('./src/todo-app').then(({
    default: app
}) => {
    app.start('root', () => {
        console.log('-------Welcome to Todo Example-------');
    });
}).catch(console.error.bind(console));
