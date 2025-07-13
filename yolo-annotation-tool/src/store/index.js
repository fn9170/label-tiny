import Vue from 'vue';
import Vuex from 'vuex';
import annotation from './modules/annotation';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    annotation
  },
  state: {
    // 全局状态
    isLoading: false,
    user: null, // 预留用户信息
  },
  mutations: {
    SET_LOADING(state, status) {
      state.isLoading = status;
    },
    SET_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    // 预留用户登录接口
    async login({ commit }, credentials) {
      // TODO: 实现登录逻辑
      console.log('Login placeholder', credentials);
    },
    // 预留用户登出接口
    async logout({ commit }) {
      commit('SET_USER', null);
    }
  },
  getters: {
    isAuthenticated: state => !!state.user
  }
});