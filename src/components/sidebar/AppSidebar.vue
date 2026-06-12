<script setup lang="ts">
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Truck,
  Users,
  Factory,
  Menu,
  ClipboardList,
  FileText,
  ChartColumn,
  LogOut,
} from "lucide-vue-next";

import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

const router = useRouter();

const handleLogout = () => {
  // 1. Hapus token session agar status login hilang
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Sesuaikan key-nya dengan proyekmu

  router.push("/signin");
};

const route = useRoute();

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-sidebar", "navigate"]);
</script>

<template>
  <aside
    :class="isCollapsed ? 'w-20' : 'w-64'"
    class="bg-[#001233] text-white flex flex-col h-screen transition-all duration-300 overflow-hidden"
  >
    <div
      class="h-16 flex items-center justify-between px-4 border-b border-white/10"
    >
      <div class="flex items-center gap-3 overflow-hidden">
        <img
          src="/logo-wms.png"
          alt="Logo logistic core"
          class="w-10 h-10 object-contain shrink-0"
        />

        <h1 v-if="!isCollapsed" class="text-lg font-bold whitespace-nowrap">
          Logistics Core
        </h1>
      </div>

      <button
        @click="emit('toggle-sidebar')"
        class="p-2 rounded-lg hover:bg-white/10 transition shrink-0"
      >
        <Menu class="w-5 h-5" />
      </button>
    </div>

    <nav class="flex-1 p-4 space-y-2">
      <RouterLink
        to="/dashboard"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/dashboard'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <LayoutDashboard class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Dashboard </span>
      </RouterLink>

      <RouterLink
        to="/warehouse"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/warehouse'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <Warehouse class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Warehouse </span>
      </RouterLink>

      <RouterLink
        to="/storageBin"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/storageBin'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <Package class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Storage Bin </span>
      </RouterLink>

      <RouterLink
        to="/asset"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/asset'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <Factory class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Asset </span>
      </RouterLink>

      <RouterLink
        to="/supplier"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/supplier'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <Truck class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Supplier </span>
      </RouterLink>

      <RouterLink
        to="/user"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/user'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <Users class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> User </span>
      </RouterLink>

      <RouterLink
        to="/work-order"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/work-order'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <ClipboardList class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Work Order </span>
      </RouterLink>

      <RouterLink
        to="/report"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/report'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <FileText class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Report </span>
      </RouterLink>
      <RouterLink
        to="/analytics"
        @click.stop="emit('navigate')"
        :class="[
          route.path === '/analytics'
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',

          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <ChartColumn class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed"> Analytics </span>
      </RouterLink>
    </nav>
    <div class="p-4 border-t border-white/10 shrink-0 mb-2">
      <div
        @click="handleLogout"
        :class="[
          'text-white/70 hover:bg-white/10 hover:text-white cursor-pointer',
          isCollapsed ? 'justify-center' : '',
        ]"
        class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition"
      >
        <LogOut class="w-5 h-5 shrink-0" />
        <span v-if="!isCollapsed">Logout</span>
      </div>
    </div>
  </aside>
</template>
