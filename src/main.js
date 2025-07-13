import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入Element UI组件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 引入全局样式
import './styles/global.css'

// 引入API模块
import api from './api'

// 使用Element UI
Vue.use(ElementUI)

// 将API挂载到Vue原型上
Vue.prototype.$api = api

// 全局配置
Vue.config.productionTip = false

// 创建Vue实例
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app') 