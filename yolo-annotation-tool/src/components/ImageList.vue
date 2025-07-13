<template>
  <div class="image-list">
    <h3 class="list-header">图片列表</h3>
    <div class="image-items">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="image-item"
        :class="{ active: index === currentImageIndex }"
        @click="selectImage(index)"
      >
        <img :src="image.url" :alt="image.name" />
        <div class="image-info">
          <span class="image-name">{{ image.name }}</span>
          <span class="annotation-count" v-if="getAnnotationCount(image.id) > 0">
            {{ getAnnotationCount(image.id) }} 个标注
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ImageList',
  computed: {
    ...mapState('annotation', ['images', 'currentImageIndex', 'annotations'])
  },
  methods: {
    ...mapMutations('annotation', ['SET_CURRENT_IMAGE_INDEX']),
    
    selectImage(index) {
      this.SET_CURRENT_IMAGE_INDEX(index);
    },
    
    getAnnotationCount(imageId) {
      return this.annotations[imageId]?.length || 0;
    }
  }
}
</script>

<style scoped>
.image-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 15px;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
}

.image-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.image-item {
  margin-bottom: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.image-item:hover {
  border-color: #409eff;
}

.image-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 8px;
  background: #fff;
}

.image-name {
  display: block;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annotation-count {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
</style>