const state = {
  images: [], // 图片列表
  currentImageIndex: 0, // 当前图片索引
  annotations: {}, // 标注数据 { imageId: [annotations] }
  classes: [], // 类别列表
  selectedClass: null, // 当前选中的类别
  scale: 1, // 图片缩放比例
  isDrawing: false, // 是否正在绘制
};

const mutations = {
  SET_IMAGES(state, images) {
    state.images = images;
  },
  ADD_IMAGE(state, image) {
    state.images.push(image);
  },
  SET_CURRENT_IMAGE_INDEX(state, index) {
    state.currentImageIndex = index;
  },
  SET_ANNOTATIONS(state, { imageId, annotations }) {
    state.annotations = {
      ...state.annotations,
      [imageId]: annotations
    };
  },
  ADD_ANNOTATION(state, { imageId, annotation }) {
    if (!state.annotations[imageId]) {
      state.annotations[imageId] = [];
    }
    state.annotations[imageId].push(annotation);
  },
  UPDATE_ANNOTATION(state, { imageId, index, annotation }) {
    if (state.annotations[imageId]) {
      state.annotations[imageId][index] = annotation;
    }
  },
  DELETE_ANNOTATION(state, { imageId, index }) {
    if (state.annotations[imageId]) {
      state.annotations[imageId].splice(index, 1);
    }
  },
  SET_CLASSES(state, classes) {
    state.classes = classes;
  },
  SET_SELECTED_CLASS(state, classId) {
    state.selectedClass = classId;
  },
  SET_SCALE(state, scale) {
    state.scale = scale;
  },
  SET_IS_DRAWING(state, status) {
    state.isDrawing = status;
  }
};

const actions = {
  // 加载图片
  loadImages({ commit }, images) {
    commit('SET_IMAGES', images);
    if (images.length > 0) {
      commit('SET_CURRENT_IMAGE_INDEX', 0);
    }
  },
  // 保存标注到后端（预留接口）
  async saveAnnotations({ state }, imageId) {
    // TODO: 实现保存到后端的逻辑
    const annotations = state.annotations[imageId] || [];
    console.log('Saving annotations:', { imageId, annotations });
    // 模拟API调用
    return new Promise(resolve => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  },
  // 从后端加载标注（预留接口）
  async loadAnnotations({ commit }, imageId) {
    // TODO: 实现从后端加载的逻辑
    console.log('Loading annotations for:', imageId);
    // 模拟API调用
    return new Promise(resolve => {
      setTimeout(() => resolve([]), 500);
    });
  }
};

const getters = {
  currentImage: state => {
    return state.images[state.currentImageIndex] || null;
  },
  currentImageAnnotations: state => {
    const currentImage = state.images[state.currentImageIndex];
    if (!currentImage) return [];
    return state.annotations[currentImage.id] || [];
  },
  getAllAnnotations: state => state.annotations,
  imageCount: state => state.images.length,
  hasNextImage: state => state.currentImageIndex < state.images.length - 1,
  hasPrevImage: state => state.currentImageIndex > 0
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};