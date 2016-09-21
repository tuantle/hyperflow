/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter app event Ids.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

export default Hflow.Event.create({
    as: [
        `count-mutated`,
        `offset-mutated`
    ],
    on: [
        `undo`,
        `count`,
        `change-offset`,
        `increase`,
        `decrease`
    ],
    do: [
        `init`,
        `undo-last-count-mutation`,
        `count-mutation`,
        `offset-mutation`
    ],
    request: [
        `dataread`,
        `datawrite`
    ]
});
