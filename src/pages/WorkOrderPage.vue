<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus, Upload, Search, Eye } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseInput from "../components/base/BaseInput.vue";
import { toast } from "vue-sonner";
import { getWorkOrders } from "../services/workorder.service.ts";
import type { WorkOrder } from "../types/workorder.ts";

const router = useRouter();

const loading = ref(false);
const search = ref("");
const filterType = ref<"INBOUND" | "OUTBOUND" | "">("");
const filterStatus = ref<"TODO" | "ON_PROGRESS" | "DONE" | "">("");

const workOrders = ref<WorkOrder[]>([]);

const fetchWorkOrders = async () => {
  try {
    loading.value = true;

    const response = await getWorkOrders();

    workOrders.value = response.data;
  } catch (error: any) {
    console.error(error);

    toast.error("Failed to fetch work orders");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWorkOrders();
});

const totalWO = computed(() => workOrders.value.length);

const activeInbound = computed(
  () => workOrders.value.filter((wo) => wo.type === "INBOUND" && wo.status !== "DONE").length
);

const activeOutbound = computed(
  () => workOrders.value.filter((wo) => wo.type === "OUTBOUND" && wo.status !== "DONE").length
);

const filteredWO = computed(() => {
  return workOrders.value.filter((wo) => {
    const keyword = search.value.toLowerCase();

    const matchSearch =
      wo.woNumber.toLowerCase().includes(keyword) ||
      (wo.warehouse?.whName ?? "").toLowerCase().includes(keyword) ||
      (wo.storageBin?.binAddress ?? "").toLowerCase().includes(keyword) ||
      (wo.asset?.assetName ?? "").toLowerCase().includes(keyword);

    const matchType = filterType.value ? wo.type === filterType.value : true;

    const matchStatus = filterStatus.value ? wo.status === filterStatus.value : true;

    return matchSearch && matchType && matchStatus;
  });
});

const getCategoryClass = (type: string) => {
  return type === "INBOUND"
    ? "bg-blue-100 text-blue-700"
    : "bg-orange-100 text-orange-700";
};

const getCategoryLabel = (type: string) => {
  return type === "INBOUND" ? "Inbound" : "Outbound";
};

const getStatusClass = (status: string) => {
  if (status === "TODO") return "bg-yellow-100 text-yellow-700";
  if (status === "ON_PROGRESS") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

const getStatusLabel = (status: string) => {
  if (status === "TODO") return "To-Do";
  if (status === "ON_PROGRESS") return "On Progress";
  return "Done";
};

const goToDetail = (wo: WorkOrder) => {
  if (wo.type === "INBOUND") {
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
                v-model="filterType"
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
                <option value="TODO">To-Do</option>
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
                <tr v-if="loading">
                  <td colspan="8" class="text-center py-10 text-gray-400">Loading...</td>
                </tr>

                <template v-else>
                  <tr
                    v-for="wo in filteredWO"
                    :key="wo.id"
                    class="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-3 whitespace-nowrap">
                      <p class="font-semibold text-gray-900">{{ wo.woNumber }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">
                        {{ new Date(wo.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) }}
                      </p>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', getCategoryClass(wo.type)]">
                        {{ getCategoryLabel(wo.type) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ wo.warehouse?.whName || "-" }}</td>
                    <td class="px-4 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">{{ wo.storageBin?.binAddress || "-" }}</td>
                    <td class="px-4 py-3 text-gray-700">
                      <p class="truncate max-w-[220px]">{{ wo.asset?.assetName || "-" }}</p>
                    </td>
                    <td class="px-4 py-3 text-center font-semibold text-gray-900 whitespace-nowrap">{{ wo.quantity }}</td>
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

                  <tr v-if="filteredWO.length === 0 && !loading">
                    <td colspan="8" class="text-center py-10 text-gray-400">
                      No work order found
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>