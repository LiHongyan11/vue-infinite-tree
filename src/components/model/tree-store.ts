import Node from './node';

class Fields {
    filtered?: boolean = false;

    currentNode?: any = null;

    key!: string;

    data: any = null;

    props!: any;

    lazy = false;

    load!: any;

    defaultExpandAll = false;

    autoExpandParent = false;

    filterNodeMethod!: any;

    defaultExpandedKeys: any[] = [];

    updateView!: any;

    currentNodeKey?: string | number;
}

interface FlattenProps {
    parent?: Node;
    visible?: boolean;
    expanded?: boolean;
}


export default class TreeStore extends Fields {
    root: any[] = [];

    constructor(options: Fields) {
        super();
        Object.assign(this, options);

        this.setData(this.data);
    }

    flattenData(data: any, props: FlattenProps) {
        let arr: any[] = [];

        if (!data || !data.length) {
            return null;
        }

        data.forEach((item: any) => {
            item = new Node({
                data: item,
                store: this,
                label: item[this.props.label],
                ...props,
            });
            arr.push(item);
            const children = this.flattenData(
                item.data[this.props.children],
                { parent: item, visible: this.defaultExpandAll, expanded: this.defaultExpandAll },
            );
            if (children) {
                arr = arr.concat(children);
            }
        });

        return arr;
    }

    setChildren(data: any[]) {
        const map: any = {};
        data.forEach((item: Node) => {
            if (item.parent) {
                if (!map[item.parent.id]) {
                    map[item.parent.id] = [];
                }
                map[item.parent.id].push(item);
            }
        });
        data.forEach((item: Node) => {
            item.children = map[item.id];
            item.updateLeafState();
        });
        return data;
    }

    flattenDataAndInit(data: any[], props: FlattenProps) {
        const flattenData = this.flattenData(data, props);
        return flattenData ? this.setChildren(flattenData) : [];
    }

    setData(data: any[]) {
        if (!Array.isArray(data)) {
            throw new Error('setData error: data must be an Array.');
        }

        this.root = this.flattenDataAndInit(
            data,
            { visible: true, expanded: this.defaultExpandAll },
        );
        this.setExpandedNode();
        if (this.currentNodeKey) {
            this.setCurrentKey(this.currentNodeKey);
        }
    }

    getNodeNextSibling(node: Node) {
        const index: number = this.getNodeIndex(node);
        if (index === this.root.length - 1) {
            return { node: null, index: -1 };
        }
        if (index !== -1) {
            for (let i = index + 1, j = this.root.length; i < j; i += 1) {
                if (this.root[i].level < node.level) { // 出现level比当前节点小的，说明后面没有兄弟节点
                    return { index: i, node: this.root[i], isNextSibling: false };
                }
                if (this.root[i].level === node.level) {
                    return { index: i, node: this.root[i], isNextSibling: true };
                }
            }
        }
        return { node: null, index: -1 };
    }

    getNodePrevSibling(node: any) {
        const index = this.getNodeIndex(node);
        if (index === 0) {
            return { node: null, index: -1 };
        }
        if (index !== -1) {
            for (let i = index - 1; i >= 0; i -= 1) {
                if (this.root[i].level < node.level) { // 出现level比当前节点小的，说明后面没有兄弟节点
                    return { index: i, node: this.root[i], isPrevSibling: false };
                }
                if (this.root[i].level === node.level) {
                    return { index: i, node: this.root[i], isPrevSibling: true };
                }
            }
        }
        return { node: null, index: -1 };
    }

    getNodeIndex(node: Node) {
        if (node instanceof Node) {
            const index = this.root.findIndex(item => item.id === node.id);
            return index;
        }
        return -1;
    }

