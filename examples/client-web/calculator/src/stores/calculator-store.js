'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import EVENT from '../events/calculator-event';

const CalculatorStore = Hf.Store.augment({
    state: {
        result: `0`
    },
    setup (done) {
        const store = this;
        store.incoming(EVENT.DO.RESET).handle(() => {
            if (store.reduce({
                result: `0`
            })) {
                Hf.log(`info1`, `Store reset.`);
            }
        });
        store.incoming(EVENT.DO.UPDATE_DISPLAY_RESULT).handle((updateResult) => {
            if (store.reduce(updateResult)) {
                Hf.log(`info1`, `Store updated.`);
            }
        });
        done();
    }
});
export default CalculatorStore;
