import Vue from 'vue';
import VueRouter from 'vue-router';
import AnnotationView from '@/views/AnnotationView.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/annotation'
  },
  {
    path: '/annotation',
    name: 'Annotation',
    component: AnnotationView,
    meta: {
      title: 'YOLO图像标注'
    }
  }
];

const router = new VueRouter({
  mode: 'hash', // 使用 hash 模式便于独立部署
  base: process.env.BASE_URL,
  routes
});

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'YOLO图像标注工具';
  next();
});

export default router;