/**
 *------------------------------------------------------------------------
 *
 * @description -  Calculator app buffer service.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import event from '../events/calculator-event';

const CalculatorService = Hflow.Service.augment({
    composites: [
        Hflow.State.ReducerComposite
    ],
    state: {
        computeReady: {
            value: false,
            stronglyTyped: true
        },
        operation: {
            value: ``,
            stronglyTyped: true
        },
        operand: {
            value: {
                current: `x`,
                x: ``,
                y: ``
            },
            stronglyTyped: true
        }
    },
    setup: function setup (done) {
        const service = this;
        service.incoming(event.do.reset).handle(() => {
            if (service.reduce({
                computeReady: false,
                operation: ``,
                operand: {
                    current: `x`,
                    x: ``,
                    y: ``
                }
            })) {
                Hflow.log(`info`, `Calculator buffer service reset.`);
            }
        });
        service.incoming(event.do.updateOperation).handle((setOperation) => {
            if (service.reduce(setOperation)) {
                Hflow.log(`info`, `Calculator buffer service operation buffer updated.`);
            }
        });
        service.incoming(event.do.updateOperand).handle((setOperand) => {
            if (service.reduce(setOperand)) {
                Hflow.log(`info`, `Calculator buffer service operand buffer updated.`);
            }
        });
        service.incoming(event.do.updateAfterCompute).handle((updateAfterCompute) => {
            if (service.reduce(updateAfterCompute)) {
                Hflow.log(`info`, `Calculator buffer service result updated;`);
            }
        });
        service.incoming(event.request.operandFromBuffer).handle(() => service.operand).relay(event.response.with.operandFromBuffer);
        done();
    }
});
export { CalculatorService };
