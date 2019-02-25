'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import CalculatorStore from '../stores/calculator-store';

import CalculatorService from '../services/calculator-service';

import CalculatorInterface from '../interfaces/calculator-interface';

import EVENT from '../events/calculator-event';

const CalculatorDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            services: [
                CalculatorService({
                    name: `calculator-service`
                })
            ],
            store: CalculatorStore({
                name: `calculator-store`
            }),
            intf: CalculatorInterface({
                name: `calculator-view`
            })
        });
    },
    setup (done) {
        const domain = this;
        domain.incoming(EVENT.ON.RESET).forward(EVENT.DO.RESET);
        domain.incoming(EVENT.ON.UPDATE_OPERATION).handle((value) => (state) => {
            if (!state.computeReady) {
                return {
                    operation: value,
                    operand: {
                        current: `y`,
                        y: ``
                    }
                };
            }
            return {
                operation: value,
                operand: {
                    current: `y`,
                    x: state.operand.y,
                    y: ``
                }
            };
        }).relay(EVENT.DO.UPDATE_OPERATION);
        domain.incoming(EVENT.ON.NEGATE_OPERAND).handle(() => (state) => {
            function negateOperand (operand) {
                if (!Hf.isEmpty(operand)) {
                    if (operand.charAt(0) === `-`) {
                        return operand.slice(1);
                    }
                    return `-${operand}`;
                }
                return operand;
            }
            if (state.operand.current === `x`) {
                return {
                    operand: {
                        x: negateOperand(state.operand.x)
                    }
                };
            }
            return {
                computeReady: true,
                operand: {
                    y: negateOperand(state.operand.y)
                }
            };
        }).relay(EVENT.DO.UPDATE_OPERAND);

        domain.incoming(EVENT.ON.UPDATE_OPERAND).handle((value) => (state) => {
            function assignOperand (operand) {
                if (value === `Pi`) {
                    return Math.PI.toString();
                } else if (value === `.` && (Hf.isEmpty(operand) || operand === `0`)) {
                    return `0.`;
                } else if (value === `0` && (Hf.isEmpty(operand) || operand === `0`)) {
                    return `0`;
                }
                return `${operand}${value}`;
            }
            if (state.operand.current === `x`) {
                return {
                    operand: {
                        x: assignOperand(state.operand.x)
                    }
                };
            }
            return {
                computeReady: true,
                operand: {
                    y: assignOperand(state.operand.y)
                }
            };
        }).relay(EVENT.DO.UPDATE_OPERAND);
        domain.incoming(
            EVENT.AS.OPERAND_UPDATED,
            EVENT.AS.OPERATION_UPDATED,
            EVENT.AS.UPDATED_AFTER_COMPUTE
        ).forward(EVENT.REQUEST.OPERAND_FROM_BUFFER);
        domain.incoming(EVENT.RESPONSE.WITH.OPERAND_FROM_BUFFER).handle((operand) => {
            let result = 0;
            const xValue = !Hf.isEmpty(operand.x) ? parseFloat(operand.x) : 0;
            const yValue = !Hf.isEmpty(operand.y) ? parseFloat(operand.y) : 0;
            domain.incoming(EVENT.ON.COMPUTE).handle(() => (state) => {
                if (state.computeReady) {
                    if (state.operation === `+`) {
                        return {
                            operand: {
                                current: `x`,
                                x: `${xValue + yValue}`
                            }
                        };
                    } else if (state.operation === `-`) {
                        return {
                            operand: {
                                current: `x`,
                                x: `${xValue - yValue}`
                            }
                        };
                    } else if (state.operation === `×`) {
                        return {
                            operand: {
                                current: `x`,
                                x: `${xValue * yValue}`
                            }
                        };
                    } else if (state.operation === `÷`) {
                        return {
                            operand: {
                                current: `x`,
                                x: `${xValue / yValue}`
                            }
                        };
                    }
                }
            }).relay(EVENT.DO.UPDATE_AFTER_COMPUTE);

            if (operand.current === `y` && yValue !== 0) {
                result = yValue;
            } else {
                result = xValue;
            }
            return function updateResult () {
                return {
                    result: Hf.isInteger(result) ? `${result}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) : `${result}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`)
                };
            };
        }).relay(EVENT.DO.UPDATE_DISPLAY_RESULT);
        done();
    }
});
export default CalculatorDomain;
