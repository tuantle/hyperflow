'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/calculator-event';

const CalculatorService = Hf.Service.augment({
    composites: [
        Hf.State.MutationComposite
    ],
    state: {
        computeReady: false,
        operation: ``,
        operand: {
            current: `x`,
            x: ``,
            y: ``
        }
    },
    setup (done) {
        const service = this;
        service.incoming(EVENT.DO.RESET).handle(() => {
            if (service.reduce({
                computeReady: false,
                operation: ``,
                operand: {
                    current: `x`,
                    x: ``,
                    y: ``
                }
            })) {
                Hf.log(`info1`, `Calculator buffer service reset.`);
            }
        });
        service.incoming(EVENT.DO.UPDATE_OPERATION).handle((setOperation) => {
            if (service.reduce(setOperation)) {
                service.outgoing(EVENT.AS.OPERATION_UPDATED).emit();
                Hf.log(`info1`, `Calculator buffer service operation buffer updated.`);
            }
        });
        service.incoming(EVENT.DO.UPDATE_OPERAND).handle((setOperand) => {
            if (service.reduce(setOperand)) {
                service.outgoing(EVENT.AS.OPERAND_UPDATED).emit();
                Hf.log(`info1`, `Calculator buffer service operand buffer updated.`);
            }
        });
        service.incoming(EVENT.DO.UPDATE_AFTER_COMPUTE).handle((updateAfterCompute) => {
            if (service.reduce(updateAfterCompute)) {
                service.outgoing(EVENT.AS.UPDATED_AFTER_COMPUTE).emit();
                Hf.log(`info1`, `Calculator buffer service result updated;`);
            }
        });
        service.incoming(EVENT.REQUEST.OPERAND_FROM_BUFFER).handle(() => service.operand).relay(EVENT.RESPONSE.WITH.OPERAND_FROM_BUFFER);
        done();
    }
});
export default CalculatorService;