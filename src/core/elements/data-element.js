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
 * @version 0.0
 */
'use strict'; // eslint-disable-line

/* load descriptor element */
import DescriptorElement from './descriptor-element';

/* load data cursor element */
import DataCursorElement from './data-cursor-element';

/* load undirected data tree element */
import TreeElement from './tree-element';

/* load CommonElement */
import CommonElement from './common-element';

/* create Hflow object */
const Hflow = CommonElement();

/* the max number mutations to persist in mutation map before roll-over */
const DEFAULT_MUTATION_HISTORY_DEPTH = 20;

const INITIAL_TIMESTAMP_REF_IN_MS = (new Date().getTime());

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
     * @return {object}
     * @private
     */
    _getAccessor: function _getAccessor (pathId) {
        pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
        if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
            Hflow.log(`error`, `DataElement._getAccessor - Input pathId is invalid.`);
        } else {
            const data = this;
            const rootKey = pathId[0];
            const mRecords = data._mutation.records;
            const immutableRootKeys = data._mutation.immutableRootKeys;
            if (immutableRootKeys.indexOf(rootKey) !== -1 && !Hflow.isEmpty(mRecords)) {
                data._updateMMap(rootKey);
                Hflow.clear(data._mutation.records);
            }
            return data._mutation.mMap.select(pathId).getContent();
        }
    },
    /**
     * @description - Record a mutatable at pathId.
     *
     * @method _recordMutation
     * @param {string|array} pathId
     * @return void
     * @private
     */
    _recordMutation: function _recordMutation (pathId) {
        pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
        if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
            Hflow.log(`error`, `DataElement._recordMutation - Input pathId is invalid.`);
        } else {
            const data = this;
            const rootKey = pathId[0];
            const immutableRootKeys = data._mutation.immutableRootKeys;
            const mRecords = data._mutation.records;

            if (immutableRootKeys.indexOf(rootKey) !== -1) {
                data._mutation.records = mRecords.concat(pathId.filter((key, index) => {
                    return mRecords.length <= index;
                }).map((key) => [ key ])).map((layers, index) => {
                    if (pathId.length > index) {
                        const key = pathId[index];

                        if (layers.indexOf(key) === -1) {
                            layers.push(key);
                        }
                    }
                    return layers;
                });
            }
        }
    },
    /**
     * @description - Update the mutation map for a root content.
     *
     * @method _updateMMap
     * @param {string} rootKey
     * @return void
     * @private
     */
    _updateMMap: function _updateMMap (rootKey) {
        const data = this;
        /* helper function to update mutation map for a nested accessor object . */
        const _deepUpdateMMap = function _deepUpdateMMap (_node, _pathId, _records) {
            if (!Hflow.isObject(_node)) {
                Hflow.log(`error`, `DataElement._deepUpdateMMap - Input node is invalid.`);
            } else if (!Hflow.isString(_pathId)) {
                Hflow.log(`error`, `DataElement._deepUpdateMMap - Input pathId is invalid.`);
            } else {
                const cursor = data.select(_pathId);
                let accessor = cursor.getContentType() === `object` ? {} : [];
                let mutatedKeys = !Hflow.isEmpty(_records) ? _records[0] : [];

                cursor.forEach((item, key) => {
                    if (Hflow.isObject(item) || Hflow.isArray(item)) {
                        if (!cursor.isImmutable() || (cursor.isImmutable() && mutatedKeys.indexOf(key) !== -1)) {
                            _deepUpdateMMap(_node.branch(key), `${_pathId}.${key}`, _records.slice(1));
                        }
                    } else {
                        if (cursor.isItemComputable(key)) {
                            Object.defineProperty(accessor, key, {
                                get: function get () {
                                    return cursor.getContentItem(key);
                                },
                                configurable: true,
                                enumerable: true
                            });
                        // } else if (cursor.isItemObservable(key)) {
                        // TODO: handle for case where key is an observable.
                        //
                        } else {
                            const cachedItem = item;

                            Object.defineProperty(accessor, key, {
                                get: function get () {
                                    if (cursor.isImmutable()) {
                                        return cachedItem;
                                    }
                                    return cursor.getContentItem(key);
                                },
                                set: function set (value) {
                                    cursor.setContentItem(value, key);
                                },
                                configurable: true,
                                enumerable: true
                            });
                        }
                    }
                });
                _node.setContent(accessor);
            }
        };
        const mMap = data._mutation.mMap;
        const mutationHistoryDepth = data._mutation.mutationHistoryDepth;
        const rootContent = data._rootContent;
        const pathId = rootKey;

        if (Hflow.isString(rootKey) && rootContent.hasOwnProperty(rootKey)) {
            const immutableRootKeys = data._mutation.immutableRootKeys;

            if (immutableRootKeys.indexOf(rootKey) !== -1) {
                const mRecords = data._mutation.records;
                const oldRootNode = mMap.select(pathId).rekey(`${rootKey}${data._mutation.timeIndex[rootKey]}`);
                const newRootNode = mMap.sproutRoot(rootKey);
                const referenceNonmutationsInMMap = Hflow.compose(oldRootNode.getPathId, newRootNode.refer);

                _deepUpdateMMap(newRootNode, pathId, mRecords.slice(1));
                referenceNonmutationsInMMap();
                newRootNode.freezeContent();
                data._mutation.timeIndex[rootKey]++;
                data._mutation.timestamp[rootKey].push((new Date()).getTime() - INITIAL_TIMESTAMP_REF_IN_MS);

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

                _deepUpdateMMap(rootNode, pathId, []);
                rootNode.freezeContent();
            }
        } else {
            Hflow.log(`error`, `DataElement._updateMMap - Root data content key:${rootKey} is undefined.`);
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
    _assignDescription: function _assignDescription (cursor, bundleItem, bundleKey) {
        if (!Hflow.isObject(cursor)) {
            Hflow.log(`error`, `DataElement._assignDescription - Input cursor object is invalid.`);
        } else if (!Hflow.isObject(bundleItem)) {
            Hflow.log(`error`, `DataElement._assignDescription - Input bundle item object is invalid.`);
        } else if (!Hflow.isString(bundleKey)) {
            Hflow.log(`error`, `DataElement._assignDescription - Input bundle key is invalid.`);
        } else {
            const data = this;
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
            if (Hflow.isArray(oneOfTypes)) {
                cursor.describeItem(bundleKey).asOneTypeOf(oneOfTypes);
            }
            /* description for one of values item */
            if (Hflow.isArray(oneOfValues)) {
                cursor.describeItem(bundleKey).asOneOf(oneOfValues);
            }
            /* description for bounded item */
            if (Hflow.isArray(boundarydValues)) {
                const [
                    lowerBound,
                    upperBound
                ] = boundarydValues;
                cursor.describeItem(bundleKey).asBounded(lowerBound, upperBound);
            }
            /* description for constrainable item */
            if (Hflow.isObject(constrainable)) {
                const {
                    constraint,
                    target
                } = constrainable;

                if (!Hflow.isEmpty(target)) {
                    Object.keys(target).filter((constraintKey) => constraint.hasOwnProperty(constraintKey)).reduce((targetPaths, constraintKey) => {
                        return targetPaths.concat(target[constraintKey]);
                    }, []).filter((targetPath) => {
                        return Hflow.isString(targetPath) || Hflow.isArray(targetPath);
                    }).map((targetPath) => {
                        return Hflow.isString(targetPath) ? Hflow.stringToArray(targetPath, `.`) : targetPath;
                    }).forEach((targetPath) => {
                        const targetKey = targetPath.pop();
                        const pathId = `${cursor.pathId}.${bundleKey}.${Hflow.arrayToString(targetPath, `.`)}`;

                        data.select(pathId).describeItem(targetKey).asConstrainable(constraint);
                    });
                } else {
                    cursor.describeItem(bundleKey).asConstrainable(constraint);
                }
            }
            /* description for observable item */
            if (Hflow.isObject(observable)) {
                if (Hflow.isBoolean(observable) && observable) {
                    cursor.describeItem(bundleKey).asObservable();
                } else if (Hflow.isObject(observable)) {
                    const {
                        condition,
                        subscriber
                    } = observable;

                    cursor.describeItem(bundleKey).asObservable(condition, subscriber);
                }
            }
            /* description for computable item */
            if (Hflow.isObject(computable)) {
                const computeName = bundleKey;
                const {
                    contexts,
                    compute
                } = computable;
                /* create a null item that will be descriped as computable */
                cursor.setContentItem(null, computeName);
                cursor.describeItem(computeName).asComputable(contexts, compute);
            }
        }
    },
    /**
     * @description - Check if there is a data content cursor at pathId.
     *
     * @method hasCursor
     * @param {string|array} pathId - Cursor pathId.
     * @return {boolean}
     */
    hasCursor: function hasCursor (pathId) {
        if (!(Hflow.isString(pathId) || Hflow.isArray(pathId))) {
            return false;
        }
        const data = this;

        /* convert pathId from array format to string format */
        pathId = Hflow.isArray(pathId) ? Hflow.arrayToString(pathId, `.`) : pathId;

        const content = Hflow.retrieve(pathId, `.`).from(data._rootContent);

        return Hflow.isObject(content);
    },
    /**
     * @description - Set the cursor at rootKey to be immutable.
     *
     * @method setImmutability
     * @param {string} rootKey
     * @param {boolean} immutable
     * @return void
     */
    setImmutability: function setImmutability (rootKey, immutable = true) {
        const data = this;
        const rootContent = data._rootContent;
        let immutableRootKeys = data._mutation.immutableRootKeys;

        immutable = Hflow.isBoolean(immutable) ? immutable : true;

        if (Hflow.isString(rootKey) && rootContent.hasOwnProperty(rootKey)) {
            if (immutable) {
                if (immutableRootKeys.indexOf(rootKey) === -1) {
                    immutableRootKeys.push(rootKey);
                    data._mutation.timeIndex[rootKey] = 0;
                    data._mutation.timestamp[rootKey] = [ (new Date()).getTime() - INITIAL_TIMESTAMP_REF_IN_MS ];
                }
            } else {
                // TODO: Test if setImmutability(false) would throw an error.
                const index = immutableRootKeys.indexOf(rootKey);
                if (index !== -1) {
                    immutableRootKeys.splice(index, 1);
                    data.flush(rootKey);
                    data._mutation.timeIndex[rootKey] = undefined;
                    data._mutation.timestamp[rootKey] = undefined;
                    delete data._mutation.timeIndex[rootKey];
                    delete data._mutation.timestamp[rootKey];
                }
            }
        } else {
            Hflow.log(`error`, `DataElement.setImmutability - Root data content key:${rootKey} is undefined.`);
        }
    },
    /**
     * @description - Flush all history of mutations of a root content.
     *
     * @method flush
     * @param {string} rootKey
     * @return void
     */
    flush: function flush (rootKey) {
        const data = this;
        const rootContent = data._rootContent;

        if (Hflow.isString(rootKey) && rootContent.hasOwnProperty(rootKey)) {
            const mMap = data._mutation.mMap;
            const immutableRootKeys = data._mutation.immutableRootKeys;

            if (immutableRootKeys.indexOf(rootKey) !== -1) {
                let timeIndexOffset = data._mutation.timeIndex[rootKey];
                while (timeIndexOffset > 0) {
                    timeIndexOffset--;
                    mMap.cutRoot(`${rootKey}${timeIndexOffset}`);
                }
                data._mutation.timeIndex[rootKey] = 0;
                data._mutation.timestamp[rootKey] = [ (new Date()).getTime() - INITIAL_TIMESTAMP_REF_IN_MS ];
            }
        } else {
            Hflow.log(`warn0`, `DataElement.flush - Root data content key:${rootKey} is undefined.`);
        }
    },
    /**
     * @description - Select pathId, get the cursor of a data content.
     *
     * @method select
     * @param {string|array} pathId
     * @return {object}
     */
    select: function select (pathId) {
        pathId = Hflow.isString(pathId) ? Hflow.stringToArray(pathId, `.`) : pathId;
        if (!(Hflow.isArray(pathId) && !Hflow.isEmpty(pathId))) {
            Hflow.log(`error`, `DataElement.select - Input pathId is invalid.`);
        } else {
            const data = this;
            const cursor = DataCursorElement(data, pathId);

            if (!Hflow.isObject(cursor)) {
                Hflow.log(`error`, `DataElement.select - Unable to create a data content cursor instance.`);
            } else {
                const revealFrozen = Hflow.compose(Object.freeze, Hflow.reveal);
                /* reveal only the public properties and functions */
                return revealFrozen(cursor);
            }
        }
    },
    /**
     * @description - Helper function to format an object to DataElement bundles.
     *
     * @method format
     * @param {bundle} bundle
     * @return {object}
     */
    format: function format (bundle) {
        if (!Hflow.isObject(bundle)) {
            Hflow.log(`error`, `DataElement.format - Input bundle object is invalid.`);
        } else {
            let formatedBundle = {};
            let formatedBundleItem;

            formatedBundle.mutable = Hflow.isSchema({
                mutable: `boolean`
            }).of(bundle) ? bundle.mutable : false;

            Hflow.forEach(bundle, (bundleItem, bundleKey) => {
                if (Hflow.isDefined(bundleItem)) {
                    if (bundleKey !== `mutable`) {
                        formatedBundle[bundleKey] = {};
                        formatedBundleItem = formatedBundle[bundleKey];

                        if (Hflow.isSchema({
                            value: `defined`
                        }).of(bundleItem)) {
                            if (bundleItem.hasOwnProperty(`required`)) {
                                if (Hflow.isBoolean(bundleItem.required)) {
                                    formatedBundleItem.required = bundleItem.required;
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable required for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`stronglyTyped`)) {
                                if (Hflow.isBoolean(bundleItem.stronglyTyped)) {
                                    formatedBundleItem.stronglyTyped = bundleItem.stronglyTyped;
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable strongly typed for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`oneTypeOf`)) {
                                if (Hflow.isSchema({
                                    oneTypeOf: [
                                        `string`
                                    ]
                                }).of(bundleItem)) {
                                    if (!Hflow.isEmpty(bundleItem.oneTypeOf)) {
                                        formatedBundleItem.oneOfTypes = bundleItem.oneTypeOf;
                                    } else {
                                        Hflow.log(`error`, `DataElement.format - Bundle constrainable one of types for key:${bundleKey} is empty.`);
                                    }
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable one of types for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`oneOf`)) {
                                if (Hflow.isSchema({
                                    oneOf: [
                                        `number|string`
                                    ]
                                }).of(bundleItem)) {
                                    if (!Hflow.isEmpty(bundleItem.oneOf)) {
                                        formatedBundleItem.oneOfValues = bundleItem.oneOf;
                                    } else {
                                        Hflow.log(`error`, `DataElement.format - Bundle constrainable one of values for key:${bundleKey} is empty.`);
                                    }
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable one of values for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`bounded`)) {
                                if (Hflow.isSchema({
                                    bounded: [
                                        `number`
                                    ]
                                }).of(bundleItem)) {
                                    if (bundleItem.bounded.length === 2) {
                                        formatedBundleItem.boundarydValues = bundleItem.bounded;
                                    } else {
                                        Hflow.log(`error`, `DataElement.format - Bundle constrainable bounding range for key:${bundleKey} is invalid.`);
                                    }
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable bounded range for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`constrainable`)) {
                                if (Hflow.isSchema({
                                    constrainable: {
                                        constraint: `object`,
                                        target: `object`
                                    }
                                }).of(bundleItem)) {
                                    formatedBundleItem.constrainable = bundleItem.constrainable;
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle constrainable for key:${bundleKey} is invalid.`);
                                }
                            }
                            if (bundleItem.hasOwnProperty(`observable`)) {
                                if (Hflow.isSchema({
                                    observable: {
                                        condition: `object`,
                                        subscriber: `object`
                                    }
                                }).of(bundleItem)) {
                                    formatedBundleItem.observable = bundleItem.observable;
                                } else {
                                    Hflow.log(`error`, `DataElement.format - Bundle observable for key:${bundleKey} is invalid.`);
                                }
                            }
                            formatedBundleItem.value = bundleItem.value;
                        } else if (Hflow.isObject(bundleItem) && bundleItem.hasOwnProperty(`computable`)) {
                            if (Hflow.isSchema({
                                computable: {
                                    contexts: `array`,
                                    compute: `function`
                                }
                            }).of(bundleItem)) {
                                formatedBundleItem.computable = bundleItem.computable;
                            } else {
                                Hflow.log(`error`, `DataElement.format - Bundle computable for key:${bundleKey} is invalid.`);
                            }
                        } else {
                            formatedBundleItem.value = bundleItem;
                            // if (Hflow.isObject(bundleItem)) {
                            //     if (!Hflow.isEmpty(bundleItem)) {
                            //         formatedBundleItem.value = bundleItem;
                            //     } else {
                            //         Hflow.log(`error`, `DataElement.format - Bundle key:${bundleKey} is empty.`);
                            //     }
                            // } else {
                            //     formatedBundleItem.value = bundleItem;
                            // }
                        }
                    }
                } else {
                    Hflow.log(`error`, `DataElement.format - Bundle key:${bundleKey} is invalid.`);
                }
            });

            return formatedBundle;
        }
    },
    /**
     * @description - Read a data bundle.
     *
     * @method read
     * @param {object} bundle
     * @param {string} bundleName
     * @return {object}
     */
    read: function read (bundle, bundleName) {
        // FIXME: Crash occurs when bundle object has circular reference.
        const data = this;

        if (!Hflow.isObject(bundle)) {
            Hflow.log(`error`, `DataElement.read - Input data content bundle is invalid.`);
        } else if (!Hflow.isString(bundleName)) {
            Hflow.log(`error`, `DataElement.read - Input data content bundle name is invalid.`);
        } else {
            const pathId = bundleName;
            const rootKey = bundleName;
            /* format bundle to correct format */
            const formatedBundle = data.format(bundle);
            const mutable = formatedBundle.mutable;
            let cursor;

            /* create a root data content for bundle */
            data._rootContent[bundleName] = {};
            cursor = data.select(pathId);

            /* read bundle and assign descriptors */
            Hflow.forEach(formatedBundle, (bundleItem, bundleKey) => {
                if (bundleKey !== `mutable`) {
                    if (bundleItem.hasOwnProperty(`value`)) {
                        const value = bundleItem.value;
                        if (Hflow.isDefined(value)) {
                            cursor.setContentItem(value, bundleKey);
                        } else {
                            Hflow.log(`error`, `DataElement.read - Cannot set undefined data bundle item key:${bundleKey}.`);
                        }
                    }
                    data._assignDescription(cursor, bundleItem, bundleKey);
                }
            });

            if (Hflow.isEmpty(data._rootContent[bundleName])) {
                Hflow.log(`error`, `DataElement.read - Root data content item name:${bundleName} is empty.`);
            } else {
                data._updateMMap(rootKey);
                if (!mutable) {
                    data.setImmutability(rootKey, true);
                }
                return {
                    select: data.select.bind(data)
                };
            }
        }
    }
    /**
     * @description - Log data element as a string for debuging.
     *
     * @method DEBUG_LOG
     * @return void
     */
    // DEBUG_LOG: function DEBUG_LOG () {
    //     const data = this;
    //     data._mutation.mMap.DEBUG_LOG();
    //     Hflow.log(`info`, JSON.stringify(data._mutation.records, null, `\t`));
    // }
};

/**
 * @description - A data element module.
 * @module DataElement
 * @description - A component`s data element module.
 * @param {object} mutationHistoryDepth - The max depth of mutation history record.
 * @return {object}
 */
export default function DataElement (mutationHistoryDepth = DEFAULT_MUTATION_HISTORY_DEPTH) {
    mutationHistoryDepth = Hflow.isInteger(mutationHistoryDepth) ? mutationHistoryDepth : DEFAULT_MUTATION_HISTORY_DEPTH;
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
            configurable: false,
            enumerable: false
        },
        _mutation: {
            value: {
                records: [],
                immutableRootKeys: [],
                mMap: TreeElement(),
                timeIndex: {},
                timestamp: {},
                mutationHistoryDepth
            },
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    if (!Hflow.isObject(element)) {
        Hflow.log(`error`, `DataElement - Unable to create a data element instance.`);
    } else {
        const revealFrozen = Hflow.compose(Hflow.reveal, Object.freeze);
        /* reveal only the public properties and functions */
        return revealFrozen(element);
    }
}