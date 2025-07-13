<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // 监听外部系统集成事件
    this.$bus.$on('external-load-images', this.handleExternalLoadImages);
    this.$bus.$on('external-get-annotations', this.handleExternalGetAnnotations);
  },
  beforeDestroy() {
    this.$bus.$off('external-load-images');
    this.$bus.$off('external-get-annotations');
  },
  methods: {
    // 处理外部系统加载图片的请求
    handleExternalLoadImages(images) {
      this.$store.commit('annotation/setImages', images);
    },
    // 处理外部系统获取标注数据的请求
    handleExternalGetAnnotations() {
      const annotations = this.$store.getters['annotation/getAllAnnotations'];
      this.$bus.$emit('external-annotations-ready', annotations);
    }
  }
}
</script>

<style>
#app {
  height: 100vh;
  overflow: hidden;
  background-color: #f5f5f5;
}

/* 全局样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>