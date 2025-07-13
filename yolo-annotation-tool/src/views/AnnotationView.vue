<template>
  <div class="annotation-view">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="openFileDialog">
          <i class="icon-upload"></i> 导入图片
        </button>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        >
        <button class="btn" @click="exportAnnotations" :disabled="!hasAnnotations">
          <i class="icon-download"></i> 导出标注
        </button>
      </div>
      <div class="toolbar-center">
        <span class="image-info" v-if="currentImage">
          {{ currentImageIndex + 1 }} / {{ imageCount }}
        </span>
      </div>
      <div class="toolbar-right">
        <button class="btn" @click="zoomIn">
          <i class="icon-zoom-in"></i> 放大
        </button>
        <button class="btn" @click="zoomOut">
          <i class="icon-zoom-out"></i> 缩小
        </button>
        <button class="btn" @click="resetZoom">
          <i class="icon-fit"></i> 适应
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧图片列表 -->
      <div class="sidebar-left">
        <ImageList />
      </div>

      <!-- 中间标注区域 -->
      <div class="annotation-area">
        <AnnotationCanvas v-if="currentImage" />
        <div v-else class="empty-state">
          <div class="drop-zone" @drop.prevent="handleDrop" @dragover.prevent>
            <i class="icon-image"></i>
            <p>拖拽图片到此处或点击上方"导入图片"按钮</p>
          </div>
        </div>
      </div>

      <!-- 右侧类别和标注列表 -->
      <div class="sidebar-right">
        <ClassSelector />
        <AnnotationList />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
import ImageList from '@/components/ImageList.vue';
import AnnotationCanvas from '@/components/AnnotationCanvas.vue';
import ClassSelector from '@/components/ClassSelector.vue';
import AnnotationList from '@/components/AnnotationList.vue';
import { exportToYOLO } from '@/utils/yoloExporter';

export default {
  name: 'AnnotationView',
  components: {
    ImageList,
    AnnotationCanvas,
    ClassSelector,
    AnnotationList
  },
  computed: {
    ...mapGetters('annotation', [
      'currentImage',
      'imageCount',
      'getAllAnnotations'
    ]),
    currentImageIndex() {
      return this.$store.state.annotation.currentImageIndex;
    },
    hasAnnotations() {
      const annotations = this.getAllAnnotations;
      return Object.keys(annotations).some(key => annotations[key].length > 0);
    }
  },
  mounted() {
    // 初始化类别
    this.$store.commit('annotation/SET_CLASSES', this.$config.defaultClasses);
  },
  methods: {
    ...mapActions('annotation', ['loadImages']),
    ...mapMutations('annotation', ['SET_SCALE']),
    
    openFileDialog() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.processFiles(files);
    },
    
    handleDrop(event) {
      const files = Array.from(event.dataTransfer.files);
      this.processFiles(files);
    },
    
    processFiles(files) {
      const imageFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return this.$config.supportedFormats.includes(ext);
      });
      
      if (imageFiles.length === 0) {
        alert('请选择支持的图片格式：' + this.$config.supportedFormats.join(', '));
        return;
      }
      
      const images = imageFiles.map((file, index) => ({
        id: Date.now() + '_' + index,
        name: file.name,
        file: file,
        url: URL.createObjectURL(file)
      }));
      
      this.loadImages(images);
    },
    
    exportAnnotations() {
      exportToYOLO(this.$store.state.annotation);
    },
    
    zoomIn() {
      const currentScale = this.$store.state.annotation.scale;
      this.SET_SCALE(Math.min(currentScale * 1.2, 5));
    },
    
    zoomOut() {
      const currentScale = this.$store.state.annotation.scale;
      this.SET_SCALE(Math.max(currentScale / 1.2, 0.1));
    },
    
    resetZoom() {
      this.SET_SCALE(1);
    }
  }
}
</script>

<style scoped>
.annotation-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.btn-primary:hover {
  background: #66b1ff;
}

.image-info {
  font-size: 14px;
  color: #666;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-left {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.annotation-area {
  flex: 1;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.sidebar-right {
  width: 280px;
  background: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone {
  width: 400px;
  height: 300px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.3s;
}

.drop-zone:hover {
  border-color: #409eff;
  color: #409eff;
}

.icon-image {
  font-size: 48px;
  margin-bottom: 20px;
}

/* 图标样式（简单实现） */
[class^="icon-"]::before {
  content: "•";
  margin-right: 5px;
}
</style>