/* eslint quotes: 0 */

'use strict'; // eslint-disable-line

window.TARGET = `client-web`;
window.NODE_ENV = `development`;
window.LOGGING_INFO0 = true;
window.LOGGING_INFO1 = true;
window.LOGGING_WARN0 = false;
window.LOGGING_WARN1 = true;
window.LOGGING_HISTORY_SIZE = 100;

import('./src/counter-app').then(({
    default: app
}) => {
    app.start();
}).catch(console.error.bind(console));
