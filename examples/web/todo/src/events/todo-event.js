'use strict'; // eslint-disable-line

import EventId from 'hyperflow/libs/utils/event-stream-id-util';

export default EventId.create({
    asEvents: [
        `store-mutated`
    ],
    onEvents: [
        `insert-task`,
        `edit-task`,
        `delete-task`,
        `delete-completed-task`,
        `change-filter`
    ],
    doEvents: [
        `store-init`,
        `insert-task`,
        `edit-task`,
        `delete-task`,
        `change-filter`
    ],
    requestEvents: [
        `dataread`,
        `datawrite`
    ]
});
