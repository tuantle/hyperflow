'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ImmutableStateComposite from 'hyperflow/libs/composites/states/immutable-state-composite';

import CONSTANT from '../../common/constant';

import EVENT from '../../common/event';

const { MESSAGE } = CONSTANT;

const ClientAppStore = Hf.Store.augment({
    composites: [
        ImmutableStateComposite
    ],
    state: {
        language: {
            value: `english`,
            oneOf: Object.keys(MESSAGE)
        },
        message: {
            computable: {
                contexts: [ `language` ],
                compute () {
                    return MESSAGE[this.language];
                }
            }
        }
    },
    $init () {
        // const store = this;
    },
    setup (done) {
        const store = this;

        store.incoming(EVENT.DO.INIT_STORE).handle(({
            language
        }) => {
            if (store.mutate({
                language
            })) {
                console.log(`Store initialized.`);
            }
        });

        store.incoming(EVENT.DO.CHANGE_LANGUAGE).handle((language) => {
            if (store.mutate({
                language
            })) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    language: store.language
                }));
                console.log(`Store mutated`);
            }
        });

        done();
    }
});
export default ClientAppStore;
