import InfiniteTree from './components/tree.vue';

InfiniteTree.install = function install(Vue) {
  Vue.component(InfiniteTree.name, InfiniteTree);
}

export default InfiniteTree;

export {InfiniteTree};