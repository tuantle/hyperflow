'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import Calculator from '../components/calculator-mui-component';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import ReactDomInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-dom-interface-composite';

import EVENT from '../events/calculator-event';

export default Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite,
        ReactDomInterfaceComposite
    ],
    $init () {
        const intf = this;
        intf.register({
            component: Calculator
        });
    },
    setup (done) {
        done();
    },
    onReset () {
        const intf = this;
        intf.outgoing(EVENT.ON.RESET).emit();
    },
    onOperation (cellLabel) {
        const intf = this;
        intf.outgoing(EVENT.ON.OPERATION).emit(() => cellLabel);
    },
    onPerand (cellLabel) {
        const intf = this;
        intf.outgoing(EVENT.ON.OPERAND).emit(() => cellLabel);
    },
    onCompute () {
        const intf = this;
        intf.outgoing(EVENT.ON.COMPUTE).emit();
    }
});
