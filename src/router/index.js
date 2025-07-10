import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import MainApp from '../components/MainApp.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'app',
      component: MainApp,
      meta: { requiresAuth: true }
    },
    {
      path: '/insurer/:name',
      name: 'insurer-detail',
      component: () => import('../components/InsurerDetail.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('authToken')
  
  if (requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
