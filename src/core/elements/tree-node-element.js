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
 * @module TreeNodeElement
 * @description - An simple implementation of an undirected data tree node.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load CommonElement */
import CommonElement from './common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - A tree node prototypes.
 *
 * TreeNodeElementPrototype
 */
const TreeNodeElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - Helper function to get the head node at this node
     *
     * @method _getHead
     * @return {object}
     * @private
     */
    _getHead: function _getHead () {
        const node = this;
        const tree = node._tree;

        if (node.isRoot()) {
            Hf.log(`error`, `TreeNodeElement._getHead - Cannot get the head node of a root node.`);
        } else {
            return tree._getNode(node._hPathId);
        }
    },
    /**
     * @description - Helper function to get the tail nodes at this node
     *
     * @method _getTails
     * @return {array}
     * @private
     */
    _getTails: function _getTails () {
        const node = this;
        const tree = node._tree;

        if (node.isLeaf()) {
            Hf.log(`error`, `TreeNodeElement._getTails - Cannot get tail nodes of a leaf node.`);
        } else {
            return node._tPathIds.map((tPathId) => tree._getNode(tPathId));
        }
    },
    /**
     * @description - Helper function to get all ancestors at this node
     *
     * @method _getAncestors
     * @return {array}
     * @private
     */
    _getAncestors: function _getAncestors () {
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
    _getDescendants: function _getDescendants () {
        const node = this;
        let dNodes = [];

        if (!node.isLeaf()) {
            const tNodes = node._getTails();

            dNodes = dNodes.concat.apply(dNodes, tNodes.concat(tNodes.filter((tNode) => {
                return !tNode.isLeaf();
            }).map((tNode) => {
                return tNode._getDescendants();
            })));
        }
        return dNodes;
    },
    /**
     * @description - Check if this node is an empty root with no tails.
     *
     * @method isSingular
     * @return {boolean}
     */
    isSingular: function isSingular () {
        const node = this;

        return Hf.isEmpty(node._hPathId) && Hf.isEmpty(node._tPathIds);
    },
    /**
     * @description - Check if this node is a root.
     *
     * @method isRoot
     * @return {boolean}
     */
    isRoot: function isRoot () {
        const node = this;

        if (node.isSingular()) {
            return true;
        }
        return Hf.isEmpty(node._hPathId) && !Hf.isEmpty(node._tPathIds);
    },
    /**
     * @description - Check if this node is a leaf.
     *
     * @method isLeaf
     * @return {boolean}
     */
    isLeaf: function isLeaf () {
        const node = this;

        return !Hf.isEmpty(node._hPathId) && Hf.isEmpty(node._tPathIds);
    },
    /**
     * @description - Check if this node is a tail of node at pathId.
     *
     * @method isTailOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isTailOf: function isTailOf (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            if (!node.isRoot()) {
                verified = node._hPathId === pathId;
            }
        }
        return verified;
    },
    /**
     * @description - Check if this node is head of node at pathId.
     *
     * @method isHeadOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isHeadOf: function isHeadOf (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            return node._tPathIds.every((tPathId) => tPathId === pathId);
        }
        return verified;
    },
    /**
     * @description - Check if this node is a common with node at pathId.
     *
     * @method isCommonWith
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isCommonWith: function isCommonWith (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            if (!node.isRoot()) {
                let hNode = node._getHead();

                return hNode._tPathIds.every((tPathId) => tPathId === pathId);
            }
        }
        return verified;
    },
    /**
     * @description - Check if this node is an ancestor of node with pathId.
     *
     * @method isAncestorOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isAncestorOf: function isAncestorOf (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            if (!node.isRoot()) {
                return node._getDescendants().every((dNode) => dNode._pathId === pathId);
            }
        }
        return verified;
    },
    /**
     * @description - Check if this node is an descendant of node with pathId.
     *
     * @method isDescendantOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isDescendantOf: function isDescendantOf (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            if (!node.isLeaf()) {
                return node._getAncestors().every((aNode) => aNode._pathId === pathId);
            }
        }
        return verified;
    },
    /**
     * @description - Check if this node is in the same hierarchy with node with pathId.
     *
     * @method isInHierarchyOf
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    isInHierarchyOf: function isInHierarchyOf (pathId) {
        const node = this;
        let verified = false;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (Hf.isString(pathId)) {
            verified = node.isAncestorOf(pathId) || node.isDescendantOf(pathId);
        }
        return verified;
    },
    /**
     * @description - Get node key.
     *
     * @method getKey
     * @return {string|number}
     */
    getKey: function getKey () {
        const node = this;

        return node._key;
    },
    /**
     * @description - Get node pathId.
     *
     * @method getPathId
     * @return {string}
     */
    getPathId: function getPathId () {
        const node = this;

        return node._pathId;
    },
    /**
     * @description - Get node content type.
     *
     * @method getContentType
     * @return {string}
     */
    getContentType: function getContentType () {
        const node = this;

        return Hf.typeOf(node._contentProxy);
    },
    /**
     * @description - Get node content.
     *
     * @method getContent
     * @return {*}
     */
    getContent: function getContent () {
        const node = this;

        return node._contentProxy;
    },
    /**
     * @description - Set node content.
     *
     * @method setContent
     * @param {object|array} content
     * @return void
     */
    setContent: function setContent (content) {
        const node = this;

        if (Hf.isObject(content) || Hf.isArray(content)) {
            node._contentProxy = content;
            if (!node.isSingular()) {
                if (!node.isRoot()) {
                    const hNode = node._getHead();

                    if (!hNode._contentProxy) {
                        hNode._contentProxy = Hf.isString(node._key) ? {} : [];
                    }
                    if (!hNode._contentProxy.hasOwnProperty(node._key)) {
                        Object.defineProperty(hNode._contentProxy, node._key, {
                            get: function get () {
                                return node._contentProxy;
                            },
                            configurable: false,
                            enumerable: true
                        });
                    }
                }
                if (!node.isLeaf()) {
                    const tNodes = node._getTails();

                    tNodes.forEach((tNode) => {
                        Object.defineProperty(node._contentProxy, tNode._key, {
                            get: function get () {
                                return tNode._contentProxy;
                            },
                            configurable: false,
                            enumerable: true
                        });
                    });
                }
            }
        } else {
            Hf.log(`error`, `TreeNodeElement.setContent - Input content must be an object or array.`);
        }
    },
    /**
     * @description - Freeze node content hierarchy and prevent extension.
     *
     * @method freeze
     * @return void
     */
    freezeContent: function freezeContent () {
        const node = this;

        Object.freeze(node._contentProxy);
        if (!node.isLeaf()) {
            const tNodes = node._getTails();

            tNodes.forEach((tNode) => {
                Object.freeze(tNode._contentProxy);
                if (!tNode.isLeaf()) {
                    tNode.freezeContent();
                }
            });
        }
    },
    /**
     * @description - Branch out a new tail node to hierarchy and return the new tail node.
     *
     * @method branch
     * @param {string|number} key - Node key.
     * @param {*} content - Node content.
     * @return {object}
     */
    branch: function branch (key, content) {
        if (!(Hf.isString(key) || Hf.isInteger(key))) {
            Hf.log(`error`, `TreeNodeElement.branch - Input node key is invalid.`);
        } else {
            const node = this;
            const tree = node._tree;
            const pathId = `${node._pathId}.${key}`;

            node.sprout(key, content);
            return tree.select(pathId);
        }
    },
    /**
     * @description - Sprout out a new tail node to hierarchy and return this node.
     *
     * @method sprout
     * @param {string|number} key - Node key.
     * @param {*} content - Node content.
     * @return {object}
     */
    sprout: function sprout (key, content) {
        if (!(Hf.isString(key) || Hf.isInteger(key))) {
            Hf.log(`error`, `TreeNodeElement.sprout - Input node key is invalid.`);
        } else {
            const node = this;
            const tree = node._tree;
            const pathId = `${node._pathId}.${key}`;
            const tNode = tree._createNode(pathId);

            tNode._hPathId = node._pathId;
            node._tPathIds.push(tNode._pathId);
            if (Hf.isObject(content) || Hf.isArray(content)) {
                tNode.setContent(content);
            }
            return tree.select(node._pathId);
        }
    },
    /**
     * @description - Graft a tail node and insert it to a branch of a new root hierarchy.
     *
     * @method graft
     * @param {string|number} key - Node key.
     * @return {object}
     */
    graft: function graft (key) {
        if (Hf.isString(key) || Hf.isInteger(key)) {
            const node = this;
            const tree = node._tree;
            const pathId = `${node._pathId}.${key}`;

            if (!node.isHeadOf(pathId)) {
                Hf.log(`error`, `TreeNodeElement.graft - Node does not have a tail node key:${key} at pathId:${pathId}.`);
            } else {
                const tNode = tree._getNode(pathId);
                const index = node._tPathIds.indexOf(pathId);
                return {
                    /**
                     * New node branch to graft onto.
                     *
                     * @method on
                     * @param {string|array} newPathId - Node pathId.
                     * @return {object}
                     */
                    onto: function onto (newPathId) {
                        if (!tree.hasNode(newPathId)) {
                            Hf.log(`error`, `TreeNodeElement.graft.onto - Input node pathId is invalid.`);
                        } else {
                            node._tPathIds.splice(index, 1);
                            tNode._hPathId = newPathId;
                            tNode.rekey(key);
                            return tree.select(tNode._pathId);
                        }
                    }
                };
            }
        } else {
            Hf.log(`error`, `TreeNodeElement.graft - Input node key is invalid.`);
        }
    },
    /**
     * @description - Cut a tail node and its descendants from hierarchy.
     *                The node at rootify pathId will become a root node.
     *
     * @method rootify
     * @param {string|number} key - Node key.
     * @return {object}
     */
    rootify: function rootify (key) {
        if (Hf.isString(key) || Hf.isInteger(key)) {
            const node = this;
            const tree = node._tree;
            const pathId = `${node._pathId}.${key}`;

            if (node.isRoot()) {
                Hf.log(`error`, `TreeNodeElement.rootify - Cannot rootify a root node key:${node._key}.`);
            } else if (!node.isHeadOf(pathId)) {
                Hf.log(`error`, `TreeNodeElement.rootify - Node does not have a tail node key:${key} at pathId:${pathId}.`);
            } else {
                const tNode = tree._getNode(pathId);
                const index = node._tPathIds.indexOf(pathId);

                node._tPathIds.splice(index, 1);
                tNode._hPathId = ``;
                tNode.rekey(key);
                return tree.select(tNode._pathId);
            }
        } else {
            Hf.log(`error`, `TreeNodeElement.rootify - Input node key is invalid.`);
        }
    },
    /**
     * @description - Content referencing the topology differences of one node descendants to the other.
     *
     * @method refer
     * @param {string|array} pathId - Node pathId.
     * @return void
     */
    refer: function refer (pathId) {
        const node = this;
        const tree = node._tree;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

        if (tree.hasNode(pathId)) {
            const rNode = tree._getNode(pathId);

            if (!rNode.isSingular() && !rNode.isLeaf()) {
                let rtdNodes = [];
                let rtsNodes = [];

                if (!node.isLeaf()) {
                    const tNodes = node._getTails();
                    const rtNodes = rNode._getTails();
                    const tNodeKeys = tNodes.map((tNode) => tNode._key);

                    rtdNodes = rtNodes.filter((rtNode) => !tNodeKeys.includes(rtNode._key));
                    rtsNodes = rtNodes.filter((rtNode) => tNodeKeys.includes(rtNode._key));

                    rtsNodes.forEach((rtsNode) => {
                        const [ tsNode ] = tNodes.filter((tNode) => tNode._key === rtsNode._key);

                        tsNode.refer(rtsNode._pathId);
                    });
                } else {
                    rtdNodes = rNode._getTails();
                }
                rtdNodes.forEach((rtdNode) => {
                    node.branch(rtdNode._key, rtdNode._contentProxy).refer(rtdNode._pathId);
                });
            }
        } else {
            Hf.log(`error`, `TreeNodeElement.refer - Input node pathId is invalid.`);
        }
    },
    /**
     * @description - Helper function to rekey node key.
     *
     * @method rekey
     * @param {string|number} newKey
     * @return void
     */
    rekey: function rekey (newKey) {
        if (!(Hf.isString(newKey) || Hf.isInteger(newKey))) {
            Hf.log(`error`, `TreeNodeElement.rekey - Input node key is invalid.`);
        } else {
            const node = this;
            const tree = node._tree;
            const oldPathId = node._pathId;
            let newPathId = ``;

            if (node.isRoot()) {
                newPathId = newKey;
            } else {
                const hNode = node._getHead();

                newPathId = `${hNode._pathId}.${newKey}`;
            }
            if (oldPathId !== newPathId) {
                tree._changeNodePathId(oldPathId, newPathId);
            }
            node._key = newKey;
            node._pathId = newPathId;
            if (!node.isLeaf()) {
                const tNodes = node._getTails();

                Hf.clear(node._tPathIds);
                tNodes.forEach((tNode) => {
                    tNode._hPathId = node._pathId;
                    tNode.rekey(tNode._key);
                    node._tPathIds.push(tNode._pathId);
                });
            }
            return tree.select(node._pathId);
        }
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
    forEach: function forEach (flag, iterator, context) {
        if (!Hf.isString(flag)) {
            Hf.log(`error`, `TreeNodeElement.forEach - Input flag is invalid.`);
        } else if (!Hf.isFunction(iterator)) {
            Hf.log(`error`, `TreeNodeElement.forEach - Input iterator callback is invalid.`);
        } else {
            const node = this;

            if (node.isSingular()) {
                Hf.log(`error`, `TreeNodeElement.forEach - Node pathId:${node._pathId} is singular.`);
            } else {
                let nodes = [];
                const fromTails = !node.isLeaf() ? flag === `tails` : false;
                const fromCommons = !node.isRoot() ? flag === `commons` : false;
                const fromAncestors = !node.isRoot() ? flag === `ancestors` : false;
                const fromDescendants = !node.isLeaf() ? flag === `descendants` : false;

                if (fromTails) {
                    nodes = node._getTails();
                } else if (fromCommons) {
                    nodes = node._getHead()._getTails();
                } else if (fromAncestors) {
                    nodes = node._getAncestors();
                } else if (fromDescendants) {
                    nodes = node._getDescendants();
                } else {
                    Hf.log(`error`, `TreeNodeElement.forEach - Input flag is invalid.`);
                }
                const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
                Hf.forEach(nodes.map((_node) => revealFrozen(_node)), iterator, context);
            }
        }
    }
    /**
     * @description - Return node`s as a string for debuging.
     *
     * @method DEBUG_LOG
     * @return void
     */
    // DEBUG_LOG: function DEBUG_LOG () {
    //     const node = this;
    //
    //     if (node.isRoot()) {
    //         Hf.log(`info`, JSON.stringify({
    //             type: `--Root--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             tails: node._tPathIds,
    //             content: node._contentProxy
    //         }, null, `\t`));
    //     } else if (node.isLeaf()) {
    //         Hf.log(`info`, JSON.stringify({
    //             type: `--Leaf--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             head: node._hPathId,
    //             content: node._contentProxy
    //         }, null, `\t`));
    //     } else {
    //         Hf.log(`info`, JSON.stringify({
    //             type: `--Branch--`,
    //             pathId: node._pathId,
    //             key: node._key,
    //             head: node._hPathId,
    //             tails: node._tPathIds,
    //             content: node._contentProxy
    //         }, null, `\t`));
    //     }
    // }
};

/**
 * @description - An undirected data tree node element module.
 *
 * @module TreeNodeElement
 * @param {string} tree - undirected tree element.
 * @param {string|array} pathId - Node pathId.
 * @return {object}
 */
export default function TreeNodeElement (tree, pathId) {
    if (!Hf.isObject(tree)) {
        Hf.log(`error`, `TreeNodeElement - Input undirected tree element instance is invalid.`);
    } else {
        if (Hf.isString(pathId) || Hf.isArray(pathId)) {
            let key = ``;

            /* get the key from pathId */
            if (Hf.isString(pathId)) {
                [ key ] = Hf.stringToArray(pathId, `.`).reverse();
            }
            if (Hf.isArray(pathId)) {
                [ key ] = pathId.slice(0).reverse();
                pathId = Hf.arrayToString(pathId, `.`);
            }

            const element = Object.create(TreeNodeElementPrototype, {
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
                // TODO: Used es6 Proxy.
                _contentProxy: {
                    value: undefined,
                    writable: true,
                    configurable: false,
                    enumerable: false
                },
                _tree: {
                    value: tree,
                    writable: false,
                    configurable: false,
                    enumerable: false
                }
            });

            if (!Hf.isObject(element)) {
                Hf.log(`error`, `TreeNodeElement - Unable to create a tree node element instance.`);
            } else {
                return element;
            }
        } else {
            Hf.log(`error`, `TreeNodeElement - Input tree node pathId is invalid.`);
        }
    }
}
