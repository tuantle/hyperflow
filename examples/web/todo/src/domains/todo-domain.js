'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import TodoStore from '../stores/todo-store';

import TodoStorageService from '../services/todo-storage-service';

import TodoInterface from '../interfaces/todo-interface';

import EVENT from '../events/todo-event';

const TodoDomain = Hf.Domain.augment({
    $init () {
        const domain = this;
        domain.register({
            store: TodoStore(`todo-store`),
            interface: TodoInterface(`todo-view`),
            services: [
                TodoStorageService(`todo-storage-service`)
            ]
        });
    },
    setup (done) {
        const domain = this;
        domain.outgoing(EVENT.REQUEST.DATAREAD).emit(() => `todo`);
        domain.incoming(EVENT.RESPONSE.TO.DATAREAD.OK).forward(EVENT.DO.STORE_INIT);
        domain.incoming(EVENT.AS.STORE_MUTATED).forward(EVENT.REQUEST.DATAWRITE);
        domain.incoming(EVENT.RESPONSE.TO.DATAWRITE.OK).handle(() => console.log(`Save todo to local storage!`));

        domain.incoming(EVENT.ON.INSERT_TASK).handle((newMessage) => (store) => ({
            tasks: [ ...store.tasks, {
                timestamp: new Date().toUTCString(),
                message: newMessage,
                editing: false,
                completed: false
            }]
        })).relay(EVENT.DO.INSERT_TASK);

        domain.incoming(EVENT.ON.EDIT_TASK).handle((editedTask) => (store) => ({
            tasks: store.tasks.map((task) => {
                if (editedTask.hasOwnProperty(`timestamp`) && task.timestamp === editedTask.timestamp) {
                    return {
                        ...task,
                        ...editedTask
                    };
                }
                return task;
            })
        })).relay(EVENT.DO.EDIT_TASK);

        domain.incoming(EVENT.ON.DELETE_TASK).handle((timestamp) => (store) => ({
            tasks: store.tasks.filter((task) => task.timestamp !== timestamp)
        })).relay(EVENT.DO.DELETE_TASK);

        domain.incoming(EVENT.ON.DELETE_COMPLETED_TASK).handle(() => (store) => ({
            tasks: store.tasks.filter((task) => !task.completed)
        })).relay(EVENT.DO.DELETE_TASK);

        domain.incoming(EVENT.ON.CHANGE_FILTER).forward(EVENT.DO.CHANGE_FILTER);

        done();
    }
});
export default TodoDomain;
