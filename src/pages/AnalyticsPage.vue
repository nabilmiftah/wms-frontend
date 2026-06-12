<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { getWarehouses } from "../services/warehouse.service";
import { getAssets } from "../services/asset.service";
import api from "../services/api";
import { toast } from "vue-sonner";

// ── Loading / Error State ─────────────────────────────────────
const isLoading = ref(false);
const isLoadingStock = ref(false);
const error = ref("");

// ── Filter State ──────────────────────────────────────────────
const selectedWarehouse = ref("all");
const selectedStorageBin = ref("all");

// Dynamic options from API
const warehouseOptions = ref([{ label: "Semua Warehouse", value: "all" }]);
const storageBinOptions = ref([{ label: "Semua Storage Bin", value: "all" }]);

const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses();
    const data = Array.isArray(response) ? response : (response.data ?? []);
    warehouseOptions.value = [
      { label: "Semua Warehouse", value: "all" },
      ...data.map((w: any) => ({ label: w.whName, value: w.id })),
    ];
  } catch (e) {
    console.error("Fetch warehouses error:", e);
  }
};

const fetchStorageBins = async (warehouseId?: string) => {
  try {
    let url = "/storage-bins";
    if (warehouseId && warehouseId !== "all") {
      url += `?warehouseId=${warehouseId}`;
    }
    const response = await api.get(url);
    const data = Array.isArray(response.data)
      ? response.data
      : (response.data?.data ?? []);
    storageBinOptions.value = [
      { label: "Semua Storage Bin", value: "all" },
      ...data.map((b: any) => ({
        label: b.binAddress ?? b.binCode,
        value: b.binAddress ?? b.binCode,
      })),
    ];
  } catch (e) {
    console.error("Fetch storage bins error:", e);
  }
};

// Reset storage bin when warehouse changes
watch(selectedWarehouse, (val) => {
  selectedStorageBin.value = "all";
  fetchStorageBins(val && val !== "all" ? val : undefined);
  applyFilter();
});

// ── Analytics (Summary Cards + Kategori) ─────────────────────
interface AnalyticsResponse {
  totalAsset: number;
  totalStock: number;
  perCategory:
    | Array<{ category: string; totalStock: number; totalAsset: number }>
    | Record<string, number>;
  detail: DetailItem[];
}

interface DetailItem {
  assetNumber: string;
  assetName: string;
  category: string;
  warehouse: string | null;
  warehouseName: string | null;
  storageBin: string | null;
  storageBinCode?: string;
  stock: number;
  price?: number;
  supplierName?: string | null;
}

const analytics = ref<AnalyticsResponse | null>(null);

// Derived summary values
const totalAsset = computed(() => analytics.value?.totalAsset ?? 0);
const totalStock = computed(() => analytics.value?.totalStock ?? 0);
const lowStockCount = computed(() => {
  return stockData.value.filter((d) => d.stock > 0 && d.stock <= 5).length;
});

