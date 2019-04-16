'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import CalculatorStore from '../stores/calculator-store';

import CalculatorInterface from '../interfaces/calculator-interface';

import EVENT from '../events/calculator-event';

const assignOperand = (nextValue, prevValue) => {
    if (nextValue === `Pi`) {
        return Math.PI.toPrecision(9).toString();
    } else if (nextValue === `.` && (Hf.isEmpty(prevValue) || prevValue === `0`)) {
        return `0.`;
    } else if (nextValue === `0` && (Hf.isEmpty(prevValue) || prevValue === `0`)) {
        return `0`;
    } else if (nextValue === `±` && Hf.isNumeric(prevValue)) {
        if (Hf.isEmpty(prevValue) || prevValue === `0`) {
            return `0`;
        } else if (prevValue.charAt(0) === `-`) {
            return `${prevValue.substr(1)}`;
        } else { // eslint-disable-line
            return `-${prevValue}`;
        }
    }
    return `${prevValue}${nextValue}`;
};

const CalculatorDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
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

        domain.incoming(EVENT.ON.COMPUTE).handle(() => (state) => {
            if (state.computes.length === 2) {
                let result = parseFloat(state.result);
                const operation = state.computes[1];
                if (operation === `+`) {
                    result += parseFloat(state.computes[0]);
                } else if (operation === `-`) {
                    result -= parseFloat(state.computes[0]);
                } else if (operation === `×`) {
                    result *= parseFloat(state.computes[0]);
                } else if (operation === `÷`) {
                    result /= parseFloat(state.computes[0]);
                }
                return {
                    result: `${result}`,
                    computes: [ `${result}`, operation ]
                };
            } else if (state.computes.length > 2) {
                let operation = null;
                const result = state.computes.slice(1).reduce((_result, value) => {
                    if (value === `+` || value === `-` || value === `×` || value === `÷`) {
                        operation = value;
                        return _result;
                    } else { // eslint-disable-line
                        if (operation === `+`) {
                            _result += parseFloat(value);
                        } else if (operation === `-`) {
                            _result -= parseFloat(value);
                        } else if (operation === `×`) {
                            _result *= parseFloat(value);
                        } else if (operation === `÷`) {
                            _result /= parseFloat(value);
                        }
                        return _result;
                    }
                }, parseFloat(state.computes[0]));
                return {
                    result: `${result}`,
                    computes: [ state.computes.slice(-1)[0], operation ]
                };
            } else { // eslint-disable-line
                return {
                    computes: state.computes
                };
            }
        }).relay(EVENT.DO.UPDATE);

        domain.incoming(EVENT.ON.OPERATION).handle((value) => (state) => {
            if (state.computes.length > 0) {
                const prevValue = state.computes.slice(-1)[0];
                if (prevValue === `+` || prevValue === `-` || prevValue === `×` || prevValue === `÷`) {
                    state.computes[state.computes.length - 1] = value;
                    return {
                        computes: state.computes
                    };
                } else { // eslint-disable-line
                    return {
                        computes: [
                            ...state.computes,
                            value
                        ]
                    };
                }
            } else { // eslint-disable-line
                return {
                    computes: state.computes
                };
            }
        }).relay(EVENT.DO.UPDATE);

        domain.incoming(EVENT.ON.OPERAND).handle((value) => (state) => {
            if (state.computes.length > 0) {
                const prevValue = state.computes.slice(-1)[0];
                if (prevValue === `+` || prevValue === `-` || prevValue === `×` || prevValue === `÷`) {
                    if (Hf.isNumeric(value) || value === `Pi`) {
                        const result = assignOperand(value, ``);
                        return {
                            result,
                            computes: [
                                ...state.computes,
                                result
                            ]
                        };
                    } else { // eslint-disable-line
                        return {
                            computes: state.computes
                        };
                    }
                } else { // eslint-disable-line
                    const result = assignOperand(value, prevValue);
                    state.computes[state.computes.length - 1] = result;
                    return {
                        result,
                        computes: state.computes
                    };
                }
            } else {
                const result = assignOperand(value, ``);
                return {
                    result,
                    computes: [ result ]
                };
            }
        }).relay(EVENT.DO.UPDATE);
        done();
    }
});
export default CalculatorDomain;
