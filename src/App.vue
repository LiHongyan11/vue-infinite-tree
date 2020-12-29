<template>
    <div>
        <input v-model="text" />
        <button @click="handleClick">按钮</button>
        <tree
            class="tree-wrapper"
            ref="tree"
            :filter-node-method="filterNode"
            :data="treeList"
            node-key="id"
            :default-expanded-keys="[3, 9]"
            :props="{
            children: 'children',
            label: 'name',
            disabled: 'disabled',
        }"
        >
          <template v-slot="{node}">
            <span>{{node.label}}</span>
          </template>
        </tree>

    </div>
</template>

<script lang="ts">
// @ts-nocheck

import { Component, Vue, Watch } from 'vue-property-decorator';
import Tree from './components/tree.vue';

@Component({
    name: 'case-1',
    components: {
        Tree,
    },
})
export default class Case1 extends Vue {
    public text = '';

    public treeList: any[] = [];

    // public treeList: any[] = [{
    //     name: '一级 1',
    //     id: 1,
    // }, {
    //     id: 4,
    //     name: '一级 2',
    // }, {
    //     id: 9,
    //     name: '一级 3',
    // }]
    @Watch('text')
    public onTextChange(val: string) {
        this.$refs.tree.filter(val);
    }

    public mounted() {
        setTimeout(() => {
            this.treeList = [{
                name: '一级 1',
                id: 1,
                children: [{
                    id: 2,
                    name: '二级 1-1',
                    children: [{
                        id: 3,
                        name: '三级 1-1-1',
                    }],
                }],
            }, {
                id: 4,
                name: '一级 2',
            }, {
                id: 9,
                name: '一级 3',
                children: [{
                    id: 10,
                    name: '二级 3-1',
                    children: [{
                        id: 11,
                        name: '三级 3-1-1',
                    }],
                }, {
                    id: 12,
                    name: '二级 3-2',
                    children: [{
                        id: 13,
                        name: '三级 3-2-1',
                    }],
                }],
            }];
        }, 2000);
    }

    public renderContent(h: any, { node, data, store }: any) {
        return h('span', {}, data.name);
    }

    public load(parentNode: any, resolve: any) {
        const nodes = [
            {
                id: 40,
                name: 'Node 1',
                isLeaf: true,
            },
            {
                id: 50,
                name: 'Node 2',
                isLeaf: true,
            },
        ];
        setTimeout(() => {
            resolve([]);
        }, 100);
    }

    public filterNode(value: any, data: any) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
    }

    public handleClick() {
        // this.updateKeyChildren();
        // this.getCurrentKey();
        // this.setCurrentKey();
        // this.remove();
        // this.append();
        // this.insertBefore();
        this.insertAfter();
    }

    public insertAfter() {
        // this.$refs.tree.insertAfter({
        //     id: 15,
        //     name: 'test2',
        // }, 12);
    }

    public insertBefore() {
        // this.$refs.tree.insertBefore({
        //     id: 15,
        //     name: 'test2',
        // }, 3);
    }

    public append() {
        // this.$refs.tree.append({
        //     id: 14,
        //     name: 'test',
        // }, 12);
    }


    public remove() {
        // this.$refs.tree.remove(12);
    }

    public setCurrentKey() {
        // this.$refs.tree.setCurrentKey(9);
    }

    public getCurrentKey() {
        // console.log(this.$refs.tree.getCurrentKey());
        // console.log(this.$refs.tree.getCurrentNode());
    }

    public updateKeyChildren() {
        // this.$refs.tree.updateKeyChildren(1, [{
        //     id: 3,
        //     name: '三级 1-1-1',
        // }]);
    }
}
</script>

<style scoped>
.tree-wrapper {
    height: 500px;
}
</style>
