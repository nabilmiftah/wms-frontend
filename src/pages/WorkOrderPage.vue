<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Plus, Upload, Search, Eye } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseButton from "../components/base/BaseButton.vue";
import BaseInput from "../components/base/BaseInput.vue";

const router = useRouter();

type WOCategory = "INBOUND" | "OUTBOUND";
type WOStatus = "TO_DO" | "ON_PROGRESS" | "DONE";

interface WorkOrder {
  id: string;
  woNumber: string;
  category: WOCategory;
  warehouse: string;
  storageBin: string;
  assetName: string;
  qty: number;
  status: WOStatus;
  createdAt: string;
}

const search = ref("");
const filterCategory = ref<WOCategory | "">("");
const filterStatus = ref<WOStatus | "">("");

const workOrders = ref<WorkOrder[]>([
  { id: "1", woNumber: "WO_IN_01", category: "INBOUND", warehouse: "Gudang Jogja", storageBin: "WH_01_001", assetName: "Nike Journey Run Road Running Shoes - Black", qty: 10, status: "TO_DO", createdAt: "10 Apr 2026 07:00" },
  { id: "2", woNumber: "WO_IN_02", category: "INBOUND", warehouse: "Gudang Jogja", storageBin: "WH_01_001", assetName: "Nike Journey Run Road Running Shoes - Black", qty: 15, status: "DONE", createdAt: "09 Apr 2026 15:30" },
  { id: "3", woNumber: "WO_OUT_01", category: "OUTBOUND", warehouse: "Gudang Jogja", storageBin: "WH_01_001", assetName: "Nike Journey Run Road Running Shoes - Black", qty: 5, status: "ON_PROGRESS", createdAt: "10 Apr 2026 08:15" },
  { id: "4", woNumber: "WO_OUT_02", category: "OUTBOUND", warehouse: "Gudang Bandung", storageBin: "WH_02_012", assetName: "Puma Velocity Nitro 2 - White", qty: 20, status: "TO_DO", createdAt: "08 Apr 2026 11:20" },
  { id: "5", woNumber: "WO_IN_03", category: "INBOUND", warehouse: "Gudang Bandung", storageBin: "WH_02_005", assetName: "Adidas Ultraboost 22 - White", qty: 8, status: "ON_PROGRESS", createdAt: "07 Apr 2026 09:00" },
  { id: "6", woNumber: "WO_OUT_03", category: "OUTBOUND", warehouse: "Gudang Jakarta", storageBin: "WH_03_002", assetName: "New Balance 574 - Navy", qty: 12, status: "DONE", createdAt: "06 Apr 2026 14:00" },
]);

const totalWO = computed(() => workOrders.value.length);

const activeInbound = computed(
  () => workOrders.value.filter((wo) => wo.category === "INBOUND" && wo.status !== "DONE").length
);

const activeOutbound = computed(
  () => workOrders.value.filter((wo) => wo.category === "OUTBOUND" && wo.status !== "DONE").length
);

const filteredWO = computed(() => {
  return workOrders.value.filter((wo) => {
    const keyword = search.value.toLowerCase();

    const matchSearch =
      wo.woNumber.toLowerCase().includes(keyword) ||
      wo.warehouse.toLowerCase().includes(keyword) ||
      wo.storageBin.toLowerCase().includes(keyword) ||
      wo.assetName.toLowerCase().includes(keyword);

    const matchCategory = filterCategory.value ? wo.category === filterCategory.value : true;

    const matchStatus = filterStatus.value ? wo.status === filterStatus.value : true;

    return matchSearch && matchCategory && matchStatus;
  });
});

const getCategoryClass = (category: WOCategory) => {
  return category === "INBOUND"
    ? "bg-blue-100 text-blue-700"
    : "bg-orange-100 text-orange-700";
};

const getCategoryLabel = (category: WOCategory) => {
  return category === "INBOUND" ? "Inbound" : "Outbound";
};

const getStatusClass = (status: WOStatus) => {
  if (status === "TO_DO") return "bg-yellow-100 text-yellow-700";
  if (status === "ON_PROGRESS") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

const getStatusLabel = (status: WOStatus) => {
  if (status === "TO_DO") return "To-Do";
  if (status === "ON_PROGRESS") return "On Progress";
  return "Done";
};

const goToDetail = (wo: WorkOrder) => {
  if (wo.category === "INBOUND") {
    router.push(`/work-order/${wo.id}/inbound`);
  } else {
    router.push(`/work-order/${wo.id}/outbound`);
  }
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">

        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Work Order</h1>
            <p class="text-sm text-gray-500 mt-1">Kelola perintah kerja inbound dan outbound</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#004AC6] text-white text-sm font-semibold hover:bg-blue-700 transition"
              @click="router.push('/work-order/create?type=inbound')"
            >
              <Plus class="w-4 h-4" />
              Buat WO Inbound
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              @click="router.push('/work-order/create?type=outbound')"
            >
              <Upload class="w-4 h-4" />
              Buat WO Outbound
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p class="text-sm text-gray-500 font-medium">Total Work Orders</p>
            <p class="text-4xl font-bold text-gray-900 mt-1">{{ totalWO.toLocaleString() }}</p>
            <p class="text-xs text-green-600 font-medium mt-1">↑ 12% vs bulan lalu</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p class="text-sm text-gray-500 font-medium">Active Inbound</p>
            <p class="text-4xl font-bold text-gray-900 mt-1">{{ activeInbound }}</p>
            <p class="text-xs text-gray-400 mt-1">WO dalam proses masuk</p>
          </div>
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <p class="text-sm text-gray-500 font-medium">Active Outbound</p>
            <p class="text-4xl font-bold text-gray-900 mt-1">{{ activeOutbound }}</p>
            <p class="text-xs text-gray-400 mt-1">WO dalam proses keluar</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
          <div class="flex items-center justify-between gap-4">
            <div class="relative w-full max-w-md">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <BaseInput
                v-model="search"
                type="text"
                placeholder="Cari No. WO..."
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>
            <div class="flex items-center gap-2">
              <select
                v-model="filterCategory"
                class="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option value="INBOUND">Inbound</option>
                <option value="OUTBOUND">Outbound</option>
              </select>
              <select
                v-model="filterStatus"
                class="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white outline-none cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="TO_DO">To-Do</option>
                <option value="ON_PROGRESS">On Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200">
            <table class="w-full text-sm min-w-[800px]">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">WO NUMBER</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">CATEGORY</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">WAREHOUSE</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">STORAGE BIN</th>
                  <th class="text-left px-4 py-3 font-semibold w-full">ASSET NAME</th>
                  <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">QTY</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">STATUS</th>
                  <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="wo in filteredWO"
                  :key="wo.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 whitespace-nowrap">
                    <p class="font-semibold text-gray-900">{{ wo.woNumber }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ wo.createdAt }}</p>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', getCategoryClass(wo.category)]">
                      {{ getCategoryLabel(wo.category) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ wo.warehouse }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{{ wo.storageBin }}</td>
                  <td class="px-4 py-3 text-gray-700 max-w-[220px]">
                    <p class="truncate">{{ wo.assetName }}</p>
                  </td>
                  <td class="px-4 py-3 text-center font-semibold text-gray-900 whitespace-nowrap">{{ wo.qty }}</td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', getStatusClass(wo.status)]">
                      {{ getStatusLabel(wo.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#004AC6] text-xs font-semibold rounded-lg hover:bg-blue-50 transition"
                      @click="goToDetail(wo)"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredWO.length === 0">
                  <td colspan="8" class="text-center py-10 text-gray-400">
                    No work order found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>