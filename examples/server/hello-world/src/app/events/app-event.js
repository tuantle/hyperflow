'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

export default Hf.Event.create({
    onEvents: [
        `render-markup-to-string`
    ],
    doEvents: [
        `broadcast-secured-api`
    ],
    broadcastEvents: [
        `secured-api`
    ],
    requestEvents: [
        `rendered-markup`
    ]
});
