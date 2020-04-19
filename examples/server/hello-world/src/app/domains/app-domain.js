'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import AppInterface from '../interfaces/app-interface';

import AppStore from '../stores/app-store';

import CONSTANT from '../../common/constant';

import EVENT from '../../common/event';

const { MESSAGE } = CONSTANT;

function getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const AppDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            interface: AppInterface(`app-interface`),
            store: AppStore(`app-store`)
        });
    },
    setup (done) {
        const domain = this;
        const languages = Object.keys(MESSAGE);

        domain.outgoing(EVENT.REQUEST.DATAREAD).emit();

        domain.incoming(EVENT.RESPONSE.TO.DATAREAD.OK).forward(EVENT.DO.INIT_STORE);

        domain.incoming(EVENT.ON.SAY_HELLO_WORLD).handle(() => {
            return languages[ getRandomInt(0, languages.length) ];
        }).relay(EVENT.DO.CHANGE_LANGUAGE);

        domain.incoming(EVENT.AS.STORE_MUTATED).forward(EVENT.REQUEST.DATAWRITE);

        done();
    }
});

export default AppDomain;
