'use strict'; // eslint-disable-line

import EventId from 'hyperflow/libs/utils/event-stream-id-util';

export default EventId.create({
    asEvents: [
    ],
    onEvents: [
        `reset`,
        `compute`,
        `operation`,
        `operand`
    ],
    doEvents: [
        `reset`,
        `update`
    ]
});
