<template>
  <div class="annotation-container">
    <!-- 头部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button 
            type="primary" 
            icon="el-icon-upload"
            @click="showUploadDialog = true"
          >
            导入图片
          </el-button>
          <el-button 
            icon="el-icon-download"
            @click="exportYOLO"
            :disabled="!currentImage"
          >
            导出YOLO
          </el-button>
          <el-button 
            icon="el-icon-refresh"
            @click="resetAnnotations"
            :disabled="!currentImage"
          >
            重置
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-center">
        <span class="image-info" v-if="currentImage">
          {{ currentImage.name }} ({{ currentAnnotations.length }} 个标注)
        </span>
      </div>
      
      <div class="toolbar-right">
        <el-button-group>
          <el-button 
            icon="el-icon-arrow-left"
            @click="previousImage"
            :disabled="getCurrentImageIndex <= 0"
          >
            上一张
          </el-button>
          <el-button 
            icon="el-icon-arrow-right"
            @click="nextImage"
            :disabled="getCurrentImageIndex >= imageList.length - 1"
          >
            下一张
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="panel-section">
          <h3>图片列表</h3>
          <div class="image-list">
            <div 
              v-for="image in imageList" 
              :key="image.id"
              class="image-item"
              :class="{ active: currentImage && currentImage.id === image.id }"
              @click="selectImage(image)"
            >
              <img :src="image.url" :alt="image.name" />
              <div class="image-info">
                <div class="image-name">{{ image.name }}</div>
                <div class="annotation-count">{{ image.annotationCount || 0 }} 个标注</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-area">
        <AnnotationCanvas 
          ref="annotationCanvas"
          :image="currentImage"
          :annotations="currentAnnotations"
          :categories="categories"
          :selectedCategory="selectedCategory"
          @annotation-added="handleAnnotationAdded"
          @annotation-updated="handleAnnotationUpdated"
          @annotation-deleted="handleAnnotationDeleted"
          @annotation-selected="handleAnnotationSelected"
        />
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="panel-section">
          <h3>标注类别</h3>
          <div class="category-list">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              <div class="category-color" :style="{ backgroundColor: category.color }"></div>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-shortcut">{{ category.id + 1 }}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>标注列表</h3>
          <div class="annotation-list">
            <div 
              v-for="(annotation, index) in currentAnnotations" 
              :key="annotation.id || index"
              class="annotation-item"
              :class="{ active: selectedAnnotation && selectedAnnotation.id === annotation.id }"
              @click="selectAnnotation(annotation)"
            >
              <div class="annotation-info">
                <div class="annotation-category">
                  <div 
                    class="category-color" 
                    :style="{ backgroundColor: getCategoryById(annotation.categoryId).color }"
                  ></div>
                  {{ getCategoryById(annotation.categoryId).name }}
                </div>
                <div class="annotation-coords">
                  x: {{ annotation.x.toFixed(3) }}, y: {{ annotation.y.toFixed(3) }}
                </div>
                <div class="annotation-size">
                  w: {{ annotation.width.toFixed(3) }}, h: {{ annotation.height.toFixed(3) }}
                </div>
              </div>
              <el-button 
                type="text" 
                icon="el-icon-delete"
                @click.stop="deleteAnnotation(index)"
              ></el-button>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>操作提示</h3>
          <div class="help-text">
            <p><strong>快捷键：</strong></p>
            <p>1-5: 选择类别</p>
            <p>Del: 删除选中标注</p>
            <p>Ctrl+S: 保存</p>
            <p>Ctrl+Z: 撤销</p>
            <p>A/D: 上一张/下一张</p>
            <p>+/-: 缩放</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog
      title="上传图片"
      :visible.sync="showUploadDialog"
      width="500px"
    >
      <ImageUpload @uploaded="handleImageUploaded" />
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import AnnotationCanvas from '../components/AnnotationCanvas.vue'
import ImageUpload from '../components/ImageUpload.vue'

