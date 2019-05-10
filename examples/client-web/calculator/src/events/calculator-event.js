'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

export default Hf.Event.create({
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
