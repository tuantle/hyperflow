'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import Counter from '../components/counter-mui-component';

// import Counter from '../components/counter-antd-component';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import ReactDomInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-dom-interface-composite';

import EVENT from '../events/counter-event';

const CounterInterface = Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite,
        ReactDomInterfaceComposite
    ],
    $init () {
        const intf = this;
        intf.register({
            component: Counter
        });
    },
    setup (done) {
        done();
    },
    onIncrease () {
        const intf = this;
        intf.outgoing(EVENT.ON.COUNT).emit(() => 1);
    },
    onDecrease () {
        const intf = this;
        intf.outgoing(EVENT.ON.COUNT).emit(() => -1);
    },
    onUndo () {
        const intf = this;
        intf.outgoing(EVENT.ON.UNDO).emit();
    },
    onChange (offset) {
        const intf = this;
        intf.outgoing(EVENT.ON.CHANGE_OFFSET).emit(() => offset);
    }
});
export default CounterInterface;
