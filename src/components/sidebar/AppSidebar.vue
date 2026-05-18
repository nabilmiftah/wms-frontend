<script setup lang="ts">
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Truck,
  Users
} from 'lucide-vue-next'
</script>

<template>
  <aside class="w-64 bg-[#001233] text-white flex flex-col">
    <div class="h-16 flex items-center px-6 border-b border-white/10">
      <h1 class="text-lg font-bold">
        Logistics Core
      </h1>
    </div>

    <nav class="flex-1 p-4 space-y-2">
      <RouterLink
         to="/"
         class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
      >
        <LayoutDashboard class="w-5 h-5" />
        Dashboard
      </RouterLink>

      <RouterLink
         to="/warehouse"
         class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
      >
        <Warehouse class="w-5 h-5" />
        Warehouse
      </RouterLink>

      <RouterLink
        to="/storage-bin"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
      >
        <Package class="w-5 h-5" />
        Storage Bin
      </RouterLink>

      <RouterLink
        to="/supplier"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
      >
        <Truck class="w-5 h-5" />
        Supplier
      </RouterLink>

      <RouterLink
        to="/user"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition"
      >
        <Users class="w-5 h-5" />
        User
      </RouterLink>
    </nav>
  </aside>
</template>