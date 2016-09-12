/**
 *------------------------------------------------------------------------
 *
 * @description -  Calculator app display store.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import { Hflow } from 'hyperflow';

const CalculatorStore = Hflow.Store.augment({
    state: {
        result: {
            value: `0`,
            stronglyTyped: true
        }
    },
    setup: function setup (done) {
        const store = this;
        store.incoming(`do-reset`).handle(() => {
            if (store.reduce({
                result: `0`
            })) {
                Hflow.log(`info`, `Store reset.`);
            }
        });
        store.incoming(`do-update-display-result`).handle((updateResult) => {
            if (store.reduce(updateResult)) {
                Hflow.log(`info`, `Store updated.`);
            }
        });
        done();
    }
});
export { CalculatorStore };
