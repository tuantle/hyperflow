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
        service.incoming(`do-reset`).handle(() => {
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
        service.incoming(`do-update-operation`).handle((setOperation) => {
            if (service.reduce(setOperation)) {
                Hflow.log(`info`, `Calculator buffer service operation buffer updated.`);
            }
        });
        service.incoming(`do-update-operand`).handle((setOperand) => {
            if (service.reduce(setOperand)) {
                Hflow.log(`info`, `Calculator buffer service operand buffer updated.`);
            }
        });
        service.incoming(`do-update-after-compute`).handle((updateAfterCompute) => {
            if (service.reduce(updateAfterCompute)) {
                Hflow.log(`info`, `Calculator buffer service result updated;`);
            }
        });
        service.incoming(`request-for-operand-from-buffer`).handle(() => service.operand).relay(`response-with-operand-from-buffer`);
        done();
    }
});
export { CalculatorService };