    getNode(data: any) {
        if (data instanceof Node) {
            if (this.root.findIndex(item => item.id === data.id) === -1) {
                return null;
            }
            return data;
        }

        let findItem = null;
        if (this.key) {
            if (typeof data !== 'object') {
                findItem = this.root.find(item => item.data[this.key] === data);
            } else {
                findItem = this.root.find(item => item.data[this.key] === data[this.key]);
            }
        } else {
            // eslint-disable-next-line no-lonely-if
            if (typeof data !== 'object') {
                findItem = this.root.find(item => item.id === data);
            } else {
                findItem = this.root.find(item => item.id === data.$treeNodeId);
            }
        }
        return findItem;
    }

    getNodeParent(node: Node) {
        if (node.parent) {
            const index = this.getNodeIndex(node.parent);
            return { node: node.parent, index };
        }
        return { node: null, index: -1 };
    }

    getNodeLastChild(node: Node) {
        const index = this.getNodeIndex(node);
        if (index < 0) {
            return null;
        }
        if (node.children && node.children.length) {
            const lastNode = node.children[node.children.length - 1];
            const lastNodeIndex = this.getNodeIndex(lastNode);

            return { node: lastNode, index: lastNodeIndex };
        }
        return { node: null, index: -1 };
    }

    toggleExpand(node: Node) {
        if (!this.getNode(node)) {
            return;
        }
        const isExpand = node.expanded;
        if (node.children && node.children.length) {
            if (isExpand) {
                node.handleCollapse();
                // this.handleCollapse(node); // 折叠
            } else {
                node.handleExpand();
                // this.handleExpand(node); // 展开
            }
        } else if (this.lazy && this.load && typeof this.load === 'function') {
            if (isExpand) {
                node.handleCollapse();
            } else {
                if (node.data[this.props.isLeaf]) {
                    return;
                }
                node.expanded = true;
                node.loading = true;
                this.load(node, (data: any[]) => {
                    this.createChildren(node, data);
                    node.loaded = true;
                    node.updateLeafState();
                    node.loading = false;
                });
            }
        }
    }

    createChildren(parentNode: Node, data: any[]) {
        const index = this.getNodeIndex(parentNode);
        const flattenData = this.flattenData(data, { parent: parentNode, visible: parentNode.expanded });
        const arrs = flattenData ? this.setChildren([parentNode].concat(flattenData)) : [parentNode]; // 父节点传进去是为了保证父节点children的设置

        const children = arrs.slice(1);

        this.root.splice(index + 1, 0, ...children);

        parentNode.children = children.length ? arrs[0].children : [];
    }

    // handleCollapse(node) {
    //     node.expanded = false;
    //     const index = this.getNodeIndex(node);
    //     if (index !== -1) { // 以level做判断，找到需要折叠的元素
    //         for (let i = index + 1, j = this.root.length; i < j; i++) {
    //             if (this.root[i].level > node.level) {
    //                 this.root[i].visible = false;
    //                 if (this.root[i].data[this.props.children]) {
    //                     this.root[i].expanded = false;
    //                 }
    //             } else {
    //                 break;
    //             }
    //         }
    //     }
    // }

    // handleExpand(node) {
    //     node.expanded = true;
    //     const index = this.getNodeIndex(node);
    //     if (index !== -1) { // 以level做判断，找到需要展开的直接子元素
    //         for (let i = index + 1, j = this.root.length; i < j; i++) {
    //             if (this.root[i].level === node.level + 1) {
    //                 this.root[i].visible = true;
    //             } else if (this.root[i].level <= node.level) {
    //                 break;
    //             }
    //         }
    //     }
    // }

    append(data: any, parent: any) {
        const parentNode = this.getNode(parent);
        if (!parentNode) {
            return false;
        }
        let { index } = this.getNodeNextSibling(parentNode) || { index: -1 };
        if (index === -1) {
            index = this.root.length;
        }
        if (!parentNode.children) {
            parentNode.children = [];
            parentNode.data[this.props.children] = [];
        }
        const node = new Node({
            data,
            label: data[this.props.label],
            store: this,
            parent: parentNode,
            visible: parentNode.expanded,
        });
        this.root.splice(index, 0, node);
        parentNode.data[this.props.children].push(data);
        parentNode.children.push(node);
        node.updateLeafState();
        parentNode.updateLeafState();

        return true;
    }

