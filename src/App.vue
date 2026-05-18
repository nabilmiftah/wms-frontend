<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import Sidebar from './components/sidebar/AppSidebar.vue' 

const route = useRoute()
const isAuthPage = computed(() => {
  const authPaths = ['/', '/signin', '/signup']
  return authPaths.includes(route.path)
})
</script>

<template>
  <template v-if="isAuthPage">
    <RouterView />
  </template>

  <div v-else class="flex h-screen bg-[#F8F9FB] overflow-hidden">
    <Sidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-20 bg-white flex items-center px-12 justify-between flex-shrink-0">
        <div class="relative w-full max-w-4xl">
          <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
            <i class="fas fa-search"></i>
          </span>
          <input 
            type="text" 
            placeholder="Search resources..." 
            class="w-full pl-12 pr-4 py-3 bg-[#F0F5FF] border border-[#DCE6FF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all shadow-sm"
          >
        </div>

        <div class="flex items-center gap-6 ml-8">
          <div class="relative cursor-pointer text-gray-400 hover:text-blue-600 transition">
            <i class="fas fa-bell text-xl"></i>
            <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div class="cursor-pointer text-gray-400 hover:text-blue-600 transition">
            <i class="fas fa-cog text-xl"></i>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>