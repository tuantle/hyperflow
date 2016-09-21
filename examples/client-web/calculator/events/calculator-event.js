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
        `operand-updated`,
        `operation-updated`,
        `updated-after-compute`
    ],
    on: [
        `reset`,
        `compute`,
        `keypad`,
        `update-operation`,
        `update-operand`,
        `negate-operand`
    ],
    do: [
        `reset`,
        `update-operation`,
        `update-operand`,
        `update-after-compute`,
        `update-display-result`
    ],
    request: [
        `operand-from-buffer`
    ]
});
