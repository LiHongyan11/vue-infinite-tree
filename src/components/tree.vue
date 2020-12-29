<template>
    <div class="infinite-tree" ref="buiTreeScroller" @scroll="handleScroll">
        <div class="infinite-tree-item-placeholder infinite-tree-item" ref="infinite-tree-item-placeholder">{{data[0] && data[0][props.label]}}</div>
        <div class="tree-content-placeholder" :style="{height: contentHeight + 'px'}"></div>
        <div class="tree-content" :style="{ transform: `translateY(${offset}px)` }">
            <tree-node
                v-for="node in visibleData"
                :key="nodeKey ? node.data[nodeKey] : node.id"
                :node="node"
                :render-content="renderContent"
            >
            </tree-node>
            <div class="tree__empty-block" v-if="isEmpty">
                <span class="tree__empty-text">{{ emptyText }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    Component, Vue, Prop, Watch,
} from 'vue-property-decorator';
import TreeNode from './tree-node.vue';
import TreeStore from './model/tree-store';
import Node from './model/node';

@Component({
    name: 'infinite-tree',
    components: {
        TreeNode,
    },
})
export default class BuiTree extends Vue {
    public itemHeight = 0;

    public contentHeight = 0;

    public offset = 0;

    public visibleData: any[] = [];

    public root: any[] = [];

    public isTree!: boolean;

    public store!: any;

    @Prop({ type: Array, default: () => [] })
    public data!: any[];

    @Prop({
        type: Object,
        default: () => ({
            children: 'children',
            label: 'label',
            disabled: 'disabled',
        }),
    })
    public props!: any;

    @Prop({ type: String })
    public nodeKey!: string;

    @Prop({ type: Number, default: 100 })
    public renderCount!: number;

    @Prop({ type: Boolean, default: false })
    public defaultExpandAll!: boolean;

    @Prop({ type: Array, default: () => ([]) })
    public defaultExpandedKeys!: any[];

    @Prop({ type: Boolean, default: false })
    public lazy!: boolean;

    @Prop({ type: Boolean, default: true })
    public expandOnClickNode!: boolean;

    @Prop({ type: Boolean, default: true })
    public autoExpandParent!: boolean;

    @Prop({ type: Number, default: 18 })
    public indent!: number;

    @Prop({ type: String })
    iconClass!: string

    @Prop({ type: String, default: '暂无数据' })
    emptyText!: string

    @Prop({ type: [String, Number] })
    currentNodeKey!: string | number

    @Prop({ type: Function })
    public filterNodeMethod!: any;

    @Prop({ type: Function })
    public load!: any;

    @Prop({ type: Function })
    public renderContent!: any;

    public created() {
        this.isTree = true;
    }

    @Watch('data', { immediate: true })
    public onDataChange(data: any[]) {
        const dataString: string = JSON.stringify(data);
        const newData: any[] = JSON.parse(dataString);
        if (!this.store) {
            this.store = new TreeStore({
                key: this.nodeKey,
                data: newData,
                props: this.props,
                lazy: this.lazy,
                load: this.load,
                autoExpandParent: this.autoExpandParent,
                currentNodeKey: this.currentNodeKey,
                defaultExpandAll: this.defaultExpandAll,
                filterNodeMethod: this.filterNodeMethod,
                defaultExpandedKeys: this.defaultExpandedKeys,
                updateView: this.updateView,
            });
        } else {
            this.store.setData(newData);
        }
        this.root = this.store.root;

        this.$nextTick(() => {
            // 重置滚动条
            const scrollWrap: any = this.$refs['buiTreeScroller'] || {};
            scrollWrap.scrollTop = 0;

            const el: any = this.$refs['infinite-tree-item-placeholder'] || {};
            this.itemHeight = el.offsetHeight || this.itemHeight;
            this.updateVisibleData();
            this.getContentHeight();
        });
    }

    get isEmpty() {
        return !this.visibleData.length;
    }

    @Watch('root')
    public onRootChange(root: any[]) {
        this.updateView();
    }

    @Watch('defaultExpandedKeys')
    public onExpandedKeysChange() {
        this.setExpandedNode();
    }

    @Watch('currentNodeKey')
    public onCurrentNodeKeyChange(key: string | number) {
        this.setCurrentKey(key);
    }

    public updateView() {
        this.getContentHeight();
        this.handleScroll();
    }

    public handleScroll() {
        const { scrollTop }: any = this.$refs.buiTreeScroller;
        this.updateVisibleData(scrollTop);
    }

    public getContentHeight() {
        this.contentHeight = (this.root || []).filter((item: Node) => item.visible).length * this.itemHeight;
    }

    public updateVisibleData(scrollTop = 0) {
        const start = Math.floor(scrollTop / this.itemHeight);
        const end = start + this.renderCount;
        const allVisibleData = (this.root || []).filter(
            (item: any) => item.visible,
        );
        this.visibleData = allVisibleData.slice(start, end);
        this.offset = start * this.itemHeight;
    }

    public getNode(data: any) {
        return this.store.getNode(data);
    }

    public append(data: any, parent: any) {
        this.store.append(data, parent);
        this.updateView();
    }

    public insertBefore(data: any, ref: any) {
        this.store.insertBefore(data, ref);
        this.updateView();
    }

    public insertAfter(data: any, ref: any) {
        this.store.insertAfter(data, ref);
        this.updateView();
    }

    public remove(data: any) {
        this.store.remove(data);
        this.updateView();
    }

    public updateKeyChildren(key: any, data: any[]) {
        this.store.updateKeyChildren(key, data);
        this.updateView();
    }

    public filter(val: any) {
        this.store.filter(val);
        this.updateView();
    }

    public setCurrentNode(data: any) {
        this.store.setCurrentNode(data);
    }

    public setCurrentKey(key: any) {
        this.store.setCurrentKey(key);
    }

    public getCurrentNode() {
        return this.store.getCurrentNode();
    }

    public getCurrentKey() {
        return this.store.getCurrentKey();
    }

    public setExpandedNode() {
        this.store.setExpandedNode(this.defaultExpandedKeys);
        this.updateView();
    }
}
</script>

<style scoped>
.infinite-tree {
    position: relative;
    overflow-y: scroll;
    
}
.tree-content-placeholder, .tree-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.infinite-tree-item-placeholder {
    visibility: hidden;
}
.tree__empty-block {
    min-height: 60px;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #bfbfbf;
}
</style>
