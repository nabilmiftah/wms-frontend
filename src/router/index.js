import { createRouter, createWebHistory } from "vue-router";
import WarehousePage from "../components/pages/WarehousePage.vue";
import SupplierPage from "../components/pages/SupplierPage.vue";
import UserPage from "../components/pages/UserPage.vue";
import AssetPage from "../components/pages/AssetPage.vue";
import StorageBinPage from "../components/pages/StorageBinPage.vue";

const routes = [
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
