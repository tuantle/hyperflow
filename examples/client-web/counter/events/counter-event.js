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
        `countMutated`,
        `offsetMutated`
    ],
    on: [
        `undo`,
        `count`,
        `changeOffset`,
        `offsetInputEnter`,
        `undoButtonPress`,
        `increaseButtonPress`,
        `decreaseButtonPress`
    ],
    do: [
        `init`,
        `undoLastCountMutation`,
        `countMutation`,
        `offsetMutation`
    ],
    request: [
        `dataread`,
        `datawrite`
    ]
});
