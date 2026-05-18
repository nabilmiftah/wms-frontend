import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../pages/Dashboard.vue'
import WarehousePage from '../components/pages/WarehousePage.vue'
import SupplierPage from '../components/pages/SupplierPage.vue'
import UserPage from '../components/pages/UserPage.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/warehouse',
    component: WarehousePage,
  },
  {
    path: '/supplier',
    component: SupplierPage,
  },  
  {
    path: '/user',
    component: UserPage,
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router