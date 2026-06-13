<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import MainLayout from "../components/layouts/MainLayout.vue";
import { getWarehouses } from "../services/warehouse.service";
import { getStorageBins } from "../services/storage-bin.service.ts";
import { getAssets } from "../services/asset.service";
import { getWorkOrders } from "../services/workorder.service.ts";
import type { Warehouse } from "../types/warehouse";
import type { StorageBin } from "../types/storage-bin";
import type { Asset } from "../types/asset";
import type { WorkOrder } from "../types/workorder";

const router = useRouter();

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false);
const warehouses = ref<Warehouse[]>([]);
const storageBins = ref<StorageBin[]>([]);
const assets = ref<Asset[]>([]);
const workOrders = ref<WorkOrder[]>([]);

// ─── Fetch All ────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  try {
    loading.value = true;

    const [whRes, sbRes, assetRes, woRes] = await Promise.all([
      getWarehouses(),
      getStorageBins(),
      getAssets(),
      getWorkOrders(),
    ]);

    warehouses.value = whRes.data ?? [];
    storageBins.value = sbRes.data ?? [];
    assets.value = assetRes.data ?? [];
    workOrders.value = woRes.data ?? [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAll();
});

// ─── Stats ────────────────────────────────────────────────────────────────────
const totalWarehouse = computed(() => warehouses.value.length);

const totalStorageBin = computed(() => storageBins.value.length);

const totalAsset = computed(() => assets.value.length);

const totalStock = computed(() =>
  workOrders.value.reduce((sum, wo) => sum + (wo.quantity ?? 0), 0)
);

const stats = computed(() => [
  {
    label: "Total Warehouse",
    value: totalWarehouse.value,
    icon: "fa-house-chimney",
    iconColor: "text-blue-600",
    bgIcon: "bg-blue-50",
  },
  {
    label: "Total Storage Bin",
    value: totalStorageBin.value.toLocaleString(),
    icon: "fa-box-archive",
    iconColor: "text-blue-600",
    bgIcon: "bg-blue-50",
  },
  {
    label: "Total Asset",
    value: totalAsset.value.toLocaleString(),
    icon: "fa-dolly",
    iconColor: "text-orange-500",
    bgIcon: "bg-orange-50",
  },
  {
    label: "Total Stock (QTY)",
    value: totalStock.value.toLocaleString(),
    icon: "fa-circle-check",
    iconColor: "text-green-500",
    bgIcon: "bg-green-50",
  },
]);

// ─── Chart — Bar (Inbound vs Outbound per hari) ───────────────────────────────
const barSeries = computed(() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const inbound = new Array(7).fill(0);
  const outbound = new Array(7).fill(0);

  workOrders.value.forEach((wo) => {
    const day = new Date(wo.createdAt).getDay(); // 0=Sun, 1=Mon...
    const idx = day === 0 ? 6 : day - 1;
    if (wo.type === "INBOUND") inbound[idx] += wo.quantity ?? 0;
    else outbound[idx] += wo.quantity ?? 0;
  });

  return [
    { name: "Inbound Asset", data: inbound },
    { name: "Outbound Asset", data: outbound },
  ];
});

const barOptions = ref({
  chart: { type: "bar", stacked: true, toolbar: { show: false } },
  colors: ["#2563EB", "#BFDBFE"],
  plotOptions: { bar: { columnWidth: "35%", borderRadius: 4 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    axisBorder: { show: false },
    labels: { style: { colors: "#94a3b8" } },
  },
  yaxis: {
    labels: { style: { colors: "#94a3b8" } },
  },
  grid: { borderColor: "#f1f5f9" },
  legend: {
    position: "bottom",
    horizontalAlign: "left",
    markers: { radius: 12 },
  },
});

// ─── Chart — Donut (Asset per category) ──────────────────────────────────────
const donutSeries = computed(() => {
  const small = storageBins.value.filter((sb) => sb.category === "SMALL_ASSET").length;
  const medium = storageBins.value.filter((sb) => sb.category === "MEDIUM_ASSET").length;
  const large = storageBins.value.filter((sb) => sb.category === "LARGE_ASSET").length;
  return [small, medium, large];
});

const donutOptions = computed(() => ({
  labels: ["Small Asset", "Medium Asset", "Large Asset"],
  colors: ["#2563EB", "#10B981", "#F59E0B"],
  dataLabels: {
    enabled: true,
    style: {
      fontSize: "10px",
      fontFamily: "Inter, sans-serif",
      fontWeight: "bold",
      colors: ["#fff"],
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "55%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total Bin",
            formatter: () => totalStorageBin.value.toString(),
            fontSize: "12px",
            color: "#64748b",
          },
          value: { show: true, fontSize: "20px", fontWeight: "bold" },
        },
      },
    },
  },
  legend: { show: false },
}));

const donutLabels = computed(() => [
  {
    label: "Small Asset",
    color: "bg-blue-600",
    value: donutSeries.value[0],
    percent:
      totalStorageBin.value > 0
        ? Math.round((donutSeries.value[0] / totalStorageBin.value) * 100)
        : 0,
  },
  {
    label: "Medium Asset",
    color: "bg-emerald-500",
    value: donutSeries.value[1],
    percent:
      totalStorageBin.value > 0
        ? Math.round((donutSeries.value[1] / totalStorageBin.value) * 100)
        : 0,
  },
  {
    label: "Large Asset",
    color: "bg-orange-500",
    value: donutSeries.value[2],
    percent:
      totalStorageBin.value > 0
        ? Math.round((donutSeries.value[2] / totalStorageBin.value) * 100)
        : 0,
  },
]);

