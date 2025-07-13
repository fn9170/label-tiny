/**
 * YOLO格式转换工具
 * 用于将标注数据转换为YOLO格式
 */

import { saveAs } from 'file-saver'

/**
 * 将标注数据转换为YOLO格式
 * @param {Array} annotations - 标注数据数组
 * @param {Object} imageInfo - 图片信息 { width, height }
 * @returns {String} YOLO格式字符串
 */
export function convertToYOLO(annotations, imageInfo) {
  if (!annotations || annotations.length === 0) {
    return ''
  }
  
  const { width, height } = imageInfo
  
  return annotations.map(annotation => {
    const {
      categoryId,
      x,
      y,
      width: boxWidth,
      height: boxHeight
    } = annotation
    
    // YOLO格式：class_id x_center y_center width height
    // 所有坐标都是相对于图像尺寸的比例值 (0-1)
    const centerX = x + boxWidth / 2
    const centerY = y + boxHeight / 2
    
    return `${categoryId} ${centerX.toFixed(6)} ${centerY.toFixed(6)} ${boxWidth.toFixed(6)} ${boxHeight.toFixed(6)}`
  }).join('\n')
}

/**
 * 从YOLO格式转换为标注数据
 * @param {String} yoloString - YOLO格式字符串
 * @param {Object} imageInfo - 图片信息 { width, height }
 * @returns {Array} 标注数据数组
 */
export function parseYOLO(yoloString, imageInfo) {
  if (!yoloString || yoloString.trim() === '') {
    return []
  }
  
  const lines = yoloString.trim().split('\n')
  const annotations = []
  
  lines.forEach((line, index) => {
    const parts = line.trim().split(/\s+/)
    
    if (parts.length !== 5) {
      console.warn(`YOLO格式错误，第${index + 1}行: ${line}`)
      return
    }
    
    const [classId, centerX, centerY, width, height] = parts.map(Number)
    
    // 验证数据范围
    if (
      classId < 0 ||
      centerX < 0 || centerX > 1 ||
      centerY < 0 || centerY > 1 ||
      width <= 0 || width > 1 ||
      height <= 0 || height > 1
    ) {
      console.warn(`YOLO数据范围错误，第${index + 1}行: ${line}`)
      return
    }
    
    // 转换为左上角坐标
    const x = centerX - width / 2
    const y = centerY - height / 2
    
    annotations.push({
      id: Date.now() + index,
      categoryId: classId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(width, 1 - x),
      height: Math.min(height, 1 - y)
    })
  })
  
  return annotations
}

/**
 * 导出单个图片的YOLO标注文件
 * @param {String} imageName - 图片名称
 * @param {Array} annotations - 标注数据
 * @param {Object} imageInfo - 图片信息
 */
export function exportSingleYOLO(imageName, annotations, imageInfo) {
  const yoloContent = convertToYOLO(annotations, imageInfo)
  const fileName = imageName.replace(/\.[^/.]+$/, '.txt')
  
  const blob = new Blob([yoloContent], { type: 'text/plain;charset=utf-8' })
  saveAs(blob, fileName)
}

/**
 * 批量导出YOLO标注文件
 * @param {Array} imageDataList - 图片数据列表
 * @param {Function} progressCallback - 进度回调函数
 */
export async function exportBatchYOLO(imageDataList, progressCallback) {
  const JSZip = await import('jszip')
  const zip = new JSZip.default()
  
  let processedCount = 0
  const total = imageDataList.length
  
  // 创建类别映射文件
  const categories = new Set()
  imageDataList.forEach(imageData => {
    imageData.annotations.forEach(annotation => {
      categories.add(annotation.categoryId)
    })
  })
  
  const classNames = Array.from(categories).sort().map(id => `class_${id}`)
  zip.file('classes.txt', classNames.join('\n'))
  
  // 处理每个图片
  for (const imageData of imageDataList) {
    const { name, annotations, width, height } = imageData
    const yoloContent = convertToYOLO(annotations, { width, height })
    const fileName = name.replace(/\.[^/.]+$/, '.txt')
    
    zip.file(fileName, yoloContent)
    
    processedCount++
    if (progressCallback) {
      progressCallback(Math.round((processedCount / total) * 100))
    }
  }
  
  // 生成并下载zip文件
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'yolo_annotations.zip')
}

/**
 * 验证YOLO格式数据
 * @param {String} yoloString - YOLO格式字符串
 * @returns {Object} 验证结果 { valid: boolean, errors: Array }
 */
