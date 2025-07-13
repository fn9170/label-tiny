<template>
  <div class="annotation-list">
    <h3 class="list-header">
      标注列表
      <span class="annotation-count">({{ currentImageAnnotations.length }})</span>
    </h3>
    <div class="annotation-items">
      <div
        v-for="(annotation, index) in currentImageAnnotations"
        :key="index"
        class="annotation-item"
        :class="{ active: selectedAnnotationIndex === index }"
        @click="selectAnnotation(index)"
      >
        <span
          class="annotation-color"
          :style="{ backgroundColor: getClassColor(annotation.class) }"
        ></span>
        <div class="annotation-info">
          <span class="annotation-class">{{ getClassName(annotation.class) }}</span>
          <span class="annotation-coords">
            中心: ({{ (annotation.x_center * 100).toFixed(1) }}%, {{ (annotation.y_center * 100).toFixed(1) }}%)
            尺寸: {{ (annotation.width * 100).toFixed(1) }}% × {{ (annotation.height * 100).toFixed(1) }}%
          </span>
        </div>
        <button
          class="btn-delete"
          @click.stop="deleteAnnotation(index)"
          title="删除"
        >
          ×
        </button>
      </div>
      <div v-if="currentImageAnnotations.length === 0" class="empty-message">
        暂无标注，请在图片上绘制矩形框
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'AnnotationList',
  data() {
    return {
      selectedAnnotationIndex: null
    };
  },
  computed: {
    ...mapState('annotation', ['classes']),
    ...mapGetters('annotation', ['currentImage', 'currentImageAnnotations'])
  },
  mounted() {
    this.$bus.$on('annotation-selected', this.handleAnnotationSelected);
  },
  beforeDestroy() {
    this.$bus.$off('annotation-selected');
  },
  methods: {
    ...mapMutations('annotation', ['DELETE_ANNOTATION']),
    
    getClassName(classId) {
      const classInfo = this.classes.find(c => c.id === classId);
      return classInfo?.name || '未知';
    },
    
    getClassColor(classId) {
      const classInfo = this.classes.find(c => c.id === classId);
      return classInfo?.color || '#999';
    },
    
    selectAnnotation(index) {
      this.selectedAnnotationIndex = index;
      // 可以添加高亮显示对应标注框的逻辑
    },
    
    handleAnnotationSelected(index) {
      this.selectedAnnotationIndex = index;
    },
    
    deleteAnnotation(index) {
      if (confirm('确定删除这个标注吗？')) {
        this.DELETE_ANNOTATION({
          imageId: this.currentImage.id,
          index
        });
        if (this.selectedAnnotationIndex === index) {
          this.selectedAnnotationIndex = null;
        }
      }
    }
  }
}
</script>

<style scoped>
.annotation-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.list-header {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.annotation-count {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}

.annotation-items {
  flex: 1;
  overflow-y: auto;
}

.annotation-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.annotation-item:hover {
  background: #f5f5f5;
}

.annotation-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.annotation-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  margin-right: 10px;
  flex-shrink: 0;
  margin-top: 2px;
}

.annotation-info {
  flex: 1;
  min-width: 0;
}

.annotation-class {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.annotation-coords {
  display: block;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.btn-delete {
  width: 24px;
  height: 24px;
  border: none;
  background: #ff4444;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.3s;
}

.annotation-item:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #ff6666;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}
</style>