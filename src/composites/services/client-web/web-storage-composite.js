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
 * @module WebStorageComposite
 * @description - A web storage composite. Compatible with local or session storage.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../../hyperflow';

/**
 * @description - A web storage composite module.
 *
 * @module WebStorageComposite
 * @return {object}
 */
export default Hf.Composite({
    enclosure: {
        WebStorageComposite: function WebStorageComposite () {
            /* ----- Private Variables ------------- */
            /* ----- Public Functions -------------- */
            /**
             * @description - Get service provider.
             *
             * @method getProvider
             * @return void
             */
            this.getProvider = function getProvider () {
                Hf.log(`error`, `WebStorageComposite.getProvider - Method is not implemented by default.`);
            };
        }
    },
    template: {
        /**
         * @description - Initialized and check that service is valid for this composite.
         *
         * @method $initWebStorageComposite
         * @return void
         */
        // $initWebStorageComposite: function $initWebStorageComposite () {
        // },
        /**
         * @description - Do fetch from storage.
         *
         * @method fetch
         * @param {array} pathIds
         * @return {object}
         */
        fetch: function fetch (...pathIds) {
            const service = this;
            if (Hf.isEmpty(pathIds) || !pathIds.every((pathId) => Hf.isString(pathId) || Hf.isArray(pathId))) {
                Hf.log(`error`, `WebStorageComposite.fetch - Input pathIds are invalid.`);
            } else {
                const {
                    storage
                } = service.getProvider();
                if (!Hf.isDefined(storage)) {
                    Hf.log(`error`, `WebStorageComposite.fetch - Storage provider is not unsupported.`);
                } else {
                    pathIds = pathIds.map((pathId) => Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId);
                    return {
                        /**
                         * @description - Do a read operation from storage.
                         *
                         * @method fetch.read
                         * @return {object}
                         */
                        read: function read () {
                            const promises = pathIds.filter((pathId) => {
                                if (Hf.isEmpty(pathId)) {
                                    Hf.log(`warn1`, `WebStorageComposite.fetch.read - Input pathId is invalid.`);
                                    return false;
                                }
                                return true;
                            }).map((pathId) => {
                                const rootKey = pathId.shift();
                                return new Promise((resolve, reject) => {
                                    if (storage.hasOwnProperty(rootKey)) {
                                        const parse = Hf.compose(storage.getItem.bind(storage), JSON.parse);
                                        const rootItem = parse(rootKey);
                                        if (!Hf.isEmpty(pathId)) {
                                            resolve(Hf.retrieve(pathId, `.`).from(rootItem));
                                        } else {
                                            resolve(rootItem);
                                        }
                                    } else {
                                        reject(new Error(`ERROR: Unable to read from storage. Root item key:${rootKey} is invalid.`));
                                    }
                                });
                            });
                            return Promise.all(promises).then((rootItems) => {
                                return rootItems;
                            });
                        },
                        /**
                         * @description - Do a write operation to storage.
                         *
                         * @method fetch.write
                         * @param {object} cmd - command statement.
                         * @return {object}
                         */
                        write: function write (cmd = {}) {
                            if (!Hf.isSchema({
                                bundle: `object`
                            }).of(cmd)) {
                                Hf.log(`error`, `WebStorageComposite.fetch.write - Input fetch command statement bundle is invalid.`);
                            } else {
                                const {
                                    bundle,
                                    touchRoot
                                } = Hf.fallback({
                                    touchRoot: false
                                }).of(cmd);
                                const promises = pathIds.filter((pathId) => {
                                    if (Hf.isEmpty(pathId)) {
                                        Hf.log(`warn1`, `WebStorageComposite.fetch.write - Input pathId is invalid.`);
                                        return false;
                                    }
                                    return true;
                                }).map((pathId) => {
                                    const rootKey = pathId.shift();
                                    return new Promise((resolve, reject) => {
                                        if (touchRoot && storage.hasOwnProperty(rootKey)) {
                                            resolve(bundle);
                                        } else {
                                            const parse = Hf.compose(storage.getItem.bind(storage), JSON.parse);
                                            const rootItem = parse(rootKey);
                                            if (!Hf.isEmpty(pathId)) {
                                                if (rootItem !== null) {
                                                    const mutator = bundle;
                                                    storage.setItem(rootKey, JSON.stringify(Hf.mutate(rootItem).atPathBy(mutator, pathId)));
                                                } else {
                                                    reject(new Error(`ERROR: Unable to write to storage. PathId${pathId} is invalid.`));
                                                }
                                                /* this part check if the setItem operation above was successfull or not */
                                                if (storage.hasOwnProperty(rootKey)) {
                                                    resolve(bundle);
                                                } else {
                                                    reject(new Error(`ERROR: Unable to write to storage root item key:${rootKey}.`));
                                                }
                                            } else {
                                                if (rootItem !== null) {
                                                    if (!bundle.hasOwnProperty(rootKey)) {
                                                        reject(new Error(`ERROR: Unable to write to storage. Bundle root item key:${rootKey} is undefined.`));
                                                    } else {
                                                        const mutator = bundle[rootKey];
                                                        if (Hf.isObject(mutator) || Hf.isArray(mutator)) {
                                                            storage.setItem(rootKey, JSON.stringify(Hf.mutate(rootItem).by(mutator)));
                                                        } else {
                                                            storage.setItem(rootKey, JSON.stringify(mutator));
                                                        }
                                                    }
                                                } else {
                                                    if (!bundle.hasOwnProperty(rootKey)) {
                                                        reject(new Error(`ERROR: Unable to write to storage. Bundle root item key:${rootKey} is undefined.`));
                                                    } else {
                                                        const mutator = bundle[rootKey];
                                                        storage.setItem(rootKey, JSON.stringify(mutator));
                                                    }
                                                }
                                                /* this part check if the setItem operation above was successfull or not */
                                                if (storage.hasOwnProperty(rootKey)) {
                                                    resolve(bundle);
                                                } else {
                                                    reject(new Error(`ERROR: Unable to write to storage root item key:${rootKey}.`));
                                                }
                                            }
                                        }
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
