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

import { Hf } from 'hyperflow';

import EVENT from '../events/calculator-event';

const CalculatorStore = Hf.Store.augment({
    state: {
        result: {
            value: `0`,
            stronglyTyped: true
        }
    },
    setup: function setup (done) {
        const store = this;
        store.incoming(EVENT.DO.RESET).handle(() => {
            if (store.reduce({
                result: `0`
            })) {
                Hf.log(`info`, `Store reset.`);
            }
        });
        store.incoming(EVENT.DO.UPDATE_DISPLAY_RESULT).handle((updateResult) => {
            if (store.reduce(updateResult)) {
                Hf.log(`info`, `Store updated.`);
            }
        });
        done();
    }
});
export default CalculatorStore;
