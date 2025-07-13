import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

// 全局事件总线 - 用于组件间通信和后续系统集成
Vue.prototype.$bus = new Vue();

// 全局配置 - 可以通过外部传入覆盖
Vue.prototype.$config = {
  apiBaseUrl: process.env.VUE_APP_API_BASE_URL || '/api',
  maxImageSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['jpg', 'jpeg', 'png', 'bmp'],
  defaultClasses: [
    { id: 0, name: '人', color: '#FF6B6B' },
    { id: 1, name: '车辆', color: '#4ECDC4' },
    { id: 2, name: '动物', color: '#45B7D1' },
    { id: 3, name: '物体', color: '#96CEB4' }
  ]
};

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');