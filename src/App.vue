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

<script>

import Tree from 'vue-infinite-tree';
import 'vue-infinite-tree/dist/vue-infinite-tree.css';

export default {
    name: 'case-1',
    components: {
      Tree,
    },
    data() {
      return {
        text: '',
        treeList: []
      }
    },
    watch: {
      text(val) {
        this.$refs.tree.filter(val);
      }
    },

    // treeList: any[] = [{
    //     name: '一级 1',
    //     id: 1,
    // }, {
    //     id: 4,
    //     name: '一级 2',
    // }, {
    //     id: 9,
    //     name: '一级 3',
    // }]

    mounted() {
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
    },

    methods: {
      renderContent(h, { node, data, store }) {
          return h('span', {}, data.name);
      },

      load(parentNode, resolve) {
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
      },

      filterNode(value, data) {
          if (!value) return true;
          return data.name.indexOf(value) !== -1;
      },

      handleClick() {
          // this.updateKeyChildren();
          // this.getCurrentKey();
          // this.setCurrentKey();
          // this.remove();
          // this.append();
          // this.insertBefore();
          this.insertAfter();
      },

      insertAfter() {
          // this.$refs.tree.insertAfter({
          //     id: 15,
          //     name: 'test2',
          // }, 12);
      },

      insertBefore() {
          // this.$refs.tree.insertBefore({
          //     id: 15,
          //     name: 'test2',
          // }, 3);
      },

      append() {
          // this.$refs.tree.append({
          //     id: 14,
          //     name: 'test',
          // }, 12);
      },


      remove() {
          // this.$refs.tree.remove(12);
      },

      setCurrentKey() {
          // this.$refs.tree.setCurrentKey(9);
      },

      getCurrentKey() {
          // console.log(this.$refs.tree.getCurrentKey());
          // console.log(this.$refs.tree.getCurrentNode());
      },

      updateKeyChildren() {
          // this.$refs.tree.updateKeyChildren(1, [{
          //     id: 3,
          //     name: '三级 1-1-1',
          // }]);
      }
    }
}
</script>

<style scoped>
.tree-wrapper {
    height: 500px;
}
</style>