export function validateYOLO(yoloString) {
  const errors = []
  
  if (!yoloString || yoloString.trim() === '') {
    return { valid: true, errors: [] }
  }
  
  const lines = yoloString.trim().split('\n')
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const parts = line.trim().split(/\s+/)
    
    if (parts.length === 0) {
      return // 空行
    }
    
    if (parts.length !== 5) {
      errors.push(`第${lineNumber}行: 格式错误，应该有5个数值`)
      return
    }
    
    const [classId, centerX, centerY, width, height] = parts
    
    // 验证是否为数字
    if (isNaN(classId) || isNaN(centerX) || isNaN(centerY) || isNaN(width) || isNaN(height)) {
      errors.push(`第${lineNumber}行: 包含非数字值`)
      return
    }
    
    const numClassId = Number(classId)
    const numCenterX = Number(centerX)
    const numCenterY = Number(centerY)
    const numWidth = Number(width)
    const numHeight = Number(height)
    
    // 验证数据范围
    if (numClassId < 0 || !Number.isInteger(numClassId)) {
      errors.push(`第${lineNumber}行: 类别ID应该是非负整数`)
    }
    
    if (numCenterX < 0 || numCenterX > 1) {
      errors.push(`第${lineNumber}行: 中心X坐标应该在0-1之间`)
    }
    
    if (numCenterY < 0 || numCenterY > 1) {
      errors.push(`第${lineNumber}行: 中心Y坐标应该在0-1之间`)
    }
    
    if (numWidth <= 0 || numWidth > 1) {
      errors.push(`第${lineNumber}行: 宽度应该在0-1之间且大于0`)
    }
    
    if (numHeight <= 0 || numHeight > 1) {
      errors.push(`第${lineNumber}行: 高度应该在0-1之间且大于0`)
    }
    
    // 验证边界框是否超出图像范围
    const left = numCenterX - numWidth / 2
    const right = numCenterX + numWidth / 2
    const top = numCenterY - numHeight / 2
    const bottom = numCenterY + numHeight / 2
    
    if (left < 0 || right > 1 || top < 0 || bottom > 1) {
      errors.push(`第${lineNumber}行: 边界框超出图像范围`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 生成YOLO配置文件
 * @param {Array} categories - 类别列表
 * @param {Object} options - 配置选项
 * @returns {String} 配置文件内容
 */
export function generateYOLOConfig(categories, options = {}) {
  const {
    trainPath = './train',
    validPath = './valid',
    testPath = './test',
    modelName = 'yolo_model'
  } = options
  
  const config = {
    train: trainPath,
    val: validPath,
    test: testPath,
    nc: categories.length,
    names: categories.map(cat => cat.name)
  }
  
  return `# YOLO配置文件
# 训练集路径
train: ${config.train}
# 验证集路径
val: ${config.val}
# 测试集路径
test: ${config.test}
# 类别数量
nc: ${config.nc}
# 类别名称
names: [${config.names.map(name => `'${name}'`).join(', ')}]
`
}

/**
 * 计算标注统计信息
 * @param {Array} annotations - 标注数据数组
 * @param {Array} categories - 类别列表
 * @returns {Object} 统计信息
 */
export function calculateAnnotationStats(annotations, categories) {
  const stats = {
    total: annotations.length,
    byCategory: {},
    avgSize: { width: 0, height: 0 },
    sizeDistribution: {
      small: 0,    // < 0.1
      medium: 0,   // 0.1 - 0.5
      large: 0     // > 0.5
    }
  }
  
  // 初始化类别统计
  categories.forEach(cat => {
    stats.byCategory[cat.id] = {
      count: 0,
      percentage: 0
    }
  })
  
  if (annotations.length === 0) {
    return stats
  }
  
  let totalWidth = 0
  let totalHeight = 0
  
  annotations.forEach(annotation => {
    const { categoryId, width, height } = annotation
    
    // 类别统计
    if (stats.byCategory[categoryId]) {
      stats.byCategory[categoryId].count++
    }
    
    // 尺寸统计
    totalWidth += width
    totalHeight += height
    
    const size = Math.max(width, height)
    if (size < 0.1) {
      stats.sizeDistribution.small++
    } else if (size < 0.5) {
      stats.sizeDistribution.medium++
    } else {
      stats.sizeDistribution.large++
    }
  })
  
  // 计算平均尺寸
  stats.avgSize.width = totalWidth / annotations.length
  stats.avgSize.height = totalHeight / annotations.length
  
  // 计算类别百分比
  Object.values(stats.byCategory).forEach(catStats => {
    catStats.percentage = (catStats.count / annotations.length) * 100
  })
  
  return stats
}

export default {
  convertToYOLO,
  parseYOLO,
  exportSingleYOLO,
  exportBatchYOLO,
  validateYOLO,
  generateYOLOConfig,
  calculateAnnotationStats
} 