    insert(index: number, { parent, data, refNode }: any, loc: string) {
        const node = new Node({
            data,
            label: data[this.props.label],
            store: this,
            parent,
            visible: parent ? parent.expanded : true, // 没有parent说明是一级节点，需要展示
        });
        this.root.splice(index, 0, node);
        node.updateLeafState();
        if (parent) {
            // Node children
            const refNodeIndex = parent.children.findIndex((item: any) => item.id === refNode.id);
            // 源数据 children
            const dataOfChildren = parent.data[this.props.children];
            const RefDataIndex = dataOfChildren.findIndex((item: any) => refNode.id === item.$treeNodeId);
            if (refNodeIndex >= 0) {
                if (loc === 'prev') {
                    parent.children.splice(refNodeIndex, 0, node);
                    dataOfChildren.splice(RefDataIndex, 0, data);
                } else if (loc === 'next') {
                    parent.children.splice(refNodeIndex + 1, 0, node);
                    dataOfChildren.splice(RefDataIndex + 1, 0, data);
                }
            }
        }
    }

    insertBefore(data: any, ref: any) {
        const refNode = this.getNode(ref);
        if (refNode) {
            const parent: any = this.getNodeParent(refNode) || {};
            const index = this.getNodeIndex(refNode);

            this.insert(index, { data, parent: parent.node || null, refNode }, 'prev');
        }
    }

    insertAfter(data: any, ref: any) {
        const refNode = this.getNode(ref);
        if (refNode) {
            const parent: any = this.getNodeParent(refNode) || {};
            const nextSibling = this.getNodeNextSibling(refNode);

            if (nextSibling && nextSibling.index !== -1) {
                this.insert(nextSibling.index, { data, parent: parent.node || null, refNode }, 'next');
            } else {
                const idx = this.root.length;
                this.insert(idx, { data, parent: parent.node || null, refNode }, 'next');
            }
        }
    }

    remove(data: any) {
        const node = this.getNode(data);
        if (!node) {
            return false;
        }
        const parent = this.getNodeParent(node);
        const index = this.getNodeIndex(node);
        const nextNode = this.getNodeNextSibling(node);

        if (index < 0) {
            return false;
        }
        let length = 1;
        if (nextNode && nextNode.index !== -1) {
            length = nextNode.index - index;
        } else {
            length = this.root.length - index + 1;
        }

        this.root.splice(index, length);
        if (parent && parent.index !== -1) {
            const { node: parentNode } = parent;
            // Node children
            const childIndex = parentNode.children.findIndex((item: any) => item.id === node.id);
            if (childIndex !== -1) {
                parentNode.children.splice(childIndex, 1);
            }
            // 源数据 children
            const dataOfChildren = parentNode.data[this.props.children];
            const RefDataIndex = dataOfChildren.findIndex((item: any) => node.id === item.$treeNodeId);
            if (RefDataIndex !== -1) {
                dataOfChildren.splice(RefDataIndex, 1);
            }

            // 重置currentNode
            if (node === this.currentNode) {
                this.currentNode = null;
            }
            parentNode.updateLeafState();
        }
    }

