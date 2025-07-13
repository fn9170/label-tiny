/**
 * API 服务模块
 * 预留与后端系统的接口
 */

// API 基础配置
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || '/api';

// 通用请求方法
async function request(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        // 预留认证 token
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 用户认证相关
export const authAPI = {
  // 用户登录
  async login(credentials) {
    // TODO: 实现实际的登录逻辑
    console.log('Login API placeholder', credentials);
    return { token: 'mock-token', user: { id: 1, name: '测试用户' } };
  },
  
  // 用户登出
  async logout() {
    // TODO: 实现实际的登出逻辑
    localStorage.removeItem('token');
    return { success: true };
  },
  
  // 获取当前用户信息
  async getCurrentUser() {
    // TODO: 实现实际的获取用户信息逻辑
    return { id: 1, name: '测试用户' };
  }
};

// 图片管理相关
export const imageAPI = {
  // 上传图片
  async uploadImage(file) {
    // TODO: 实现实际的图片上传逻辑
    const formData = new FormData();
    formData.append('image', file);
    
    console.log('Upload image placeholder', file.name);
    // 模拟返回
    return {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      name: file.name
    };
  },
  
  // 批量上传图片
  async uploadImages(files) {
    // TODO: 实现实际的批量上传逻辑
    const promises = files.map(file => this.uploadImage(file));
    return Promise.all(promises);
  },
  
  // 获取图片列表
  async getImages(params = {}) {
    // TODO: 实现实际的获取图片列表逻辑
    console.log('Get images placeholder', params);
    return [];
  },
  
  // 删除图片
  async deleteImage(imageId) {
    // TODO: 实现实际的删除图片逻辑
    console.log('Delete image placeholder', imageId);
    return { success: true };
  }
};

// 标注管理相关
export const annotationAPI = {
  // 保存标注数据
  async saveAnnotations(imageId, annotations) {
    // TODO: 实现实际的保存标注逻辑
    console.log('Save annotations placeholder', { imageId, annotations });
    return { success: true, saved: annotations.length };
  },
  
  // 获取标注数据
  async getAnnotations(imageId) {
    // TODO: 实现实际的获取标注逻辑
    console.log('Get annotations placeholder', imageId);
    return [];
  },
  
  // 批量保存标注数据
  async batchSaveAnnotations(annotationsData) {
    // TODO: 实现实际的批量保存逻辑
    console.log('Batch save annotations placeholder', annotationsData);
    return { success: true };
  },
  
  // 导出标注数据
  async exportAnnotations(format = 'yolo') {
    // TODO: 实现实际的导出逻辑
    console.log('Export annotations placeholder', format);
    return { url: '/mock-export-url' };
  }
};

// 类别管理相关
export const classAPI = {
  // 获取类别列表
  async getClasses() {
    // TODO: 实现实际的获取类别列表逻辑
    return [
      { id: 0, name: '人', color: '#FF6B6B' },
      { id: 1, name: '车辆', color: '#4ECDC4' },
      { id: 2, name: '动物', color: '#45B7D1' },
      { id: 3, name: '物体', color: '#96CEB4' }
    ];
  },
  
  // 创建类别
  async createClass(classData) {
    // TODO: 实现实际的创建类别逻辑
    console.log('Create class placeholder', classData);
    return { ...classData, id: Date.now() };
  },
  
  // 更新类别
  async updateClass(classId, classData) {
    // TODO: 实现实际的更新类别逻辑
    console.log('Update class placeholder', { classId, classData });
    return { ...classData, id: classId };
  },
  
  // 删除类别
  async deleteClass(classId) {
    // TODO: 实现实际的删除类别逻辑
    console.log('Delete class placeholder', classId);
    return { success: true };
  }
};

// 导出所有 API
export default {
  auth: authAPI,
  image: imageAPI,
  annotation: annotationAPI,
  class: classAPI
};