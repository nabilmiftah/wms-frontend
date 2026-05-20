<script setup>
import { RouterView, useRoute } from "vue-router";
import { computed } from "vue";
import Sidebar from "./components/sidebar/AppSidebar.vue";
import { Toaster } from "vue-sonner";

const route = useRoute();
const isAuthPage = computed(() => {
  const authPaths = ["/", "/signin", "/signup"];
  return authPaths.includes(route.path);
});
</script>

<template v-if="isAuthPage">
  <RouterView />

  <Toaster richColors />
</template>

<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
