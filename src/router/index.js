import { createRouter, createWebHistory } from "vue-router";
import WelcomePage from "../pages/WelcomePage.vue";
import SignInPage from "../pages/SignInPage.vue";
import SignUpPage from "../pages/SignUpPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import WarehousePage from "../pages/WarehousePage.vue";
import SupplierPage from "../pages/SupplierPage.vue";
import UserPage from "../pages/UserPage.vue";
import AssetPage from "../pages/AssetPage.vue";
import StorageBinPage from "../pages/StorageBinPage.vue";

const routes = [
  {
    path: "/",
    component: WelcomePage,
  },
  {
    path: "/signin",
    component: SignInPage,
  },
  {
    path: "/signup",
    component: SignUpPage,
  },
  {
    path: "/dashboard",
    component: DashboardPage,
  },
  {
    path: "/warehouse",
    component: WarehousePage,
  },
  {
    path: "/supplier",
    component: SupplierPage,
  },
  {
    path: "/user",
    component: UserPage,
  },
  {
    path: "/asset",
    component: AssetPage,
  },
  {
    path: "/storageBin",
    component: StorageBinPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
