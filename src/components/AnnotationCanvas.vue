<template>
  <div class="annotation-canvas-container">
    <div class="canvas-controls">
      <div class="zoom-controls">
        <el-button-group size="small">
          <el-button icon="el-icon-zoom-in" @click="zoomIn">放大</el-button>
          <el-button icon="el-icon-zoom-out" @click="zoomOut">缩小</el-button>
          <el-button icon="el-icon-full-screen" @click="resetZoom">重置</el-button>
        </el-button-group>
        <span class="zoom-info">{{ Math.round(scale * 100) }}%</span>
      </div>
      
      <div class="drawing-mode">
        <el-switch
          v-model="drawingMode"
          active-text="绘制模式"
          inactive-text="选择模式"
          @change="toggleDrawingMode"
        />
      </div>
    </div>
    
    <div 
      class="canvas-wrapper" 
      ref="canvasWrapper"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    >
      <div 
        class="canvas-content"
        :style="{ 
          transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: 'center center'
        }"
      >
        <!-- 图片 -->
        <img 
          v-if="image"
          :src="image.url"
          :alt="image.name"
          ref="imageElement"
          class="canvas-image"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        
        <!-- 标注框 -->
        <div 
          v-for="(annotation, index) in annotations"
          :key="annotation.id || index"
          class="annotation-box"
          :class="{ 
            selected: selectedAnnotation && selectedAnnotation.id === annotation.id,
            'category-highlight': true 
          }"
          :style="getAnnotationStyle(annotation)"
          @mousedown.stop="selectAnnotation(annotation, index)"
        >
          <!-- 标注框边框 -->
          <div class="annotation-border"></div>
          
          <!-- 标注信息 -->
          <div class="annotation-info">
            <span class="annotation-label">
              {{ getCategoryName(annotation.categoryId) }}
            </span>
          </div>
          
          <!-- 调整手柄 -->
          <div 
            v-if="selectedAnnotation && selectedAnnotation.id === annotation.id"
            class="resize-handles"
          >
            <div 
              v-for="handle in resizeHandles"
              :key="handle"
              class="resize-handle"
              :class="`resize-handle-${handle}`"
              @mousedown.stop="startResize(annotation, index, handle)"
            ></div>
          </div>
          
          <!-- 删除按钮 -->
          <div 
            v-if="selectedAnnotation && selectedAnnotation.id === annotation.id"
            class="annotation-actions"
          >
            <el-button 
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click.stop="deleteAnnotation(index)"
            />
          </div>
        </div>
        
        <!-- 绘制中的标注框 -->
        <div 
          v-if="drawingBox"
          class="drawing-box"
          :style="getDrawingBoxStyle()"
        >
          <div class="annotation-border"></div>
          <div class="annotation-info">
            <span class="annotation-label">
              {{ getCurrentCategoryName() }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 无图片提示 -->
    <div v-if="!image" class="no-image-placeholder">
      <div class="placeholder-content">
        <i class="el-icon-picture-outline"></i>
        <p>请选择或上传图片开始标注</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnotationCanvas',
  props: {
    image: {
      type: Object,
      default: null
    },
    annotations: {
      type: Array,
      default: () => []
    },
    categories: {
      type: Array,
      default: () => []
    },
    selectedCategory: {
      type: Number,
      default: 0
    },
    selectedAnnotation: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
      drawingMode: true,
      drawingBox: null,
      startDrawing: false,
      startX: 0,
      startY: 0,
      
      // 拖拽相关
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragStartTranslate: { x: 0, y: 0 },
      
      // 调整大小相关
      isResizing: false,
      resizeHandle: null,
      resizeAnnotation: null,
      resizeIndex: -1,
      resizeHandles: ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'],
      
      // 移动标注框相关
      isMovingAnnotation: false,
      movingAnnotation: null,
      movingIndex: -1,
      moveStart: { x: 0, y: 0 },
      
      // 图片加载状态
      imageLoaded: false,
      imageError: false
    }
  },
  watch: {
    image: {
      handler(newImage) {
        if (newImage) {
          this.resetZoom()
        }
      },
      immediate: true
    },
    selectedAnnotation: {
      handler(newAnnotation) {
        if (!newAnnotation) {
          this.isMovingAnnotation = false
          this.movingAnnotation = null
          this.movingIndex = -1
        }
      }
    }
  },
  methods: {
    // 处理图片加载
    handleImageLoad() {
      this.imageLoaded = true
      this.imageError = false
      this.$nextTick(() => {
        this.resetZoom()
      })
    },
    
    // 处理图片加载错误
    handleImageError() {
      this.imageError = true
      this.imageLoaded = false
    },
    
    // 重置缩放
    resetZoom() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
    },
    
    // 放大
    zoomIn() {
      this.scale = Math.min(this.scale * 1.2, 5)
    },
    
    // 缩小
    zoomOut() {
      this.scale = Math.max(this.scale / 1.2, 0.1)
    },
    
    // 处理滚轮事件
    handleWheel(event) {
      event.preventDefault()
      
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },
    
    // 切换绘制模式
    toggleDrawingMode() {
      this.drawingBox = null
      this.startDrawing = false
      this.$emit('annotation-selected', null)
    },
    
    // 获取鼠标相对于图片的坐标
    getRelativeCoordinates(event) {
      const rect = this.$refs.imageElement.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      return { x, y }
    },
    
    // 处理鼠标按下
    handleMouseDown(event) {
      if (!this.image || !this.imageLoaded) return
      
      const coords = this.getRelativeCoordinates(event)
      
      if (this.drawingMode) {
        // 绘制模式
        this.startDrawing = true
        this.startX = coords.x
        this.startY = coords.y
        this.drawingBox = {
          x: coords.x,
          y: coords.y,
          width: 0,
          height: 0
        }
      } else {
        // 拖拽模式
        this.isDragging = true
        this.dragStart = { x: event.clientX, y: event.clientY }
        this.dragStartTranslate = { x: this.translateX, y: this.translateY }
      }
      
      // 取消选中标注
      if (this.drawingMode) {
        this.$emit('annotation-selected', null)
      }
    },
    
    // 处理鼠标移动
    handleMouseMove(event) {
      if (!this.image || !this.imageLoaded) return
      
      if (this.startDrawing && this.drawingBox) {
        // 绘制标注框
        const coords = this.getRelativeCoordinates(event)
        this.drawingBox = {
          x: Math.min(this.startX, coords.x),
          y: Math.min(this.startY, coords.y),
          width: Math.abs(coords.x - this.startX),
          height: Math.abs(coords.y - this.startY)
        }
      } else if (this.isDragging && !this.drawingMode) {
        // 拖拽画布
        const deltaX = event.clientX - this.dragStart.x
        const deltaY = event.clientY - this.dragStart.y
        this.translateX = this.dragStartTranslate.x + deltaX / this.scale
        this.translateY = this.dragStartTranslate.y + deltaY / this.scale
      } else if (this.isResizing) {
        // 调整标注框大小
        this.handleResize(event)
      } else if (this.isMovingAnnotation) {
        // 移动标注框
        this.handleMoveAnnotation(event)
      }
    },
    
    // 处理鼠标抬起
    handleMouseUp(event) {
      if (this.startDrawing && this.drawingBox) {
        // 完成绘制
        if (this.drawingBox.width > 0.01 && this.drawingBox.height > 0.01) {
          const annotation = {
            id: Date.now(),
            categoryId: this.selectedCategory,
            x: this.drawingBox.x,
            y: this.drawingBox.y,
            width: this.drawingBox.width,
            height: this.drawingBox.height
          }
          this.$emit('annotation-added', annotation)
        }
        
        this.startDrawing = false
        this.drawingBox = null
      }
      
      this.isDragging = false
      this.isResizing = false
      this.isMovingAnnotation = false
      this.resizeAnnotation = null
      this.movingAnnotation = null
    },
    
    // 处理鼠标离开
    handleMouseLeave() {
      this.handleMouseUp()
    },
    
    // 选择标注
    selectAnnotation(annotation, index) {
      this.$emit('annotation-selected', annotation)
      
      if (!this.drawingMode) {
        // 准备移动标注
        this.isMovingAnnotation = true
        this.movingAnnotation = annotation
        this.movingIndex = index
      }
    },
    
    // 开始调整大小
    startResize(annotation, index, handle) {
      this.isResizing = true
      this.resizeHandle = handle
      this.resizeAnnotation = annotation
      this.resizeIndex = index
    },
    
    // 处理调整大小
    handleResize(event) {
      if (!this.resizeAnnotation || !this.resizeHandle) return
      
      const coords = this.getRelativeCoordinates(event)
      const annotation = { ...this.resizeAnnotation }
      
      // 根据调整手柄位置调整标注框
      switch (this.resizeHandle) {
        case 'nw':
          annotation.width += annotation.x - coords.x
          annotation.height += annotation.y - coords.y
          annotation.x = coords.x
          annotation.y = coords.y
          break
        case 'n':
          annotation.height += annotation.y - coords.y
          annotation.y = coords.y
          break
        case 'ne':
          annotation.width = coords.x - annotation.x
          annotation.height += annotation.y - coords.y
          annotation.y = coords.y
          break
        case 'w':
          annotation.width += annotation.x - coords.x
          annotation.x = coords.x
          break
        case 'e':
          annotation.width = coords.x - annotation.x
          break
        case 'sw':
          annotation.width += annotation.x - coords.x
          annotation.height = coords.y - annotation.y
          annotation.x = coords.x
          break
        case 's':
          annotation.height = coords.y - annotation.y
          break
        case 'se':
          annotation.width = coords.x - annotation.x
          annotation.height = coords.y - annotation.y
          break
      }
      
      // 确保标注框不会变成负数
      if (annotation.width > 0.01 && annotation.height > 0.01) {
        this.$emit('annotation-updated', { 
          index: this.resizeIndex, 
          annotation 
        })
      }
    },
    
    // 处理移动标注
    handleMoveAnnotation(event) {
      if (!this.movingAnnotation) return
      
      const coords = this.getRelativeCoordinates(event)
      const annotation = { ...this.movingAnnotation }
      
      // 计算移动距离
      if (!this.moveStart.x && !this.moveStart.y) {
        this.moveStart = coords
        return
      }
      
      const deltaX = coords.x - this.moveStart.x
      const deltaY = coords.y - this.moveStart.y
      
      annotation.x += deltaX
      annotation.y += deltaY
      
      // 确保标注框不会超出图片边界
      annotation.x = Math.max(0, Math.min(annotation.x, 1 - annotation.width))
      annotation.y = Math.max(0, Math.min(annotation.y, 1 - annotation.height))
      
      this.$emit('annotation-updated', { 
        index: this.movingIndex, 
        annotation 
      })
      
      this.moveStart = coords
    },
    
    // 删除标注
    deleteAnnotation(index) {
      this.$emit('annotation-deleted', index)
    },
    
    // 获取标注框样式
    getAnnotationStyle(annotation) {
      const category = this.categories.find(cat => cat.id === annotation.categoryId)
      const color = category ? category.color : '#409eff'
      
      return {
        position: 'absolute',
        left: `${annotation.x * 100}%`,
        top: `${annotation.y * 100}%`,
        width: `${annotation.width * 100}%`,
        height: `${annotation.height * 100}%`,
        '--annotation-color': color
      }
    },
    
    // 获取绘制中标注框样式
    getDrawingBoxStyle() {
      const category = this.categories.find(cat => cat.id === this.selectedCategory)
      const color = category ? category.color : '#409eff'
      
      return {
        position: 'absolute',
        left: `${this.drawingBox.x * 100}%`,
        top: `${this.drawingBox.y * 100}%`,
        width: `${this.drawingBox.width * 100}%`,
        height: `${this.drawingBox.height * 100}%`,
        '--annotation-color': color
      }
    },
    
    // 获取类别名称
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.name : '未知类别'
    },
    
    // 获取当前类别名称
    getCurrentCategoryName() {
      return this.getCategoryName(this.selectedCategory)
    }
  }
}
</script>

