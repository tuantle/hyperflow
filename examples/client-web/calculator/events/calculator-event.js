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

import { Hf } from 'hyperflow';

export default Hf.Event.create({
    asEvents: [
        `operand-updated`,
        `operation-updated`,
        `updated-after-compute`
    ],
    onEvents: [
        `reset`,
        `compute`,
        `keypad`,
        `update-operation`,
        `update-operand`,
        `negate-operand`
    ],
    doEvents: [
        `reset`,
        `update-operation`,
        `update-operand`,
        `update-after-compute`,
        `update-display-result`
    ],
    requestEvents: [
        `operand-from-buffer`
    ]
});
