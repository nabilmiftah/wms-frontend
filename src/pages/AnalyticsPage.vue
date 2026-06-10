<script setup lang="ts">
import { ref, computed } from "vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import * as XLSX from "xlsx";

// ── Filter State ──────────────────────────────────────────────
const selectedWarehouse = ref("");
const selectedStorageBin = ref("");
const selectedPeriode = ref("April 2026");

const warehouseOptions = [
  { label: "Semua Warehouse", value: "" },
  { label: "Gudang Jogja", value: "Gudang Jogja" },
  { label: "Gudang Bandung", value: "Gudang Bandung" },
];

const storageBinOptions = [
  { label: "Semua Storage Bin", value: "" },
  { label: "WH_01_001", value: "WH_01_001" },
  { label: "WH_01_002", value: "WH_01_002" },
  { label: "WH_02_014", value: "WH_02_014" },
];

const periodeOptions = [
  { label: "April 2026", value: "April 2026" },
  { label: "Maret 2026", value: "Maret 2026" },
  { label: "Februari 2026", value: "Februari 2026" },
];

// ── Summary Cards Data ────────────────────────────────────────
const summaryCards = ref([
  { label: "Total Asset Unique", value: "1.250", unit: "", badge: "+12%", badgeColor: "green" },
  { label: "Total Quantity Stok", value: "12.500", unit: "pcs", badge: null, badgeColor: null },
  { label: "Kapasitas Gudang", value: "85%", unit: "", badge: null, badgeColor: null, isProgress: true, progress: 85 },
  { label: "Low Stock Alert", value: "12", unit: "Items", badge: null, badgeColor: null, isAlert: true },
]);

// ── Bar Chart Data ────────────────────────────────────────────
const stockPerAsset = ref([
  { name: "Nike Journey Run Road...", stock: 1200, max: 1200 },
  { name: "Adidas Ultraboost", stock: 900, max: 1200 },
  { name: "Puma Velocity", stock: 600, max: 1200 },
  { name: "Reebok Nano X", stock: 300, max: 1200 },
]);

// ── Donut Chart Data ──────────────────────────────────────────
const kategoriData = ref([
  { label: "Footwear", value: 70, color: "#3B6FE8" },
  { label: "Apparel", value: 30, color: "#34C98A" },
]);

