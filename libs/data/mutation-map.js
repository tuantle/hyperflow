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
 * @module MutationMap
 * @description - An simple implementation of a mutation map using a directed tree graph.
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
    isString,
    isDefined,
    isFunction,
    isObject,
    isArray,
    isNonEmptyArray,
    isEmpty,
    arrayToString,
    stringToArray,
    clear,
    compose,
    fallback,
    reveal,
    forEach,
    log
} from '../utils/common-util';

/**
 * @description - A mutation map node prototypes.
 *
 * NodePrototype
 */
const NodePrototype = Object.create({}).prototype = {
    /**
     * @description - Helper function to get the head node at this node
     *
     * @method _getHead
     * @return {object}
     * @private
     */
    _getHead () {
        const node = this;
        const mMap = node._mMap;

        if (ENV.DEVELOPMENT) {
            if (node.isRoot()) {
                log(`error`, `Node._getHead - Cannot get the head node of a root node.`);
            }
        }

        return mMap._getNode(node._hPathId);
    },

    /**
     * @description - Helper function to get the tail nodes at this node
     *
     * @method _getTails
     * @return {array}
     * @private
     */
    _getTails () {
        const node = this;
        const mMap = node._mMap;

        if (ENV.DEVELOPMENT) {
            if (node.isLeaf()) {
                log(`error`, `Node._getTails - Cannot get tail nodes of a leaf node.`);
            }
        }

        return node._tPathIds.map((tPathId) => mMap._getNode(tPathId));
    },

    /**
     * @description - Helper function to get all ancestors at this node
     *
     * @method _getAncestors
     * @return {array}
     * @private
     */
    _getAncestors () {
        const node = this;
        let aNodes = [];

        if (!node.isRoot()) {
            const hNode = node._getHead();

            aNodes.push(hNode);
            if (!hNode.isRoot()) {
                aNodes = aNodes.concat(hNode._getAncestors());
            }
        }
        /* note: reserve if want root node is at index 0 */
        return aNodes;
    },

    /**
     * @description - Helper function to get all descendants at this node
     *
     * @method _getDescendants
     * @return {array}
     * @private
     */
    _getDescendants () {
        const node = this;
        let dNodes = [];

        if (!node.isLeaf()) {
            const tNodes = node._getTails();

            dNodes = dNodes.concat.apply(dNodes, tNodes.concat(
                tNodes.filter((tNode) => !tNode.isLeaf()).map((tNode) => tNode._getDescendants())
            ));
        }
        return dNodes;
    },

    /**
     * @description - Check if this node is an empty root with no tails.
     *
     * @method isSingular
     * @return {boolean}
     */
    isSingular () {
        const node = this;

        return isEmpty(node._hPathId) && !isNonEmptyArray(node._tPathIds);
    },

    /**
     * @description - Check if this node is a root.
     *
     * @method isRoot
     * @return {boolean}
     */
    isRoot () {
        const node = this;

        if (node.isSingular()) {
            return true;
        }
        return isEmpty(node._hPathId) && isNonEmptyArray(node._tPathIds);
    },

    /**
     * @description - Check if this node is a leaf.
     *
     * @method isLeaf
     * @return {boolean}
     */
    isLeaf () {
        const node = this;

        return !isEmpty(node._hPathId) && !isNonEmptyArray(node._tPathIds);
    },

    /**
     * @description - Check if this node is a tail of node at pathId.
     *
     * @method isTailOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isTailOf (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        return !node.isRoot() && node._hPathId === pathId;
    },

    /**
     * @description - Check if this node is head of node at pathId.
     *
     * @method isHeadOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isHeadOf (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        return node._tPathIds.every((tPathId) => tPathId === pathId);
    },

    /**
     * @description - Check if this node is a common with node at pathId.
     *
     * @method isCommonWith
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isCommonWith (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        if (!node.isRoot()) {
            let hNode = node._getHead();

            return hNode._tPathIds.every((tPathId) => tPathId === pathId);
        }

        return false;
    },

    /**
     * @description - Check if this node is an ancestor of node with pathId.
     *
     * @method isAncestorOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isAncestorOf (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        return !node.isRoot() && node._getDescendants().every((dNode) => dNode._pathId === pathId);
    },

    /**
     * @description - Check if this node is an descendant of node with pathId.
     *
     * @method isDescendantOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isDescendantOf (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        return !node.isLeaf() && node._getAncestors().every((aNode) => aNode._pathId === pathId);
    },

    /**
     * @description - Check if this node is in the same hierarchy with node with pathId.
     *
     * @method isInHierarchyOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isInHierarchyOf (pathId) {
        const node = this;

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        return node.isAncestorOf(pathId) || node.isDescendantOf(pathId);
    },

    /**
     * @description - Get node key.
     *
     * @method getKey
     * @return {string|number}
     */
    getKey () {
        const node = this;

        return node._key;
    },

    /**
     * @description - Get node pathId.
     *
     * @method getPathId
     * @return {string}
     */
    getPathId () {
        const node = this;

        return node._pathId;
    },

    /**
     * @description - Get node content type.
     *
     * @method getContentType
     * @return {string}
     */
    getContentType () {
        const node = this;

        return typeOf(node._content.accessor);
    },

    /**
     * @description - Get node content.
     *
     * @method getContent
     * @return {*}
     */
    getContent () {
        const node = this;

        return node._content.accessor;
    },

    /**
     * @description - Set node content.
     *
     * @method getContentCacheItem
     * @param {*} cachedItem
     * @return void
     */
    getContentCacheItem (key) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(key) || isInteger(key))) {
                log(`error`, `Node.getContentCacheItem - Input content cache item key is invalid.`);
            }
        }

        if (isObject(node._content.cache)) {
            return Object.prototype.hasOwnProperty.call(node._content.cache, key) ? node._content.cache[key] : undefined;
        } else if (isArray(node._content.cache)) {
            return node._content.cache.length > key ? node._content.cache[key] : undefined;
        }

        return undefined;
    },

    /**
     * @description - Set node content.
     *
     * @method setContent
     * @param {object} content
     * @return void
     */
    setContent (content) {
        const node = this;

        // if (isSchema({
        //     cache: `object|array`,
        //     accessor: `object|array`
        // }).of(content)) {
        if (isObject(content) && Object.prototype.hasOwnProperty.call(content, `cache`) && Object.prototype.hasOwnProperty.call(content, `accessor`) &&
           (isObject(content.cache) || isArray(content.cache)) &&
           (isObject(content.accessor) || isArray(content.accessor))) {
            node._content = content;

            if (!node.isSingular() && !node.isRoot()) {
                const hNode = node._getHead();

                if (!isDefined(hNode._content.accessor)) {
                    hNode._content.accessor = isString(node._key) ? {} : [];
                }
                if (!Object.prototype.hasOwnProperty.call(hNode._content.accessor, node._key)) {
                    Object.defineProperty(hNode._content.accessor, node._key, {
                        get () {
                            return node._content.accessor;
                        },
                        configurable: false,
                        enumerable: true
                    });
                }
            }
            if (!node.isLeaf()) {
                const tNodes = node._getTails();

                tNodes.forEach((tNode) => {
                    Object.defineProperty(node._content.accessor, tNode._key, {
                        get () {
                            return tNode._content.accessor;
                        },
                        configurable: false,
                        enumerable: true
                    });
                });
            }
        }
    },

    /**
     * @description - Freeze node content hierarchy and prevent extension.
     *
     * @method freezeContent
     * @return void
     */
    freezeContent () {
        const node = this;

        Object.freeze(node._content);

        if (!node.isLeaf()) {
            const tNodes = node._getTails();

            tNodes.forEach((tNode) => {
                Object.freeze(tNode._content);
                if (!tNode.isLeaf()) {
                    tNode.freezeContent();
                }
            });
        }
    },

    /**
     * @description - Delete node content and its children's contents.
     *
     * @method flushContent
     * @return void
     */
    // flushContent () {
    //     const node = this;
    //
    //     if (!node.isLeaf() && !node.isSingular()) {
    //         node.forEach(`descendants`, (dNode) => {
    //             dNode._content = {
    //             cache: undefined,
    //             accessor: undefined
    //             };
    //         });
    //
    //     node._content = {
    //         cache: undefined,
    //         accessor: undefined
    //     };
    // },
    /**
     * @description - Branch out a new tail node to hierarchy and return the new tail node.
     *
     * @method branch
     * @param {string|number} key - Node key.
     * @param {*} content - Node content.
     * @return {object}
     */
    branch (key, content) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(key) || isInteger(key))) {
                log(`error`, `Node.branch - Input node key is invalid.`);
            }
        }

        const mMap = node._mMap;
        const pathId = `${node._pathId}.${key}`;

        node.sprout(key, content);

        return mMap.select(pathId);
    },

    /**
     * @description - Sprout out a new tail node to hierarchy and return this node.
     *
     * @method sprout
     * @param {string|number} key - Node key.
     * @param {*} content - Node content.
     * @return {object}
     */
    sprout (key, content) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(key) || isInteger(key))) {
                log(`error`, `Node.sprout - Input node key is invalid.`);
            }
        }

        const mMap = node._mMap;
        const pathId = `${node._pathId}.${key}`;
        const tNode = mMap._createNode(pathId);

        tNode._hPathId = node._pathId;
        node._tPathIds.push(tNode._pathId);

        tNode.setContent(content);

        return mMap.select(node._pathId);
    },

    /**
     * @description - Graft a tail node and insert it to a branch of a new root hierarchy.
     *
     * @method graft
     * @param {string|number} key - Node key.
     * @return {object}
     */
    graft (key) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(key) || isInteger(key))) {
                log(`error`, `Node.graft - Input node key is invalid.`);
            }
        }

        const mMap = node._mMap;
        const pathId = `${node._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (!node.isHeadOf(pathId)) {
                log(`error`, `Node.graft - Node does not have a tail node key:${key} at pathId:${pathId}.`);
            }
        }

        const tNode = mMap._getNode(pathId);
        const index = node._tPathIds.indexOf(pathId);

        return {
            /**
             * New node branch to graft onto.
             *
             * @method on
             * @param {string|array} newPathId - Node pathId.
             * @return {object}
             */
            onto (newPathId) {
                if (ENV.DEVELOPMENT) {
                    if (!mMap.hasNode(newPathId)) {
                        log(`error`, `Node.graft.onto - Input node pathId is invalid.`);
                    }
                }

                node._tPathIds.splice(index, 1);
                tNode._hPathId = newPathId;
                tNode.rekey(key);

                return mMap.select(tNode._pathId);
            }
        };
    },

    /**
     * @description - Cut a tail node and its descendants from hierarchy.
     *                The node at rootify pathId will become a root node.
     *
     * @method rootify
     * @param {string|number} key - Node key.
     * @return {object}
     */
    rootify (key) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(key) || isInteger(key))) {
                log(`error`, `Node.rootify - Input node key is invalid.`);
            }
        }

        const mMap = node._mMap;
        const pathId = `${node._pathId}.${key}`;

        if (ENV.DEVELOPMENT) {
            if (node.isRoot()) {
                log(`error`, `Node.rootify - Cannot rootify a root node key:${node._key}.`);
            } else if (!node.isHeadOf(pathId)) {
                log(`error`, `Node.rootify - Node does not have a tail node key:${key} at pathId:${pathId}.`);
            }
        }

        const tNode = mMap._getNode(pathId);
        const index = node._tPathIds.indexOf(pathId);

        node._tPathIds.splice(index, 1);
        tNode._hPathId = ``;
        tNode.rekey(key);

        return mMap.select(tNode._pathId);
    },

    /**
     * @description - Content referencing the topology differences of one node descendants to the other.
     *
     * @method refer
     * @param {string|array} pathId - Node pathId.
     * @param {object} option - Referal option.
     * @return void
     */
    refer (pathId, option = {
        maxReferalDepth: -1,
        excludedReferalPathIds: []
    }) {
        const node = this;
        const mMap = node._mMap;
        const {
            maxReferalDepth,
            /* skip referal of pathIds in the exclusion list. */
            excludedReferalPathIds
        } = fallback({
            maxReferalDepth: -1,
            excludedReferalPathIds: []
        }).of(option);

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        const depth = pathId.length - pathId.replace(/\./g, ``).length;

        if (ENV.DEVELOPMENT) {
            if (!mMap.hasNode(pathId)) {
                log(`error`, `Node.refer - Input node pathId is invalid.`);
            }
        }

        const rNode = mMap._getNode(pathId);

        if (!rNode.isSingular() && !rNode.isLeaf()) {
            let rtdNodes = [];
            let rtsNodes = [];

            if (!node.isLeaf()) {
                const tNodes = node._getTails();
                const rtNodes = rNode._getTails();
                const tNodeKeys = tNodes.map((tNode) => tNode._key);

                rtdNodes = rtNodes.filter((rtNode) => !tNodeKeys.includes(rtNode._key) && !excludedReferalPathIds.includes(rtNode._pathId));
                rtsNodes = rtNodes.filter((rtNode) => tNodeKeys.includes(rtNode._key) && !excludedReferalPathIds.includes(rtNode._pathId));

                rtsNodes.forEach((rtsNode) => {
                    const [ tsNode ] = tNodes.filter((tNode) => tNode._key === rtsNode._key);

                    if ((maxReferalDepth === -1 || depth <= maxReferalDepth)) {
                        tsNode.refer(rtsNode._pathId, option);
                    }
                });
            } else {
                rtdNodes = rNode._getTails();
            }

            rtdNodes.forEach((rtdNode) => {
                // let ts = new Date().getTime();

                // TODO: needs optimization. Performance issue with deep object & array, especially for large array of objects.
                if ((maxReferalDepth === -1 || depth <= maxReferalDepth)) {
                    node.branch(rtdNode._key, rtdNode._content).refer(rtdNode._pathId, option);
                } else {
                    node.branch(rtdNode._key, rtdNode._content);
                }
                // let te = new Date().getTime();
                // log(`debug`, `Node.refer - execution time: ${te - ts} ms.`);
                // if (te - ts > 20) {
                //     log(`debug`, `Node.refer - pathId: ${rtdNode._pathId}.`);
                // }
            });
        }
    },

    /**
     * @description - Helper function to rekey node key.
     *
     * @method rekey
     * @param {string|number} newKey
     * @return void
     */
    rekey (newKey) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(newKey) || isInteger(newKey))) {
                log(`error`, `Node.rekey - Input node key is invalid.`);
            }
        }

        const mMap = node._mMap;
        const oldPathId = node._pathId;
        let newPathId = ``;

        if (node.isRoot()) {
            newPathId = newKey;
        } else {
            const hNode = node._getHead();

            newPathId = `${hNode._pathId}.${newKey}`;
        }
        if (oldPathId !== newPathId) {
            mMap._changeNodePathId(oldPathId, newPathId);
        }
        node._key = newKey;
        node._pathId = newPathId;
        if (!node.isLeaf()) {
            const tNodes = node._getTails();

            clear(node._tPathIds);
            tNodes.forEach((tNode) => {
                tNode._hPathId = node._pathId;
                tNode.rekey(tNode._key);
                node._tPathIds.push(tNode._pathId);
            });
        }
        return mMap.select(node._pathId);
    },

    /**
     * @description - Loop through the hierarchy and apply the callback iterator.
     *
     * @method forEach
     * @param {string} flag - A filter flag.
     * @param {function} iterator - Iterator function.
     * @param {object} context - Object to become context (`this`) for the iterator function.
     * @return void
     */
    forEach (flag, iterator, context) {
        const node = this;

        if (ENV.DEVELOPMENT) {
            if (!isString(flag)) {
                log(`error`, `Node.forEach - Input flag is invalid.`);
            } else if (!isFunction(iterator)) {
                log(`error`, `Node.forEach - Input iterator callback is invalid.`);
            } else if (node.isSingular()) {
                log(`error`, `Node.forEach - Node pathId:${node._pathId} is singular.`);
            }
        }

        const fromTails = !node.isLeaf() ? flag === `tails` : false;
        const fromCommons = !node.isRoot() ? flag === `commons` : false;
        const fromAncestors = !node.isRoot() ? flag === `ancestors` : false;
        const fromDescendants = !node.isLeaf() ? flag === `descendants` : false;
        const revealFrozen = compose(reveal, Object.freeze);

        if (fromTails) {
            forEach(node._getTails().map((_node) => revealFrozen(_node)), iterator, context);
        } else if (fromCommons) {
            forEach(node._getHead()._getTails().map((_node) => revealFrozen(_node)), iterator, context);
        } else if (fromAncestors) {
            forEach(node._getAncestors().map((_node) => revealFrozen(_node)), iterator, context);
        } else if (fromDescendants) {
            forEach(node._getDescendants().map((_node) => revealFrozen(_node)), iterator, context);
        } else {
            log(`error`, `Node.forEach - Input flag is invalid.`);
        }
    }

    /**
     * @description - Return node`s as a string for debuging.
     *
     * @method DEBUG_LOG
     * @return void
     */
    // DEBUG_LOG () {
    //     const node = this;
    //
    //     if (node.isRoot()) {
    //         log(`debug`, JSON.stringify({
    //             type: `--Root--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             tails: node._tPathIds,
    //             content: node._content
    //         }, null, `\t`));
    //     } else if (node.isLeaf()) {
    //         log(`debug`, JSON.stringify({
    //             type: `--Leaf--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             head: node._hPathId,
    //             content: node._content
    //         }, null, `\t`));
    //     } else {
    //         log(`debug`, JSON.stringify({
    //             type: `--Branch--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             head: node._hPathId,
    //             tails: node._tPathIds,
    //             content: node._content
    //         }, null, `\t`));
    //     }
    // }
};

