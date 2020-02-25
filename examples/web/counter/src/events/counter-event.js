'use strict'; // eslint-disable-line

import EventId from 'hyperflow/libs/utils/event-stream-id-util';

export default EventId.create({
    asEvents: [
        `store-mutated`
    ],
    onEvents: [
        `undo`,
        `count`,
        `change-offset`,
        `increase`,
        `decrease`
    ],
    doEvents: [
        `init-store`,
        `undo-last-count`,
        `count`,
        `change-offset`
    ],
    requestEvents: [
        `dataread`,
        `datawrite`
    ]
});
