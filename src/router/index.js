import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/index.vue'
import Login from '@/components/user/login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/record',
    name: 'record',
    component: () => import(/* webpackChunkName: "mental" */ '../components/mental/record.vue')
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import(/* webpackChunkName: "mental" */ '../components/mental/calendar.vue')
  },
  {
    path: '/detail',
    name: 'detail',
    component: () => import(/* webpackChunkName: "mental" */ '../components/mental/detail.vue')
  },
  {
    path: '/info',
    name: 'info',
    component: () => import(/* webpackChunkName: "user" */ '../components/user/info.vue')
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import(/* webpackChunkName: "user" */ '../components/user/changePwd.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
