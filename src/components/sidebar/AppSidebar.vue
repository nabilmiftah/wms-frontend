<script setup lang="ts">
import { ref } from "vue";

import {
  LayoutDashboard,
  Warehouse,
  Package,
  Truck,
  Users,
  Factory,
  Menu,
} from "lucide-vue-next";

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <aside
    :class="
      isCollapsed ? 'w-20' : 'w-64'
    "
    class="
      bg-[#001233]
      text-white
      flex
      flex-col
      transition-all
      duration-300
    "
  >
    <div
      class="
        h-16
        flex
        items-center
        justify-between
        px-4
        border-b
        border-white/10
      "
    >
      <div class="flex items-center gap-3">
        <img
          src="/logo-wms.png"
          alt="Logo logistic core"
          class="w-10 h-10 object-contain"
        />

        <h1
          v-if="!isCollapsed"
          class="text-lg font-bold"
        >
          Logistics Core
        </h1>
      </div>

      <button
        @click="toggleSidebar"
        class="
          p-2
          rounded-lg
          hover:bg-white/10
          transition
        "
      >
        <Menu class="w-5 h-5" />
      </button>
    </div>

    <nav class="flex-1 p-4 space-y-2">
      <RouterLink
        to="/dashboard"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <LayoutDashboard class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          Dashboard
        </span>
      </RouterLink>

      <RouterLink
        to="/warehouse"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <Warehouse class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          Warehouse
        </span>
      </RouterLink>

      <RouterLink
        to="/storageBin"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <Package class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          Storage Bin
        </span>
      </RouterLink>

      <RouterLink
        to="/asset"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <Factory class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          Asset
        </span>
      </RouterLink>

      <RouterLink
        to="/supplier"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <Truck class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          Supplier
        </span>
      </RouterLink>

      <RouterLink
        to="/user"
        class="
          flex
          items-center
          gap-3
          px-4
          py-3
          rounded-xl
          hover:bg-white/10
          transition
        "
      >
        <Users class="w-5 h-5 shrink-0" />

        <span v-if="!isCollapsed">
          User
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>