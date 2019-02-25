'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

export default Hf.Event.create({
    asEvents: [
        `count-mutated`,
        `offset-mutated`
    ],
    onEvents: [
        `undo`,
        `count`,
        `change-offset`,
        `increase`,
        `decrease`
    ],
    doEvents: [
        `init`,
        `undo-last-count-mutation`,
        `count-mutation`,
        `offset-mutation`
    ],
    requestEvents: [
        `dataread`,
        `datawrite`
    ]
});