// ─── Recent Warehouse Table ───────────────────────────────────────────────────
const recentWarehouses = computed(() => {
  return warehouses.value.slice(0, 5).map((wh) => {
    const binCount = storageBins.value.filter(
      (sb) => sb.warehouseId === wh.id
    ).length;

    return {
      id: wh.id,
      name: wh.whName,
      location: wh.whLocation || "-",
      storageBinCount: binCount,
    };
  });
});

// ─── Recent Work Order Table ──────────────────────────────────────────────────
const recentWorkOrders = computed(() =>
  workOrders.value.slice(0, 5)
);

const getWOStatusClass = (status: string) => {
  if (status === "TODO") return "bg-yellow-100 text-yellow-700";
  if (status === "ON_PROGRESS") return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

const getWOStatusLabel = (status: string) => {
  if (status === "TODO") return "To-Do";
  if (status === "ON_PROGRESS") return "On Progress";
  return "Done";
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">

        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Warehouse</h1>
          <p class="text-sm text-gray-500 mt-1">Monitor aktivitas warehouse dan inventory secara real-time.</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div
            v-for="item in stats"
            :key="item.label"
            class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
          >
            <div class="flex justify-between items-start mb-4">
              <div :class="['w-10 h-10 rounded-xl flex items-center justify-center', item.bgIcon]">
                <i :class="['fas', item.icon, item.iconColor]"></i>
              </div>
            </div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ item.label }}</p>
            <h3 class="text-2xl font-bold text-gray-800 mt-1">
              <span v-if="loading" class="block h-7 w-20 bg-gray-100 rounded animate-pulse" />
              <span v-else>{{ item.value }}</span>
            </h3>
          </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Bar Chart -->
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-gray-800 text-sm">Inbound / Outbound Asset Chart</h3>
            </div>
            <apexchart
              type="bar"
              height="280"
              :options="barOptions"
              :series="barSeries"
            />
          </div>

          <!-- Donut Chart -->
          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <h3 class="font-bold text-gray-800 mb-6 text-sm">Storage Bin Distribution</h3>
            <div class="flex flex-col items-center gap-6 flex-1">
              <apexchart
                type="donut"
                width="200"
                :options="donutOptions"
                :series="donutSeries"
              />
              <div class="w-full space-y-3">
                <div
                  v-for="item in donutLabels"
                  :key="item.label"
                  class="flex justify-between items-center"
                >
                  <div class="flex items-center gap-2">
                    <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', item.color]" />
                    <p class="text-xs font-semibold text-gray-700">{{ item.label }}</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-gray-800">{{ item.value }}</span>
                    <span class="text-xs text-gray-400 ml-1">({{ item.percent }}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

          <!-- Recent Warehouse -->
          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-gray-800 text-sm">Recent Warehouse</h3>
              <button
                class="text-[#004AC6] text-xs font-bold hover:underline"
                @click="router.push('/warehouse')"
              >
                Lihat semua
              </button>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 text-gray-700">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold text-xs">Warehouse</th>
                    <th class="text-left px-4 py-3 font-semibold text-xs">Location</th>
                    <th class="text-center px-4 py-3 font-semibold text-xs">Storage Bin</th>
                    <th class="text-center px-4 py-3 font-semibold text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="4" class="text-center py-8 text-gray-400 text-xs">Loading...</td>
                  </tr>
                  <tr v-else-if="recentWarehouses.length === 0">
                    <td colspan="4" class="text-center py-8 text-gray-400 text-xs">No data</td>
                  </tr>
                  <tr
                    v-else
                    v-for="wh in recentWarehouses"
                    :key="wh.id"
                    class="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-3 font-semibold text-gray-900 text-xs">{{ wh.name }}</td>
                    <td class="px-4 py-3 text-gray-500 text-xs">{{ wh.location }}</td>
                    <td class="px-4 py-3 text-center text-gray-700 text-xs font-medium">{{ wh.storageBinCount }}</td>
                    <td class="px-4 py-3 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Work Order -->
          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-gray-800 text-sm">Recent Work Order</h3>
              <button
                class="text-[#004AC6] text-xs font-bold hover:underline"
                @click="router.push('/work-order')"
              >
                Lihat semua
              </button>
            </div>

            <div class="overflow-x-auto rounded-xl border border-gray-200">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 text-gray-700">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold text-xs">WO Number</th>
                    <th class="text-center px-4 py-3 font-semibold text-xs">Category</th>
                    <th class="text-left px-4 py-3 font-semibold text-xs">Warehouse</th>
                    <th class="text-center px-4 py-3 font-semibold text-xs">Status</th>
                    <th class="text-center px-4 py-3 font-semibold text-xs">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="loading">
                    <td colspan="5" class="text-center py-8 text-gray-400 text-xs">Loading...</td>
                  </tr>
                  <tr v-else-if="recentWorkOrders.length === 0">
                    <td colspan="5" class="text-center py-8 text-gray-400 text-xs">No data</td>
                  </tr>
                  <tr
                    v-else
                    v-for="wo in recentWorkOrders"
                    :key="wo.id"
                    class="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td class="px-4 py-3 font-bold text-[#004AC6] text-xs whitespace-nowrap">{{ wo.woNumber }}</td>
                    <td class="px-4 py-3 text-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        :class="wo.type === 'INBOUND' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'"
                      >
                        {{ wo.type === 'INBOUND' ? 'Inbound' : 'Outbound' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{{ wo.warehouse?.whName || "-" }}</td>
                    <td class="px-4 py-3 text-center">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        :class="getWOStatusClass(wo.status)"
                      >
                        {{ getWOStatusLabel(wo.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center font-semibold text-gray-900 text-xs">{{ wo.quantity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>
    </div>
  </MainLayout>
</template>