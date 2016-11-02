/**
 * Copyright 2015-present Tuan Le.
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
 * @module AsyncStorageComposite
 * @description - A local storage composite.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CompositeElement */
import CompositeElement from '../../../core/elements/composite-element';

/* load CommonElement */
import CommonElement from '../../../core/elements/common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - An async storage composite module.
 *
 * @module AsyncStorageComposite
 * @return {object}
 */
export default CompositeElement({
    enclosure: {
        AsyncStorageComposite: function AsyncStorageComposite () {
            /* ----- Private Variables ------------- */
            /* ----- Public Functions -------------- */
            /**
             * @description - Get service provider.
             *
             * @method getProvider
             * @return void
            */
            this.getProvider = function getProvider () {
                Hf.log(`error`, `AsyncStorageComposite.getProvider - Method is not implemented by default.`);
            };
        }
    },
    template: {
        /**
         * @description - Initialized and check that service is valid for this composite.
         *
         * @method $initAsyncStorageComposite
         * @return void
         */
        // $initAsyncStorageComposite: function $initAsyncStorageComposite () {
        // };
        /**
         * @description - Do fetch from async storage.
         *
         * @method fetch
         * @param {string} key
         * @return {object}
         */
        fetch: function fetch (...pathIds) {
            const service = this;
            if (Hf.isEmpty(pathIds) || !pathIds.every((pathId) => Hf.isString(pathId) || Hf.isArray(pathId))) {
                Hf.log(`error`, `AsyncStorageComposite.fetch - Input pathIds are invalid.`);
            } else {
                const {
                    storage
                } = service.getProvider();
                if (!Hf.isDefined(storage)) {
                    Hf.log(`error`, `AsyncStorageComposite.fetch - Async storage provider is not unsupported.`);
                } else {
                    pathIds = pathIds.map((pathId) => Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId);
                    return {
                        /**
                         * @description - Do a read operation from async storage.
                         *
                         * @method fetch.read
                         * @return {object}
                         */
                        read: function read () {
                            const promises = pathIds.filter((pathId) => {
                                if (Hf.isEmpty(pathId)) {
                                    Hf.log(`warn1`, `AsyncStorageComposite.fetch.read - Input pathId is invalid.`);
                                    return false;
                                }
                                return true;
                            }).map((pathId) => {
                                const rootKey = pathId.shift();
                                return new Promise((resolve, reject) => {
                                    storage.getAllKeys().then((rootKeys) => {
                                        if (rootKeys.includes(rootKey)) {
                                            storage.getItem(rootKey).then((rootItem) => {
                                                if (!Hf.isEmpty(pathId)) {
                                                    resolve(Hf.retrieve(pathId, `.`).from(JSON.parse(rootItem)));
                                                } else {
                                                    resolve(JSON.parse(rootItem));
                                                }
                                            }).catch((error) => {
                                                reject(new Error(`ERROR: Unable to read from storage. ${error.message}`));
                                            });
                                        } else {
                                            reject(new Error(`ERROR: Unable to read from storage. Root item key:${rootKey} is invalid.`));
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
                         * @method fetch.write
                         * @param {object} cmd - command statement.
                         * @return {object}
                         */
                        write: function write (cmd = {}) {
                            if (!Hf.isSchema({
                                bundle: `object`
                            }).of(cmd)) {
                                Hf.log(`error`, `AsyncStorageComposite.fetch.write - Input fetch command statement bundle is invalid.`);
                            } else {
                                const {
                                    bundle,
                                    touchRoot
                                } = Hf.fallback({
                                    touchRoot: false
                                }).of(cmd);
                                const promises = pathIds.filter((pathId) => {
                                    if (Hf.isEmpty(pathId)) {
                                        Hf.log(`warn1`, `AsyncStorageComposite.fetch.write - Input pathId is invalid.`);
                                        return false;
                                    }
                                    return true;
                                }).map((pathId) => {
                                    const rootKey = pathId.shift();
                                    return new Promise((resolve, reject) => {
                                        storage.getAllKeys().then((rootKeys) => {
                                            if (touchRoot && rootKeys.includes(rootKey)) {
                                                resolve(bundle);
                                            } else {
                                                if (!Hf.isEmpty(pathId)) {
                                                    storage.getItem(rootKey).then((rootItem) => {
                                                        const mutator = bundle;
                                                        storage.setItem(
                                                            rootKey,
                                                            JSON.stringify(Hf.mutate(JSON.parse(rootItem)).atPathBy(mutator, pathId))
                                                        ).then(() => {
                                                            resolve(bundle);
                                                        }).catch((_error) => {
                                                            reject(new Error(`ERROR: Unable to write to storage. ${_error.message}`));
                                                        });
                                                    }).catch((error) => { // eslint-disable-line
                                                        reject(new Error(`ERROR: Unable to write to storage. Path Id:${pathId} is invalid.`));
                                                    });
                                                } else {
                                                    storage.getItem(rootKey).then((rootItem) => {
                                                        const mutator = bundle;
                                                        if (Hf.isObject(mutator) || Hf.isArray(mutator)) {
                                                            storage.setItem(
                                                                rootKey,
                                                                JSON.stringify(Hf.mutate(JSON.parse(rootItem)).by(mutator))
                                                            ).then(() => {
                                                                resolve(bundle);
                                                            }).catch((error) => {
                                                                reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                                            });
                                                        } else {
                                                            storage.setItem(
                                                                rootKey,
                                                                JSON.stringify(mutator)
                                                            ).then(() => {
                                                                resolve(bundle);
                                                            }).catch((error) => {
                                                                reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                                            });
                                                        }
                                                    }).catch((error) => { // eslint-disable-line
                                                        if (!bundle.hasOwnProperty(rootKey)) {
                                                            reject(new Error(`ERROR: Unable to write to storage. Bundle root item key:${rootKey} is undefined.`));
                                                        } else {
                                                            const mutator = bundle[rootKey];
                                                            storage.setItem(
                                                                rootKey,
                                                                JSON.stringify(mutator)
                                                            ).then(() => {
                                                                resolve(bundle);
                                                            }).catch((_error) => {
                                                                reject(new Error(`ERROR: Unable to write to storage. ${_error.message}`));
                                                            });
                                                        }
                                                    });
                                                }
                                            }
                                        }).catch((error) => {
                                            reject(new Error(`ERROR: Unable to write to storage. ${error.message}`));
                                        });
                                    });
                                });
                                return Promise.all(promises);
                            }
                        }
                    };
                }
            }
        }
    }
});
