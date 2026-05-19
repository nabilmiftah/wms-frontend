<script setup>
import { ref } from 'vue'
import AppSidebar from '../sidebar/AppSidebar.vue' 

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-[#F8F9FB] overflow-hidden w-full relative">
    
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 h-screen transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <AppSidebar class="h-full" />
    </div>

    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false" 
      class="fixed inset-0 bg-black/40 z-40 lg:hidden"
    ></div>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-20 bg-white flex items-center px-4 md:px-12 justify-between flex-shrink-0 border-b border-slate-100 gap-4">
        
        <div class="flex items-center gap-3 w-full max-w-4xl">
          <button 
            @click="isSidebarOpen = !isSidebarOpen" 
            class="lg:hidden p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all flex-shrink-0 focus:outline-none"
          >
            <i class="fas fa-bars text-base"></i>
          </button>

          <div class="relative w-full">
            <span class="absolute inset-y-0 left-4 flex items-center text-gray-400">
              <i class="fas fa-search text-xs md:text-sm"></i>
            </span>
            <input 
              type="text" 
              placeholder="Search resources..." 
              class="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-[#F0F5FF] border border-[#DCE6FF] rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all shadow-sm"
            >
          </div>
        </div>

        <div class="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-2">
          <div class="relative cursor-pointer text-gray-400 hover:text-blue-600 transition">
            <i class="fas fa-bell text-lg md:text-xl"></i>
            <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div class="cursor-pointer text-gray-400 hover:text-blue-600 transition">
            <i class="fas fa-cog text-lg md:text-xl"></i>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-4 md:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>