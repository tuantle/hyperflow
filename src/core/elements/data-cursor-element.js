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
 * @module DataCursorElement
 * @description -  A data cursor element.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
'use strict'; // eslint-disable-line

/* load default constrainable descriptor presets */
import required from './descriptors/presets/required-descriptor';
import boundedWithin from './descriptors/presets/bounded-within-descriptor';
import oneOfValues from './descriptors/presets/one-of-values-descriptor';
import oneOfTypes from './descriptors/presets/one-of-types-descriptor';
import stronglyTyped from './descriptors/presets/strongly-typed-descriptor';

/* load CommonElement */
import CommonElement from './common-element';

/* create CommonElement as Hflow object */
const Hflow = CommonElement();

/**
 * @description - A data cursor prototypes.
 *
 * DataCursorElementPrototype
 */
const DataCursorElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - At cursor, check if there is a data item in content at key.
     *
     * @method hasItem
     * @param {string|number} key
     * @return {boolean}
     */
    hasItem: function hasItem (key) {
        const cursor = this;

        return cursor._content.hasOwnProperty(key);
    },
    /**
     * @description - At cursor, check if it is immutable.
     *
     * @method isImmutable
     * @return {boolean}
     */
    isImmutable: function isImmutable () {
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
    isItemBounded: function isItemBounded (key) {
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
    isItemStronglyTyped: function isItemStronglyTyped (key) {
        const cursor = this;

        if (cursor.isItemConstrainable(key)) {
            const pathId = `${cursor._pathId}.${key}`;

            return cursor._descriptor.select(`constrainable`).getDescription(pathId).hasConstraint(`stronglyTyped`);
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
    isItemRequired: function isItemRequired (key) {
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
    isItemConstrainable: function isItemConstrainable (key) {
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
    isItemComputable: function isItemComputable (key) {
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
    isItemObservable: function isItemObservable (key) {
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
    getPathId: function getPathId () {
        const cursor = this;

        return cursor._pathId;
    },
    /**
     * @description - At cursor, get key.
     *
     * @method getKey
     * @return {string|number}
     */
    getKey: function getKey () {
        const cursor = this;

        return cursor._key;
    },
    /**
     * @description - At cursor, get data item accessor.
     *
     * @method getAccessor
     * @return {object}
     */
    getAccessor: function getAccessor () {
        const cursor = this;
        const data = cursor._data;

        return data._getAccessor(cursor._pathId);
    },
    /**
     * @description - At cursor, get data type of content.
     *
     * @method getContentType
     * @return {string}
     */
    getContentType: function getContentType () {
        const cursor = this;

        return Hflow.typeOf(cursor._content);
    },
    /**
     * @description - At cursor, get content item keys.
     *
     * @method getContentItemKeys
     * @return {string|number}
     */
    getContentItemKeys: function getContentItemKeys () {
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
    getContentItem: function getContentItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.getContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else {
            const contentItem = cursor._content[key];
            if (Hflow.isObject(contentItem) || Hflow.isArray(contentItem)) {
                // TODO: should freeze or clone the return content item?
                return Hflow.clone(contentItem);
                // return Object.freeze(contentItem);
            }
            return contentItem;
        }
    },
    /**
     * @description - At cursor, set value to a data item.
     *
     * @method setContentItem
     * @param {*} item
     * @param {string|number} key
     * @return void
     */
    setContentItem: function setContentItem (item, key) {
        const cursor = this;
        const data = cursor._data;
        const pathId = `${cursor._pathId}.${key}`;

        if (Hflow.isDefined(item)) {
            if (cursor.hasItem(key)) {
                /* check that data item is not computable */
                if (cursor.isItemComputable(key)) {
                    Hflow.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} is already described as a computable.`);
                } else {
                    if (Hflow.isObject(item) || Hflow.isArray(item)) {
                        if (Hflow.isObject(item)) {
                            if (Hflow.isEmpty(item)) {
                                Hflow.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} cannot be an empty object.`);
                            } else {
                                cursor._content[key] = {};
                                const innerCursor = data.select(pathId);
                                Object.keys(item).forEach((innerKey) => {
                                    innerCursor.setContentItem(item[innerKey], innerKey);
                                });
                            }
                        } else {
                            if (Hflow.isEmpty(item)) {
                                Hflow.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} cannot be an empty array.`);
                            } else {
                                cursor._content[key] = [];
                                const innerCursor = data.select(pathId);
                                item.forEach((innerItem, innerKey) => {
                                    innerCursor.setContentItem(innerItem, innerKey);
                                });
                            }
                        }

                        /* if data item is strongly typed and/or is required
                           reassign strongly typed and/or required descriptor for item and it`s nested items */
                        if (cursor.isItemStronglyTyped(key)) {
                            cursor.describeItem(key).asStronglyTyped();
                        }
                        if (cursor.isItemRequired(key)) {
                            cursor.describeItem(key).asRequired();
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
                }
            } else {
                if (Hflow.isObject(item) || Hflow.isArray(item)) {
                    if (Hflow.isObject(item)) {
                        if (Hflow.isEmpty(item)) {
                            Hflow.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} cannot be an empty object.`);
                        } else {
                            cursor._content[key] = {};
                            const innerCursor = data.select(pathId);
                            Object.keys(item).forEach((innerKey) => {
                                innerCursor.setContentItem(item[innerKey], innerKey);
                            });
                        }
                    } else {
                        if (Hflow.isEmpty(item)) {
                            Hflow.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} cannot be an empty array.`);
                        } else {
                            cursor._content[key] = [];
                            const innerCursor = data.select(pathId);
                            item.forEach((innerItem, innerKey) => {
                                innerCursor.setContentItem(innerItem, innerKey);
                            });
                        }
                    }
                    /* save change to mutation record at cursor if immutable */
                    if (cursor.isImmutable()) {
                        data._recordMutation(pathId);
                    }
                } else {
                    cursor._content[key] = item;
                    /* save change to mutation record at cursor if immutable */
                    if (cursor.isImmutable()) {
                        data._recordMutation(pathId);
                    }
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
            Hflow.log(`error`, `DataCursorElement.setContentItem - Input data item with key:${key} at pathId:${pathId} is invalid.`);
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
    recallContentItem: function recallContentItem (key, timeIndexOffset) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else if (!Hflow.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
            Hflow.log(`error`, `DataCursorElement.recallContentItem - Input time index offset must be non-zero and negative.`);
        } else {
            if (!cursor.isImmutable()) {
                Hflow.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            } else {
                const data = cursor._data;
                const mMap = data._mutation.mMap;
                const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
                const recallTimeIndex = currentTimeIndex + timeIndexOffset;
                const cursorTimestamps = data._mutation.timestamp[cursor._rootKey];
                let pathIdAtTimeIndex = Hflow.stringToArray(cursor._pathId, `.`);

                if (cursorTimestamps.length > recallTimeIndex) {
                    pathIdAtTimeIndex.shift();
                    pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
                    pathIdAtTimeIndex = Hflow.arrayToString(pathIdAtTimeIndex, `.`);

                    if (mMap.hasNode(pathIdAtTimeIndex)) {
                        return {
                            timestamp: cursorTimestamps[recallTimeIndex],
                            content: mMap.select(pathIdAtTimeIndex).getContent()
                        };
                    } else { // eslint-disable-line
                        Hflow.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is undefine at time index:${recallTimeIndex}.`);
                    }
                } else {
                    return {
                        timestamp: null,
                        content: null
                    };
                }
            }
        }
    },
    /**
     * @description - At cursor, recall and return all the previous content items and timestamps from mutation history.
     *
     * @method recallAllContentItems
     * @param {string|number} key
     * @return {object}
     */
    recallAllContentItems: function recallContentItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.recallAllContentItems - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else {
            if (!cursor.isImmutable()) {
                Hflow.log(`error`, `DataCursorElement.recallAllContentItems - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            } else {
                const data = cursor._data;
                const mMap = data._mutation.mMap;
                const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
                const timestamps = data._mutation.timestamp[cursor._rootKey];
                let timeIndexOffset = -1;

                return timestamps.slice(1).map((timestamp) => {
                    const recallTimeIndex = currentTimeIndex + timeIndexOffset;
                    let pathIdAtTimeIndex = Hflow.stringToArray(cursor._pathId, `.`);
                    timeIndexOffset--;
                    pathIdAtTimeIndex.shift();
                    pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
                    pathIdAtTimeIndex = Hflow.arrayToString(pathIdAtTimeIndex, `.`);

                    if (mMap.hasNode(pathIdAtTimeIndex)) {
                        return {
                            timestamp,
                            content: mMap.select(pathIdAtTimeIndex).getContent()
                        };
                    } else { // eslint-disable-line
                        Hflow.log(`warn1`, `DataCursorElement.recallAllContentItems - Data item key:${key} at pathId:${pathId} is undefine at time index:${recallTimeIndex}.`);
                        return {
                            timestamp: null,
                            content: null
                        };
                    }
                });
            }
        }
    },
    /**
     * @description - At cursor, get the description of an item.
     *
     * @method getItemDescription
     * @param {string} type
     * @return {object}
     */
    getItemDescription: function getItemDescription (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.getItemDescription - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else {
            return {
                /**
                 * @description - Get item constrainable description.
                 *
                 * @method getItemDescription.ofConstrainable
                 * @return {object}
                 */
                ofConstrainable: function ofConstrainable () {
                    if (!cursor.isItemObservable(key)) {
                        Hflow.log(`error`, `DataCursorElement.getItemDescription.ofConstrainable - Data item key:${key} at pathId:${pathId} does not have a constrainable description.`);
                    } else {
                        return cursor._descriptor.select(`constrainable`).getDescription(pathId);
                    }
                },
                /**
                 * @description - Get item computable description.
                 *
                 * @method getItemDescription.ofComputable
                 * @return {object}
                 */
                ofComputable: function ofComputable () {
                    if (!cursor.isItemComputable(key)) {
                        Hflow.log(`error`, `DataCursorElement.getItemDescription.ofComputable - Data item key:${key} at pathId:${pathId} does not have a computable description.`);
                    } else {
                        return cursor._descriptor.select(`computable`).getDescription(pathId);
                    }
                },
                /**
                 * @description - Get item observable description.
                 *
                 * @method getItemDescription.ofObservable
                 * @return {object}
                 */
                ofObservable: function ofObservable () {
                    if (!cursor.isItemObservable(key)) {
                        Hflow.log(`error`, `DataCursorElement.getItemDescription.ofObservable - Data item key:${key} at pathId:${pathId} does not have an observable description.`);
                    } else {
                        return cursor._descriptor.select(`observable`).getDescription(pathId);
                    }
                }
            };
        }
    },
    /**
     * @description - At cursor, give descriptions to an item.
     *
     * @method describeItem
     * @param {string|number} key
     * @return {object}
     */
    describeItem: function describeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.describeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else {
            const constrainableItem = cursor.isItemConstrainable(key);
            const computableItem = cursor.isItemComputable(key);
            const observableItem = cursor.isItemObservable(key);

            return {
                /**
                 * @description - Describe item with a one of values constraint.
                 *
                 * @method describeItem.asOneOf
                 * @param {array} values
                 * @return {object}
                 */
                asOneOf: function asOneOf (values) {
                    if (!Hflow.isArray(values) || Hflow.isEmpty(values)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asOneOf - Input values are invalid.`);
                    } else if (!values.every((value) => Hflow.isString(value) || Hflow.isNumeric(value))) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asOneOf - Value must be either numeric or string.`);
                    } else {
                        if (computableItem) {
                            Hflow.log(`error`, `DataCursorElement.describeItem.asOneOf - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                        } else {
                            const descriptor = cursor._descriptor.select(`constrainable`);
                            const descObj = {
                                key,
                                constraint: {
                                    oneOf: oneOfValues(values)
                                }
                            };
                            if (!descriptor.hasDescription(pathId)) {
                                descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                            } else {
                                descriptor.getDescription(pathId).addConstraint(descObj.constraint.oneOf, `oneOf`);
                            }
                        }
                    }
                    return this;
                },
                /**
                 * @description - Describe item with a one of types constraint.
                 *
                 * @method describeItem.asOneTypeOf
                 * @param {array} types
                 * @return {object}
                 */
                asOneTypeOf: function asOneTypeOf (types) {
                    if (!Hflow.isArray(types) || Hflow.isEmpty(types)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asOneTypeOf - Input types are invalid.`);
                    } else if (!types.every((type) => Hflow.isString(type))) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asOneTypeOf - Type value must be string.`);
                    } else {
                        if (computableItem) {
                            Hflow.log(`error`, `DataCursorElement.describeItem.asOneTypeOf - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                        } else {
                            const descriptor = cursor._descriptor.select(`constrainable`);
                            const descObj = {
                                key,
                                constraint: {
                                    oneTypeOf: oneOfTypes(types)
                                }
                            };
                            if (!descriptor.hasDescription(pathId)) {
                                descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                            } else {
                                descriptor.getDescription(pathId).addConstraint(descObj.constraint.oneOf, `oneTypeOf`);
                            }
                        }
                    }
                    return this;
                },
                /**
                 * @description - Describe item with a required constraint.
                 *
                 * @method describeItem.asRequired
                 * @return {object}
                 */
                asRequired: function asRequired () {
                    function deepAssignDescription (_pathId, _content, _key) {
                        const descriptor = cursor._descriptor.select(`constrainable`);
                        const descObj = {
                            key: _key,
                            constraint: {
                                required
                            }
                        };

                        if (!descriptor.hasDescription(_pathId)) {
                            descriptor.addDescription(_pathId).assign(descObj).to(_content);
                        } else {
                            descriptor.getDescription(_pathId).addConstraint(descObj.constraint.required, `required`);
                        }

                        /* recursively set requirable description to nested objects */
                        if (Hflow.isObject(_content[_key])) {
                            Object.keys(_content[_key]).forEach((innerKey) => {
                                deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                            });
                        }
                    }

                    if (computableItem) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asRequired - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    } else {
                        deepAssignDescription(pathId, cursor._content, key);
                    }
                    return this;
                },
                /**
                 * @description - Describe item with a strongly typed constraint.
                 *
                 * @method describeItem.asStronglyTyped
                 * @return void
                 */
                asStronglyTyped: function asStronglyTyped () {
                    function deepAssignDescription (_pathId, _content, _key) {
                        const descriptor = cursor._descriptor.select(`constrainable`);
                        const descObj = {
                            key: _key,
                            constraint: {
                                stronglyTyped
                            }
                        };

                        if (!descriptor.hasDescription(_pathId)) {
                            descriptor.addDescription(_pathId).assign(descObj).to(_content);
                        } else {
                            descriptor.getDescription(_pathId).addConstraint(descObj.constraint.stronglyTyped, `stronglyTyped`);
                        }

                        /* recursively set strongly typed description to nested objects */
                        if (Hflow.isObject(_content[_key])) {
                            Object.keys(_content[_key]).forEach((innerKey) => {
                                deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                            });
                        }
                    }

                    if (computableItem) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asStronglyTyped - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    } else {
                        deepAssignDescription(pathId, cursor._content, key);
                    }
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
                asBounded: function asBounded (lowerBound, upperBound) {
                    if (!Hflow.isNumeric(lowerBound) && !Hflow.isNumeric(upperBound)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asBounded - Input bouding range values are must be numeric.`);
                    } else {
                        if (computableItem) {
                            Hflow.log(`error`, `DataCursorElement.describeItem.asBounded - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                        } else {
                            const descriptor = cursor._descriptor.select(`constrainable`);
                            const descObj = {
                                key,
                                constraint: {
                                    bounded: boundedWithin(lowerBound, upperBound)
                                }
                            };

                            if (!descriptor.hasDescription(pathId)) {
                                descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                            } else {
                                descriptor.getDescription(pathId).addConstraint(descObj.constraint.bounded, `bounded`);
                            }
                        }
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
                asConstrainable: function asConstrainable (constraint) {
                    if (!Hflow.isObject(constraint)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asConstrainable - Input constraint object is invalid.`);
                    } else {
                        if (computableItem) {
                            Hflow.log(`error`, `DataCursorElement.describeItem.asConstrainable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                        } else {
                            const descriptor = cursor._descriptor.select(`constrainable`);
                            const descObj = {
                                key,
                                constraint
                            };

                            if (!descriptor.hasDescription(pathId)) {
                                descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                            } else {
                                Hflow.forEach(constraint, (constraintObj, constraintKey) => {
                                    descriptor.getDescription(pathId).addConstraint(constraintObj, constraintKey);
                                });
                            }
                        }
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
                asObservable: function asObservable (condition, subscriber) {
                    if (computableItem) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asObservable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    } else {
                        condition = Hflow.isObject(condition) ? condition : {};
                        subscriber = Hflow.isObject(subscriber) ? subscriber : {};

                        const descriptor = cursor._descriptor.select(`observable`);
                        const descObj = {
                            key,
                            condition,
                            subscriber
                        };

                        if (!descriptor.hasDescription(pathId)) {
                            descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                        } else {
                            Hflow.forEach(condition, (trigger, conditionKey) => {
                                descriptor.getDescription(pathId).addCondition(trigger, conditionKey);
                            });
                            Hflow.forEach(subscriber, (handler, handlerKey) => {
                                descriptor.getDescription(pathId).addSubscriber(handler, handlerKey);
                            });
                        }
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
                asComputable: function asComputable (contexts, compute) {
                    if (!Hflow.isArray(contexts)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asComputable - Input computable contexts are invalid.`);
                    } else if (!Hflow.isFunction(compute)) {
                        Hflow.log(`error`, `DataCursorElement.describeItem.asComputable - Input compute function is invalid.`);
                    } else {
                        if (constrainableItem || observableItem) {
                            Hflow.log(`error`, `DataCursorElement.describeItem.asComputable - Cannot redescribe computable to data item key:${key} at pathId:${pathId}.`);
                        } else {
                            const descriptor = cursor._descriptor.select(`computable`);
                            const descObj = {
                                key,
                                contexts,
                                compute
                            };

                            if (descriptor.hasDescription(pathId)) {
                                descriptor.removeDescription(pathId);
                            }
                            descriptor.addDescription(pathId).assign(descObj).to(cursor._content);
                        }
                    }
                    return this;
                }
            };
        }
    },
    /**
     * @description - At cursor, remove descriptions from an item.
     *
     * @method unDescribeItem
     * @param {string|number} key
     * @return {object}
     */
    unDescribeItem: function unDescribeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (!cursor.hasItem(key)) {
            Hflow.log(`error`, `DataCursorElement.unDescribeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
        } else {
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
                asConstrainable: function asConstrainable () {
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
                asObservable: function asObservable () {
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
                asComputable: function asComputable () {
                    if (computableItem) {
                        cursor._descriptor.select(`computable`).removeDescription(pathId);
                    }
                    return this;
                }
            };
        }
    },
    /**
     * @description - At cursor, loop through all data values.
     *
     * @method forEach
     * @param {function} iterator - Iterator function.
     * @param {object} context - Object to become context (`this`) for the iterator function.
     * @return void
     */
    forEach: function forEach (iterator, context) {
        if (Hflow.isFunction(iterator)) {
            const cursor = this;

            Hflow.forEach(cursor._content, (item, key) => {
                iterator.call(context, item, key);
            });
        } else {
            Hflow.log(`error`, `DataCursorElement.forEach - Input iterator callback is invalid.`);
        }
    },
    /**
     * @description - At cursor, get data item as schema object.
     *
     * @method getSchema
     * @return {object}
     */
    getSchema: function getSchema () {
        const cursor = this;
        /* helper function to create schema from a source object */
        const createSchema = function createSchema (source) {
            if (!(Hflow.isObject(source) || Hflow.isArray(source))) {
                Hflow.log(`error`, `DataCursorElement.createSchema - Input source object is invalid.`);
            } else {
                return Object.keys(source).reduce((schema, key) => {
                    const value = source[key];
                    if (Hflow.isObject(value)) {
                        schema[key] = createSchema(value);
                    } else if (Hflow.isArray(value)) {
                        schema[key] = value.map((arrayItem) => {
                            if (Hflow.isObject(arrayItem)) {
                                return createSchema(arrayItem);
                            }
                            return Hflow.typeOf(arrayItem);
                        });
                    } else if (cursor.isItemComputable(key)) {
                        schema[key] = `computable`;
                    } else if (cursor.isItemObservable(key)) {
                        schema[key] = `observable`;
                    } else {
                        schema[key] = Hflow.typeOf(value);
                    }
                    return schema;
                }, {});
            }
        };
        return createSchema(cursor._content);
    },
    /**
     * @description - At cursor, return data item as plain object.
     *
     * @method toObject
     * @return {object}
     */
    toObject: function toObject () {
        const cursor = this;
        /* helper function to deep clone data item as plain object. */
        const deepValueClone = function deepValueClone (source) {
            if (!(Hflow.isObject(source) || Hflow.isArray(source))) {
                Hflow.log(`error`, `DataCursorElement.deepValueClone - Input is not an object or array type.`);
            } else {
                let result;
                if (Hflow.isObject(source)) {
                    result = Object.keys(source).reduce((_result, key) => {
                        const value = source[key];
                        _result[key] = Hflow.isObject(value) || Hflow.isArray(value) ? Hflow.clone(value) : value;
                        return _result;
                    }, {});
                } else if (Hflow.isArray(source)) {
                    result = source.map((value) => {
                        return Hflow.isObject(value) || Hflow.isArray(value) ? Hflow.clone(value) : value;
                    }).slice(0);
                }
                return result;
            }
        };
        return deepValueClone(cursor._content);
    },
    /**
     * @description - At cursor, return data item as a JSON string.
     *
     * @method toString
     * @param {boolean} beautified
     * @return {string}
     */
    toString: function toString (beautified = true) {
        const cursor = this;

        beautified = Hflow.isBoolean(beautified) ? beautified : true;

        if (beautified) {
            return JSON.stringify(cursor.toObject(), null, `\t`);
        }
        return JSON.stringify(cursor.toObject());
    }
};

/**
 * @description - A data cursor element module.
 * @module DataCursorElement
 * @param {object} data - DataElement object.
 * @param {string|array} pathId
 * @return {object}
 */
export default function DataCursorElement (data, pathId) {
    if (!Hflow.isObject(data)) {
        Hflow.log(`error`, `DataCursorElement - Input data element instance is invalid.`);
    } else {
        if (Hflow.isString(pathId) || Hflow.isArray(pathId)) {
            let rootKey = ``;
            let key = ``;
            /* parsing pathId and retrive content */
            const content = Hflow.retrieve(pathId, `.`).from(data._rootContent);

            /* get the keys from pathId */
            if (Hflow.isString(pathId)) {
                key = Hflow.stringToArray(pathId, `.`).pop();
                rootKey = Hflow.stringToArray(pathId, `.`).reverse().pop();
            }
            if (Hflow.isArray(pathId)) {
                rootKey = pathId.slice(0).reverse().pop();
                key = pathId.slice(0).pop();
                pathId = Hflow.arrayToString(pathId, `.`);
            }

            /* check that content must be an object or array */
            if (!(Hflow.isObject(content) || Hflow.isArray(content))) {
                Hflow.log(`error`, `DataCursorElement - Invalid pathId. Last content in pathId must be an object or array.`);
            } else {
                const element = Object.create(DataCursorElementPrototype, {
                    _pathId: {
                        value: pathId,
                        writable: true,
                        configurable: false,
                        enumerable: false
                    },
                    _immutable: {
                        get: function get () {
                            return data._mutation.immutableRootKeys.indexOf(rootKey) !== -1;
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

                if (!Hflow.isObject(element)) {
                    Hflow.log(`error`, `DataCursorElement - Unable to create a data cursor element instance.`);
                } else {
                    return element;
                }
            }
        } else {
            Hflow.log(`error`, `DataCursorElement - Input pathId is invalid.`);
        }
    }
}