// Compute donut SVG path (simple 2-segment donut)
const donutSegments = computed(() => {
  const cx = 80, cy = 80, r = 60, strokeW = 20;
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

// ── Detail Table Data ─────────────────────────────────────────
const detailStok = ref([
  { assetName: "Nike Journey Run Road Shoes - Black", warehouse: "Gudang Jogja", storageBin: "WH_01_001", category: "Footwear", totalStock: 120, stockLevel: "normal", lastUpdated: "13-04-2026 07:00" },
  { assetName: "Adidas Ultraboost 22 - White", warehouse: "Gudang Jogja", storageBin: "WH_01_002", category: "Footwear", totalStock: 85, stockLevel: "normal", lastUpdated: "13-04-2026 09:15" },
  { assetName: "Puma Velocity Run - Blue", warehouse: "Gudang Bandung", storageBin: "WH_02_014", category: "Footwear", totalStock: 12, stockLevel: "low", lastUpdated: "14-04-2026 11:00" },
  { assetName: "Reebok Nano X - Grey", warehouse: "Gudang Bandung", storageBin: "WH_02_014", category: "Footwear", totalStock: 55, stockLevel: "normal", lastUpdated: "14-04-2026 13:30" },
  { assetName: "Nike Dri-FIT Shirt - Black", warehouse: "Gudang Jogja", storageBin: "WH_01_001", category: "Apparel", totalStock: 8, stockLevel: "low", lastUpdated: "15-04-2026 08:45" },
]);

// ── Filtered Table ────────────────────────────────────────────
const filteredDetail = computed(() => {
  return detailStok.value.filter((row) => {
    const matchWH = !selectedWarehouse.value || row.warehouse === selectedWarehouse.value;
    const matchBin = !selectedStorageBin.value || row.storageBin === selectedStorageBin.value;
    return matchWH && matchBin;
  });
});

function applyFilter() {
  // In real implementation: call API with filter params
  // filteredDetail is already reactive via computed
}

function exportExcel() {
  // Siapkan data dari tabel
  const rows = filteredDetail.value.map((row) => ({
    "Asset Name": row.assetName,
    "Warehouse": row.warehouse,
    "Storage Bin": row.storageBin,
    "Category": row.category,
    "Total Stock": row.totalStock + " pcs",
    "Last Updated": row.lastUpdated,
  }));

  // Buat worksheet & workbook
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Overview");

  // Download file
  XLSX.writeFile(wb, `Analytics_Stock_${selectedPeriode.value}.xlsx`);
}
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">

        <!-- ── Page Header ── -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Analytics - Stock Overview</h1>
        </div>

        <!-- ── Filter Bar ── -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-end gap-4 w-full">
            <div class="flex flex-col gap-1.5 flex-1">
                <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Warehouse</label>
                <BaseSelect v-model="selectedWarehouse" :items="warehouseOptions" placeholder="Semua Warehouse" />
            </div>

            <div class="flex flex-col gap-1.5 flex-1">
                <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Storage Bin</label>
                <BaseSelect v-model="selectedStorageBin" :items="storageBinOptions" placeholder="Semua Storage Bin" />
            </div>

            <div class="flex flex-col gap-1.5 flex-1">
                <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Periode</label>
                <BaseSelect v-model="selectedPeriode" :items="periodeOptions" placeholder="Pilih Periode" />
            </div>

            <div class="pb-0.5 flex-shrink-0">
                <BaseButton color="brand" @click="applyFilter">
                <span class="px-1 py-0.5">Terapkan Filter</span>
                </BaseButton>
            </div>
        </div>
        <!-- ── Summary Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Asset Unique -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Total Asset Unique</p>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-gray-900">1.250</span>
              <span class="mb-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>

          <!-- Total Quantity Stok -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Total Quantity Stok</p>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-gray-900">12.500</span>
              <span class="mb-1 text-xs font-semibold text-gray-400">pcs</span>
            </div>
          </div>

          <!-- Kapasitas Gudang -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Kapasitas Gudang</p>
            <div class="flex items-end gap-2 mb-3">
              <span class="text-3xl font-extrabold text-gray-900">85%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" style="width: 85%"></div>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <p class="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">Low Stock Alert</p>
            <div class="flex items-end gap-2">
              <span class="text-3xl font-extrabold text-red-500">12</span>
              <span class="mb-1 text-xs font-semibold text-red-400">Items</span>
            </div>
          </div>
        </div>

        <!-- ── Charts Row ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <!-- Bar Chart: Stok per Asset -->
          <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div class="flex items-start justify-between mb-5">
              <h2 class="text-sm font-bold text-gray-900">Stok per Asset</h2>
              <span class="text-xs text-gray-400">Jumlah stock untuk semua asset (pcs)</span>
            </div>
            <div class="space-y-4">
              <div v-for="item in stockPerAsset" :key="item.name" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-gray-700">{{ item.name }}</span>
                  <span class="font-bold text-gray-500">{{ item.stock.toLocaleString() }} pcs</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-3">
                  <div
                    class="h-3 rounded-full bg-[#3B6FE8] transition-all duration-500"
                    :style="{ width: (item.stock / item.max * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Donut Chart: Distribusi Kategori -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col">
            <h2 class="text-sm font-bold text-gray-900 mb-5">Distribusi Kategori</h2>
            <div class="flex-1 flex items-center justify-center">
              <div class="relative w-40 h-40">
                <svg viewBox="0 0 160 160" class="w-40 h-40 -rotate-90">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f3f4f6" stroke-width="20" />
                  <circle
                    v-for="seg in donutSegments"
                    :key="seg.label"
                    cx="80" cy="80" r="60"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="20"
                    :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                    :stroke-dashoffset="-seg.offset"
                    stroke-linecap="butt"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-extrabold text-gray-900">5</span>
                  <span class="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Kategori</span>
                </div>
              </div>
            </div>
            <div class="mt-4 space-y-2">
              <div v-for="k in kategoriData" :key="k.label" class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: k.color }"></span>
                  <span class="font-semibold text-gray-600">{{ k.label }}</span>
                </div>
                <span class="font-bold text-gray-500">{{ k.value }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Detail Table ── -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-900">Data Detail Stok</h2>
            <button
              @click="exportExcel"
              class="flex items-center gap-1.5 text-xs font-bold text-[#004AC6] hover:text-[#0038a0] transition"
            >
              <i class="fas fa-file-excel text-sm"></i>
              Export Excel
            </button>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm border-collapse whitespace-nowrap">
              <thead class="bg-gray-100 text-gray-400 text-xs font-bold tracking-wider uppercase">
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-4 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-4 font-semibold">Warehouse</th>
                  <th class="text-left px-4 py-4 font-semibold">Storage Bin</th>
                  <th class="text-left px-4 py-4 font-semibold">Category</th>
                  <th class="text-right px-4 py-4 font-semibold">Total Stock</th>
                  <th class="text-right px-5 py-4 font-semibold">Last Updated</th>
                </tr>
              </thead>
              <tbody class="text-xs font-medium text-gray-600">
                <tr
                  v-for="(row, index) in filteredDetail"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50/50 transition"
                >
                  <td class="px-4 py-4 font-semibold text-gray-800 max-w-xs truncate">{{ row.assetName }}</td>
                  <td class="px-4 py-4 text-gray-500">{{ row.warehouse }}</td>
                  <td class="px-4 py-4 font-mono text-gray-400">{{ row.storageBin }}</td>
                  <td class="px-4 py-4 text-gray-500">{{ row.category }}</td>
                  <td class="px-4 py-4 text-right">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-md text-[10px] font-bold',
                        row.stockLevel === 'low'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-emerald-50 text-emerald-600',
                      ]"
                    >
                      {{ row.totalStock }} pcs
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right text-gray-400">{{ row.lastUpdated }}</td>
                </tr>

                <!-- Empty state -->
                <tr v-if="filteredDetail.length === 0">
                  <td colspan="6" class="px-4 py-10 text-center text-gray-400 text-xs">
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