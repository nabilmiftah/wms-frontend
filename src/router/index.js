import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import WarehousePage from '../pages/WarehousePage.vue'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/warehouse', component: WarehousePage },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})