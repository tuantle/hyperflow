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
 *
 * @flow
 */
'use strict'; // eslint-disable-line

/* load Hyperflow */
import { Hf } from '../../hyperflow';

/* load default constrainable descriptor presets */
import requiredPreset from './descriptors/presets/required-constrainable-preset';
import boundedPreset from './descriptors/presets/bounded-constrainable-preset';
import oneOfValuesPreset from './descriptors/presets/one-of-values-constrainable-preset';
import oneOfTypesPreset from './descriptors/presets/one-of-types-constrainable-preset';
import stronglyTypedPreset from './descriptors/presets/strongly-typed-constrainable-preset';

/**
 * @description - A data cursor prototypes.
 *
 * DataCursorElementPrototype
 */
const DataCursorElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Helper function to create schema from a source object.
     *
     * @method _createSchema
     * @param {object} source
     * @return {object}
     * @private
     */
    _createSchema: function _createSchema (source) {
        const cursor = this;
        if (Hf.DEVELOPMENT) {
            if (!(Hf.isObject(source) || Hf.isArray(source))) {
                Hf.log(`error`, `DataCursorElement._createSchema - Input source object is invalid.`);
            }
        }

        return Object.entries(source).reduce((schema, [ key, value ]) => {
            if (Hf.isObject(value)) {
                schema[key] = cursor._createSchema(value);
            } else if (Hf.isArray(value)) {
                schema[key] = value.map((arrayItem) => {
                    if (Hf.isObject(arrayItem)) {
                        return cursor._createSchema(arrayItem);
                    }
                    return Hf.typeOf(arrayItem);
                });
            } else if (cursor.isItemComputable(key)) {
                schema[key] = `computable`;
            } else if (cursor.isItemObservable(key)) {
                schema[key] = `observable`;
            } else {
                schema[key] = Hf.typeOf(value);
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
     * @description - At cursor, check that data item is one of values.
     *
     * @method isItemOneOfValues
     * @param {string|number} key
     * @return {boolean}
     */
    isItemOneOfValues: function isItemRequired (key) {
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
    isItemOneOfTypes: function isItemRequired (key) {
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
     * @param {object} option
     * @return {object}
     */
    getAccessor: function getAccessor (option = {}) {
        const cursor = this;
        const data = cursor._data;

        return data._getAccessor(cursor._pathId, option);
    },
    /**
     * @description - At cursor, get data type of content.
     *
     * @method getContentType
     * @return {string}
     */
    getContentType: function getContentType () {
        const cursor = this;

        return Hf.typeOf(cursor._content);
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

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.getContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        const contentItem = cursor._content[key];

        return Hf.isObject(contentItem) || Hf.isArray(contentItem) ? Hf.clone(contentItem) : contentItem;
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

        if (Hf.DEVELOPMENT) {
            if (!Hf.isDefined(item)) {
                Hf.log(`error`, `DataCursorElement.setContentItem - Input data item with key:${key} at pathId:${pathId} is invalid.`);
            }
        }

        if (cursor.hasItem(key)) {
            /* check that data item is not computable */
            if (Hf.DEVELOPMENT) {
                if (cursor.isItemComputable(key)) {
                    Hf.log(`error`, `DataCursorElement.setContentItem - Data item key:${key} at pathId:${pathId} is already described as a computable.`);
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
            } else if (Hf.isObject(item) || Hf.isArray(item)) {
                if (Hf.isObject(item)) {
                    cursor._content[key] = {};

                    if (!Hf.isEmpty(item)) {
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
                } else if (Hf.isArray(item)) {
                    cursor._content[key] = [];

                    if (!Hf.isEmpty(item)) {
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
                if (Hf.isObject(item) || Hf.isArray(item)) {
                    if (Hf.isObject(item)) {
                        cursor._content[key] = {};

                        if (!Hf.isEmpty(item)) {
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

                        if (!Hf.isEmpty(item)) {
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
    recallContentItem: function recallContentItem (key, timeIndexOffset) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is not defined.`);
            } else if (!Hf.isInteger(timeIndexOffset) || timeIndexOffset >= 0) {
                Hf.log(`error`, `DataCursorElement.recallContentItem - Input time index offset must be non-zero and negative.`);
            } else if (!cursor.isImmutable()) {
                Hf.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            }
        }

        const data = cursor._data;
        const mMap = data._mutation.mMap;
        const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
        const recallTimeIndex = currentTimeIndex + timeIndexOffset;
        const cursorTimestamps = data._mutation.timestamp[cursor._rootKey];
        const leafType = cursor.getContentType(key) !== `object` || cursor.getContentType(key) !== `array`;
        let pathIdAtTimeIndex = Hf.stringToArray(pathId, `.`);

        if (cursorTimestamps.length > recallTimeIndex) {
            if (leafType) {
                pathIdAtTimeIndex.pop();
            }
            pathIdAtTimeIndex.shift();
            pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
            pathIdAtTimeIndex = Hf.arrayToString(pathIdAtTimeIndex, `.`);

            if (Hf.DEVELOPMENT) {
                if (!mMap.hasNode(pathIdAtTimeIndex)) {
                    Hf.log(`error`, `DataCursorElement.recallContentItem - Data item key:${key} at pathId:${pathId} is undefine at time index:${recallTimeIndex}.`);
                }
            }

            return {
                timestamp: cursorTimestamps[recallTimeIndex],
                key,
                content: leafType ? mMap.select(pathIdAtTimeIndex).getContent()[key] : mMap.select(pathIdAtTimeIndex).getContent()
            };
        } else { // eslint-disable-line
            return {
                timestamp: null,
                content: null
            };
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

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.recallAllContentItems - Data item key:${key} at pathId:${pathId} is not defined.`);
            } else if (!cursor.isImmutable()) {
                Hf.log(`error`, `DataCursorElement.recallAllContentItems - Data item key:${key} at pathId:${pathId} is mutable and has no mutation history.`);
            }
        }

        const data = cursor._data;
        const mMap = data._mutation.mMap;
        const currentTimeIndex = data._mutation.timeIndex[cursor._rootKey];
        const cursorTimestamps = data._mutation.timestamp[cursor._rootKey];
        const leafType = cursor.getContentType(key) !== `object` || cursor.getContentType(key) !== `array`;
        let timeIndexOffset = -1;

        return cursorTimestamps.slice(1).map((cursorTimestamp) => {
            const recallTimeIndex = currentTimeIndex + timeIndexOffset;
            let pathIdAtTimeIndex = Hf.stringToArray(pathId, `.`);

            timeIndexOffset--;

            if (leafType) {
                pathIdAtTimeIndex.pop();
            }

            pathIdAtTimeIndex.shift();
            pathIdAtTimeIndex.unshift(`${cursor._rootKey}${recallTimeIndex}`);
            pathIdAtTimeIndex = Hf.arrayToString(pathIdAtTimeIndex, `.`);
            return {
                timestamp: cursorTimestamp,
                pathIdAtTimeIndex
            };
        }).filter((timeCursor) => mMap.hasNode(timeCursor.pathIdAtTimeIndex)).map((timeCursor) => {
            return {
                timestamp: timeCursor.timestamp,
                key,
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
    getItemDescription: function getItemDescription (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.getItemDescription - Data item key:${key} at pathId:${pathId} is not defined.`);
            }
        }

        return {
            /**
             * @description - Get item constrainable description.
             *
             * @method getItemDescription.ofConstrainable
             * @return {object}
             */
            ofConstrainable: function ofConstrainable () {
                if (Hf.DEVELOPMENT) {
                    if (!cursor.isItemConstrainable(key)) {
                        Hf.log(`error`, `DataCursorElement.getItemDescription.ofConstrainable - Data item key:${key} at pathId:${pathId} does not have a constrainable description.`);
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
            ofComputable: function ofComputable () {
                if (Hf.DEVELOPMENT) {
                    if (!cursor.isItemComputable(key)) {
                        Hf.log(`error`, `DataCursorElement.getItemDescription.ofComputable - Data item key:${key} at pathId:${pathId} does not have a computable description.`);
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
            ofObservable: function ofObservable () {
                if (Hf.DEVELOPMENT) {
                    if (!cursor.isItemObservable(key)) {
                        Hf.log(`error`, `DataCursorElement.getItemDescription.ofObservable - Data item key:${key} at pathId:${pathId} does not have an observable description.`);
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
    describeItem: function describeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.describeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
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
            asOneOfValues: function asOneOfValues (values) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isArray(values) || Hf.isEmpty(values)) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfValues - Input values are invalid.`);
                    } else if (!values.every((value) => Hf.isString(value) || Hf.isNumeric(value))) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfValues - Value must be either numeric or string.`);
                    } else if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfValues - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = oneOfValuesPreset(values);

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
            asOneOfTypes: function asOneOfTypes (types) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isArray(types) || Hf.isEmpty(types)) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfTypes - Input types are invalid.`);
                    } else if (!types.every((type) => Hf.isString(type))) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfTypes - Type value must be string.`);
                    } else if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asOneOfTypes - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = oneOfTypesPreset(types);
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
            asRequired: function asRequired () {
                function deepAssignDescription (_pathId, _content, _key) {
                    const descriptor = cursor._descriptor.select(`constrainable`);
                    const constraint = requiredPreset();
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
                    if (Hf.isNonEmptyObject(_content[_key])) {
                        Object.keys(_content[_key]).forEach((innerKey) => {
                            deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                        });
                    }
                }

                if (Hf.DEVELOPMENT) {
                    if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asRequired - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
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
            asStronglyTyped: function asStronglyTyped () {
                function deepAssignDescription (_pathId, _content, _key) {
                    const descriptor = cursor._descriptor.select(`constrainable`);
                    const constraint = stronglyTypedPreset();
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
                    if (Hf.isNonEmptyObject(_content[_key])) {
                        Object.keys(_content[_key]).forEach((innerKey) => {
                            deepAssignDescription(`${_pathId}.${innerKey}`, _content[_key], innerKey);
                        });
                    }
                }

                if (Hf.DEVELOPMENT) {
                    if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asStronglyTyped - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
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
            asBounded: function asBounded (lowerBound, upperBound) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isNumeric(lowerBound) && !Hf.isNumeric(upperBound)) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asBounded - Input bouding range values are must be numeric.`);
                    } else if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asBounded - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                const descriptor = cursor._descriptor.select(`constrainable`);
                const constraint = boundedPreset(lowerBound, upperBound);
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
            asConstrainable: function asConstrainable (constraint) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isObject(constraint) && Object.key(constraint).forEach((constraintKey) => {
                        return Hf.isSchema({
                            constrainer: `function`
                        }).of(constraint[constraintKey]);
                    })) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asConstrainable - Input constraint is invalid.`);
                    } else if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asConstrainable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
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
            asObservable: function asObservable (condition, subscriber) {
                if (Hf.DEVELOPMENT) {
                    if (computableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asObservable - Cannot redescribe computable data item key:${key} at pathId:${pathId}.`);
                    }
                }

                condition = Hf.isObject(condition) ? condition : {};
                subscriber = Hf.isObject(subscriber) ? subscriber : {};

                const descriptor = cursor._descriptor.select(`observable`);
                const descPreset = {
                    key,
                    condition,
                    subscriber
                };

                if (!descriptor.hasDescription(pathId)) {
                    descriptor.addDescription(pathId).assign(descPreset).to(cursor._content);
                } else {
                    Hf.forEach(condition, (trigger, conditionKey) => {
                        descriptor.getDescription(pathId).addCondition(trigger, conditionKey);
                    });
                    Hf.forEach(subscriber, (handler, handlerKey) => {
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
            asComputable: function asComputable (contexts, compute) {
                if (Hf.DEVELOPMENT) {
                    if (!Hf.isArray(contexts)) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asComputable - Input computable contexts are invalid.`);
                    } else if (!Hf.isFunction(compute)) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asComputable - Input compute function is invalid.`);
                    } else if (constrainableItem || observableItem) {
                        Hf.log(`error`, `DataCursorElement.describeItem.asComputable - Cannot redescribe computable to data item key:${key} at pathId:${pathId}.`);
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
    unDescribeItem: function unDescribeItem (key) {
        const cursor = this;
        const pathId = `${cursor._pathId}.${key}`;

        if (Hf.DEVELOPMENT) {
            if (!cursor.hasItem(key)) {
                Hf.log(`error`, `DataCursorElement.unDescribeItem - Data item key:${key} at pathId:${pathId} is not defined.`);
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
        if (Hf.DEVELOPMENT) {
            if (!Hf.isFunction(iterator)) {
                Hf.log(`error`, `DataCursorElement.forEach - Input iterator callback is invalid.`);
            }
        }

        const cursor = this;

        Hf.forEach(cursor._content, (item, key) => {
            iterator.call(context, item, key);
        });
    },
    /**
     * @description - At cursor, get data item as schema object.
     *
     * @method getSchema
     * @return {object}
     */
    getSchema: function getSchema () {
        const cursor = this;
        return cursor._createSchema(cursor._content);
    },
    /**
     * @description - At cursor, return data item as plain object.
     *
     * @method toObject
     * @return {object}
     */
    toObject: function toObject () {
        const cursor = this;
        return Hf.clone(cursor._content);
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

        beautified = Hf.isBoolean(beautified) ? beautified : true;

        return beautified ? JSON.stringify(cursor.toObject(), null, `\t`) : JSON.stringify(cursor.toObject());
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
    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(data)) {
            Hf.log(`error`, `DataCursorElement - Input data element instance is invalid.`);
        } else if (!(Hf.isString(pathId) || Hf.isArray(pathId))) {
            Hf.log(`error`, `DataCursorElement - Input pathId is invalid.`);
        }
    }

    let rootKey = ``;
    let key = ``;
    /* parsing pathId and retrive content */
    const content = Hf.retrieve(pathId, `.`).from(data._rootContent);

    /* get the keys from pathId */
    if (Hf.isString(pathId)) {
        [ key ] = Hf.stringToArray(pathId, `.`).reverse();
        [ rootKey ] = Hf.stringToArray(pathId, `.`);
    }
    if (Hf.isArray(pathId)) {
        [ rootKey ] = pathId;
        [ key ] = pathId.slice(0).reverse();
        pathId = Hf.arrayToString(pathId, `.`);
    }

    /* check that content must be an object or array */
    if (Hf.DEVELOPMENT) {
        if (!(Hf.isObject(content) || Hf.isArray(content))) {
            Hf.log(`error`, `DataCursorElement - Invalid pathId. Last content in pathId must be an object or array.`);
        }
    }

    const element = Object.create(DataCursorElementPrototype, {
        _pathId: {
            value: pathId,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _immutable: {
            get: function get () {
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

    if (Hf.DEVELOPMENT) {
        if (!Hf.isObject(element)) {
            Hf.log(`error`, `DataCursorElement - Unable to create a data cursor element instance.`);
        }
    }

    return element;
}
