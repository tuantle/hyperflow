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
 * @module ImmutableData
 * @description -  An immutable data that is used for defining component state.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    isNumeric,
    isString,
    isBoolean,
    isDefined,
    isObject,
    isArray,
    isNonEmptyString,
    isNonEmptyObject,
    isNonEmptyArray,
    isEmpty,
    isSchema,
    arrayToString,
    stringToArray,
    clear,
    compose,
    fallback,
    retrieve,
    reveal,
    forEach,
    log
} from '../utils/common-util';

import DataDescriptor from './data-descriptor';

import DataCursor from './data-cursor';

import MutationMap from './mutation-map';

/* number mutations to persist in mutation map before roll-over */
const DEFAULT_MUTATION_HISTORY_SIZE = 32;

const revealFrozen = compose(reveal, Object.freeze);

/**
 * @description - An immutable data prototypes.
 *
 * ImmutableDataPrototype
 */
const ImmutableDataPrototype = Object.create({}).prototype = {
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

        option = isObject(option) ? option : {};
        pathId = isString(pathId) ? stringToArray(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (!isNonEmptyArray(pathId)) {
                log(`error`, `ImmutableData._getAccessor - Input pathId is invalid.`);
            }
        }

        const [ rootKey ] = pathId;
        const mRecords = data._mutation.records;
        const immutableRootKeys = data._mutation.immutableRootKeys;

        if (immutableRootKeys.includes(rootKey) && isNonEmptyArray(mRecords)) {
            data._updateMMap(rootKey, option);
            clear(data._mutation.records);
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

        pathId = isString(pathId) ? stringToArray(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (!isNonEmptyArray(pathId)) {
                log(`error`, `ImmutableData._recordMutation - Input pathId is invalid.`);
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

        if (ENV.DEVELOPMENT) {
            if (!isObject(node)) {
                log(`error`, `ImmutableData._deepUpdateMMap - Input node is invalid.`);
            } else if (!isString(pathId)) {
                log(`error`, `ImmutableData._deepUpdateMMap - Input pathId is invalid.`);
            } else if (!isArray(records)) {
                log(`error`, `ImmutableData._deepUpdateMMap - Input records is invalid.`);
            }
        }

        const cursor = data.select(pathId);
        let content = {};
        let [ mutatedKeys ] = isNonEmptyArray(records) ? records : [[]];

        if (cursor.getContentType() === `object`) {
            content.cache = {};
            content.accessor = {};
        } else if (cursor.getContentType() === `array`) {
            content.cache = [];
            content.accessor = [];
        }

        cursor.forEach((item, key) => {
            if (isNonEmptyObject(item) || isNonEmptyArray(item)) {
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
                    content.cache[key] = item;
                    Object.defineProperty(content.accessor, key, {
                        get () {
                            return cursor.isImmutable() ? node.getContentCacheItem(key) : cursor.getContentItem(key);
                        },
                        set (value) {
                            cursor.setContentItem(value, key);
                        },
                        configurable: true,
                        enumerable: true
                    });
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
    _updateMMap (rootKey, option = {}) {
        const data = this;
        const mMap = data._mutation.mMap;
        const mutationHistorySize = data._mutation.historySize;
        const rootContent = data._rootContent;
        const pathId = rootKey;
        const {
            /* skip referal of pathIds in the exclusion list. */
            excludedReferalPathIds
        } = fallback({
            excludedReferalPathIds: []
        }).of(option);

        if (ENV.DEVELOPMENT) {
            if (!isString(rootKey) || !Object.prototype.hasOwnProperty.call(rootContent, rootKey)) {
                log(`error`, `ImmutableData._updateMMap - Root data content key:${rootKey} is undefined.`);
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
                ...option,
                excludedReferalPathIds: excludedReferalPathIds.filter((_pathId) => isNonEmptyString(_pathId)).map((_pathId) => {
                    _pathId = stringToArray(_pathId, `.`);
                    if (_pathId[0] === rootKey) {
                        _pathId[0] = oldRootKey;
                        return arrayToString(_pathId, `.`);
                    }
                })
            });

            newRootNode.freezeContent();
            data._mutation.timeIndex[rootKey]++;
            data._mutation.timestamp[rootKey].push((new Date()).getTime() - data._mutation.timestampRef);

            if (mutationHistorySize > 0 && mMap.getRootCount() > mutationHistorySize) {
                let timeIndexOffset = mutationHistorySize >> 1;
                const startingTimeIndex = data._mutation.timeIndex[rootKey] - (mutationHistorySize >> 1);
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

        if (ENV.DEVELOPMENT) {
            if (!isObject(cursor)) {
                log(`error`, `ImmutableData._assignDescription - Input cursor object is invalid.`);
            } else if (!isObject(bundleItem)) {
                log(`error`, `ImmutableData._assignDescription - Input bundle item object is invalid.`);
            } else if (!isString(bundleKey)) {
                log(`error`, `ImmutableData._assignDescription - Input bundle key is invalid.`);
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
        if (isArray(oneOfTypes)) {
            cursor.describeItem(bundleKey).asOneOfTypes(oneOfTypes);
        }
        /* description for one of values item */
        if (isArray(oneOfValues)) {
            cursor.describeItem(bundleKey).asOneOfValues(oneOfValues);
        }
        /* description for bounded item */
        if (isArray(boundarydValues)) {
            const [
                lowerBound,
                upperBound
            ] = boundarydValues;
            cursor.describeItem(bundleKey).asBounded(lowerBound, upperBound);
        }
        /* description for constrainable item */
        if (isObject(constrainable)) {
            const {
                constraint,
                target
            } = constrainable;

            if (!isEmpty(target)) {
                Object.entries(target).filter(([ constraintKey, constraintValue ]) => { // eslint-disable-line
                    return Object.prototype.hasOwnProperty.call(constraint, constraintKey);
                }).reduce((targetPaths, [ constraintKey, constraintValue ]) => { // eslint-disable-line
                    return targetPaths.concat(constraintValue);
                }, []).filter((targetPath) => {
                    return isString(targetPath) || isArray(targetPath);
                }).map((targetPath) => {
                    return isString(targetPath) ? stringToArray(targetPath, `.`) : targetPath;
                }).forEach((targetPath) => {
                    const targetKey = targetPath.pop();
                    const pathId = `${cursor.pathId}.${bundleKey}.${arrayToString(targetPath, `.`)}`;

                    data.select(pathId).describeItem(targetKey).asConstrainable(constraint);
                });
            } else {
                cursor.describeItem(bundleKey).asConstrainable(constraint);
            }
        }
        /* description for observable item */
        if (isObject(observable)) {
            if (isBoolean(observable) && observable) {
                cursor.describeItem(bundleKey).asObservable();
            } else if (isObject(observable)) {
                const {
                    condition,
                    subscriber
                } = observable;

                cursor.describeItem(bundleKey).asObservable(condition, subscriber);
            }
        }
        /* description for computable item */
        if (isObject(computable)) {
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

        if (!(isString(pathId) || isArray(pathId))) {
            return false;
        }

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        const content = retrieve(pathId, `.`).from(data._rootContent);

        return isObject(content);
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

        immutable = isBoolean(immutable) ? immutable : true;

        if (ENV.DEVELOPMENT) {
            if (!isString(rootKey) || !Object.prototype.hasOwnProperty.call(rootContent, rootKey)) {
                log(`error`, `ImmutableData.setImmutability - Root data content key:${rootKey} is undefined.`);
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
     * @method setMutationHistorySize
     * @param {number} mutationHistorySize
     * @return void
     */
    setMutationHistorySize (mutationHistorySize) {
        const data = this;

        if (ENV.DEVELOPMENT) {
            if (!isNumeric(mutationHistorySize) && mutationHistorySize > 1) {
                log(`error`, `ImmutableData.select - Input mutation history size is invalid.`);
            }
            if (mutationHistorySize < DEFAULT_MUTATION_HISTORY_SIZE) {
                log(`warn1`, `ImmutableData.select - Input mutation history size value:${mutationHistorySize} is less than default value of:${DEFAULT_MUTATION_HISTORY_SIZE}.`);
            }
        }

        data._mutation.historySize = mutationHistorySize;
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

        if (ENV.DEVELOPMENT) {
            if (!isString(rootKey) || !Object.prototype.hasOwnProperty.call(rootContent, rootKey)) {
                log(`error`, `ImmutableData.flush - Root data content key:${rootKey} is undefined.`);
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

        pathId = isString(pathId) ? stringToArray(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (!isNonEmptyArray(pathId)) {
                log(`error`, `ImmutableData.select - Input pathId is invalid.`);
            }
        }

        const cursor = DataCursor(data, pathId);

        if (ENV.DEVELOPMENT) {
            if (!isObject(cursor)) {
                log(`error`, `ImmutableData.select - Unable to create a data content cursor instance.`);
            }
        }

        /* reveal only the public properties and functions */
        return revealFrozen(cursor);
    },

    /**
     * @description - Helper function to format an object to ImmutableData bundles.
     *
     * @method format
     * @param {bundle} bundle
     * @return {object}
     */
    format (bundle) {
        if (ENV.DEVELOPMENT) {
            if (!isObject(bundle)) {
                log(`error`, `ImmutableData.format - Input bundle object is invalid.`);
            }
        }

        let formatedBundle = {};
        let formatedBundleItem;

        forEach(bundle, (bundleItem, bundleKey) => {
            if (isDefined(bundleItem)) {
                formatedBundle[bundleKey] = {};
                formatedBundleItem = formatedBundle[bundleKey];

                if (Object.prototype.hasOwnProperty.call(bundleItem, `value`) && isDefined(bundleItem.value)) {
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `required`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isBoolean(bundleItem.required)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable required for key:${bundleKey} is invalid.`);
                            }
                        }
                        formatedBundleItem.required = bundleItem.required;
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `stronglyTyped`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isBoolean(bundleItem.stronglyTyped)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable strongly typed for key:${bundleKey} is invalid.`);
                            } else if (Object.prototype.hasOwnProperty.call(bundleItem, `oneTypeOf`)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable for key:${bundleKey} is conflicted with one of types.`);
                            }
                        }
                        formatedBundleItem.stronglyTyped = bundleItem.stronglyTyped;
                    } else {
                        if (!Object.prototype.hasOwnProperty.call(bundleItem, `oneTypeOf`)) {
                            formatedBundleItem.stronglyTyped = true;
                            log(`warn0`, `ImmutableData.format - Bundle constrainable strongly typed for key:${bundleKey} is set to true by default if not set.`);
                        }
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `oneTypeOf`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                oneTypeOf: [ `string` ]
                            }).of(bundleItem)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable one of types for key:${bundleKey} is invalid.`);
                            } else if (isEmpty(bundleItem.oneTypeOf)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable one of types for key:${bundleKey} is empty.`);
                            } else if (Object.prototype.hasOwnProperty.call(bundleItem, `stronglyTyped`)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable for key:${bundleKey} is conflicted with strongly typed.`);
                            }
                        }

                        formatedBundleItem.oneOfTypes = bundleItem.oneTypeOf;
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `oneOf`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                oneOf: [ `number|string` ]
                            }).of(bundleItem)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable one of values for key:${bundleKey} is invalid.`);
                            } else if (isEmpty(bundleItem.oneOf)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable one of values for key:${bundleKey} is empty.`);
                            }
                        }

                        formatedBundleItem.oneOfValues = bundleItem.oneOf;
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `bounded`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                bounded: [
                                    `number`
                                ]
                            }).of(bundleItem)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable bounded range for key:${bundleKey} is invalid.`);
                            } else if (bundleItem.bounded.length !== 2) {
                                log(`error`, `ImmutableData.format - Bundle constrainable bounding range for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.boundarydValues = bundleItem.bounded;
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `constrainable`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                constrainable: {
                                    constraint: `object`,
                                    target: `object`
                                }
                            }).of(bundleItem)) {
                                log(`error`, `ImmutableData.format - Bundle constrainable for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.constrainable = bundleItem.constrainable;
                    }
                    if (Object.prototype.hasOwnProperty.call(bundleItem, `observable`)) {
                        if (ENV.DEVELOPMENT) {
                            if (!isSchema({
                                observable: {
                                    condition: `object`,
                                    subscriber: `object`
                                }
                            }).of(bundleItem)) {
                                log(`error`, `ImmutableData.format - Bundle observable for key:${bundleKey} is invalid.`);
                            }
                        }

                        formatedBundleItem.observable = bundleItem.observable;
                    }

                    formatedBundleItem.value = bundleItem.value;
                } else if (isObject(bundleItem) && Object.prototype.hasOwnProperty.call(bundleItem, `computable`)) {
                    if (ENV.DEVELOPMENT) {
                        if (!isSchema({
                            computable: {
                                contexts: `array`,
                                compute: `function`
                            }
                        }).of(bundleItem)) {
                            log(`error`, `ImmutableData.format - Bundle computable for key:${bundleKey} is invalid.`);
                        }
                    }

                    formatedBundleItem.computable = bundleItem.computable;
                } else {
                    formatedBundleItem.value = bundleItem;

                    // if (isObject(bundleItem)) {
                    //     if (ENV.DEVELOPMENT) {
                    //         if (isEmpty(bundleItem)) {
                    //             log(`error`, `ImmutableData.format - Bundle key:${bundleKey} is empty.`);
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

        if (ENV.DEVELOPMENT) {
            if (!isObject(bundle)) {
                log(`error`, `ImmutableData.read - Input data content bundle is invalid.`);
            } else if (!isString(bundleName)) {
                log(`error`, `ImmutableData.read - Input data content bundle name is invalid.`);
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
        forEach(formatedBundle, (bundleItem, bundleKey) => {
            if (Object.prototype.hasOwnProperty.call(bundleItem, `value`)) {
                const value = bundleItem.value;

                if (ENV.DEVELOPMENT) {
                    if (!isDefined(value)) {
                        log(`error`, `ImmutableData.read - Cannot set undefined data bundle item key:${bundleKey}.`);
                    }
                }

                cursor.setContentItem(value, bundleKey);
            }
            data._assignDescription(cursor, bundleItem, bundleKey);
        });

        if (ENV.DEVELOPMENT) {
            if (isEmpty(data._rootContent[bundleName])) {
                log(`error`, `ImmutableData.read - Root data content item name:${bundleName} is empty.`);
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
                immutable = isBoolean(immutable) ? immutable : true;
                data.setImmutability(rootKey, immutable);
                return data;
            }
        };
    }

    /**
     * @description - Log as a string for debuging.
     *
     * @method DEBUG_LOG
     * @return void
     */
    // DEBUG_LOG () {
    //     const data = this;
    //     data._mutation.mMap.DEBUG_LOG();
    //     log(`debug`, JSON.stringify(data._mutation.records, null, `\t`));
    // }
};

/**
 * @description - An immutable data module.
 *
 * @module ImmutableData
 * @return {object}
 */
export default function ImmutableData () {
    const data = Object.create(ImmutableDataPrototype, {
        _descriptor: {
            value: DataDescriptor(),
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
                mMap: MutationMap(),
                timeIndex: {},
                timestamp: {},
                historySize: DEFAULT_MUTATION_HISTORY_SIZE,
                timestampRef: new Date().getTime()
            },
            writable: false,
            configurable: true,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(data)) {
            log(`error`, `ImmutableData - Unable to create an immutable data instance.`);
        }
    }

    return compose(reveal, Object.freeze)(data);
}
