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
 * @module TreeElement
 * @description - An simple implementation of a undirected data tree.
 *
 * @author Tuan Le (tuan.t.lei@gmail.com)
 */
/* @flow */
'use strict'; // eslint-disable-line

/* load undirected node */
import TreeNodeElement from './tree-node-element';

/* load CommonElement */
import CommonElement from './common-element';

/* create CommonElement as Hf object */
const Hf = CommonElement();

/**
 * @description - An undirected tree element prototypes.
 *
 * TreeElementPrototype
 */
const TreeElementPrototype = Object.create({}).prototype = {
    /* ----- Prototype Definitions --------- */
    /**
     * @description - From pathId, get node at pathId.
     *
     * @method _getNode
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     * @private
     */
    _getNode: function _getNode (pathId) {
        if (Hf.isString(pathId) || Hf.isArray(pathId)) {
            const tree = this;

            /* convert pathId from array format to string format */
            pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

            if (!tree.hasNode(pathId)) {
                Hf.log(`error`, `TreeElement._getNode - Node with pathId:${pathId} is undefined.`);
            } else {
                return tree._node[pathId];
            }
        } else {
            Hf.log(`error`, `TreeElement._getNode - Input node pathId is invalid.`);
        }
    },
    /**
     * @description - Create a new node or existing node at pathId.
     *
     * @method _createNode
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     * @private
     */
    _createNode: function _createNode (pathId) {
        if (!(Hf.isString(pathId) || Hf.isArray(pathId))) {
            Hf.log(`error`, `TreeElement._createNode - Input node pathId is invalid.`);
        } else {
            const tree = this;

            /* convert pathId from array format to string format */
            pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;

            if (tree.hasNode(pathId)) {
                Hf.log(`error`, `TreeElement._createNode - Node with pathId:${pathId} is already defined.`);
            } else {
                /* create a singular node at pathId */
                const node = TreeNodeElement(tree, pathId);

                if (!Hf.isObject(node)) {
                    Hf.log(`error`, `TreeElement._createNode - Unable to create a tree node instance.`);
                } else {
                    tree._node[pathId] = node;
                    return node;
                }
            }
        }
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
    _changeNodePathId: function _changeNodePathId (oldPathId, newPathId) {
        if ((Hf.isString(oldPathId) || Hf.isArray(oldPathId)) &&
            (Hf.isString(newPathId) || Hf.isArray(newPathId))) {
            const tree = this;

            /* convert pathId from array format to string format */
            oldPathId = Hf.isArray(oldPathId) ? Hf.arrayToString(oldPathId, `.`) : oldPathId;
            newPathId = Hf.isArray(newPathId) ? Hf.arrayToString(newPathId, `.`) : newPathId;

            if (!tree.hasNode(newPathId)) {
                if (tree.hasNode(oldPathId)) {
                    const node = tree._node[oldPathId];

                    tree._node[newPathId] = node;
                    tree._node[oldPathId] = undefined;
                    delete tree._node[oldPathId];
                } else {
                    Hf.log(`error`, `TreeElement._changeNodePathId - Node with pathId:${oldPathId} is undefined.`);
                }
            } else {
                Hf.log(`error`, `TreeElement._changeNodePathId - Node with pathId:${oldPathId} is already defined.`);
            }
        } else {
            Hf.log(`error`, `TreeElement._changeNodePathId - Input node pathIds are invalid.`);
        }
    },
    /**
     * @description - From pathId, check if there is a node at pathId.
     *
     * @method hasNode
     * @param {string|array} pathId - Node pathId.
     * @return {boolean}
     */
    hasNode: function hasNode (pathId) {
        if (!(Hf.isString(pathId) || Hf.isArray(pathId))) {
            return false;
        }
        const tree = this;

        /* convert pathId from array format to string format */
        pathId = Hf.isArray(pathId) ? Hf.arrayToString(pathId, `.`) : pathId;
        return tree._node.hasOwnProperty(pathId);
    },
    /**
     * @description - Get the number of root nodes.
     *
     * @method getRootCount
     * @return {number}
     */
    getRootCount: function getRootCount () {
        const tree = this;
        return Object.keys(tree._node).reduce((count, pathId) => {
            return tree._node[pathId].isRoot() ? count++ : count;
        }, 0);
    },
    /**
     * @description - Cut and discard a root node and its descendants.
     *
     * @method cutRoot
     * @param {string|number} rootKey - Root node key.
     * @return void
     */
    cutRoot: function cutRoot (rootKey) {
        if (!(Hf.isString(rootKey) || Hf.isInteger(rootKey))) {
            Hf.log(`error`, `TreeElement.cutRoot - Input root node key is invalid.`);
        } else {
            const tree = this;
            const pathId = rootKey;
            if (!tree.hasNode(pathId)) {
                Hf.log(`error`, `TreeElement.cutRoot - Root node rootKey:${rootKey} is undefined.`);
            } else {
                const rootNode = tree._getNode(pathId);

                if (!Hf.isObject(rootNode)) {
                    Hf.log(`error`, `TreeElement.cutRoot - Unable to cut root node at pathId:${pathId}`);
                } else {
                    if (!rootNode.isSingular()) {
                        let pathIds = [];
                        rootNode.forEach(`descendants`, (tNode) => {
                            pathIds.push(tNode.getPathId());
                        });
                        pathIds.forEach((_pathId) => {
                            tree._node[_pathId] = undefined;
                            delete tree._node[_pathId];
                        });
                    }
                    tree._node[pathId] = undefined;
                    delete tree._node[pathId];
                }
            }
        }
    },
    /**
     * @description - Sprout out a new root node.
     *
     * @method sproutRoot
     * @param {string|number} rootKey - Root node key.
     * @param {*} rootContent - Root node content.
     * @return {object}
     */
    sproutRoot: function sproutRoot (rootKey, rootContent) {
        if (!(Hf.isString(rootKey) || Hf.isInteger(rootKey))) {
            Hf.log(`error`, `TreeElement.sproutRoot - Input root node key is invalid.`);
        } else {
            const tree = this;
            const pathId = rootKey;
            const rootNode = tree._createNode(pathId);

            if (!Hf.isObject(rootNode)) {
                Hf.log(`error`, `TreeElement.sproutRoot - Unable to sprout root node at pathId:${pathId}`);
            } else {
                if (Hf.isObject(rootContent) || Hf.isArray(rootContent)) {
                    rootNode.setContent(rootContent);
                }
                return tree.select(pathId);
            }
        }
    },
    /**
     * @description - Select pathId, get and reveal node at pathId.
     *
     * @method select
     * @param {string|array} pathId - Node pathId.
     * @return {object}
     */
    select: function select (pathId) {
        if (Hf.isString(pathId) || Hf.isArray(pathId)) {
            const tree = this;
            if (!tree.hasNode(pathId)) {
                Hf.log(`error`, `TreeElement.select - Node with pathId:${pathId} is undefined.`);
            } else {
                const node = tree._getNode(pathId);
                if (!Hf.isObject(node)) {
                    Hf.log(`error`, `TreeElement.select - Unable to start from node at pathId:${pathId}.`);
                } else {
                    const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
                    /* reveal only the public properties and functions */
                    return revealFrozen(node);
                }
            }
        } else {
            Hf.log(`error`, `TreeElement.select - Input node pathId is invalid.`);
        }
    }
    /**
     * @description - Return an undirected tree element hierarchy as a string for debugging.
     *
     * @method DEBUG_LOG
     * @return {string}
     */
    // DEBUG_LOG: function DEBUG_LOG () {
    //     const tree = this;
    //
    //     Hf.forEach(tree._node, (node) => {
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
 * @description - An undirected data tree element module.
 *
 * @module TreeElement
 * @return {object}
 */
export default function TreeElement () {
    const element = Object.create(TreeElementPrototype, {
        _node: {
            value: {},
            writable: false,
            configurable: true,
            enumerable: false
        }
    });

    if (!Hf.isObject(element)) {
        Hf.log(`error`, `TreeElement - Unable to create a this element element instance.`);
    } else {
        const revealFrozen = Hf.compose(Hf.reveal, Object.freeze);
        /* reveal only the public properties and functions */
        return revealFrozen(element);
    }
}
