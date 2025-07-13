<template>
  <div class="image-upload-container">
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver, 'uploading': isUploading }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <div class="upload-content">
        <div class="upload-icon">
          <i class="el-icon-upload" v-if="!isUploading"></i>
          <i class="el-icon-loading" v-if="isUploading"></i>
        </div>
        
        <div class="upload-text">
          <p class="upload-title" v-if="!isUploading">
            Drag images here, or click to select files
          </p>
          <p class="upload-title" v-if="isUploading">
            Uploading...
          </p>
          
          <p class="upload-subtitle">
            Supports JPG, PNG, GIF formats, file size up to 10MB
          </p>
        </div>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleFileChange"
      />
    </div>
    
    <!-- 上传进度 -->
    <div class="upload-progress" v-if="isUploading">
      <el-progress
        :percentage="uploadProgress"
        :show-text="false"
        :stroke-width="4"
      />
    </div>
    
    <!-- 预览区域 -->
    <div class="preview-area" v-if="previewImages.length > 0">
      <h4>Preview</h4>
      <div class="preview-list">
        <div
          v-for="(image, index) in previewImages"
          :key="index"
          class="preview-item"
        >
          <img :src="image.url" :alt="image.name" />
          <div class="preview-info">
            <div class="preview-name">{{ image.name }}</div>
            <div class="preview-size">{{ formatFileSize(image.size) }}</div>
          </div>
          <div class="preview-actions">
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="removePreview(index)"
            />
          </div>
        </div>
      </div>
      
      <div class="upload-actions">
        <el-button @click="clearPreviews">Clear</el-button>
        <el-button
          type="primary"
          :loading="isUploading"
          @click="startUpload"
        >
          Start Upload
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageUpload',
  data() {
    return {
      isDragOver: false,
      isUploading: false,
      uploadProgress: 0,
      previewImages: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
  },
  methods: {
    // 处理拖拽进入
    handleDragEnter(event) {
      event.preventDefault()
      this.isDragOver = true
    },
    
    // 处理拖拽经过
    handleDragOver(event) {
      event.preventDefault()
      this.isDragOver = true
    },
    
    // 处理拖拽离开
    handleDragLeave(event) {
      event.preventDefault()
      // 检查是否真的离开了拖拽区域
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.isDragOver = false
      }
    },
    
    // 处理拖拽放下
    handleDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      
      const files = Array.from(event.dataTransfer.files)
      this.handleFiles(files)
    },
    
    // 触发文件选择
    triggerFileInput() {
      if (!this.isUploading) {
        this.$refs.fileInput.click()
      }
    },
    
    // 处理文件选择
    handleFileChange(event) {
      const files = Array.from(event.target.files)
      this.handleFiles(files)
      
      // 清空input值，允许重复选择相同文件
      event.target.value = ''
    },
    
    // 处理文件
    handleFiles(files) {
      const validFiles = files.filter(file => this.validateFile(file))
      
      if (validFiles.length === 0) {
        return
      }
      
      // 创建预览
      validFiles.forEach(file => {
        this.createPreview(file)
      })
    },
    
    // 验证文件
    validateFile(file) {
      // 检查文件类型
      if (!this.allowedTypes.includes(file.type)) {
        this.$message.error(`不支持的文件类型: ${file.name}`)
        return false
      }
      
      // 检查文件大小
      if (file.size > this.maxFileSize) {
        this.$message.error(`文件太大: ${file.name}`)
        return false
      }
      
      return true
    },
    
    // 创建预览
    createPreview(file) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const preview = {
          file: file,
          name: file.name,
          size: file.size,
          url: e.target.result
        }
        
        this.previewImages.push(preview)
      }
      
      reader.readAsDataURL(file)
    },
    
    // 移除预览
    removePreview(index) {
      this.previewImages.splice(index, 1)
    },
    
    // 清空预览
    clearPreviews() {
      this.previewImages = []
    },
    
    // 开始上传
    async startUpload() {
      if (this.previewImages.length === 0) {
        this.$message.warning('Please select images first')
        return
      }
      
      this.isUploading = true
      this.uploadProgress = 0
      
      try {
        // 逐个上传文件
        for (let i = 0; i < this.previewImages.length; i++) {
          const preview = this.previewImages[i]
          
          // 模拟上传进度
          this.uploadProgress = Math.round((i / this.previewImages.length) * 100)
          
          // 触发上传事件
          this.$emit('uploaded', preview.file)
          
          // 模拟上传延迟
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        this.uploadProgress = 100
        this.$message.success('Upload successful')
        
        // 清空预览
        this.previewImages = []
        
      } catch (error) {
        this.$message.error('Upload failed')
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.image-upload-container {
  padding: 20px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.upload-area.drag-over {
  border-color: #409eff;
  background-color: #e6f7ff;
}

.upload-area.uploading {
  pointer-events: none;
  opacity: 0.7;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  margin-bottom: 20px;
}

.upload-icon i {
  font-size: 48px;
  color: #409eff;
}

.upload-text {
  color: #666;
}

.upload-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 10px 0;
}

.upload-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.upload-progress {
  margin-top: 20px;
}

.preview-area {
  margin-top: 30px;
}

.preview-area h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: white;
}

.preview-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.preview-info {
  flex: 1;
}

.preview-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.preview-size {
  font-size: 12px;
  color: #666;
}

.preview-actions {
  display: flex;
  align-items: center;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .upload-area {
    padding: 20px;
  }
  
  .upload-icon i {
    font-size: 36px;
  }
  
  .upload-title {
    font-size: 14px;
  }
  
  .upload-subtitle {
    font-size: 12px;
  }
  
  .preview-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .preview-item img {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .preview-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 