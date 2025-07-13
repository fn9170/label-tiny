import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 当前选中的图片
    currentImage: null,
    // 图片列表
    imageList: [],
    // 当前图片的标注数据
    currentAnnotations: [],
    // 标注类别列表
    categories: [
      { id: 0, name: '人', color: '#ff6b6b' },
      { id: 1, name: '车', color: '#4ecdc4' },
      { id: 2, name: '动物', color: '#45b7d1' },
      { id: 3, name: '建筑', color: '#96ceb4' },
      { id: 4, name: '其他', color: '#feca57' }
    ],
    // 当前选中的类别
    selectedCategory: 0,
    // 画布缩放比例
    canvasScale: 1,
    // 是否正在绘制标注框
    isDrawing: false,
    // 当前选中的标注框
    selectedAnnotation: null
  },
  mutations: {
    // 设置当前图片
    SET_CURRENT_IMAGE(state, image) {
      state.currentImage = image
    },
    // 设置图片列表
    SET_IMAGE_LIST(state, images) {
      state.imageList = images
    },
    // 设置当前图片的标注数据
    SET_CURRENT_ANNOTATIONS(state, annotations) {
      state.currentAnnotations = annotations
    },
    // 添加标注
    ADD_ANNOTATION(state, annotation) {
      state.currentAnnotations.push(annotation)
    },
    // 更新标注
    UPDATE_ANNOTATION(state, { index, annotation }) {
      if (index >= 0 && index < state.currentAnnotations.length) {
        Vue.set(state.currentAnnotations, index, annotation)
      }
    },
    // 删除标注
    DELETE_ANNOTATION(state, index) {
      if (index >= 0 && index < state.currentAnnotations.length) {
        state.currentAnnotations.splice(index, 1)
      }
    },
    // 设置选中的类别
    SET_SELECTED_CATEGORY(state, categoryId) {
      state.selectedCategory = categoryId
    },
    // 设置画布缩放比例
    SET_CANVAS_SCALE(state, scale) {
      state.canvasScale = scale
    },
    // 设置绘制状态
    SET_IS_DRAWING(state, isDrawing) {
      state.isDrawing = isDrawing
    },
    // 设置选中的标注框
    SET_SELECTED_ANNOTATION(state, annotation) {
      state.selectedAnnotation = annotation
    },
    // 更新类别列表
    UPDATE_CATEGORIES(state, categories) {
      state.categories = categories
    }
  },
  actions: {
    // 加载图片列表
    async loadImageList({ commit }) {
      try {
        const response = await this.$api.getImageList()
        commit('SET_IMAGE_LIST', response.data)
      } catch (error) {
        console.error('加载图片列表失败:', error)
      }
    },
    // 加载图片标注数据
    async loadAnnotations({ commit }, imageId) {
      try {
        const response = await this.$api.getAnnotations(imageId)
        commit('SET_CURRENT_ANNOTATIONS', response.data)
      } catch (error) {
        console.error('加载标注数据失败:', error)
      }
    },
    // 保存标注数据
    async saveAnnotations({ state }, imageId) {
      try {
        await this.$api.saveAnnotations(imageId, state.currentAnnotations)
        return true
      } catch (error) {
        console.error('保存标注数据失败:', error)
        return false
      }
    }
  },
  getters: {
    // 获取当前类别
    getCurrentCategory: state => {
      return state.categories.find(cat => cat.id === state.selectedCategory)
    },
    // 获取类别通过ID
    getCategoryById: state => id => {
      return state.categories.find(cat => cat.id === id)
    },
    // 获取当前图片索引
    getCurrentImageIndex: state => {
      if (!state.currentImage) return -1
      return state.imageList.findIndex(img => img.id === state.currentImage.id)
    }
  }
}) 