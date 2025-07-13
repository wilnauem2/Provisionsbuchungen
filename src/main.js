 import { createApp, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