<style scoped>
.annotation-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.canvas-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-info {
  font-size: 12px;
  color: #666;
  min-width: 40px;
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
}

.canvas-wrapper.dragging {
  cursor: move;
}

.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
}

.canvas-image {
  max-width: 100%;
  max-height: 100%;
  user-select: none;
  pointer-events: none;
}

.annotation-box,
.drawing-box {
  border: 2px solid var(--annotation-color);
  background-color: transparent;
  cursor: move;
}

.annotation-box.selected {
  border-color: var(--annotation-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.annotation-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid var(--annotation-color);
  background-color: rgba(64, 158, 255, 0.1);
}

.annotation-info {
  position: absolute;
  top: -25px;
  left: 0;
  background-color: var(--annotation-color);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
}

.annotation-label {
  font-weight: 500;
}

.resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: var(--annotation-color);
  border: 1px solid white;
  pointer-events: all;
  z-index: 20;
}

.resize-handle-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-handle-n {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}

.resize-handle-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-handle-w {
  top: 50%;
  left: -4px;
  transform: translateY(-50%);
  cursor: w-resize;
}

.resize-handle-e {
  top: 50%;
  right: -4px;
  transform: translateY(-50%);
  cursor: e-resize;
}

.resize-handle-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-handle-s {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.resize-handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.annotation-actions {
  position: absolute;
  top: -35px;
  right: 0;
  z-index: 15;
}

.no-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
}

.placeholder-content {
  text-align: center;
}

.placeholder-content i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.placeholder-content p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .canvas-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .zoom-controls {
    width: 100%;
    justify-content: center;
  }
  
  .drawing-mode {
    width: 100%;
    text-align: center;
  }
}
</style> 