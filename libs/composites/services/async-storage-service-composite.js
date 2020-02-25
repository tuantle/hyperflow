/**
 * Copyright 2018-present Tuan Le.
 *
 * Licensed under the MIT License.
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://opensource.org/licenses/mit-license.html
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *------------------------------------------------------------------------
 *
 * @module AsyncStorageServiceComposite
 * @description - A local async storage service composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import AsyncStorage from '@react-native-community/async-storage';

import {
    ENV,
    isString,
    isObject,
    isArray,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    stringToArray,
    mutate,
    retrieve,
    log
} from '../../utils/common-util';

import Composite from '../../../src/composite';

export default Composite({
    template: {
        /**
         * @description - Initialized and check that service is valid for this composite.
         *
         * @method $initAsyncStorageServiceComposite
         * @return void
         */
        $initAsyncStorageServiceComposite () {
            const service = this;
            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`
                }).of(service) || service.type !== `service`) {
                    log(`error`, `AsyncStorageServiceComposite.$init - Service is invalid. Cannot apply composite.`);
                }
            }
        },

        /**
         * @description - From async storage.
         *
         * @method from
         * @param {string} key
         * @return {object}
         */
        from (...pathIds) {
            if (ENV.DEVELOPMENT) {
                if (!isNonEmptyArray(pathIds) || !pathIds.every((pathId) => isString(pathId) || isArray(pathId))) {
                    log(`error`, `AsyncStorageServiceComposite.from - Input pathIds are invalid.`);
                }
            }

            const storage = AsyncStorage;

            pathIds = pathIds.map((pathId) => isString(pathId) ? stringToArray(pathId, `.`) : pathId);

            if (ENV.DEVELOPMENT) {
                if (pathIds.some((pathId) => isEmpty(pathId))) {
                    log(`warn1`, `AsyncStorageServiceComposite.from.read - Input pathId is invalid.`);
                }
            }

            return {
                /**
                 * @description - Do a schema check operation to storage.
                 *
                 * @method from.isSchema
                 * @param {object} schema - schema object.
                 * @return {object}
                 */
                isSchema (schema) {
                    if (ENV.DEVELOPMENT) {
                        if (!isObject(schema)) {
                            log(`error`, `WebStorageServiceComposite.from.isSchema - Input schema is invalid.`);
                        }
                    }

                    const promises = pathIds.map((pathId) => {
                        const rootKey = pathId.shift();

                        return new Promise((resolve) => {
                            storage.getItem(rootKey).then((rootItem) => {
                                if (!isEmpty(pathId)) {
                                    const item = retrieve(pathId, `.`).from(rootItem);
                                    resolve(isSchema(schema).of(item));
                                } else {
                                    resolve(isSchema(schema).of(rootItem));
                                }
                            }).catch((error) => { // eslint-disable-line
                                resolve(false);
                            });
                        });
                    });
                    return Promise.all(promises);
                },
                /**
                 * @description - Do a read operation from async storage.
                 *
                 * @method from.read
                 * @return {object}
                 */
                read () {
                    const promises = pathIds.map((pathId) => {
                        const rootKey = pathId.shift();
                        return new Promise((resolve, reject) => {
                            storage.getItem(rootKey).then((rootItem) => {
                                if (rootItem === null) {
                                    reject(new Error(`ERROR: Unable to read from storage. Root item key:${rootKey} is invalid.`));
                                }
                                if (!isEmpty(pathId)) {
                                    resolve(retrieve(pathId, `.`).from(JSON.parse(rootItem)));
                                } else {
                                    resolve(JSON.parse(rootItem));
                                }
                            }).catch((error) => {
                                reject(new Error(`ERROR: Unable to read from storage. ${error.message}`));
                            });
                        });
                    });
                    return Promise.all(promises).then((rootItems) => {
                        return rootItems;
                    });
                },
                /**
                 * @description - Do a write operation to async storage.
                 *
                 * @method from.write
                 * @param {object} bundle - data bundle
                 * @return {object}
                 */
                write (bundle) {
                    if (ENV.DEVELOPMENT) {
                        if (!isObject(bundle)) {
                            log(`error`, `AsyncStorageServiceComposite.from.write - Input bundle is invalid.`);
                        }
                    }

                    const promises = pathIds.map((pathId) => {
                        const rootKey = pathId.shift();

                        return new Promise((resolve, reject) => {
                            if (!isEmpty(pathId)) {
                                storage.getItem(rootKey).then((rootItem) => {
                                    if (rootItem !== null) {
                                        const mutatedRootItem = mutate(rootItem, {
                                            reconfig: true
                                        }).atPathBy(bundle, pathId);

                                        storage.setItem(
                                            rootKey,
                                            JSON.stringify(mutatedRootItem)
                                        ).then(() => {
                                            resolve(bundle);
                                        }).catch((_error) => {
                                            reject(new Error(`ERROR: Unable to write to storage. ${_error.message}`));
                                        });
                                    } else {
                                        reject(new Error(`ERROR: Unable to write to storage. Path Id:${pathId} is invalid.`));
                                    }
                                }).catch((error) => {
                                    reject(new Error(`ERROR: Unable to write to storage. Path Id:${pathId} is invalid. ${error.message}`));
                                });
                            } else {
                                storage.setItem(
                                    rootKey,
                                    JSON.stringify(bundle)
                                ).then(() => {
                                    resolve(bundle);
                                }).catch((error) => {
                                    reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                });
                            }
                        });
                    });
                    return Promise.all(promises);
                }
            };
        }
    }
});
