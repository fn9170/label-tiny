import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Annotation from '../views/Annotation.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/annotation'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/annotation',
    name: 'Annotation',
    component: Annotation
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router 