    updateKeyChildren(key: string, data: any[]) {
        if (!this.key) {
            throw new Error('[Tree] nodeKey is required in updateKeyChild');
        }
        if (!Array.isArray(data)) {
            return;
        }
        const parentNode = this.getNode(key);
        if (!parentNode) {
            return;
        }

        if (parentNode.visible) {
            parentNode.expanded = true;
        }

        const index = this.getNodeIndex(parentNode);
        if (index < 0) {
            return;
        }

        const deleteNodes = [];
        for (let i = index + 1, j = this.root.length; i < j; i += 1) {
            if (this.root[i].level > parentNode.level) {
                deleteNodes.push(this.root[i].id);
            } else {
                break;
            }
        }

        const flattenData = this.flattenData(data, { parent: parentNode, visible: parentNode.expanded });
        const arrs = flattenData ? this.setChildren([parentNode].concat(flattenData)) : [parentNode]; // 父节点传进去是为了保证父节点children的设置

        const children = arrs.slice(1);

        this.root.splice(index + 1, deleteNodes.length, ...children);
        // Node children
        parentNode.children = children.length ? arrs[0].children : [];

        // 源数据 children
        parentNode.data[this.props.children] = data;

        parentNode.updateLeafState();
    }

    filter(value: any) {
        const { filterNodeMethod }: any = this;
        const filteredIds: any[] = [];
        if (value) {
            this.filtered = true;
        } else {
            this.filtered = false;
        }
        this.root.forEach((node: Node) => {
            node.visible = filterNodeMethod(value, node.data, node);
            node.filtered = node.visible;
            if (node.visible) {
                const recursionParentVisible = (node: Node) => {
                    filteredIds.push(node.id);
                    node.visible = true;
                    node.filtered = true;
                    if (node.children) {
                        node.expanded = true;
                    }
                    if (node.parent) {
                        recursionParentVisible(node.parent);
                    }
                };
                if (node.parent) {
                    recursionParentVisible(node.parent);
                }
            }
        });
        this.root.forEach((node: Node) => {
            if (filteredIds.includes(node.id)) { // 已经处理过的节点不用再处理
                return;
            }
            node.visible = filterNodeMethod(value, node.data, node);
            if (node.visible) {
                if (node.children && node.children.length) {
                    const index = this.getNodeIndex(node);
                    for (let i = index + 1, j = this.root.length; i < j; i += 1) {
                        filteredIds.push(this.root[i].id);
                        if (this.root[i].level > node.level) {
                            this.root[i].visible = true;
                            this.root[i].filtered = true;
                            // eslint-disable-next-line max-depth
                            if (this.root[i].children && this.root[i].children.length) {
                                this.root[i].expanded = true;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        });
    }

    setExpandedNode(defaultExpandedKeys = this.defaultExpandedKeys) {
        if (this.key && defaultExpandedKeys && defaultExpandedKeys.length) {
            const handledIds: any[] = [];
            defaultExpandedKeys.forEach((key: any) => {
                const node = this.getNode(key);
                if (!node) {
                    return;
                }
                const recursionParentVisible = (node: any) => {
                    if (handledIds.includes(node.id)) {
                        return;
                    }
                    handledIds.push(node.id);
                    node.handleExpand();
                    if (!this.autoExpandParent) {
                        return;
                    }
                    if (node.parent) {
                        recursionParentVisible(node.parent);
                    }
                };
                recursionParentVisible(node);
            });
        }
    }

    getCurrentNode() {
        return this.currentNode;
    }

    getCurrentKey() {
        if (!this.key) {
            throw new Error('[Tree] nodeKey is required in getCurrentKey');
        }
        if (!this.currentNode) {
            return null;
        }
        return this.currentNode.data[this.key];
    }

    setCurrentNode(data: any) {
        if (!data) {
            this.currentNode.isCurrent = false;
            this.currentNode = null;
            return;
        }
        const node = this.getNode(data);
        if (!node) {
            return;
        }
        const prevCurrentNode = this.currentNode;
        if (prevCurrentNode) {
            prevCurrentNode.isCurrent = false;
        }
        this.currentNode = node;
        this.currentNode.isCurrent = true;
    }

    setCurrentKey(key: any) {
        if (!key) {
            this.currentNode.isCurrent = false;
            this.currentNode = null;
            throw new Error('[Tree] nodeKey is required in setCurrentKey');
        }
        const node = this.getNode(key);
        this.setCurrentNode(node);
    }
}
