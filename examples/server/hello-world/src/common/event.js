'use strict'; // eslint-disable-line

import EventId from 'hyperflow/libs/utils/event-stream-id-util';

export default EventId.create({
    asEvents: [
        `store-mutated`
    ],
    onEvents: [
        `say-hello-world`
    ],
    doEvents: [
        `init-store`,
        `change-language`,
        `broadcast-secured-api`,
        `broadcast-rendered-target`
    ],
    broadcastEvents: [
        `secured-api`
    ],
    requestEvents: [
        `dataread`,
        `datawrite`,
        `rendered-target`
    ]
});
