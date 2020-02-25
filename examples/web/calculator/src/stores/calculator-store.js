'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import {
    isInteger,
    isNumeric
} from 'hyperflow/libs/utils/common-util';

import ImmutableStateComposite from 'hyperflow/libs/composites/states/immutable-state-composite';

import EVENT from '../events/calculator-event';

const CalculatorStore = Hf.Store.augment({
    composites: [
        ImmutableStateComposite
    ],
    state: {
        result: `0`,
        computes: [],
        displayResult: {
            computable: {
                contexts: [
                    `result`
                ],
                compute () {
                    return isInteger(this.result) ? `${this.result}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) : `${this.result}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`);
                }
            }
        },
        displayComputes: {
            computable: {
                contexts: [
                    `computes`
                ],
                compute () {
                    if (this.computes.length === 0) {
                        return ` `;
                    }
                    return this.computes.map((value) => {
                        if (isNumeric(value)) {
                            return isInteger(value) ? `${value}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) : `${value}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`);
                        }
                        return value;
                    }).join(` `);
                }
            }
        }
    },
    setup (done) {
        const store = this;
        store.incoming(EVENT.DO.RESET).handle(() => {
            store.mutate({
                result: `0`,
                computes: []
            }, {
                reconfig: true
            });
            console.log(`Store reset.`);
        });
        store.incoming(EVENT.DO.UPDATE).handle((mutateState) => {
            store.mutate(mutateState, {
                reconfig: true
            });
            console.log(`Store updated.`);
        });
        done();
    }
});
export default CalculatorStore;
