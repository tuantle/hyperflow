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
 * @module DataElement
 * @description -  A data element that is used for defining component state.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line


import CommonElement from './common-element';

/* load descriptor element */
import DescriptorElement from './descriptor-element';

/* load data cursor element */
import DataCursorElement from './data-cursor-element';

/* load undirected data tree element */
import TreeElement from './tree-element';

const Hf = CommonElement();

/* number mutations to persist in mutation map before roll-over */
const DEFAULT_MUTATION_HISTORY_DEPTH = 64;

const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);

/**
 * @description - A data element prototypes.
 *
 * DataElementPrototype
 */
const DataElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Get accessor for a content at pathId.
     *
     * @method _getAccessor
     * @param {string|array} pathId
     * @param {object} option
     * @return {object}
     * @private
     */
    _getAccessor (pathId, option = {}) {
        const data = this;

        option = Hf.isObject(option) ? option : {};
        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;
        if (Hf.DEVELOPMENT) {
            if (!Hf.isNonEmptyArray(pathId)) {
                Hf.log(`error`, `DataElement._getAccessor - Input pathId is invalid.`);
            }
        }

        const [ rootKey ] = pathId;
        const mRecords = data._mutation.records;
        const immutableRootKeys = data._mutation.immutableRootKeys;

        if (immutableRootKeys.includes(rootKey) && Hf.isNonEmptyArray(mRecords)) {
            data._updateMMap(rootKey, option);
            Hf.clear(data._mutation.records);
        }

        return data._mutation.mMap.select(pathId).getContent();
    },
    /**
     * @description - Record a mutatable at pathId.
     *
     * @method _recordMutation
     * @param {string|array} pathId
     * @return void
     * @private
     */
    _recordMutation (pathId) {
        const data = this;

        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isNonEmptyArray(pathId)) {
                Hf.log(`error`, `DataElement._recordMutation - Input pathId is invalid.`);
            }
        }

        const [ rootKey ] = pathId;
        const immutableRootKeys = data._mutation.immutableRootKeys;
        const mRecords = data._mutation.records;

        if (immutableRootKeys.includes(rootKey)) {
            data._mutation.records = mRecords.concat(pathId.filter((key, index) => {
                return mRecords.length <= index;
            }).map((key) => [ key ])).map((layers, index) => {
                if (pathId.length > index) {
                    const key = pathId[index];

                    if (!layers.includes(key)) {
                        layers.push(key);
                    }
                }
                return layers;
            });
        }
    },
    /**
     * @description - Helper function to update mutation map for a nested accessor object .
     *
     * @method _deepUpdateMMap
     * @param {object} _node
     * @param {string} _pathId
     * @param {array} _records
     * @return void
     * @private
     */
    _deepUpdateMMap (node, pathId, records) {
        const data = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(node)) {
                Hf.log(`error`, `DataElement._deepUpdateMMap - Input node is invalid.`);
            } else if (!Hf.isString(pathId)) {
                Hf.log(`error`, `DataElement._deepUpdateMMap - Input pathId is invalid.`);
            } else if (!Hf.isArray(records)) {
                Hf.log(`error`, `DataElement._deepUpdateMMap - Input records is invalid.`);
            }
        }

        const cursor = data.select(pathId);
        let content = {
            cache: undefined,
            accessor: undefined
        };
        let [ mutatedKeys ] = Hf.isNonEmptyArray(records) ? records : [[]];

        if (cursor.getContentType() === `object`) {
            content.cache = {};
            content.accessor = {};
        } else if (cursor.getContentType() === `array`) {
            content.cache = [];
            content.accessor = [];
        }

        cursor.forEach((item, key) => {
            if (Hf.isNonEmptyObject(item) || Hf.isNonEmptyArray(item)) {
                if (!cursor.isImmutable() || (cursor.isImmutable() && mutatedKeys.includes(key))) {
                    data._deepUpdateMMap(node.branch(key), `${pathId}.${key}`, records.slice(1));
                }
            } else {
                if (cursor.isItemComputable(key)) {
                    Object.defineProperty(content.accessor, key, {
                        get () {
                            return cursor.getContentItem(key);
                        },
                        configurable: false,
                        enumerable: true
                    });
                // TODO: handle for case where key is an observable.
                // } else if (cursor.isItemObservable(key)) {
                // }
                } else {
                    if (cursor.isImmutable()) {
                        content.cache[key] = item;
                        Object.defineProperty(content.accessor, key, {
                            get () {
                                return node.getContentCacheItem(key);
                            },
                            set (value) {
                                cursor.setContentItem(value, key);
                            },
                            configurable: true,
                            enumerable: true
                        });
                    } else {
                        Object.defineProperty(content.accessor, key, {
                            get () {
                                return cursor.getContentItem(key);
                            },
                            set (value) {
                                cursor.setContentItem(value, key);
                            },
                            configurable: true,
                            enumerable: true
                        });
                    }
                }
            }
        });

        node.setContent(content);
    },
    /**
     * @description - Update the mutation map for a root content.
     *
     * @method _updateMMap
     * @param {string} rootKey
     * @param {object} option
     * @return void
     * @private
     */
    _updateMMap (rootKey, option = {
        excludedNonmutatioReferalPathIds: []
    }) {
        const data = this;
        const mMap = data._mutation.mMap;
        const mutationHistoryDepth = data._mutation.historyDepth;
        const rootContent = data._rootContent;
        const pathId = rootKey;
        const {
            /* skip referal of pathIds in the exclusion list. */
            excludedNonmutatioReferalPathIds
        } = Hf.fallback({
            excludedNonmutatioReferalPathIds: []
        }).of(option);

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(rootKey) || !rootContent.hasOwnProperty(rootKey)) {
                Hf.log(`error`, `DataElement._updateMMap - Root data content key:${rootKey} is undefined.`);
            }
        }

        const immutableRootKeys = data._mutation.immutableRootKeys;

        if (immutableRootKeys.includes(rootKey)) {
            const mRecords = data._mutation.records;
            const oldRootKey = `${rootKey}${data._mutation.timeIndex[rootKey]}`;
            const oldRootNode = mMap.select(pathId).rekey(oldRootKey);
            const newRootNode = mMap.sproutRoot(rootKey);

            data._deepUpdateMMap(newRootNode, pathId, mRecords.slice(1));

            newRootNode.refer(oldRootNode.getPathId(), {
                excludedPathIds: excludedNonmutatioReferalPathIds.filter((_pathId) => Hf.isNonEmptyString(_pathId)).map((_pathId) => {
                    _pathId = Hf.stringToArray(_pathId, `.`);
                    if (_pathId[0] === rootKey) {
                        _pathId[0] = oldRootKey;
                        return Hf.arrayToString(_pathId, `.`);
                    }
                })
            });

            newRootNode.freezeContent();
            data._mutation.timeIndex[rootKey]++;
            data._mutation.timestamp[rootKey].push((new Date()).getTime() - data._mutation.timestampRef);

            if (mutationHistoryDepth > 0 && mMap.getRootCount() > mutationHistoryDepth) {
                let timeIndexOffset = mutationHistoryDepth >> 1;
                const startingTimeIndex = data._mutation.timeIndex[rootKey] - (mutationHistoryDepth >> 1);
                while (timeIndexOffset > 0) {
                    timeIndexOffset--;
                    mMap.cutRoot(`${rootKey}${startingTimeIndex - timeIndexOffset}`);
                }
            }
        } else {
            const rootNode = mMap.sproutRoot(rootKey);

            data._deepUpdateMMap(rootNode, pathId, []);
            rootNode.freezeContent();
        }
    },
    /**
     * @description - Assign descriptor to data content items.
     *
     * @method _assignDescription
     * @param {object} cursor
     * @param {object} bundleItem
     * @param {string} bundleKey
     * @return void
     * @private
     */
    _assignDescription (cursor, bundleItem, bundleKey) {
        const data = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(cursor)) {
                Hf.log(`error`, `DataElement._assignDescription - Input cursor object is invalid.`);
            } else if (!Hf.isObject(bundleItem)) {
                Hf.log(`error`, `DataElement._assignDescription - Input bundle item object is invalid.`);
            } else if (!Hf.isString(bundleKey)) {
                Hf.log(`error`, `DataElement._assignDescription - Input bundle key is invalid.`);
            }
        }

        const {
            required,
            stronglyTyped,
            oneOfTypes,
            oneOfValues,
            boundarydValues,
            constrainable,
            observable,
            computable
        } = bundleItem;

        /* description for required item */
        if (required) {
            cursor.describeItem(bundleKey).asRequired();
        }
        /* description for strongly type item */
        if (stronglyTyped) {
            cursor.describeItem(bundleKey).asStronglyTyped();
        }
        /* description for one of types item */
        if (Hf.isArray(oneOfTypes)) {
            cursor.describeItem(bundleKey).asOneOfTypes(oneOfTypes);
        }
        /* description for one of values item */
        if (Hf.isArray(oneOfValues)) {
            cursor.describeItem(bundleKey).asOneOfValues(oneOfValues);
        }
        /* description for bounded item */
        if (Hf.isArray(boundarydValues)) {
            const [
                lowerBound,
                upperBound
            ] = boundarydValues;
            cursor.describeItem(bundleKey).asBounded(lowerBound, upperBound);
        }
        /* description for constrainable item */
        if (Hf.isObject(constrainable)) {
            const {
                constraint,
                target
            } = constrainable;

            if (!Hf.isEmpty(target)) {
                Object.entries(target).filter(([ constraintKey, constraintValue ]) => { // eslint-disable-line
                    return constraint.hasOwnProperty(constraintKey);
                }).reduce((targetPaths, [ constraintKey, constraintValue ]) => { // eslint-disable-line
                    return targetPaths.concat(constraintValue);
                }, []).filter((targetPath) => {
                    return Hf.isString(targetPath) || Hf.isArray(targetPath);
                }).map((targetPath) => {
                    return Hf.isString(targetPath) ? Hf.stringToArray(targetPath, `.`) : targetPath;
                }).forEach((targetPath) => {
                    const targetKey = targetPath.pop();
                    const pathId = `${cursor.pathId}.${bundleKey}.${Hf.arrayToString(targetPath, `.`)}`;

                    data.select(pathId).describeItem(targetKey).asConstrainable(constraint);
                });
            } else {
                cursor.describeItem(bundleKey).asConstrainable(constraint);
            }
        }
        /* description for observable item */
        if (Hf.isObject(observable)) {
            if (Hf.isBoolean(observable) && observable) {
                cursor.describeItem(bundleKey).asObservable();
            } else if (Hf.isObject(observable)) {
                const {
                    condition,
                    subscriber
                } = observable;

                cursor.describeItem(bundleKey).asObservable(condition, subscriber);
            }
        }
        /* description for computable item */
        if (Hf.isObject(computable)) {
            const computeName = bundleKey;
            const {
                contexts,
                compute
            } = computable;
            /* create a null item that will be descriped as computable */
            cursor.setContentItem(null, computeName);
            cursor.describeItem(computeName).asComputable(contexts, compute);
        }
    },
    /**
     * @description - Check if there is a data content cursor at pathId.
     *
     * @method hasCursor
     * @param {string|array} pathId - Cursor pathId.
     * @return {boolean}
     */
    hasCursor (pathId) {
        const data = this;

        if (!(Hf.isString(pathId) || Hf.isArray(pathId))) {
            return false;
        }

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        const content = Hf.retrieve(pathId, `.`).from(data._rootContent);

        return Hf.isObject(content);
    },
    /**
     * @description - Set the cursor at rootKey to be immutable.
     *
     * @method setImmutability
     * @param {string} rootKey
     * @param {boolean} immutable
     * @return void
     */
    setImmutability (rootKey, immutable = true) {
        const data = this;
        const rootContent = data._rootContent;
        let immutableRootKeys = data._mutation.immutableRootKeys;

        immutable = Hf.isBoolean(immutable) ? immutable : true;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(rootKey) || !rootContent.hasOwnProperty(rootKey)) {
                Hf.log(`error`, `DataElement.setImmutability - Root data content key:${rootKey} is undefined.`);
            }
        }

        if (immutable) {
            if (!immutableRootKeys.includes(rootKey)) {
                immutableRootKeys.push(rootKey);
                data._mutation.timeIndex[rootKey] = 0;
                data._mutation.timestamp[rootKey] = [ (new Date()).getTime() - data._mutation.timestampRef ];
            }
        } else {
            // TODO: Test if setImmutability(false) would throw an error.
            const index = immutableRootKeys.indexOf(rootKey);
            if (index !== -1) {
                immutableRootKeys.splice(index, 1);
                data.flush(rootKey);
                delete data._mutation.timeIndex[rootKey];
                delete data._mutation.timestamp[rootKey];
                // data._mutation.timeIndex[rootKey] = undefined;
                // data._mutation.timestamp[rootKey] = undefined;
            }
        }
    },
    /**
     * @description - Set the max number of mutation before roll over is occured.
     *
     * @method setMutationHistoryDepth
     * @param {number} mutationHistoryDepth
     * @return void
     */
    setMutationHistoryDepth (mutationHistoryDepth) {
        const data = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isNumeric(mutationHistoryDepth) && mutationHistoryDepth > 1) {
                Hf.log(`error`, `DataElement.select - Input mutation history depth is invalid.`);
            }
            if (mutationHistoryDepth < DEFAULT_MUTATION_HISTORY_DEPTH) {
                Hf.log(`warn1`, `DataElement.select - Input mutation history depth value:${mutationHistoryDepth} is less than default value of:${DEFAULT_MUTATION_HISTORY_DEPTH}.`);
            }
        }

        data._mutation.historyDepth = mutationHistoryDepth;
    },
    /**
     * @description - Flush all history of mutations of a root content.
     *
     * @method flush
     * @param {string} rootKey
     * @return void
     */
    flush (rootKey) {
        const data = this;
        const rootContent = data._rootContent;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isString(rootKey) || !rootContent.hasOwnProperty(rootKey)) {
                Hf.log(`error`, `DataElement.flush - Root data content key:${rootKey} is undefined.`);
            }
        }

        const mMap = data._mutation.mMap;
        const immutableRootKeys = data._mutation.immutableRootKeys;

        if (immutableRootKeys.includes(rootKey)) {
            let timeIndexOffset = data._mutation.timeIndex[rootKey];
            while (timeIndexOffset > 0) {
                timeIndexOffset--;
                mMap.cutRoot(`${rootKey}${timeIndexOffset}`);
            }
            data._mutation.timestampRef = new Date().getTime();
            data._mutation.timeIndex[rootKey] = 0;
            data._mutation.timestamp[rootKey] = [ 0 ];
        }
    },
    /**
     * @description - Select pathId, get the cursor of a data content.
     *
     * @method select
     * @param {string|array} pathId
     * @return {object}
     */
    select (pathId) {
        const data = this;

        pathId = Hf.isString(pathId) ? Hf.stringToArray(pathId, `.`) : pathId;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isNonEmptyArray(pathId)) {
                Hf.log(`error`, `DataElement.select - Input pathId is invalid.`);
            }
        }

        const cursor = DataCursorElement(data, pathId);

        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(cursor)) {
                Hf.log(`error`, `DataElement.select - Unable to create a data content cursor instance.`);
            }
        }

        /* reveal only the public properties and functions */
        return revealFrozen(cursor);
    },
    /**
     * @description - Helper function to format an object to DataElement bundles.
     *
     * @method format
     * @param {bundle} bundle
     * @return {object}
     */
    format (bundle) {
        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(bundle)) {
                Hf.log(`error`, `DataElement.format - Input bundle object is invalid.`);
            }
        }

        let formatedBundle = {};
        let formatedBundleItem;

        Hf.forEach(bundle, (bundleItem, bundleKey) => {
            if (Hf.isDefined(bundleItem)) {
                formatedBundle[bundleKey] = {};
                formatedBundleItem = formatedBundle[bundleKey];

                if (Hf.isSchema({
                    value: `defined`
                }).of(bundleItem)) {
                    if (bundleItem.hasOwnProperty(`required`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isBoolean(bundleItem.required)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable required for key:${bundleKey} is invalid.`);
                            }
                        }
                        formatedBundleItem.required = bundleItem.required;
                    }
                    if (bundleItem.hasOwnProperty(`stronglyTyped`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isBoolean(bundleItem.stronglyTyped)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable strongly typed for key:${bundleKey} is invalid.`);
                            } else if (bundleItem.hasOwnProperty(`oneTypeOf`)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable for key:${bundleKey} is conflicted with one of types.`);
                            }
                        }
                        formatedBundleItem.stronglyTyped = bundleItem.stronglyTyped;
                    } else {
                        if (!bundleItem.hasOwnProperty(`oneTypeOf`)) {
                            formatedBundleItem.stronglyTyped = true;
                            Hf.log(`warn0`, `DataElement.format - Bundle constrainable strongly typed for key:${bundleKey} is set to true by default if not set.`);
                        }
                    }
                    if (bundleItem.hasOwnProperty(`oneTypeOf`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isSchema({
                                oneTypeOf: [ `string` ]
                            }).of(bundleItem)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable one of types for key:${bundleKey} is invalid.`);
                            } else if (Hf.isEmpty(bundleItem.oneTypeOf)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable one of types for key:${bundleKey} is empty.`);
                            } else if (bundleItem.hasOwnProperty(`stronglyTyped`)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable for key:${bundleKey} is conflicted with strongly typed.`);
                            }
                        }

                        formatedBundleItem.oneOfTypes = bundleItem.oneTypeOf;
                    }
                    if (bundleItem.hasOwnProperty(`oneOf`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isSchema({
                                oneOf: [ `number|string` ]
                            }).of(bundleItem)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable one of values for key:${bundleKey} is invalid.`);
                            } else if (Hf.isEmpty(bundleItem.oneOf)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable one of values for key:${bundleKey} is empty.`);
                            }
                        }

                        formatedBundleItem.oneOfValues = bundleItem.oneOf;
                    }
                    if (bundleItem.hasOwnProperty(`bounded`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isSchema({
                                bounded: [
                                    `number`
                                ]
                            }).of(bundleItem)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable bounded range for key:${bundleKey} is invalid.`);
                            } else if (bundleItem.bounded.length !== 2) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable bounding range for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.boundarydValues = bundleItem.bounded;
                    }
                    if (bundleItem.hasOwnProperty(`constrainable`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isSchema({
                                constrainable: {
                                    constraint: `object`,
                                    target: `object`
                                }
                            }).of(bundleItem)) {
                                Hf.log(`error`, `DataElement.format - Bundle constrainable for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.constrainable = bundleItem.constrainable;
                    }
                    if (bundleItem.hasOwnProperty(`observable`)) {
                        if (Hf.DEVELOPMENT) {
                            if (!Hf.isSchema({
                                observable: {
                                    condition: `object`,
                                    subscriber: `object`
                                }
                            }).of(bundleItem)) {
                                Hf.log(`error`, `DataElement.format - Bundle observable for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.observable = bundleItem.observable;
                    }

                    formatedBundleItem.value = bundleItem.value;
                } else if (Hf.isObject(bundleItem) && bundleItem.hasOwnProperty(`computable`)) {
                    if (Hf.DEVELOPMENT) {
                        if (!Hf.isSchema({
                            computable: {
                                contexts: `array`,
                                compute: `function`
                            }
                        }).of(bundleItem)) {
                            Hf.log(`error`, `DataElement.format - Bundle computable for key:${bundleKey} is invalid.`);
                        }
                    }

                    formatedBundleItem.computable = bundleItem.computable;
                } else {
                    formatedBundleItem.value = bundleItem;

                    // if (Hf.isObject(bundleItem)) {
                    //     if (Hf.DEVELOPMENT) {
                    //         if (Hf.isEmpty(bundleItem)) {
                    //             Hf.log(`error`, `DataElement.format - Bundle key:${bundleKey} is empty.`);
                    //         }
                    //     }
                    //     formatedBundleItem.value = bundleItem;
                    // } else {
                    //     formatedBundleItem.value = bundleItem;
                    // }
                }
            }
        });

        return formatedBundle;
    },
    /**
     * @description - Read a data bundle.
     *
     * @method read
     * @param {object} bundle
     * @param {string} bundleName
     * @return {object}
     */
    read (bundle, bundleName) {
        // FIXME: Crash occurs when bundle object has circular reference.
        const data = this;

        if (Hf.DEVELOPMENT) {
            if (!Hf.isObject(bundle)) {
                Hf.log(`error`, `DataElement.read - Input data content bundle is invalid.`);
            } else if (!Hf.isString(bundleName)) {
                Hf.log(`error`, `DataElement.read - Input data content bundle name is invalid.`);
            }
        }

        const pathId = bundleName;
        const rootKey = bundleName;
        /* format bundle to correct format */
        const formatedBundle = data.format(bundle);
        let cursor;

        /* create a root data content for bundle */
        data._rootContent[bundleName] = {};
        cursor = data.select(pathId);

        /* read bundle and assign descriptors */
        Hf.forEach(formatedBundle, (bundleItem, bundleKey) => {
            if (bundleItem.hasOwnProperty(`value`)) {
                const value = bundleItem.value;

                if (Hf.DEVELOPMENT) {
                    if (!Hf.isDefined(value)) {
                        Hf.log(`error`, `DataElement.read - Cannot set undefined data bundle item key:${bundleKey}.`);
                    }
                }

                cursor.setContentItem(value, bundleKey);
            }
            data._assignDescription(cursor, bundleItem, bundleKey);
        });

        if (Hf.DEVELOPMENT) {
            if (Hf.isEmpty(data._rootContent[bundleName])) {
                Hf.log(`error`, `DataElement.read - Root data content item name:${bundleName} is empty.`);
            }
        }

        data._updateMMap(rootKey);

        return {
            /**
             * @description - Set data immutability after reading.
             *
             * @method asImmutable
             * @param {boolean} immutable
             * @return {object}
             */
            asImmutable (immutable = true) {
                immutable = Hf.isBoolean(immutable) ? immutable : true;
                data.setImmutability(rootKey, immutable);
                return data;
            }
        };
    }
    /**
     * @description - Log data element as a string for debuging.
     *
     * @method DEBUG_LOG
     * @return void
     */
    // DEBUG_LOG () {
    //     const data = this;
    //     data._mutation.mMap.DEBUG_LOG();
    //     Hf.log(`debug`, JSON.stringify(data._mutation.records, null, `\t`));
    // }
};

/**
 * @description - A data element module.
 * @module DataElement
 * @description - A component`s data element module.
 * @return {object}
 */
export default function DataElement () {
    const element = Object.create(DataElementPrototype, {
        _descriptor: {
            value: DescriptorElement(),
            writable: false,
            configurable: false,
            enumerable: false
        },
        _rootContent: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        },
        _mutation: {
            value: {
                records: [],
                immutableRootKeys: [],
                mMap: TreeElement(),
                timeIndex: {},
                timestamp: {},
                historyDepth: DEFAULT_MUTATION_HISTORY_DEPTH,
                timestampRef: new Date().getTime()
            },
            writable: false,
            configurable: true,
            enumerable: false
        }
    });

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(element)) {
            Hf.log(`error`, `DataElement - Unable to create a data element instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return Hf.compose(Hf.reveal, Object.freeze)(element);
}