export default {
  name: 'Annotation',
  components: {
    AnnotationCanvas,
    ImageUpload
  },
  data() {
    return {
      showUploadDialog: false
    }
  },
  computed: {
    ...mapState([
      'currentImage',
      'imageList',
      'currentAnnotations',
      'categories',
      'selectedCategory',
      'selectedAnnotation'
    ]),
    ...mapGetters([
      'getCurrentCategory',
      'getCategoryById',
      'getCurrentImageIndex'
    ])
  },
  async mounted() {
    await this.loadData()
    this.setupKeyboardShortcuts()
  },
  beforeDestroy() {
    this.removeKeyboardShortcuts()
  },
  methods: {
    ...mapMutations([
      'SET_CURRENT_IMAGE',
      'SET_CURRENT_ANNOTATIONS',
      'SET_SELECTED_CATEGORY',
      'SET_SELECTED_ANNOTATION',
      'ADD_ANNOTATION',
      'UPDATE_ANNOTATION',
      'DELETE_ANNOTATION'
    ]),
    ...mapActions([
      'loadImageList',
      'loadAnnotations',
      'saveAnnotations'
    ]),

    // 加载数据
    async loadData() {
      try {
        const response = await this.$api.getImageList()
        this.$store.commit('SET_IMAGE_LIST', response.data)
        
        if (response.data.length > 0) {
          await this.selectImage(response.data[0])
        }
      } catch (error) {
        this.$message.error('加载数据失败')
      }
    },

    // 选择图片
    async selectImage(image) {
      try {
        this.SET_CURRENT_IMAGE(image)
        const response = await this.$api.getAnnotations(image.id)
        this.SET_CURRENT_ANNOTATIONS(response.data)
      } catch (error) {
        this.$message.error('加载标注数据失败')
      }
    },

    // 选择类别
    selectCategory(categoryId) {
      this.SET_SELECTED_CATEGORY(categoryId)
    },

    // 选择标注
    selectAnnotation(annotation) {
      this.SET_SELECTED_ANNOTATION(annotation)
    },

    // 处理标注添加
    handleAnnotationAdded(annotation) {
      this.ADD_ANNOTATION(annotation)
      this.saveCurrentAnnotations()
    },

    // 处理标注更新
    handleAnnotationUpdated({ index, annotation }) {
      this.UPDATE_ANNOTATION({ index, annotation })
      this.saveCurrentAnnotations()
    },

    // 处理标注删除
    handleAnnotationDeleted(index) {
      this.DELETE_ANNOTATION(index)
      this.saveCurrentAnnotations()
    },

    // 处理标注选择
    handleAnnotationSelected(annotation) {
      this.SET_SELECTED_ANNOTATION(annotation)
    },

    // 删除标注
    deleteAnnotation(index) {
      this.DELETE_ANNOTATION(index)
      this.saveCurrentAnnotations()
    },

    // 保存当前标注
    async saveCurrentAnnotations() {
      if (!this.currentImage) return
      
      try {
        await this.$api.saveAnnotations(this.currentImage.id, this.currentAnnotations)
      } catch (error) {
        this.$message.error('保存失败')
      }
    },

    // 重置标注
    resetAnnotations() {
      this.SET_CURRENT_ANNOTATIONS([])
      this.saveCurrentAnnotations()
    },

    // 上一张图片
    previousImage() {
      const currentIndex = this.getCurrentImageIndex
      if (currentIndex > 0) {
        this.selectImage(this.imageList[currentIndex - 1])
      }
    },

    // 下一张图片
    nextImage() {
      const currentIndex = this.getCurrentImageIndex
      if (currentIndex < this.imageList.length - 1) {
        this.selectImage(this.imageList[currentIndex + 1])
      }
    },

    // 处理图片上传
    async handleImageUploaded(file) {
      try {
        const response = await this.$api.uploadImage(file)
        this.$store.commit('SET_IMAGE_LIST', [...this.imageList, response.data])
        await this.selectImage(response.data)
        this.showUploadDialog = false
        this.$message.success('上传成功')
      } catch (error) {
        this.$message.error('上传失败')
      }
    },

    // 导出YOLO格式
    async exportYOLO() {
      if (!this.currentImage) return
      
      try {
        const response = await this.$api.exportYOLO([this.currentImage.id])
        const yoloData = response.data
        
        // 创建下载链接
        Object.keys(yoloData).forEach(fileName => {
          const blob = new Blob([yoloData[fileName]], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName
          a.click()
          URL.revokeObjectURL(url)
        })
        
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      }
    },

    // 设置键盘快捷键
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', this.handleKeyDown)
    },

    // 移除键盘快捷键
    removeKeyboardShortcuts() {
      document.removeEventListener('keydown', this.handleKeyDown)
    },

    // 处理键盘按键
    handleKeyDown(event) {
      // 如果在输入框中，不处理快捷键
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault()
          this.selectCategory(parseInt(event.key) - 1)
          break
        case 'Delete':
          if (this.selectedAnnotation) {
            const index = this.currentAnnotations.findIndex(
              ann => ann.id === this.selectedAnnotation.id
            )
            if (index >= 0) {
              this.deleteAnnotation(index)
            }
          }
          break
        case 's':
          if (event.ctrlKey) {
            event.preventDefault()
            this.saveCurrentAnnotations()
          }
          break
        case 'a':
        case 'A':
          event.preventDefault()
          this.previousImage()
          break
        case 'd':
        case 'D':
          event.preventDefault()
          this.nextImage()
          break
        case '+':
        case '=':
          event.preventDefault()
          this.$refs.annotationCanvas.zoomIn()
          break
        case '-':
          event.preventDefault()
          this.$refs.annotationCanvas.zoomOut()
          break
      }
    }
  }
}
</script>

<style scoped>
.annotation-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-center {
  font-weight: 500;
  color: #333;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel,
.right-panel {
  width: 300px;
  background-color: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.right-panel {
  border-right: none;
  border-left: 1px solid #e4e7ed;
}

.panel-section {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-section:first-child {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-section h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.image-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.image-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  height: 64px;
}

.image-item:hover {
  background-color: #f5f7fa;
}

.image-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.image-item img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
  flex-shrink: 0;
}

.image-info {
  flex: 1;
}

.image-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 2px;
}

.annotation-count {
  font-size: 11px;
  color: #909399;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.category-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.category-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 8px;
}

.category-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.category-shortcut {
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.annotation-list {
  max-height: 200px;
  overflow-y: auto;
}

.annotation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.annotation-item:hover {
  background-color: #f5f7fa;
}

.annotation-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.annotation-info {
  flex: 1;
}

.annotation-category {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #333;
  margin-bottom: 2px;
}

.annotation-coords,
.annotation-size {
  font-size: 10px;
  color: #909399;
}

.canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  overflow: hidden;
}

.help-text {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.help-text p {
  margin: 0 0 5px 0;
}

@media (max-width: 1200px) {
  .left-panel,
  .right-panel {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .left-panel,
  .right-panel {
    width: 200px;
  }
  
  .toolbar {
    padding: 10px;
  }
  
  .toolbar-center {
    display: none;
  }
}
</style> 