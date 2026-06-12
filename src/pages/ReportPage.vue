<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import {
  getInboundReports,
  getOutboundReports,
} from "../services/report.service";
import { getWarehouses } from "../services/warehouse.service";
import { getAssets } from "../services/asset.service";
import { toast } from "vue-sonner";

const loading = ref(false);
const reportType = ref<"INBOUND" | "OUTBOUND">("INBOUND");
const selectedWarehouse = ref("ALL");
const selectedAsset = ref("ALL");
const reports = ref<any[]>([]);

const reportTypeOptions = [
  { label: "Inbound", value: "INBOUND" },
  { label: "Outbound", value: "OUTBOUND" },
];

const warehouseOptions = ref([{ label: "All Warehouse", value: "ALL" }]);
const assetOptions = ref([{ label: "All Assets", value: "ALL" }]);

const fetchReports = async () => {
  try {
    loading.value = true;

    const response =
      reportType.value === "INBOUND"
        ? await getInboundReports()
        : await getOutboundReports();

    reports.value = response.data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch reports");
  } finally {
    loading.value = false;
  }
};

const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses();
    warehouseOptions.value = [
      { label: "All Warehouse", value: "ALL" },
      ...response.data.map((warehouse: any) => ({
        label: warehouse.whName,
        value: warehouse.whName,
      })),
    ];
  } catch (error) {
    console.error(error);
  }
};

const fetchAssets = async () => {
  try {
    const response = await getAssets();
    assetOptions.value = [
      { label: "All Assets", value: "ALL" },
      ...response.data.map((asset: any) => ({
        label: asset.assetName,
        value: asset.assetName,
      })),
    ];
  } catch (error) {
    console.error(error);
  }
};

