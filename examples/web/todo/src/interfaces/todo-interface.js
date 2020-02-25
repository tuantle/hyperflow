'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import Todo from '../components/todo-mui-component';

import ReactComponentInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-component-interface-composite';

import ReactDomInterfaceComposite from 'hyperflow/libs/composites/interfaces/react-dom-interface-composite';

import EVENT from '../events/todo-event';

const TodoInterface = Hf.Interface.augment({
    composites: [
        ReactComponentInterfaceComposite,
        ReactDomInterfaceComposite
    ],
    $init () {
        const intf = this;
        intf.register({
            component: Todo
        });
    },
    setup (done) {
        done();
    },
    onInsertTask (newMessage) {
        const intf = this;
        intf.outgoing(EVENT.ON.INSERT_TASK).emit(() => newMessage);
    },
    onEditTask (task) {
        const intf = this;
        intf.outgoing(EVENT.ON.EDIT_TASK).emit(() => task);
    },
    onDeleteTask (timestamp) {
        const intf = this;
        intf.outgoing(EVENT.ON.DELETE_TASK).emit(() => timestamp);
    },
    onDeleteCompletedTask () {
        const intf = this;
        intf.outgoing(EVENT.ON.DELETE_COMPLETED_TASK).emit();
    },
    onChangeFilter (newFilter) {
        const intf = this;
        intf.outgoing(EVENT.ON.CHANGE_FILTER).emit(() => newFilter);
    }
});
export default TodoInterface;
