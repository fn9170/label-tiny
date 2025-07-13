<template>
  <div class="annotation-canvas" ref="canvasContainer">
    <div class="canvas-wrapper" :style="wrapperStyle">
      <img
        ref="image"
        :src="currentImage.url"
        @load="handleImageLoad"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        :style="imageStyle"
      />
      <!-- 已有标注 -->
      <div
        v-for="(annotation, index) in currentImageAnnotations"
        :key="index"
        class="annotation-box"
        :style="getAnnotationStyle(annotation)"
        @click="selectAnnotation(index)"
      >
        <span class="annotation-label">{{ getClassName(annotation.class) }}</span>
      </div>
      <!-- 正在绘制的框 -->
      <div
        v-if="isDrawing && drawingBox"
        class="annotation-box drawing"
        :style="getDrawingBoxStyle()"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'AnnotationCanvas',
  data() {
    return {
      imageWidth: 0,
      imageHeight: 0,
      containerWidth: 0,
      containerHeight: 0,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      drawingBox: null
    };
  },
  computed: {
    ...mapState('annotation', ['scale', 'isDrawing', 'selectedClass', 'classes']),
    ...mapGetters('annotation', ['currentImage', 'currentImageAnnotations']),
    
    wrapperStyle() {
      return {
        width: this.imageWidth + 'px',
        height: this.imageHeight + 'px',
        transform: `scale(${this.scale})`,
        transformOrigin: 'center center'
      };
    },
    
    imageStyle() {
      return {
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: this.selectedClass !== null ? 'crosshair' : 'default'
      };
    }
  },
  mounted() {
    this.updateContainerSize();
    window.addEventListener('resize', this.updateContainerSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateContainerSize);
  },
  methods: {
    ...mapMutations('annotation', ['SET_IS_DRAWING', 'ADD_ANNOTATION']),
    
    updateContainerSize() {
      if (this.$refs.canvasContainer) {
        this.containerWidth = this.$refs.canvasContainer.clientWidth;
        this.containerHeight = this.$refs.canvasContainer.clientHeight;
      }
    },
    
    handleImageLoad() {
      const img = this.$refs.image;
      const containerAspect = this.containerWidth / this.containerHeight;
      const imageAspect = img.naturalWidth / img.naturalHeight;
      
      if (imageAspect > containerAspect) {
        this.imageWidth = this.containerWidth * 0.9;
        this.imageHeight = this.imageWidth / imageAspect;
      } else {
        this.imageHeight = this.containerHeight * 0.9;
        this.imageWidth = this.imageHeight * imageAspect;
      }
    },
    
    handleMouseDown(event) {
      if (this.selectedClass === null) {
        alert('请先选择一个类别');
        return;
      }
      
      const rect = this.$refs.image.getBoundingClientRect();
      this.startX = (event.clientX - rect.left) / this.scale;
      this.startY = (event.clientY - rect.top) / this.scale;
      this.currentX = this.startX;
      this.currentY = this.startY;
      this.SET_IS_DRAWING(true);
      this.drawingBox = {
        x: this.startX,
        y: this.startY,
        width: 0,
        height: 0
      };
    },
    
    handleMouseMove(event) {
      if (!this.isDrawing) return;
      
      const rect = this.$refs.image.getBoundingClientRect();
      this.currentX = (event.clientX - rect.left) / this.scale;
      this.currentY = (event.clientY - rect.top) / this.scale;
      
      this.drawingBox = {
        x: Math.min(this.startX, this.currentX),
        y: Math.min(this.startY, this.currentY),
        width: Math.abs(this.currentX - this.startX),
        height: Math.abs(this.currentY - this.startY)
      };
    },
    
    handleMouseUp() {
      if (!this.isDrawing || !this.drawingBox) return;
      
      if (this.drawingBox.width > 5 && this.drawingBox.height > 5) {
        // 转换为YOLO格式（相对坐标）
        const annotation = {
          class: this.selectedClass,
          x_center: (this.drawingBox.x + this.drawingBox.width / 2) / this.imageWidth,
          y_center: (this.drawingBox.y + this.drawingBox.height / 2) / this.imageHeight,
          width: this.drawingBox.width / this.imageWidth,
          height: this.drawingBox.height / this.imageHeight
        };
        
        this.ADD_ANNOTATION({
          imageId: this.currentImage.id,
          annotation
        });
      }
      
      this.SET_IS_DRAWING(false);
      this.drawingBox = null;
    },
    
    handleMouseLeave() {
      if (this.isDrawing) {
        this.SET_IS_DRAWING(false);
        this.drawingBox = null;
      }
    },
    
    getAnnotationStyle(annotation) {
      const x = annotation.x_center * this.imageWidth - (annotation.width * this.imageWidth) / 2;
      const y = annotation.y_center * this.imageHeight - (annotation.height * this.imageHeight) / 2;
      const width = annotation.width * this.imageWidth;
      const height = annotation.height * this.imageHeight;
      const classInfo = this.classes.find(c => c.id === annotation.class);
      
      return {
        left: x + 'px',
        top: y + 'px',
        width: width + 'px',
        height: height + 'px',
        borderColor: classInfo?.color || '#ff0000'
      };
    },
    
    getDrawingBoxStyle() {
      if (!this.drawingBox) return {};
      const classInfo = this.classes.find(c => c.id === this.selectedClass);
      
      return {
        left: this.drawingBox.x + 'px',
        top: this.drawingBox.y + 'px',
        width: this.drawingBox.width + 'px',
        height: this.drawingBox.height + 'px',
        borderColor: classInfo?.color || '#ff0000'
      };
    },
    
    getClassName(classId) {
      const classInfo = this.classes.find(c => c.id === classId);
      return classInfo?.name || '未知';
    },
    
    selectAnnotation(index) {
      this.$bus.$emit('annotation-selected', index);
    }
  }
}
</script>

<style scoped>
.annotation-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.canvas-wrapper {
  position: relative;
  transition: transform 0.1s;
}

.annotation-box {
  position: absolute;
  border: 2px solid;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: background-color 0.3s;
}

.annotation-box:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.annotation-box.drawing {
  pointer-events: none;
  background-color: rgba(255, 255, 255, 0.1);
}

.annotation-label {
  position: absolute;
  top: -20px;
  left: 0;
  background: inherit;
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
  white-space: nowrap;
  background-color: inherit;
  border-color: inherit;
}
</style>