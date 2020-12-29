let nodeIdSeed = 0;

export default class Node {
    id = 0;

    label!: string;

    level!: number;

    data!: any;

    expanded = false;

    parent!: any;

    children!: any;

    visible = false;

    filtered = false;

    isCurrent = false;

    isLeaf = false;

    loaded= false;

    loading = false;

    store!: any;

    constructor(options: any) {
        this.id = nodeIdSeed;
        Object.assign(this, options);

        nodeIdSeed += 1;

        this.level = 1;
        if (this.data) {
            this.data.$treeNodeId = this.id;
        }

        if (this.parent) {
            this.level = this.parent.level + 1;
        }
        if (!options.store) {
            throw new Error('[Node]store is required!');
        }
    }

    handleCollapse() {
        this.expanded = false;
        this.recursionVisible(this.children, false);
    }

    handleExpand() {
        this.expanded = true;
        this.recursionVisible(this.children, true);
    }

    recursionVisible(children: any[], status: boolean) {
        if (!children || !children.length) {
            return false;
        }
        children.forEach((node: Node) => {
            node.visible = status;
            if (this.store.filtered && !node.filtered && status) {
                node.visible = false;
            }
            if (node.children && !status) {
                node.expanded = false;
                this.recursionVisible(node.children, status);
            }
        });
    }

    updateLeafState() {
        const { props, lazy, load }: any = this.store;
        if (props && typeof props.isLeaf !== 'undefined') {
            const isLeaf = this.getPropertyFromData(this, 'isLeaf');
            if (typeof isLeaf === 'boolean') {
                this.isLeaf = isLeaf;
            }
        } else if (!lazy || (lazy && load && typeof load === 'function' && this.loaded)) {
            if (!this.children || !this.children.length) {
                this.isLeaf = true;
            } else {
                this.isLeaf = false;
            }
        }
    }

    getPropertyFromData(node: Node, prop: string) {
        const { store: { props }, data = {} } = node;
        const config = props[prop];

        if (typeof config === 'function') {
            return config(data, node);
        } if (typeof config === 'string') {
            return data[config];
        } if (typeof config === 'undefined') {
            const dataProp = data[prop];
            return dataProp === undefined ? '' : dataProp;
        }
    }
}
