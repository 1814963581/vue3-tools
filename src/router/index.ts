import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/tool/:id',
    name: 'ToolDetail',
    component: () => import('@/views/ToolDetailView.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.name === 'Home' && savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

export default router
