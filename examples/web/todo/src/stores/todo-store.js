'use strict'; // eslint-disable-line

import { Hf } from 'hyperflow';

import ImmutableStateComposite from 'hyperflow/libs/composites/states/immutable-state-composite';

import EVENT from '../events/todo-event';

export default Hf.Store.augment({
    composites: [ ImmutableStateComposite ],
    state: {
        setting: {
            filters: [ `all`, `active`, `completed` ],
            currentFilter: `all`
        },
        tasks: [],
        filteredTasks: {
            computable: {
                contexts: [
                    `tasks`,
                    `setting`
                ],
                compute () {
                    switch (this.setting.currentFilter) {
                    case `all`:
                        return this.tasks;
                    case `active`:
                        return this.tasks.filter((task) => !task.completed);
                    case `completed`:
                        return this.tasks.filter((task) => task.completed);
                    default:
                        return this.tasks;
                    }
                }
            }
        },
        status: {
            computable: {
                contexts: [
                    `tasks`
                ],
                compute () {
                    const incompleteItemCount = this.tasks.filter((task) => !task.completed).length;
                    let status = `Nothing to do.`;

                    if (incompleteItemCount > 1) {
                        status = `${incompleteItemCount} things left to do.`;
                    } else if (incompleteItemCount === 1) {
                        status = `${incompleteItemCount} thing left to do.`;
                    }
                    return status;
                }
            }
        }
    },
    $init () {
        // const store = this;
    },
    setup (done) {
        const store = this;

        store.incoming(EVENT.DO.STORE_INIT).handle(({
            setting,
            tasks
        }) => {
            if (store.mutate({
                setting,
                tasks
            }, {
                reconfig: true
            })) {
                console.log(`Store initialized.`);
            }
        });

        store.incoming(EVENT.DO.INSERT_TASK).handle((insertTask) => {
            if (store.mutate(insertTask, {
                reconfig: true
            })) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    bundle: {
                        tasks: store.tasks
                    },
                    pathId: `todo.tasks`
                }));
                console.log(`Store mutated`);
            }
        });

        store.incoming(EVENT.DO.DELETE_TASK).handle((deleteTask) => {
            if (store.mutate(deleteTask, {
                reconfig: true
            })) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    bundle: {
                        tasks: store.tasks
                    },
                    pathId: `todo.tasks`
                }));
                console.log(`Store mutated`);
            }
        });

        store.incoming(EVENT.DO.EDIT_TASK).handle((editTask) => {
            if (store.mutate(editTask)) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    bundle: {
                        tasks: store.tasks
                    },
                    pathId: `todo.tasks`
                }));
                console.log(`Store mutated.`);
            }
        });

        store.incoming(EVENT.DO.CHANGE_FILTER).handle((newFilter) => {
            if (store.mutate({
                setting: {
                    currentFilter: newFilter
                }
            })) {
                store.outgoing(EVENT.AS.STORE_MUTATED).emit(() => ({
                    bundle: {
                        setting: store.setting
                    },
                    pathId: `todo.setting`
                }));
                console.log(`Store mutated.`);
            }
        });
        done();
    }
});