/**
 * @description - Mutation map tree node module.
 *
 * @module Node
 * @param {string} mMap - mutation map object.
 * @param {string|array} pathId - node pathId.
 * @return {object}
 */
function Node (mMap, pathId) {
    if (ENV.DEVELOPMENT) {
        if (!isObject(mMap)) {
            log(`error`, `Node - Input mutation map instance is invalid.`);
        }
        if (!(isString(pathId) || isArray(pathId))) {
            log(`error`, `Node - Input node pathId is invalid.`);
        }
    }

    let key = ``;

    /* get the key from pathId */
    if (isString(pathId)) {
        [ key ] = stringToArray(pathId, `.`).reverse();
    }

    if (isArray(pathId)) {
        [ key ] = pathId.slice(0).reverse();
        pathId = arrayToString(pathId, `.`);
    }

    const node = Object.create(NodePrototype, {
        _pathId: {
            value: pathId,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _hPathId: {
            value: ``,
            writable: true,
            configurable: false,
            enumerable: false
        },
        _tPathIds: {
            value: [],
            writable: false,
            configurable: true,
            enumerable: false
        },
        _key: {
            value: key,
            writable: true,
            configurable: false,
            enumerable: false
        },
        // TODO: Used es6 proxy.
        _content: {
            value: {
                cache: undefined,
                accessor: undefined
            },
            writable: true,
            configurable: true,
            enumerable: false
        },
        _mMap: {
            value: mMap,
            writable: false,
            configurable: false,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(node)) {
            log(`error`, `Node - Unable to create a node instance.`);
        }
    }

    return node;
}

/**
 * @description - A mutation map prototypes.
 *
 * MutationMapPrototype
 */
const MutationMapPrototype = Object.create({}).prototype = {
    /**
     * @description - From pathId, get node at pathId.
     *
     * @method _getNode
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     * @private
     */
    _getNode (pathId) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(pathId) || isArray(pathId))) {
                log(`error`, `MutationMap._getNode - Input node pathId is invalid.`);
            }
        }

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (!mMap.hasNode(pathId)) {
                log(`error`, `MutationMap._getNode - Node with pathId:${pathId} is undefined.`);
            }
        }

        return mMap._node[pathId];
    },

    /**
     * @description - Create a new node or existing node at pathId.
     *
     * @method _createNode
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     * @private
     */
    _createNode (pathId) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(pathId) || isArray(pathId))) {
                log(`error`, `MutationMap._createNode - Input node pathId is invalid.`);
            }
        }

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (mMap.hasNode(pathId)) {
                log(`error`, `MutationMap._createNode - Node with pathId:${pathId} is already defined.`);
            }
        }

        /* create a singular node at pathId */
        const node = Node(mMap, pathId);

        if (ENV.DEVELOPMENT) {
            if (!isObject(node)) {
                log(`error`, `MutationMap._createNode - Unable to create a mutation map node instance.`);
            }
        }

        mMap._node[pathId] = node;
        return node;
    },

    /**
     * @description - From pathId, delete node at pathId.
     *
     * @method _destroyNode
     * @param {string|array} pathId - Node pathId.
     * @return void
     * @private
     */
    _destroyNode (pathId) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(pathId) || isArray(pathId))) {
                log(`error`, `MutationMap._destroyNode - Input node pathId is invalid.`);
            }
        }

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;

        if (ENV.DEVELOPMENT) {
            if (!mMap.hasNode(pathId)) {
                log(`error`, `MutationMap._destroyNode - Node with pathId:${pathId} is undefined.`);
            }
        }

        const node = mMap._node[pathId];

        if (!node.isSingular()) {
            let pathIds = [];
            node.forEach(`descendants`, (dNode) => {
                pathIds.push(dNode.getPathId());
            });
            pathIds.forEach((_pathId) => {
                delete mMap._node[_pathId];
                // mMap._node[_pathId] = undefined;
            });
        }

        delete mMap._node[pathId];
        // mMap._node[pathId] = undefined;
    },

    /**
     * @description - Change Node pathId
     *
     * @method _changeNodePathId
     * @param {string} oldPathId
     * @param {string} newPathId
     * @return void
     * @private
     */
    _changeNodePathId (oldPathId, newPathId) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(oldPathId) || isArray(oldPathId)) &&
               (!(isString(newPathId) || isArray(newPathId)))) {
                log(`error`, `MutationMap._changeNodePathId - Input node pathIds are invalid.`);
            }
        }

        /* convert pathId from array format to string format */
        oldPathId = isArray(oldPathId) ? arrayToString(oldPathId, `.`) : oldPathId;
        newPathId = isArray(newPathId) ? arrayToString(newPathId, `.`) : newPathId;

        if (ENV.DEVELOPMENT) {
            if (mMap.hasNode(newPathId)) {
                log(`error`, `MutationMap._changeNodePathId - Node with pathId:${oldPathId} is already defined.`);
            } else if (!mMap.hasNode(oldPathId)) {
                log(`error`, `MutationMap._changeNodePathId - Node with pathId:${oldPathId} is undefined.`);
            }
        }

        const node = mMap._node[oldPathId];

        mMap._node[newPathId] = node;
        delete mMap._node[oldPathId];
        // mMap._node[oldPathId] = undefined;
    },

    /**
     * @description - From pathId, check if there is a node at pathId.
     *
     * @method hasNode
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    hasNode (pathId) {
        const mMap = this;

        if (!(isString(pathId) || isArray(pathId))) {
            return false;
        }

        /* convert pathId from array format to string format */
        pathId = isArray(pathId) ? arrayToString(pathId, `.`) : pathId;
        return Object.prototype.hasOwnProperty.call(mMap._node, pathId) && isDefined(mMap._node[pathId]);
    },

    /**
     * @description - Get the number of root nodes.
     *
     * @method getRootCount
     * @return {number}
     */
    getRootCount () {
        const mMap = this;

        return Object.values(mMap._node)
            .filter((node) => isDefined(node))
            .reduce((count, node) => {
                if (node.isRoot()) {
                    return count++;
                }
                return count;
            }, 0);
    },

    /**
     * @description - Cut and discard a root node and its descendants.
     *
     * @method cutRoot
     * @param {string|number} rootKey - Root node key.
     * @return void
     */
    cutRoot (rootKey) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(rootKey) || isInteger(rootKey))) {
                log(`error`, `MutationMap.cutRoot - Input root node key is invalid.`);
            }
        }

        const pathId = rootKey;

        if (ENV.DEVELOPMENT) {
            if (!mMap.hasNode(pathId)) {
                log(`error`, `MutationMap.cutRoot - Root node rootKey:${rootKey} is undefined.`);
            } else if (!isObject(mMap._getNode(pathId))) {
                log(`error`, `MutationMap.cutRoot - Unable to cut root node at pathId:${pathId}`);
            }
        }

        mMap._destroyNode(pathId);
    },

    /**
     * @description - Sprout out a new root node.
     *
     * @method sproutRoot
     * @param {string|number} rootKey - Root node key.
     * @param {*} rootContent - Root node content.
     * @return {object}
     */
    sproutRoot (rootKey, rootContent) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(rootKey) || isInteger(rootKey))) {
                log(`error`, `MutationMap.sproutRoot - Input root node key is invalid.`);
            }
        }

        const pathId = rootKey;
        const rootNode = mMap._createNode(pathId);

        if (ENV.DEVELOPMENT) {
            if (!isObject(rootNode)) {
                log(`error`, `MutationMap.sproutRoot - Unable to sprout root node at pathId:${pathId}`);
            }
        }

        rootNode.setContent(rootContent);

        return mMap.select(pathId);
    },

    /**
     * @description - Select pathId, get and reveal node at pathId.
     *
     * @method select
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     */
    select (pathId) {
        const mMap = this;

        if (ENV.DEVELOPMENT) {
            if (!(isString(pathId) || isArray(pathId))) {
                log(`error`, `MutationMap.select - Input node pathId is invalid.`);
            } else if (!mMap.hasNode(pathId)) {
                log(`error`, `MutationMap.select - Node with pathId:${pathId} is undefined.`);
            } else if (!isObject(mMap._getNode(pathId))) {
                log(`error`, `MutationMap.select - Unable to start from node at pathId:${pathId}.`);
            }
        }

        const node = mMap._getNode(pathId);

        /* reveal only the public properties and functions */
        return compose(reveal, Object.freeze)(node);
    }

    /**
     * @description - Return a mutation map hierarchy as a string for debugging.
     *
     * @method DEBUG_LOG
     * @return {string}
     */
    // DEBUG_LOG () {
    //     const mMap = this;
    //
    //     forEach(mMap._node, (node) => {
    //         if (node.isRoot() || node.isSingular()) {
    //             if (node.isSingular()) {
    //                 node.DEBUG_LOG();
    //             } else {
    //                 node.DEBUG_LOG();
    //                 node.forEach(`descendants`, (dNode) => {
    //                     dNode.DEBUG_LOG();
    //                 });
    //             }
    //         }
    //     });
    // }
};

/**
 * @description - A mutation map module.
 *
 * @module MutationMap
 * @return {object}
 */
export default function MutationMap () {
    const mMap = Object.create(MutationMapPrototype, {
        _node: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        }
    });

    if (ENV.DEVELOPMENT) {
        if (!isObject(mMap)) {
            log(`error`, `MutationMap - Unable to create a mutation map instance.`);
        }
    }

    /* reveal only the public properties and functions */
    return compose(reveal, Object.freeze)(mMap);
}
