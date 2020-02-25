'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import {
    isEmpty,
    isNumeric
} from 'hyperflow/libs/utils/common-util';

import CalculatorStore from '../stores/calculator-store';

import CalculatorInterface from '../interfaces/calculator-interface';

import EVENT from '../events/calculator-event';

const assignOperand = (nextValue, prevValue) => {
    if (nextValue === `Pi`) {
        return Math.PI.toPrecision(9).toString();
    } else if (nextValue === `.` && (isEmpty(prevValue) || prevValue === `0`)) {
        return `0.`;
    } else if (nextValue === `0` && (isEmpty(prevValue) || prevValue === `0`)) {
        return `0`;
    } else if (nextValue === `±` && isNumeric(prevValue)) {
        if (isEmpty(prevValue) || prevValue === `0`) {
            return `0`;
        } else if (prevValue.charAt(0) === `-`) {
            return `${prevValue.substr(1)}`;
        }
        return `-${prevValue}`;
    }
    return `${prevValue}${nextValue}`;
};

const CalculatorDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            store: CalculatorStore(`calculator-store`),
            interface: CalculatorInterface(`calculator-view`)
        });
    },
    setup (done) {
        const domain = this;
        domain.incoming(EVENT.ON.RESET).forward(EVENT.DO.RESET);

        domain.incoming(EVENT.ON.COMPUTE).handle(() => (store) => {
            if (store.computes.length === 2) {
                let result = parseFloat(store.result);
                const operation = store.computes[1];
                switch (operation) {
                case `+`:
                    result += parseFloat(store.computes[0]);
                    break;
                case `-`:
                    result -= parseFloat(store.computes[0]);
                    break;
                case `×`:
                    result *= parseFloat(store.computes[0]);
                    break;
                case `÷`:
                    result /= parseFloat(store.computes[0]);
                    break;
                default:
                    break;
                }
                return {
                    result: `${result}`,
                    computes: [ `${result}`, operation ]
                };
            } else if (store.computes.length > 2) {
                let operation = null;
                const result = store.computes.slice(1).reduce((_result, value) => {
                    if (value === `+` || value === `-` || value === `×` || value === `÷`) {
                        operation = value;
                        return _result;
                    }
                    switch (operation) {
                    case `+`:
                        _result += parseFloat(value);
                        return _result;
                    case `-`:
                        _result -= parseFloat(value);
                        return _result;
                    case `×`:
                        _result *= parseFloat(value);
                        return _result;
                    case `÷`:
                        _result /= parseFloat(value);
                        return _result;
                    default:
                        return _result;
                    }
                }, parseFloat(store.computes[0]));
                return {
                    result: `${result}`,
                    computes: [ store.computes.slice(-1)[0], operation ]
                };
            }
            return {
                computes: store.computes
            };
        }).relay(EVENT.DO.UPDATE);

        domain.incoming(EVENT.ON.OPERATION).handle((value) => (store) => {
            if (store.computes.length > 0) {
                const prevValue = store.computes.slice(-1)[0];
                if (prevValue === `+` || prevValue === `-` || prevValue === `×` || prevValue === `÷`) {
                    store.computes[store.computes.length - 1] = value;
                    return {
                        computes: store.computes
                    };
                }
                return {
                    computes: [
                        ...store.computes,
                        value
                    ]
                };
            }
            return {
                computes: store.computes
            };
        }).relay(EVENT.DO.UPDATE);

        domain.incoming(EVENT.ON.OPERAND).handle((value) => (store) => {
            if (store.computes.length > 0) {
                const prevValue = store.computes.slice(-1)[0];
                if (prevValue === `+` || prevValue === `-` || prevValue === `×` || prevValue === `÷`) {
                    if (isNumeric(value) || value === `Pi`) {
                        const result = assignOperand(value, ``);
                        return {
                            result,
                            computes: [
                                ...store.computes,
                                result
                            ]
                        };
                    }
                    return {
                        computes: store.computes
                    };
                }
                const result = assignOperand(value, prevValue);
                store.computes[store.computes.length - 1] = result;
                return {
                    result,
                    computes: store.computes
                };
            }
            const result = assignOperand(value, ``);
            return {
                result,
                computes: [ result ]
            };
        }).relay(EVENT.DO.UPDATE);
        done();
    }
});
export default CalculatorDomain;