// Donut chart
const CHART_COLORS = [
  "#3B6FE8",
  "#34C98A",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const kategoriData = computed(() => {
  const perCat = analytics.value?.perCategory;
  if (!perCat) return [];

  let entries: Array<[string, number]> = [];

  // Handle array format from backend
  if (Array.isArray(perCat)) {
    entries = perCat.map((item: any) => [item.category, item.totalStock]);
  } else if (typeof perCat === "object") {
    // Handle object format
    entries = Object.entries(perCat);
  }

  const total = entries.reduce((a: number, [_, b]) => a + Number(b), 0) || 1;
  return entries.map(([label, count], i) => ({
    label,
    value: Math.round((Number(count) / total) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
});

const totalKategori = computed(() => {
  const perCat = analytics.value?.perCategory;
  if (!perCat) return 0;
  if (Array.isArray(perCat)) {
    return perCat.length;
  }
  return Object.keys(perCat).length;
});

const donutSegments = computed(() => {
  const cx = 80,
    cy = 80,
    r = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return kategoriData.value.map((k) => {
    const dash = (k.value / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...k, dash, gap, offset };
    offset += dash;
    return seg;
  });
});

// ── Stock Report (Detail Table + Bar Chart) ───────────────────
interface StockItem {
  assetNumber: string;
  assetName: string;
  category: string;
  warehouseName: string | null;
  storageBin: string | null;
  stock: number;
  price?: number;
  supplierName?: string | null;
}

const stockData = ref<StockItem[]>([]);

// Map binAddress -> warehouseName untuk join manual
const storageBinMap = ref<Record<string, string>>({});

const fetchStorageBinMap = async () => {
  try {
    const response = await api.get("/storage-bins?limit=999");
    const data = response.data?.data ?? response.data ?? [];
    const map: Record<string, string> = {};
    data.forEach((bin: any) => {
      const address = bin.binAddress ?? bin.address;
      const whName = bin.warehouse?.whName ?? bin.warehouse?.name ?? null;
      if (address && whName) {
        map[address] = whName;
      }
    });
    storageBinMap.value = map;
  } catch (e) {
    console.error("Fetch storageBinMap error:", e);
  }
};

// Get selected warehouse name for client-side filtering
const selectedWarehouseName = computed(() => {
  if (selectedWarehouse.value === "all") return null;
  const warehouse = warehouseOptions.value.find(
    (w) => w.value === selectedWarehouse.value,
  );
  return warehouse?.label ?? null;
});

// Bar chart: top assets by stock
const stockPerAsset = computed(() => {
  const sorted = [...stockData.value]
    .filter((s) => {
      // Filter by warehouse (client-side fallback)
      if (
        selectedWarehouseName.value &&
        s.warehouseName !== selectedWarehouseName.value
      ) {
        return false;
      }
      return s.stock > 0;
    })
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 6);
  const max = sorted[0]?.stock || 1;
  return sorted.map((s) => ({ name: s.assetName, stock: s.stock, max }));
});

// Filtered detail table (client-side for storageBin and warehouse filter)
const filteredDetail = computed(() => {
  console.log("Filtering detail - stockData:", stockData.value);
  console.log("selectedStorageBin:", selectedStorageBin.value);
  console.log("selectedWarehouseName:", selectedWarehouseName.value);

  const filtered = stockData.value.filter((row) => {
    // Filter by warehouse (client-side fallback)
    if (
      selectedWarehouseName.value &&
      row.warehouseName !== selectedWarehouseName.value
    ) {
      return false;
    }

    // Filter by storageBin
    if (!selectedStorageBin.value || selectedStorageBin.value === "all") {
      return true;
    }
    return row.storageBin === selectedStorageBin.value;
  });

  console.log("Filtered detail result:", filtered);
  return filtered;
});

function stockLevel(stock: number): "low" | "normal" | "empty" {
  if (stock === 0) return "empty";
  if (stock <= 5) return "low";
  return "normal";
}


// ── Fetch All Data ────────────────────────────────────────────
const fetchAnalytics = async () => {
  isLoading.value = true;
  error.value = "";
  try {
    let url = "/reports/analytics";
    const params = new URLSearchParams();
    if (selectedWarehouse.value && selectedWarehouse.value !== "all") {
      params.set("warehouseId", selectedWarehouse.value);
    }
    if (params.toString()) url += `?${params}`;

    const response = await api.get(url);

    // Handle both response formats
    let data = null;
    if (response.data?.data && typeof response.data.data === "object") {
      // Format: {success, message, data: {...}}
      data = response.data.data;
    } else if (
      typeof response.data === "object" &&
      response.data?.totalAsset !== undefined
    ) {
      // Already the data object
      data = response.data;
    } else {
      // Fallback
      data = response.data;
    }

    analytics.value = data;
  } catch (e: any) {
    console.error("Fetch analytics error:", e);
    error.value = e?.response?.data?.message ?? "Gagal memuat data analytics.";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

const fetchStock = async () => {
  isLoadingStock.value = true;
  try {
    let url = "/reports/stock";
    const params = new URLSearchParams();
    if (selectedWarehouse.value && selectedWarehouse.value !== "all") {
      params.set("warehouseId", selectedWarehouse.value);
    }
    // Storage bin filter is handled client-side to avoid API parameter mismatch
    if (params.toString()) url += `?${params}`;

    const response = await api.get(url);

    // Handle both response formats
    let raw = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      // Format: {success, message, data: [...]}
      raw = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Format: direct array
      raw = response.data;
    } else {
      // Fallback
      raw = [];
    }

    stockData.value = raw.map((item: any) => ({
      assetNumber: item.assetNumber ?? item.assetId ?? "-",
      assetName: item.assetName ?? "-",
      category: item.category ?? "-",
      warehouseName:
        item.warehouseName ??
        item.warehouse?.whName ??
        (item.storageBin ? storageBinMap.value[item.storageBin] ?? null : null),
      storageBin:
        item.storageBin ??
        item.storageBinCode ??
        item.binAddress ??
        item.storageBinAddress ??
        null,
      stock: Number(item.stock ?? item.totalStock ?? 0),
      price: item.price,
      supplierName: item.supplierName ?? item.supplier?.supName ?? null,
    }));
  } catch (e) {
    console.error("Fetch stock error:", e);
    stockData.value = [];
    toast.error("Gagal memuat data stock");
  } finally {
    isLoadingStock.value = false;
  }
};

const applyFilter = async () => {
  await Promise.all([fetchAnalytics(), fetchStock()]);
};

// ── Export Excel (dari BE) ────────────────────────────────────
const isExporting = ref(false);

const exportExcel = async () => {
  isExporting.value = true;
  try {
    const response = await api.get("/reports/export/excel", {
      responseType: "blob",
    });
    const blob = response.data;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WMS_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel berhasil didownload");
  } catch (e) {
    console.error("Export error:", e);
    toast.error("Export Excel gagal. Coba lagi.");
  } finally {
    isExporting.value = false;
  }
};

// ── Init ──────────────────────────────────────────────────────
onMounted(async () => {
  try {
    await fetchWarehouses();
    await fetchStorageBins();
    await fetchStorageBinMap();
    await applyFilter();
  } catch (e) {
    console.error("Error on mount:", e);
    toast.error("Error loading analytics page");
  }
});
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <!-- ── Page Header ── -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Analytics - Stock Overview
          </h1>
        </div>

        <!-- ── Error Banner ── -->
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
        >
          {{ error }}
        </div>

        <!-- ── Filter Bar ── -->
        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-end gap-4 w-full"
        >
          <div class="flex flex-col gap-1.5 flex-1">
            <label
              class="text-xs font-bold text-gray-400 tracking-wider uppercase"
              >Warehouse</label
            >
            <BaseSelect
              v-model="selectedWarehouse"
              :items="warehouseOptions"
              placeholder="Semua Warehouse"
            />
          </div>

          <div class="flex flex-col gap-1.5 flex-1">
            <label
              class="text-xs font-bold text-gray-400 tracking-wider uppercase"
              >Storage Bin</label
            >
            <BaseSelect
              v-model="selectedStorageBin"
              :items="storageBinOptions"
              placeholder="Semua Storage Bin"
            />
          </div>

          <div class="pb-0.5 flex-shrink-0">
            <BaseButton
              color="brand"
              :disabled="isLoading"
              @click="applyFilter"
            >
              <span class="px-1 py-0.5">
                {{ isLoading ? "Memuat..." : "Terapkan Filter" }}
              </span>
            </BaseButton>
          </div>
        </div>

        <!-- ── Summary Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Asset Unique -->
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <p
              class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3"
            >
              Total Asset Unique
            </p>
            <div class="flex items-end gap-2">
              <span
                v-if="isLoading"
                class="text-3xl font-extrabold text-gray-300 animate-pulse"
                >—</span
              >
              <span v-else class="text-3xl font-extrabold text-gray-900">{{
                totalAsset.toLocaleString("id-ID")
              }}</span>
            </div>
          </div>

          <!-- Total Quantity Stok -->
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <p
              class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3"
            >
              Total Quantity Stok
            </p>
            <div class="flex items-end gap-2">
              <span
                v-if="isLoading"
                class="text-3xl font-extrabold text-gray-300 animate-pulse"
                >—</span
              >
              <span v-else class="text-3xl font-extrabold text-gray-900">{{
                totalStock.toLocaleString("id-ID")
              }}</span>
              <span class="mb-1 text-xs font-semibold text-gray-400">pcs</span>
            </div>
          </div>

          <!-- Total Kategori -->
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <p
              class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3"
            >
              Total Kategori
            </p>
            <div class="flex items-end gap-2">
              <span
                v-if="isLoading"
                class="text-3xl font-extrabold text-gray-300 animate-pulse"
                >—</span
              >
              <span v-else class="text-3xl font-extrabold text-gray-900">{{
                totalKategori
              }}</span>
              <span class="mb-1 text-xs font-semibold text-gray-400"
                >kategori</span
              >
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200"
          >
            <p
              class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3"
            >
              Low Stock Alert
            </p>
            <div class="flex items-end gap-2">
              <span
                v-if="isLoading"
                class="text-3xl font-extrabold text-gray-300 animate-pulse"
                >—</span
              >
              <span v-else class="text-3xl font-extrabold text-red-500">{{
                lowStockCount
              }}</span>
              <span class="mb-1 text-xs font-semibold text-red-400">Items</span>
            </div>
          </div>
        </div>

        <!-- ── Charts Row ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Bar Chart: Stok per Asset -->
          <div
            class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div class="flex items-start justify-between mb-5">
              <h2 class="text-sm font-bold text-gray-900">Stok per Asset</h2>
              <span class="text-xs text-gray-400"
                >Jumlah stock untuk semua asset (pcs)</span
              >
            </div>

            <!-- Loading skeleton -->
            <div v-if="isLoadingStock" class="space-y-4">
              <div v-for="i in 4" :key="i" class="space-y-1.5">
                <div class="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                <div
                  class="w-full bg-gray-100 rounded-full h-3 animate-pulse"
                ></div>
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-else-if="stockPerAsset.length === 0"
              class="flex items-center justify-center h-32 text-gray-400 text-xs"
            >
              Tidak ada data stok.
            </div>

            <!-- Chart -->
            <div v-else class="space-y-4">
              <div
                v-for="item in stockPerAsset"
                :key="item.name"
                class="space-y-1.5"
              >
                <div class="flex items-center justify-between text-xs">
                  <span
                    class="font-semibold text-gray-700 truncate max-w-[70%]"
                    >{{ item.name }}</span
                  >
                  <span class="font-bold text-gray-500"
                    >{{ item.stock.toLocaleString("id-ID") }} pcs</span
                  >
                </div>
                <div class="w-full bg-gray-100 rounded-full h-3">
                  <div
                    class="h-3 rounded-full bg-[#3B6FE8] transition-all duration-500"
                    :style="{ width: (item.stock / item.max) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Donut Chart: Distribusi Kategori -->
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col"
          >
            <h2 class="text-sm font-bold text-gray-900 mb-5">
              Distribusi Kategori
            </h2>
            <div class="flex-1 flex items-center justify-center">
              <div class="relative w-40 h-40">
                <!-- Loading state -->
                <svg
                  v-if="isLoading"
                  viewBox="0 0 160 160"
                  class="w-40 h-40 -rotate-90"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f3f4f6"
                    stroke-width="20"
                  />
                </svg>
                <svg v-else viewBox="0 0 160 160" class="w-40 h-40 -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f3f4f6"
                    stroke-width="20"
                  />
                  <circle
                    v-for="seg in donutSegments"
                    :key="seg.label"
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="20"
                    :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                    :stroke-dashoffset="-seg.offset"
                    stroke-linecap="butt"
                  />
                </svg>
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <span class="text-2xl font-extrabold text-gray-900">{{
                    totalKategori
                  }}</span>
                  <span
                    class="text-[10px] font-bold text-gray-400 tracking-widest uppercase"
                    >Kategori</span
                  >
                </div>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <!-- Loading skeleton -->
              <template v-if="isLoading">
                <div
                  v-for="i in 2"
                  :key="i"
                  class="h-3 bg-gray-100 rounded animate-pulse"
                ></div>
              </template>
              <!-- Kategori legend -->
              <template v-else>
                <div
                  v-for="k in kategoriData"
                  :key="k.label"
                  class="flex items-center justify-between text-xs"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: k.color }"
                    ></span>
                    <span class="font-semibold text-gray-600">{{
                      k.label
                    }}</span>
                  </div>
                  <span class="font-bold text-gray-500">{{ k.value }}%</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- ── Detail Table ── -->
        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-900">Data Detail Stok</h2>
            <button
              @click="exportExcel"
              :disabled="isExporting"
              class="flex items-center gap-1.5 text-xs font-bold text-[#004AC6] hover:text-[#0038a0] transition disabled:opacity-50"
            >
              <i class="fas fa-file-excel text-sm"></i>
              {{ isExporting ? "Mengunduh..." : "Export Excel" }}
            </button>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200">
            <table class="w-full text-sm border-collapse min-w-[800px]">
              <thead
                class="bg-gray-100 text-gray-400 text-xs font-bold tracking-wider uppercase"
              >
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-4 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-4 font-semibold">Warehouse</th>
                  <th class="text-left px-4 py-4 font-semibold">Storage Bin</th>
                  <th class="text-left px-4 py-4 font-semibold">Category</th>
                  <th class="text-right px-4 py-4 font-semibold">
                    Total Stock
                  </th>
                </tr>
              </thead>
              <tbody class="text-xs font-medium text-gray-600">
                <!-- Loading skeleton rows -->
                <template v-if="isLoadingStock">
                  <tr v-for="i in 4" :key="i" class="border-t border-gray-100">
                    <td class="px-4 py-4">
                      <div
                        class="h-3 bg-gray-100 rounded animate-pulse w-48"
                      ></div>
                    </td>
                    <td class="px-4 py-4">
                      <div
                        class="h-3 bg-gray-100 rounded animate-pulse w-24"
                      ></div>
                    </td>
                    <td class="px-4 py-4">
                      <div
                        class="h-3 bg-gray-100 rounded animate-pulse w-20"
                      ></div>
                    </td>
                    <td class="px-4 py-4">
                      <div
                        class="h-3 bg-gray-100 rounded animate-pulse w-20"
                      ></div>
                    </td>
                    <td class="px-4 py-4 text-right">
                      <div
                        class="h-3 bg-gray-100 rounded animate-pulse w-16 ml-auto"
                      ></div>
                    </td>
                  </tr>
                </template>

                <!-- Data rows -->
                <template v-else>
                  <tr
                    v-for="(row, index) in filteredDetail"
                    :key="index"
                    class="border-t border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <td
                      class="px-4 py-4 font-semibold text-gray-800 max-w-xs truncate"
                    >
                      {{ row.assetName }}
                    </td>
                    <td class="px-4 py-4 text-gray-500">
                      {{ row.warehouseName ?? "-" }}
                    </td>
                    <td class="px-4 py-4 font-mono text-gray-400">
                      {{ row.storageBin ?? "-" }}
                    </td>
                    <td class="px-4 py-4 text-gray-500">
                      {{ row.category ?? "-" }}
                    </td>
                    <td class="px-4 py-4 text-right">
                      <span
                        :class="[
                          'px-2.5 py-1 rounded-md text-[10px] font-bold',
                          row.stock === 0
                            ? 'bg-gray-100 text-gray-400'
                            : row.stock <= 5
                              ? 'bg-red-50 text-red-500'
                              : 'bg-emerald-50 text-emerald-600',
                        ]"
                      >
                        {{ row.stock }} pcs
                      </span>
                    </td>
                  </tr>
                </template>

                <!-- Empty state -->
                <tr v-if="!isLoadingStock && filteredDetail.length === 0">
                  <td
                    colspan="5"
                    class="px-4 py-10 text-center text-gray-400 text-xs"
                  >
                    Tidak ada data untuk filter yang dipilih.
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