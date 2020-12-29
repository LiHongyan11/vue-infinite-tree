<template>
    <div
        class="infinite-tree-item"
        :class="{
            'is-expanded': node.expanded,
            'is-current': node.isCurrent,
            'is-hidden': !node.visible,
        }"
        :aria-expanded="node.expanded"
        @click="handleNodeClick"
        @contextmenu="handleNodeContextMenu"
    >
        <div
            class="tree-node__content"
            :style="{'padding-left': (node.level - 1) * tree.indent + 'px'}">
            <span
                @click.stop="handleExpandIconClick"
                :class="[
                { 'is-leaf': node.isLeaf, expanded: expanded },
                'tree-node__expand-icon',
                icon,
                ]"
            >
            </span>
            <node-content :node="node"></node-content>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Node from './model/node';

@Component({
    name: 'tree-node',
    components: {
        NodeContent: {
            props: {
                node: {
                    required: true,
                },
            },
            render(h: any) {
                const parent = this.$parent;
                const { tree, renderContent, _renderProxy }: any = parent;
                const { node }: any = this;
                const { data, store } = node;
                if (renderContent) {
                    return renderContent.call(_renderProxy, h, {
                        _self: tree.$vnode.context, node, data, store,
                    });
                }
                if (tree.$scopedSlots.default) {
                    return h('div', {style: 'flex: 1'}, tree.$scopedSlots.default({ node, data }));
                }
                return h('span', {
                    attrs: {
                        class: 'tree-node__label',
                    },
                }, node[tree.props.label] || data[tree.props.label]);
            },
        },
    },
})
export default class BuiTreeNode extends Vue {
    @Prop({ type: Object, required: true })
    public node!: Node;

    @Prop({ type: Function })
    public renderContent!: any;

    public tree!: any;

    public created() {
        const parent: any = this.$parent;

        if (parent.isTree) {
            this.tree = parent;
        } else {
            this.tree = parent.tree;
        }

        if (!this.tree) {
            console.warn('Can not find node\'s tree.');
        }
    }

    get expanded() {
        return !this.node.isLeaf && this.node.expanded;
    }

    get icon() {
        if (this.node.loading) {
            return 'el-icon-loading';
        }
        if (this.tree.iconClass) {
            return this.tree.iconClass;
        }
        return 'icon-arrow-right';
    }

    public handleNodeClick() {
        this.tree.$emit('node-click', this.node.data, this.node, this);
        this.tree.store.setCurrentNode(this.node);
        if (this.tree.expandOnClickNode) {
            this.handleExpandIconClick();
        }
    }

    public handleExpandIconClick() {
        if (this.node.isLeaf) return;
        if (this.node.expanded) {
            this.tree.$emit('node-collapse', this.node.data, this.node, this);
        } else {
            this.tree.$emit('node-expand', this.node.data, this.node, this);
        }
        this.tree.store.toggleExpand(this.node);
        this.tree.updateView();
    }

    public handleNodeContextMenu(e: any) {
        this.tree.$emit('node-expand', e, this.node.data, this.node, this);
    }
}
</script>

<style scoped>
.infinite-tree-item {
    font-size: 14px;
    line-height: 40px;
    cursor: pointer;
    color: #595959;
}
.infinite-tree-item:hover, .infinite-tree-item.is-current {
    background: rgb(72, 78, 113, 10%);
}
.tree-node__content {
    display: flex;
    align-items: center;
}
.icon-arrow-right::before {
    content: '>';
}
.tree-node__expand-icon {
    cursor: pointer;
    transform: rotate(0deg);
    transition: transform 0.3s ease-in-out;
    font-size: 14px;
    padding: 0 8px;
}
.tree-node__expand-icon.expanded {
    transform: rotate(90deg);
}
.tree-node__expand-icon.is-leaf {
    color: transparent;
    cursor: default;
}
</style>
