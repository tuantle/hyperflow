/**
 *------------------------------------------------------------------------
 *
 * @description -  Calculator app domain.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

import { CalculatorStore } from '../stores/calculator-store';

import { CalculatorService } from '../services/calculator-service';

import { CalculatorInterface } from '../interfaces/calculator-interface';

import event from '../events/calculator-event';

const CalculatorDomain = Hflow.Domain.augment({
    $init: function $init () {
        const domain = this;
        domain.register({
            services: [
                CalculatorService({
                    name: `${domain.name}-service`
                })
            ],
            store: CalculatorStore({
                name: `${domain.name}-store`
            }),
            intf: CalculatorInterface({
                name: `${domain.name}-view`,
                style: {
                    h1: {
                        color: `gray`,
                        fontFamily: `helvetica`,
                        fontSize: 12,
                        textAlign: `right`,
                        paddingRight: 310
                    },
                    displayText: {
                        color: `#388E3C`,
                        background: `whitesmkoke`,
                        border: 1,
                        borderStyle: `solid`,
                        borderRadius: 2,
                        fontFamily: `helvetica`,
                        fontSize: 32,
                        fontWeight: `bold`,
                        textAlign: `right`,
                        textIndent: -10,
                        paddingRight: 5,
                        paddingLeft: 5,
                        width: `100%`
                    },
                    display: {
                        display: `flex`,
                        flexDirection: `row`,
                        justifyContent: `center`,
                        alignContent: `center`,
                        paddingLeft: 350,
                        paddingRight: 310
                    },
                    keypadGridStyle: {
                        display: `flex`,
                        flexDirection: `row`,
                        flexWrap: `wrap`,
                        justifyContent: `space-around`,
                        alignContent: `center`,
                        alignItems: `stretch`,
                        paddingRight: 300,
                        paddingLeft: 300
                    },
                    keypadCellStyle: {
                        flex: [ 1, 1, `auto` ],
                        alignSelf: `center`,
                        width: 55,
                        margin: 10
                    }
                }
            })
        });
    },
    setup: function setup (done) {
        const domain = this;
        domain.incoming(event.on.reset).forward(event.do.reset);
        domain.incoming(event.on.updateOperation).handle((value) => {
            return function setOperation (state) {
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
            };
        }).relay(event.do.updateOperation);
        domain.incoming(event.on.negateOperand).handle(() => {
            function negateOperand (operand) {
                if (!Hflow.isEmpty(operand)) {
                    if (operand.charAt(0) === `-`) {
                        return operand.slice(1);
                    }
                    return `-${operand}`;
                }
                return operand;
            }
            return function setOperand (state) {
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
            };
        }).relay(event.do.updateOperand);

        domain.incoming(event.on.updateOperand).handle((value) => {
            function assignOperand (operand) {
                if (value === `π`) {
                    return `3.14159265359`;
                } else if (value === `.` && (Hflow.isEmpty(operand) || operand === `0`)) {
                    return `0.`;
                } else if (value === `0` && (Hflow.isEmpty(operand) || operand === `0`)) {
                    return `0`;
                }
                return `${operand}${value}`;
            }
            function setOperand (state) {
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
            }
            return setOperand;
        }).relay(event.do.updateOperand);
        domain.incoming(
            event.as.operandUpdated,
            event.as.operationUpdated,
            event.as.updatedAfterCompute
        ).forward(event.request.operandFromBuffer);
        domain.incoming(event.response.with.operandFromBuffer).handle((operand) => {
            let result = 0;
            const xValue = !Hflow.isEmpty(operand.x) ? parseFloat(operand.x) : 0;
            const yValue = !Hflow.isEmpty(operand.y) ? parseFloat(operand.y) : 0;
            domain.incoming(event.on.compute).handle(() => {
                return function updateAfterCompute (state) {
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
                };
            }).relay(event.do.updateAfterCompute);

            if (operand.current === `y` && yValue !== 0) {
                result = yValue;
            } else {
                result = xValue;
            }
            return function updateResult () {
                return {
                    result: Hflow.isInteger(result) ?
                            `${result}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) :
                            `${result}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`)
                };
            };
        }).relay(event.do.updateDisplayResult);
        done();
    }
});
export { CalculatorDomain };