const filteredReports = computed(() => {
  return reports.value.filter((item) => {
    const warehouseMatch =
      selectedWarehouse.value === "ALL" ||
      item.warehouseName === selectedWarehouse.value;

    const assetMatch =
      selectedAsset.value === "ALL" || item.assetName === selectedAsset.value;

    return warehouseMatch && assetMatch;
  });
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function exportExcel() {
  if (reportType.value === "INBOUND") {
    exportInboundExcel();
  } else {
    exportOutboundExcel();
  }
}

function exportInboundExcel() {
  const rows = filteredReports.value.map((row: any) => ({
    "WO Number": row.woNumber,
    "WO Category": row.woCategory,
    Warehouse: row.warehouseName,
    "Storage Bin": row.storageBin,
    "Asset Name": row.assetName,
    Supplier: row.supplierName || "-",
    "Label Code": row.labelCode,
    "Scanned At": row.scannedAt,
    "Scanned By": row.scannedBy,
    "Updated Stock": row.updatedStock,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inbound Report");
  XLSX.writeFile(wb, `Report_Inbound_${new Date().toISOString().split("T")[0]}.xlsx`);
}

function exportOutboundExcel() {
  const rows = filteredReports.value.map((row: any) => ({
    "WO Number": row.woNumber,
    "WO Category": row.woCategory,
    Warehouse: row.warehouseName,
    "Storage Bin": row.storageBin,
    "Asset Name": row.assetName,
    Supplier: row.supplierName || "-",
    "Label Code": row.labelCode,
    "Inbound At": row.inboundAt,
    "Outbound At": row.outboundAt,
    "Outbound By": row.outboundBy || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Outbound Report");
  XLSX.writeFile(wb, `Report_Outbound_${new Date().toISOString().split("T")[0]}.xlsx`);
}

const handleReportTypeChange = () => {
  selectedWarehouse.value = "ALL";
  selectedAsset.value = "ALL";
  fetchReports();
};

onMounted(() => {
  fetchReports();
  fetchWarehouses();
  fetchAssets();
});
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-y-auto">

        <!-- Header -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Report Transaction</h1>
          <p class="text-sm text-gray-500 mt-1">Log transaksi inbound & outbound</p>
        </div>

        <!-- Filter Bar -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="flex flex-wrap items-end gap-4 flex-1">

            <!-- Report Type Toggle -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Report Type</label>
              <div class="flex gap-2">
                <button
                  v-for="type in reportTypeOptions"
                  :key="type.value"
                  :class="[
                    'px-4 py-2 rounded-xl font-semibold text-sm transition',
                    reportType === type.value
                      ? 'bg-[#004AC6] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ]"
                  @click="reportType = type.value as 'INBOUND' | 'OUTBOUND'; handleReportTypeChange();"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- Warehouse Filter -->
            <div class="flex flex-col gap-1.5 min-w-[180px]">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Warehouse</label>
              <BaseSelect v-model="selectedWarehouse" :items="warehouseOptions" placeholder="All Warehouse" />
            </div>

            <!-- Asset Filter -->
            <div class="flex flex-col gap-1.5 min-w-[200px]">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Asset</label>
              <BaseSelect v-model="selectedAsset" :items="assetOptions" placeholder="All Assets" />
            </div>

          </div>

          <!-- Export Button -->
          <BaseButton color="brand" @click="exportExcel">
            <div class="flex items-center gap-2 px-1 py-0.5">
              <i class="fas fa-file-excel text-sm"></i>
              <span>Export Excel</span>
            </div>
          </BaseButton>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">

          <!-- Summary -->
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900">
              {{ reportType === 'INBOUND' ? 'Log Inbound' : 'Log Outbound' }}
            </p>
            <span class="text-xs text-gray-400 font-medium">
              {{ filteredReports.length }} record ditemukan
            </span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200">

            <!-- INBOUND TABLE -->
            <table
              v-if="reportType === 'INBOUND'"
              class="w-full text-sm border-collapse min-w-[900px]"
            >
              <thead class="bg-gray-100 text-gray-500 text-xs font-bold tracking-wider uppercase">
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">WO Number</th>
                  <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Category</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Warehouse</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Storage Bin</th>
                  <th class="text-left px-4 py-3 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Supplier</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Label Code</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Scanned At</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Scanned By</th>
                </tr>
              </thead>

              <tbody class="text-xs font-medium text-gray-600">
                <!-- Loading -->
                <tr v-if="loading">
                  <td colspan="10" class="text-center py-10 text-gray-400">
                    <div class="flex items-center justify-center gap-2">
                      <svg class="animate-spin w-4 h-4 text-[#004AC6]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>

                <!-- Empty -->
                <tr v-else-if="filteredReports.length === 0">
                  <td colspan="10" class="text-center py-10 text-gray-400">
                    No report data found
                  </td>
                </tr>

                <!-- Data -->
                <tr
                  v-else
                  v-for="(item, index) in filteredReports"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 font-bold text-[#004AC6] whitespace-nowrap">{{ item.woNumber }}</td>

                  <td class="px-4 py-3 text-center whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#EAF0FF] text-[#004AC6]">
                      {{ item.woCategory }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ item.warehouseName || "-" }}</td>
                  <td class="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{{ item.storageBin || "-" }}</td>
                  <td class="px-4 py-3 font-semibold text-gray-800 max-w-[200px] truncate">{{ item.assetName }}</td>
                  <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{{ item.supplierName || "-" }}</td>
                  <td class="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{{ item.labelCode }}</td>
                  <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{{ formatDate(item.scannedAt) }}</td>
                  <td class="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{{ item.scannedBy || "-" }}</td>
                </tr>
              </tbody>
            </table>

            <!-- OUTBOUND TABLE -->
            <table
              v-else
              class="w-full text-sm border-collapse min-w-[900px]"
            >
              <thead class="bg-gray-100 text-gray-500 text-xs font-bold tracking-wider uppercase">
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">WO Number</th>
                  <th class="text-center px-4 py-3 font-semibold whitespace-nowrap">Category</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Warehouse</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Storage Bin</th>
                  <th class="text-left px-4 py-3 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Supplier</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Label Code</th>
                  <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">Outbound At</th>
                </tr>
              </thead>

              <tbody class="text-xs font-medium text-gray-600">
                <!-- Loading -->
                <tr v-if="loading">
                  <td colspan="9" class="text-center py-10 text-gray-400">
                    <div class="flex items-center justify-center gap-2">
                      <svg class="animate-spin w-4 h-4 text-[#004AC6]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>

                <!-- Empty -->
                <tr v-else-if="filteredReports.length === 0">
                  <td colspan="9" class="text-center py-10 text-gray-400">
                    No report data found
                  </td>
                </tr>

                <!-- Data -->
                <tr
                  v-else
                  v-for="(item, index) in filteredReports"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 font-bold text-[#004AC6] whitespace-nowrap">{{ item.woNumber }}</td>

                  <td class="px-4 py-3 text-center whitespace-nowrap">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FFF3E6] text-[#FF9933]">
                      {{ item.woCategory }}
                    </span>
                  </td>

                  <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ item.warehouseName || "-" }}</td>
                  <td class="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{{ item.storageBin || "-" }}</td>
                  <td class="px-4 py-3 font-semibold text-gray-800 max-w-[200px] truncate">{{ item.assetName }}</td>
                  <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{{ item.supplierName || "-" }}</td>
                  <td class="px-4 py-3 font-mono text-gray-400 whitespace-nowrap">{{ item.labelCode }}</td>
                  <td class="px-4 py-3 text-gray-400 whitespace-nowrap">{{ formatDate(item.outboundAt) }}</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>

        <!-- Info Banner -->
        <div class="bg-[#EFF4FF] border border-[#DCE6FF] rounded-2xl p-4 flex items-center gap-3 text-[#004AC6] text-xs font-semibold shadow-sm">
          <i class="fas fa-info-circle text-base flex-shrink-0"></i>
          <span>Data pada report transaction tidak dapat diubah (edit) ataupun dihapus untuk menjaga integritas riwayat logistik.</span>
        </div>

      </main>
    </div>
  </MainLayout>
</template>