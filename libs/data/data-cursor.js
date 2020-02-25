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
 * @module DataCursor
 * @description -  A data cursor module.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 *
 * @flow
 */
'use strict'; // eslint-disable-line

import {
    ENV,
    typeOf,
    isInteger,
    isNumeric,
    isString,
    isBoolean,
    isDefined,
    isFunction,
    isObject,
    isArray,
    isNonEmptyObject,
    isNonEmptyArray,
    isEmpty,
    arrayToString,
    stringToArray,
    clone,
    retrieve,
    forEach,
    log
} from '../utils/common-util';

import requiredConstraint from './data-descriptions/constraints/required-constraint';

import boundedConstraint from './data-descriptions/constraints/bounded-constraint';

import oneOfValuesConstraint from './data-descriptions/constraints/one-of-values-constraint';

import oneOfTypesConstraint from './data-descriptions/constraints/one-of-types-constraint';

import stronglyTypedConstraint from './data-descriptions/constraints/strongly-typed-constraint';

/**
 * @description - A data cursor prototypes.
 *
 * DataCursorPrototype
 */
const DataCursorPrototype = Object.create({}).prototype = {
    /**
     * @description - Helper function to create schema from a source object.
     *
     * @method _createSchema
     * @param {object} source
     * @return {object}
     * @private
     */
    _createSchema (source) {
        const cursor = this;

        if (ENV.DEVELOPMENT) {
            if (!(isObject(source) || isArray(source))) {
                log(`error`, `DataCursor._createSchema - Input source object is invalid.`);
            }
        }

        return Object.entries(source).reduce((schema, [ key, value ]) => {
            if (isObject(value)) {
                schema[key] = cursor._createSchema(value);
            } else if (isArray(value)) {
                schema[key] = value.map((arrayItem) => {
                    if (isObject(arrayItem)) {
                        return cursor._createSchema(arrayItem);
                    }
                    return typeOf(arrayItem);
                });
            } else if (cursor.isItemComputable(key)) {
                schema[key] = `computable`;
            } else if (cursor.isItemObservable(key)) {
                schema[key] = `observable`;
            } else {
                schema[key] = typeOf(value);
            }
            return schema;
        }, {});
    },

    /**
     * @description - At cursor, check if there is a data item in content at key.
     *
     * @method hasItem
     * @param {string|number} key
     * @return {boolean}
     */
    hasItem (key) {
        const cursor = this;

        return cursor._content.hasOwnProperty(key);
    },

    /**
     * @description - At cursor, check if it is immutable.
     *
     * @method isImmutable
     * @return {boolean}
     */
    isImmutable () {
        const cursor = this;

        return cursor._immutable;
    },

    /**
     * @description - At cursor, check that data item is bounded.
     *
     * @method isItemBounded
     * @param {string|number} key
     * @return {boolean}
     */
    isItemBounded (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`bounded`);
        }
        return false;
    },

    /**
     * @description - At cursor, check that data item is strongly typed.
     *
     * @method isItemStronglyTyped
     * @param {string|number} key
     * @return {boolean}
     */
    isItemStronglyTyped (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`stronglyTyped`);
        }
        return false;
    },

    /**
     * @description - At cursor, check that data item is one of values.
     *
     * @method isItemOneOfValues
     * @param {string|number} key
     * @return {boolean}
     */
    isItemOneOfValues (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`oneOf`);
        }
        return false;
    },

    /**
     * @description - At cursor, check that data item is one of types.
     *
     * @method isItemOneOfTypes
     * @param {string|number} key
     * @return {boolean}
     */
    isItemOneOfTypes (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`oneTypeOf`);
        }
        return false;
    },

    /**
     * @description - At cursor, check that data item is required.
     *
     * @method isItemRequired
     * @param {string|number} key
     * @return {boolean}
     */
    isItemRequired (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`required`);
        }
        return false;
    },

    /**
     * @description - At cursor, check that data item is constrainable.
     *
     * @method isItemConstrainable
     * @param {string|number} key
     * @return {boolean}
     */
    isItemConstrainable (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        return cursor.hasItem(key) ? cursor._descriptor.select(`constrainable`).hasDescription(pathId) : false;
    },

    /**
     * @description - At cursor, check that data item is computable.
     *
     * @method isItemComputable
     * @param {string|number} key
     * @return {boolean}
     */
    isItemComputable (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        return cursor.hasItem(key) ? cursor._descriptor.select(`computable`).hasDescription(pathId) : false;
    },

    /**
     * @description - At cursor, check that data item is observable.
     *
     * @method isItemObservable
     * @param {string|number} key
     * @return {boolean}
     */
    isItemObservable (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        return cursor.hasItem(key) ? cursor._descriptor.select(`observable`).hasDescription(pathId) : false;
    },

    /**
     * @description - At cursor, get pathId.
     *
     * @method getPathId
     * @return {string}
     */
    getPathId () {
        const cursor = this;

        return cursor._pathId;
    },

    /**
     * @description - At cursor, get key.
     *
     * @method getKey
     * @return {string|number}
     */
    getKey () {
        const cursor = this;

        return cursor._key;
    },

    /**
     * @description - At cursor, get data item accessor.
     *
     * @method getAccessor
     * @param {object} option
     * @return {object}
     */
    getAccessor (option = {}) {
        const cursor = this;
        const data = cursor._data;

        option = isObject(option) ? option : {};

        return data._getAccessor(cursor._pathId, option);
    },

    /**
     * @description - At cursor, get data type of content.
     *
     * @method getContentType
     * @return {string}
     */
    getContentType () {
        const cursor = this;

        return typeOf(cursor._content);
    },

    /**
     * @description - At cursor, get content item keys.
     *
     * @method getContentItemKeys
     * @return {string|number}
     */
    getContentItemKeys () {
        const cursor = this;

        return Object.keys(cursor._content);
    },

    /**
     * @description - At cursor, get data content item value.
     *
     * @method getContentItem
     * @param {string|number} key
     * @return {*}
     */
    getContentItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.getContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        const contentItem = cursor._content[key];

        return isObject(contentItem) || isArray(contentItem) ? clone(contentItem) : contentItem;
    },

    /**
     * @description - At cursor, set value to a data item.
     *
     * @method setContentItem
     * @param {*} item
     * @param {string|number} key
     * @return void
     */
    setContentItem (item, key) {
        const cursor = this;
        const data = cursor._data;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!isDefined(item)) {
                log(`error`, `DataCursor.setContentItem - Input data item with key:${key} at pathId:${pathId} is invalid.`);
            }
        }

        if (cursor.hasItem(key)) {
            /* check that data item is not computable */
            if (ENV.DEVELOPMENT) {
                if (cursor.isItemComputable(key)) {
                    log(`error`, `DataCursor.setContentItem - Data item key:${key} at pathId:${pathId} is already described as a computable.`);
                }
            }
            if (item === null && cursor._content[key] !== null) {
                cursor._content[key] = null;
                /* unassign descriptors if data item is strongly typed and/or is required */
                if (cursor.isItemStronglyTyped(key) || cursor.isItemRequired(key)) {
                    cursor.unDescribeItem(key).asConstrainable();
                }
                /* save change to mutation record at cursor if immutable */
                if (cursor.isImmutable()) {
                    data._recordMutation(pathId);
                }
            } else if (isObject(item) || isArray(item)) {
                if (isObject(item)) {
                    cursor._content[key] = {};

                    if (!isEmpty(item)) {
                        const innerCursor = data.select(pathId);

                        Object.entries(item).forEach(([ innerKey, innerItem ]) => {
                            innerCursor.setContentItem(innerItem, innerKey);
                        });
                    }
                    /* if data item is strongly typed and/or is required
                       reassign strongly typed and/or required descriptor for item and it`s nested items */
                    if (cursor.isItemStronglyTyped(key)) {
                        cursor.describeItem(key).asStronglyTyped();
                    }
                    if (cursor.isItemRequired(key)) {
                        cursor.describeItem(key).asRequired();
                    }
                } else if (isArray(item)) {
                    cursor._content[key] = [];

                    if (!isEmpty(item)) {
                        const innerCursor = data.select(pathId);
                        item.forEach((innerItem, innerKey) => {
                            innerCursor.setContentItem(innerItem, innerKey);
                        });
                    }
                    /* if data item is strongly typed and/or is required
                       reassign strongly typed and/or required descriptor for item and it`s nested items */
                    if (cursor.isItemStronglyTyped(key)) {
                        cursor.describeItem(key).asStronglyTyped();
                    }
                    if (cursor.isItemRequired(key)) {
                        cursor.describeItem(key).asRequired();
                    }
                }
                /* save change to mutation record at cursor if immutable */
                if (cursor.isImmutable()) {
                    data._recordMutation(pathId);
                }
            } else {
                if (cursor._content[key] !== item) {
                    cursor._content[key] = item;
                    /* save change to mutation record at cursor if immutable */
                    if (cursor.isImmutable()) {
                        data._recordMutation(pathId);
                    }
                }
            }
        } else {
            if (item === null) {
                cursor._content[key] = null;
                /* save change to mutation record at cursor if immutable */
                if (cursor.isImmutable()) {
                    data._recordMutation(pathId);
                }
            } else {
                if (isObject(item) || isArray(item)) {
                    if (isObject(item)) {
                        cursor._content[key] = {};

                        if (!isEmpty(item)) {
                            const innerCursor = data.select(pathId);

                            Object.entries(item).forEach(([ innerKey, innerItem ]) => {
                                innerCursor.setContentItem(innerItem, innerKey);
                            });
                        }

                        /* set the nested item as strongly typed and/or required if top item is a strongly typed and/or required */
                        if (cursor._descriptor.select(`constrainable`).hasDescription(cursor._pathId)) {
                            const description = cursor._descriptor.select(`constrainable`).getDescription(cursor._pathId);

                            if (description.hasConstraint(`stronglyTyped`)) {
                                cursor.describeItem(key).asStronglyTyped();
                            }
                            if (description.hasConstraint(`required`)) {
                                cursor.describeItem(key).asRequired();
                            }
                        }
                    } else {
                        cursor._content[key] = [];

                        if (!isEmpty(item)) {
                            const innerCursor = data.select(pathId);
                            item.forEach((innerItem, innerKey) => {
                                innerCursor.setContentItem(innerItem, innerKey);
                            });
                        }

                        /* set the nested item as strongly typed and/or required if top item is a strongly typed and/or required */
                        if (cursor._descriptor.select(`constrainable`).hasDescription(cursor._pathId)) {
                            const description = cursor._descriptor.select(`constrainable`).getDescription(cursor._pathId);

                            if (description.hasConstraint(`stronglyTyped`)) {
                                cursor.describeItem(key).asStronglyTyped();
                            }
                            if (description.hasConstraint(`required`)) {
                                cursor.describeItem(key).asRequired();
                            }
                        }
                    }
                } else {
                    cursor._content[key] = item;
                    /* set the nested item as strongly typed and/or required if top item is a strongly typed and/or required */
                    if (cursor._descriptor.select(`constrainable`).hasDescription(cursor._pathId)) {
                        const description = cursor._descriptor.select(`constrainable`).getDescription(cursor._pathId);

                        if (description.hasConstraint(`stronglyTyped`)) {
                            cursor.describeItem(key).asStronglyTyped();
                        }
                        if (description.hasConstraint(`required`)) {
                            cursor.describeItem(key).asRequired();
                        }
                    }
                }
                /* save change to mutation record at cursor if immutable */
                if (cursor.isImmutable()) {
                    data._recordMutation(pathId);
                }
            }
        }
    },

    /**
     * @description - At cursor, recall and return the previous content item and its timestamp from mutation history.
     *
     * @method recallContentItem
     * @param {string|number} key
     * @param {number} timeIndexOffset
     * @return {object}
     */
    recallContentItem (key, timeIndexOffset) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.recallContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            } else if (!isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                log(`error`, `DataCursor.recallContentItem - Input time index offset must be non-zero and negative.`);
            } else if (!cursor.isImmutable()) {
                log(`error`, `DataCursor.recallContentItem - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            }
        }

        const data = cursor._data;
        const mMap = data._mutation.mMap;
        const cursorTimestamps = data._mutation.timestamp[cursor._rootKey];
        const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
        const recallTimeIndex = currentTimeIndex + timeIndexOffset;
        const recallTimeCount = cursorTimestamps.length;
        const leafType = cursor.getContentType(key) !== `object` || cursor.getContentType(key) !== `array`;
        let pathIdAtTimeIndex = stringToArray(pathId, `.`);

        if (recallTimeCount > recallTimeIndex) {
            if (leafType) {
                pathIdAtTimeIndex.pop();
            }
            pathIdAtTimeIndex.shift();
            pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
            pathIdAtTimeIndex = arrayToString(pathIdAtTimeIndex, `.`);

            if (!mMap.hasNode(pathIdAtTimeIndex)) {
                if (ENV.DEVELOPMENT) {
                    log(`warn1`, `DataCursor.recallContentItem - Data item key:${key} at pathId:${pathId} is undefine at time index:${recallTimeIndex}.`);
                }
                return {
                    timestamp: null,
                    key,
                    recallTimeIndex: null,
                    recallTimeCount: null,
                    content: null
                };
            }

            return {
                timestamp: cursorTimestamps[recallTimeIndex],
                key,
                recallTimeIndex: -recallTimeIndex,
                recallTimeCount,
                content: leafType ? mMap.select(pathIdAtTimeIndex).getContent()[key] : mMap.select(pathIdAtTimeIndex).getContent()
            };
        }

        return {
            timestamp: null,
            key,
            recallTimeIndex: null,
            recallTimeCount: null,
            content: null
        };
    },

    /**
     * @description - At cursor, recall and return all the previous content items and timestamps from mutation history.
     *
     * @method recallAllContentItems
     * @param {string|number} key
     * @return {object}
     */
    recallAllContentItems (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.recallAllContentItems - Data item key:${key} at pathId:${pathId} is not defined.`);
            } else if (!cursor.isImmutable()) {
                log(`error`, `DataCursor.recallAllContentItems - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            }
        }

        const data = cursor._data;
        const mMap = data._mutation.mMap;
        const cursorTimestamps = data._mutation.timestamp[cursor._rootKey];
        const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
        const recallTimeCount = cursorTimestamps.length;
        const leafType = cursor.getContentType(key) !== `object` || cursor.getContentType(key) !== `array`;
        let timeIndexOffset = -1;

        return cursorTimestamps.slice(1).map((cursorTimestamp) => {
            const recallTimeIndex = currentTimeIndex + timeIndexOffset;
            let pathIdAtTimeIndex = stringToArray(pathId, `.`);

            timeIndexOffset--;

            if (leafType) {
                pathIdAtTimeIndex.pop();
            }

            pathIdAtTimeIndex.shift();
            pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
            pathIdAtTimeIndex = arrayToString(pathIdAtTimeIndex, `.`);
            return {
                timestamp: cursorTimestamp,
                pathIdAtTimeIndex
            };
        }).filter((timeCursor) => mMap.hasNode(timeCursor.pathIdAtTimeIndex)).map((timeCursor) => {
            return {
                timestamp: timeCursor.timestamp,
                key,
                recallTimeCount,
                content: leafType ? mMap.select(timeCursor.pathIdAtTimeIndex).getContent()[key] : mMap.select(timeCursor.pathIdAtTimeIndex).getContent()
            };
        });
    },

    /**
     * @description - At cursor, get the description of an item.
     *
     * @method getItemDescription
     * @param {string} type
     * @return {object}
     */
    getItemDescription (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.getItemDescription - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        return {
            /**
             * @description - Get item constrainable description.
             *
             * @method getItemDescription.ofConstrainable
             * @return {object}
             */
            ofConstrainable () {
                if (ENV.DEVELOPMENT) {
                    if (!cursor.isItemConstrainable(key)) {
                        log(`error`, `DataCursor.getItemDescription.ofConstrainable - Data item key:${key} at pathId:${pathId} does not have a constrainable description.`);
                    }
                }

                return cursor._descriptor.select(`constrainable`).getDescription(pathId);
            },
            /**
             * @description - Get item computable description.
             *
             * @method getItemDescription.ofComputable
             * @return {object}
             */
            ofComputable () {
                if (ENV.DEVELOPMENT) {
                    if (!cursor.isItemComputable(key)) {
                        log(`error`, `DataCursor.getItemDescription.ofComputable - Data item key:${key} at pathId:${pathId} does not have a computable description.`);
                    }
                }

                return cursor._descriptor.select(`computable`).getDescription(pathId);
            },
            /**
             * @description - Get item observable description.
             *
             * @method getItemDescription.ofObservable
             * @return {object}
             */
            ofObservable () {
                if (ENV.DEVELOPMENT) {
                    if (!cursor.isItemObservable(key)) {
                        log(`error`, `DataCursor.getItemDescription.ofObservable - Data item key:${key} at pathId:${pathId} does not have an observable description.`);
                    }
                }

                return cursor._descriptor.select(`observable`).getDescription(pathId);
            }
        };
    },

    /**
     * @description - At cursor, give descriptions to an item.
     *
     * @method describeItem
     * @param {string|number} key
     * @return {object}
     */
    describeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.describeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        const constrainableItem = cursor.isItemConstrainable(key);
        const computableItem = cursor.isItemComputable(key);
        const observableItem = cursor.isItemObservable(key);

        return {
            /**
             * @description - Describe item with a one of values constraint.
             *
             * @method describeItem.asOneOfValues
             * @param {array} values
             * @return {object}
             */
            asOneOfValues (values) {
                if (ENV.DEVELOPMENT) {
                    if (!isArray(values) || !isNonEmptyArray(values)) {
                        log(`error`, `DataCursor.describeItem.asOneOfValues - Input values are invalid.`);
                    } else if (!values.every((value) => isString(value) || isNumeric(value))) {
                        log(`error`, `DataCursor.describeItem.asOneOfValues - Value must be either numeric or string.`);
                    } else if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asOneOfValues - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = oneOfValuesConstraint(values);

                if (!descriptor.hasDescription(pathId)) {
                    const descPreset = {
                        key,
                        constraint
                    };
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    descriptor.getDescription(pathId).addConstraint(
                        constraint.oneOf.constrainer,
                        constraint.oneOf.condition,
                        `oneOf`
                    );
                }

                return this;
            },
            /**
             * @description - Describe item with a one of types constraint.
             *
             * @method describeItem.asOneOfTypes
             * @param {array} types
             * @return {object}
             */
            asOneOfTypes (types) {
                if (ENV.DEVELOPMENT) {
                    if (!isArray(types) || !isNonEmptyArray(types)) {
                        log(`error`, `DataCursor.describeItem.asOneOfTypes - Input types are invalid.`);
                    } else if (!types.every((type) => isString(type))) {
                        log(`error`, `DataCursor.describeItem.asOneOfTypes - Type value must be string.`);
                    } else if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asOneOfTypes - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = oneOfTypesConstraint(types);
                if (!descriptor.hasDescription(pathId)) {
                    const descPreset = {
                        key,
                        constraint
                    };
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    descriptor.getDescription(pathId).addConstraint(
                        constraint.oneTypeOf.constrainer,
                        constraint.oneTypeOf.condition,
                        `oneTypeOf`
                    );
                }

                return this;
            },
            /**
             * @description - Describe item with a required constraint.
             *
             * @method describeItem.asRequired
             * @return {object}
             */
            asRequired () {
                function deepAssignDescription (_pathId, _content, _key) {
                    const descriptor = cursor._descriptor.select(`constrainable`);
                    const constraint = requiredConstraint();
                    if (!descriptor.hasDescription(_pathId)) {
                        const descPreset = {
                            key: _key,
                            constraint
                        };
                        descriptor.addDescription(_pathId).assign(descPreset).to(_content);
                    } else {
                        descriptor.getDescription(_pathId).addConstraint(
                            constraint.required.constrainer,
                            null,
                            `required`
                        );
                    }

                    /* recursively set requirable description to nested objects */
                    if (isNonEmptyObject(_content[_key])) {
                        Object.keys(_content[_key]).forEach((innerKey) => {
                            deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                        });
                    }
                }

                if (ENV.DEVELOPMENT) {
                    if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asRequired - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                deepAssignDescription(pathId, cursor._content, key);

                return this;
            },
            /**
             * @description - Describe item with a strongly typed constraint.
             *
             * @method describeItem.asStronglyTyped
             * @return void
             */
            asStronglyTyped () {
                function deepAssignDescription (_pathId, _content, _key) {
                    const descriptor = cursor._descriptor.select(`constrainable`);
                    const constraint = stronglyTypedConstraint();
                    if (!descriptor.hasDescription(_pathId)) {
                        const descPreset = {
                            key: _key,
                            constraint
                        };
                        descriptor.addDescription(_pathId).assign(descPreset).to(_content);
                    } else {
                        descriptor.getDescription(_pathId).addConstraint(
                            constraint.stronglyTyped.constrainer,
                            null,
                            `stronglyTyped`);
                    }

                    /* recursively set strongly typed description to nested objects */
                    if (isNonEmptyObject(_content[_key])) {
                        Object.keys(_content[_key]).forEach((innerKey) => {
                            deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                        });
                    }
                }

                if (ENV.DEVELOPMENT) {
                    if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asStronglyTyped - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                deepAssignDescription(pathId, cursor._content, key);

                return this;
            },
            /**
             * @description - Describe item with a bounding constraint.
             *
             * @method describeItem.asBounded
             * @param {object} lowerBound
             * @param {object} upperBound
             * @return {object}
             */
            asBounded (lowerBound, upperBound) {
                if (ENV.DEVELOPMENT) {
                    if (!isNumeric(lowerBound) && !isNumeric(upperBound)) {
                        log(`error`, `DataCursor.describeItem.asBounded - Input bouding range values are must be numeric.`);
                    } else if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asBounded - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = boundedConstraint(lowerBound, upperBound);
                if (!descriptor.hasDescription(pathId)) {
                    const descPreset = {
                        key,
                        constraint
                    };
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    descriptor.getDescription(pathId).addConstraint(
                        constraint.bounded.constrainer,
                        constraint.bounded.condition,
                        `bounded`);
                }

                return this;
            },
            /**
             * @description - Describe item as a constrainable.
             *
             * @method describeItem.asConstrainable
             * @param {object} constraint
             * @return void
             */
            asConstrainable (constraint) {
                if (ENV.DEVELOPMENT) {
                    if (!isObject(constraint) && Object.key(constraint).forEach((constraintKey) => {
                        return constraint[constraintKey].hasOwnProperty(`constrainer`) && isFunction(constraint[constraintKey].constrainer);
                        // return isSchema({
                        //     constrainer: `function`
                        // }).of(constraint[constraintKey]);
                    })) {
                        log(`error`, `DataCursor.describeItem.asConstrainable - Input constraint is invalid.`);
                    } else if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asConstrainable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);

                if (!descriptor.hasDescription(pathId)) {
                    const descPreset = {
                        key,
                        constraint
                    };
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    Object.entries(constraint).forEach(([ constraintKey, constraintValue ]) => {
                        descriptor.getDescription(pathId).addConstraint(
                            constraintValue.contrainer,
                            constraintValue.condition,
                            constraintKey
                        );
                    });
                }

                return this;
            },
            /**
             * @description - Describe item as an observable.
             *
             * @method describeItem.asObservable
             * @param {object} condition
             * @param {object} subscriber
             * @return void
             */
            asObservable (condition, subscriber) {
                if (ENV.DEVELOPMENT) {
                    if (computableItem) {
                        log(`error`, `DataCursor.describeItem.asObservable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                condition = isObject(condition) ? condition : {};
                subscriber = isObject(subscriber) ? subscriber : {};

                const descriptor = cursor._descriptor.select(`observable`);
                const descPreset = {
                    key,
                    condition,
                    subscriber
                };

                if (!descriptor.hasDescription(pathId)) {
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    forEach(condition, (trigger, conditionKey) => {
                        descriptor.getDescription(pathId).addCondition(trigger, conditionKey);
                    });
                    forEach(subscriber, (handler, handlerKey) => {
                        descriptor.getDescription(pathId).addSubscriber(handler, handlerKey);
                    });
                }

                return this;
            },
            /**
             * @description - Describe item as a computable.
             *
             * @method describeItem.asComputable
             * @param {array} contexts
             * @param {function} compute
             * @return void
             */
            asComputable (contexts, compute) {
                if (ENV.DEVELOPMENT) {
                    if (!isArray(contexts)) {
                        log(`error`, `DataCursor.describeItem.asComputable - Input computable contexts are invalid.`);
                    } else if (!isFunction(compute)) {
                        log(`error`, `DataCursor.describeItem.asComputable - Input compute function is invalid.`);
                    } else if (constrainableItem || observableItem) {
                        log(`error`, `DataCursor.describeItem.asComputable - Cannot redescribe computable to data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`computable`);
                const descPreset = {
                    key,
                    contexts,
                    compute
                };

                if (descriptor.hasDescription(pathId)) {
                    descriptor.removeDescription(pathId);
                }
                descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);

                return this;
            }
        };
    },

    /**
     * @description - At cursor, remove descriptions from an item.
     *
     * @method unDescribeItem
     * @param {string|number} key
     * @return {object}
     */
    unDescribeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                log(`error`, `DataCursor.unDescribeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        const constrainableItem = cursor.isItemComputable(key);
        const computableItem = cursor.isItemComputable(key);
        const observableItem = cursor.isItemObservable(key);

        return {
            /**
             * @description - Undescribe item as a constrainable.
             *
             * @method unDescribeItem.asConstrainable
             * @return void
             */
            asConstrainable () {
                if (constrainableItem) {
                    cursor._descriptor.select(`constrainable`).removeDescription(pathId);
                }
                return this;
            },
            /**
             * @description - Undescribe item as an observable.
             *
             * @method unDescribeItem.asObservable
             * @return void
             */
            asObservable () {
                if (observableItem) {
                    cursor._descriptor.select(`observable`).removeDescription(pathId);
                }
                return this;
            },
            /**
             * @description - Undescribe item as a computable.
             *
             * @method unDescribeItem.asComputable
             * @return void
             */
            asComputable () {
                if (computableItem) {
                    cursor._descriptor.select(`computable`).removeDescription(pathId);
                }
                return this;
            }
        };
    },

    /**
     * @description - At cursor, loop through all data values.
     *
     * @method forEach
     * @param {function} iterator - Iterator function.
     * @param {object} context - Object to become context (`this`) for the iterator function.
     * @return void
     */
    forEach (iterator, context) {
        const cursor = this;

        if (ENV.DEVELOPMENT) {
            if (!isFunction(iterator)) {
                log(`error`, `DataCursor.forEach - Input iterator callback is invalid.`);
            }
        }

        forEach(cursor._content, (item, key) => {
            iterator.call(context, item, key);
        });
    },

    /**
     * @description - At cursor, get data item as schema object.
     *
     * @method getSchema
     * @return {object}
     */
    getSchema () {
        const cursor = this;
        return cursor._createSchema(cursor._content);
    },

    /**
     * @description - At cursor, return data item as plain object.
     *
     * @method toObject
     * @return {object}
     */
    toObject () {
        const cursor = this;
        return clone(cursor._content);
    },

    /**
     * @description - At cursor, return data item as a JSON string.
     *
     * @method toString
     * @param {boolean} beautified
     * @return {string}
     */
    toString (beautified = true) {
        const cursor = this;

        beautified = isBoolean(beautified) ? beautified : true;

        return beautified ? JSON.stringify(cursor.toObject(), null, `\t`) : JSON.stringify(cursor.toObject());
    }
};

/**
 * @description - A data cursor module.
 * @module DataCursor
 * @param {object} data - Data object.
 * @param {string|array} pathId
 * @return {object}
 */
export default function DataCursor (data, pathId) {
    if (ENV.DEVELOPMENT) {
        if (!isObject(data)) {
            log(`error`, `DataCursor - Input data instance is invalid.`);
        } else if (!(isString(pathId) || isArray(pathId))) {
            log(`error`, `DataCursor - Input pathId is invalid.`);
        }
    }

    let rootKey = ``;
    let key = ``;
    /* parsing pathId and retrive content */
    const content = retrieve(pathId, `.`).from(data._rootContent);

    /* get the keys from pathId */
    if (isString(pathId)) {
        [ key ] = stringToArray(pathId, `.`).reverse();
        [ rootKey ] = stringToArray(pathId, `.`);
    }
    if (isArray(pathId)) {
        [ rootKey ] = pathId;
        [ key ] = pathId.slice(0).reverse();
        pathId = arrayToString(pathId, `.`);
    }

    /* check that content must be an object or array */
    if (ENV.DEVELOPMENT) {
        if (!(isObject(content) || isArray(content))) {
            log(`error`, `DataCursor - Invalid pathId. Last content in pathId must be an object or array.`);
        }
    }

    const cursor = Object.create(DataCursorPrototype, {
        _pathId: {
            value: pathId,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _immutable: {
            get () {
                return data._mutation.immutableRootKeys.includes(rootKey);
            },
            configurable: false,
            enumerable: false
        },
        _rootKey: {
            value: rootKey,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _key: {
            value: key,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _content: {
            value: content,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _descriptor: {
            value: data._descriptor,
            writable: false,
            configurable: false,
            enumerable: false
        },
        _data: {
            value: data,
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(cursor)) {
            log(`error`, `DataCursor - Unable to create a data cursor instance.`);
        }
    }

    return cursor;
}
