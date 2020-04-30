'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import App from '../components/app-mui-component';

import EVENT from '../../common/event';

export default Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite
    ],
    $init () {
        const intf = this;

        intf.register({
            component: App
        });
    },
    setup (done) {
        done();
    },
    onSayHelloWorld () {
        const intf = this;

        intf.outgoing(EVENT.ON.SAY_HELLO_WORLD).emit();
    }
});
