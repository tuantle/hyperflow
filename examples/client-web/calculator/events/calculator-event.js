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
    on: [
        `reset`,
        `compute`,
        `updateOperation`,
        `updateOperand`,
        `negateOperand`,

        `keypadButtonPress`,
        `clearKeyButtonPress`,
        `operationKeyButtonPress`,
        `digitKeyButtonPress`,
        `negateKeyButtonPress`,
        `equalKeyButtonPress`
    ],
    do: [
        `reset`,
        `updateOperation`,
        `updateOperand`,
        `updateAfterCompute`,
        `updateDisplayResult`
    ],
    request: [
        `operandFromBuffer`
    ]
});
