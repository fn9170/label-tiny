/**
 * Mock API 模块
 * 这里模拟后端接口，便于前端开发和测试
 * 后期可以轻松替换为真实的后端接口
 */

// 模拟延迟
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 导入本地演示图片
const demoImages = {
  image1: require('@/assets/demo/RdcProject_20250625_170211_Survey_2024-12-10_14-20-18_Swath001_Ch0_200VV_371.136m_2_的_2_split_000.jpg'),
  image2: require('@/assets/demo/RdcProject_20250625_170211_Survey_2024-12-10_14-20-18_Swath001_Ch0_200VV_371.136m_2_的_2_split_001.jpg'),
  image3: require('@/assets/demo/RdcProject_20250625_170211_Survey_2024-12-10_14-20-18_Swath001_Ch0_200VV_371.136m_2_的_2_split_002.jpg'),
  image4: require('@/assets/demo/RdcProject_20250625_170211_Survey_2024-12-10_14-20-18_Swath001_Ch0_200VV_371.136m_2_的_2_split_003.jpg'),
  image5: require('@/assets/demo/RdcProject_20250625_170211_Survey_2024-12-10_14-20-18_Swath001_Ch0_200VV_371.136m_2_的_2_split_004.jpg')
}

// 模拟图片数据
const mockImages = [
  {
    id: 1,
    name: 'survey_image_000.jpg',
    url: demoImages.image1,
    width: 800,
    height: 600,
    createdAt: '2023-01-01T10:00:00Z',
    annotations: []
  },
  {
    id: 2,
    name: 'survey_image_001.jpg',
    url: demoImages.image2,
    width: 800,
    height: 600,
    createdAt: '2023-01-02T10:00:00Z',
    annotations: []
  },
  {
    id: 3,
    name: 'survey_image_002.jpg',
    url: demoImages.image3,
    width: 800,
    height: 600,
    createdAt: '2023-01-03T10:00:00Z',
    annotations: []
  },
  {
    id: 4,
    name: 'survey_image_003.jpg',
    url: demoImages.image4,
    width: 800,
    height: 600,
    createdAt: '2023-01-04T10:00:00Z',
    annotations: []
  },
  {
    id: 5,
    name: 'survey_image_004.jpg',
    url: demoImages.image5,
    width: 800,
    height: 600,
    createdAt: '2023-01-05T10:00:00Z',
    annotations: []
  }
]

// 模拟类别数据
const mockCategories = [
  { id: 0, name: '人', color: '#ff6b6b' },
  { id: 1, name: '车', color: '#4ecdc4' },
  { id: 2, name: '动物', color: '#45b7d1' },
  { id: 3, name: '建筑', color: '#96ceb4' },
  { id: 4, name: '其他', color: '#feca57' }
]

// Mock API 接口
const api = {
  /**
   * 获取图片列表
   * @returns {Promise<{data: Array}>}
   */
  async getImageList() {
    await delay(300)
    return {
      code: 200,
      message: 'success',
      data: mockImages.map(img => ({
        id: img.id,
        name: img.name,
        url: img.url,
        width: img.width,
        height: img.height,
        createdAt: img.createdAt,
        annotationCount: img.annotations.length
      }))
    }
  },

  /**
   * 获取指定图片的标注数据
   * @param {number} imageId - 图片ID
   * @returns {Promise<{data: Array}>}
   */
  async getAnnotations(imageId) {
    await delay(200)
    const image = mockImages.find(img => img.id === imageId)
    if (!image) {
      throw new Error('图片不存在')
    }
    return {
      code: 200,
      message: 'success',
      data: image.annotations
    }
  },

  /**
   * 保存标注数据
   * @param {number} imageId - 图片ID
   * @param {Array} annotations - 标注数据
   * @returns {Promise<{data: boolean}>}
   */
  async saveAnnotations(imageId, annotations) {
    await delay(500)
    const image = mockImages.find(img => img.id === imageId)
    if (!image) {
      throw new Error('图片不存在')
    }
    
    // 更新标注数据
    image.annotations = annotations.map((annotation, index) => ({
      ...annotation,
      id: annotation.id || Date.now() + index
    }))
    
    console.log(`保存图片 ${imageId} 的标注数据:`, annotations)
    
    return {
      code: 200,
      message: 'success',
      data: true
    }
  },

  /**
   * 获取类别列表
   * @returns {Promise<{data: Array}>}
   */
  async getCategories() {
    await delay(100)
    return {
      code: 200,
      message: 'success',
      data: mockCategories
    }
  },

  /**
   * 上传图片
   * @param {File} file - 图片文件
   * @returns {Promise<{data: Object}>}
   */
  async uploadImage(file) {
    await delay(1000)
    
    // 模拟上传过程
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const newImage = {
          id: mockImages.length + 1,
          name: file.name,
          url: e.target.result,
          width: 800, // 这里应该从实际图片中获取
          height: 600,
          createdAt: new Date().toISOString(),
          annotations: []
        }
        
        mockImages.push(newImage)
        
        resolve({
          code: 200,
          message: 'success',
          data: newImage
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  /**
   * 删除图片
   * @param {number} imageId - 图片ID
   * @returns {Promise<{data: boolean}>}
   */
  async deleteImage(imageId) {
    await delay(300)
    const index = mockImages.findIndex(img => img.id === imageId)
    if (index === -1) {
      throw new Error('图片不存在')
    }
    
    mockImages.splice(index, 1)
    
    return {
      code: 200,
      message: 'success',
      data: true
    }
  },

  /**
   * 批量导出标注数据为YOLO格式
   * @param {Array} imageIds - 图片ID数组
   * @returns {Promise<{data: Object}>}
   */
  async exportYOLO(imageIds) {
    await delay(800)
    
    const exportData = {}
    
    for (const imageId of imageIds) {
      const image = mockImages.find(img => img.id === imageId)
      if (image) {
        // 转换为YOLO格式
        const yoloData = image.annotations.map(annotation => {
          return `${annotation.categoryId} ${annotation.x} ${annotation.y} ${annotation.width} ${annotation.height}`
        }).join('\n')
        
        exportData[image.name.replace(/\.[^/.]+$/, '.txt')] = yoloData
      }
    }
    
    return {
      code: 200,
      message: 'success',
      data: exportData
    }
  }
}

export default api 