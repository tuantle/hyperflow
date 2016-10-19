/**
 *------------------------------------------------------------------------
 *
 * @description -  Counter test fixture for app increase button interface.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 *------------------------------------------------------------------------
 */
'use strict'; // eslint-disable-line

import Hf from 'hyperflow';

import { IncreaseButtonInterface } from '../interfaces/counter-interface';

import event from '../events/counter-event';

/**
 * @description - Counter app increase button interface test fixture  module.
 *
 * @module IncreaseButtonInterfaceTestFixture
 */
const IncreaseButtonInterfaceTestFixture = Hf.Fixture.augment({
    composites: [
        Hf.Test.InterfaceFixtureComposite
    ],
    $init: function $init () {
        const fixture = this;
        fixture.register({
            testSubject: IncreaseButtonInterface({
                name: `increase-button`
            })
        });
    }
});
export { IncreaseButtonInterfaceTestFixture };
