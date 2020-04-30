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
 * @module WebStorageServiceComposite
 * @description - A web storage service composite. Compatible with local or session storage.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isString,
    isObject,
    isArray,
    isDefined,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    stringToArray,
    compose,
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
         * @method $initWebStorageServiceComposite
         * @return void
         */
        $initWebStorageServiceComposite () {
            const service = this;

            if (ENV.DEVELOPMENT) {
                if (!isSchema({
                    name: `string`,
                    type: `string`
                }).of(service) || service.type !== `service`) {
                    log(`error`, `WebStorageServiceComposite.$init - Service is invalid. Cannot apply composite.`);
                }
                if (!isDefined(window?.localStorage) && !isDefined(window?.sessionStorage)) {
                    log(`warn1`, `WebStorageServiceComposite.$init - Local storage and session storage features are not unsupported.`);
                }
            }
        },

        /**
         * @description - From web storage.
         *
         * @method from
         * @param {string} source
         * @param {array} pathIds
         * @return {object}
         */
        from (source, ...pathIds) {
            if (ENV.DEVELOPMENT) {
                if (!isString(source)) {
                    log(`error`, `WebStorageServiceComposite.from - Input storage source is invalid.`);
                }
                if (!isNonEmptyArray(pathIds) || !pathIds.every((pathId) => isString(pathId) || isArray(pathId))) {
                    log(`error`, `WebStorageServiceComposite.from - Input pathIds are invalid.`);
                }
            }

            let storage;

            switch (source) { // eslint-disable-line
            case `local-storage`:
                storage = window?.localStorage;
                if (ENV.DEVELOPMENT) {
                    if (!isDefined(storage)) {
                        log(`error`, `WebStorageServiceComposite.from - Local storage feature is not unsupported.`);
                    }
                }
                break;
            case `session-storage`:
                storage = window?.sessionStorage;
                if (ENV.DEVELOPMENT) {
                    if (!isDefined(storage)) {
                        log(`error`, `WebStorageServiceComposite.from - Session storage feature is not unsupported.`);
                    }
                }
                break;
            }

            pathIds = pathIds.map((pathId) => {
                if (isString(pathId)) {
                    return stringToArray(pathId, `.`);
                }
                return pathId;
            });

            if (ENV.DEVELOPMENT) {
                if (pathIds.some((pathId) => isEmpty(pathId))) {
                    log(`warn1`, `WebStorageServiceComposite.from - Input pathId is invalid.`);
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
                        const parse = compose(storage.getItem.bind(storage), JSON.parse);

                        return new Promise((resolve) => {
                            if (Object.prototype.hasOwnProperty.call(storage, rootKey)) {
                                try {
                                    const rootItem = parse(rootKey);
                                    if (!isEmpty(pathId)) {
                                        const item = retrieve(pathId, `.`).from(rootItem);
                                        resolve(isSchema(schema).of(item));
                                    } else {
                                        resolve(isSchema(schema).of(rootItem));
                                    }
                                } catch (error) { // eslint-disable-line
                                    resolve(false);
                                }
                            } else {
                                resolve(false);
                            }
                        });
                    });
                    return Promise.all(promises);
                },
                /**
                 * @description - Do a read operation from storage.
                 *
                 * @method from.read
                 * @return {object}
                 */
                read () {
                    const promises = pathIds.map((pathId) => {
                        const rootKey = pathId.shift();
                        const parse = compose(storage.getItem.bind(storage), JSON.parse);

                        return new Promise((resolve, reject) => {
                            if (Object.prototype.hasOwnProperty.call(storage, rootKey)) {
                                try {
                                    const rootItem = parse(rootKey);

                                    if (!isEmpty(pathId)) {
                                        const item = retrieve(pathId, `.`).from(rootItem);
                                        resolve(item);
                                    } else {
                                        resolve(rootItem);
                                    }
                                } catch (error) {
                                    reject(new Error(`ERROR: Unable to read from storage. ${error.message}`));
                                }
                            } else {
                                reject(new Error(`ERROR: Unable to read from storage. Root item key:${rootKey} is invalid.`));
                            }
                        });
                    });
                    return Promise.all(promises);
                },
                /**
                 * @description - Do a write operation to storage.
                 *
                 * @method from.write
                 * @param {object} bundle - data bundle
                 * @return {object}
                 */
                write (bundle) {
                    if (ENV.DEVELOPMENT) {
                        if (!isObject(bundle)) {
                            log(`error`, `WebStorageServiceComposite.from.write - Input bundle is invalid.`);
                        }
                    }

                    const promises = pathIds.map((pathId) => {
                        const rootKey = pathId.shift();
                        const parse = compose(storage.getItem.bind(storage), JSON.parse);

                        return new Promise((resolve, reject) => {
                            if (!isEmpty(pathId)) {
                                try {
                                    const rootItem = parse(rootKey);

                                    if (rootItem !== null) {
                                        const mutatedRootItem = mutate(rootItem, {
                                            reconfig: true
                                        }).atPathBy(bundle, pathId);
                                        storage.setItem(rootKey, JSON.stringify(mutatedRootItem));
                                    } else {
                                        reject(new Error(`ERROR: Unable to write to storage. Path Id:${pathId} is invalid.`));
                                    }
                                    /* this part check if the setItem operation above was successfull or not */
                                    if (Object.prototype.hasOwnProperty.call(storage, rootKey)) {
                                        resolve(bundle);
                                    } else {
                                        reject(new Error(`ERROR: Unable to write to storage root item key:${rootKey}.`));
                                    }
                                } catch (error) {
                                    reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                }
                            } else {
                                try {
                                    storage.setItem(rootKey, JSON.stringify(bundle));
                                    /* this part check if the setItem operation above was successfull or not */
                                    if (Object.prototype.hasOwnProperty.call(storage, rootKey)) {
                                        resolve(bundle);
                                    } else {
                                        reject(new Error(`ERROR: Unable to write to storage root item key:${rootKey}.`));
                                    }
                                } catch (error) {
                                    reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                }
                            }
                        });
                    });
                    return Promise.all(promises);
                }
            };
        }
    }
});
