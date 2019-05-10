'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/calculator-event';

const CalculatorStore = Hf.Store.augment({
    state: {
        result: `0`,
        computes: [],
        displayResult: {
            computable: {
                contexts: [
                    `result`
                ],
                compute () {
                    return Hf.isInteger(this.result) ? `${this.result}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) : `${this.result}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`);
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
                    } else { // eslint-disable-line
                        return this.computes.map((value) => {
                            if (Hf.isNumeric(value)) {
                                return Hf.isInteger(value) ? `${value}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1,`) : `${value}`.replace(/(\d)(?=(\d{3})+\.)/g, `$1,`);
                            } else { // eslint-disable-line
                                return value;
                            }
                        }).join(` `);
                    }
                }
            }
        }
    },
    setup (done) {
        const store = this;
        store.incoming(EVENT.DO.RESET).handle(() => {
            store.reconfig({
                result: `0`,
                computes: []
            });
            Hf.log(`info1`, `Store reset.`);
        });
        store.incoming(EVENT.DO.UPDATE).handle((mutateState) => {
            store.reconfig(mutateState);
            Hf.log(`info1`, `Store updated.`);
        });
        done();
    }
});
export default CalculatorStore;
