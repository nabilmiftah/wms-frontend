<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { getInboundReports, getOutboundReports } from "../services/report.service";
import { getWarehouses } from "../services/warehouse.service";
import { getAssets } from "../services/asset.service";
import { toast } from "vue-sonner";

const loading = ref(false);
const reportType = ref<"INBOUND" | "OUTBOUND">("INBOUND");
const dateRange = ref("all");
const selectedWarehouse = ref("ALL");
const selectedAsset = ref("ALL");
const reports = ref<any[]>([]);

const dateOptions = [
  {
    label: "All Data",
    value: "all",
  },
];

const reportTypeOptions = [
  { label: "Inbound", value: "INBOUND" },
  { label: "Outbound", value: "OUTBOUND" },
];

const warehouseOptions = ref([
  {
    label: "All Warehouse",
    value: "ALL",
  },
]);

const assetOptions = ref([
  {
    label: "All Assets",
    value: "ALL",
  },
]);

const fetchReports = async () => {
  try {
    loading.value = true;

    const response = reportType.value === "INBOUND"
      ? await getInboundReports()
      : await getOutboundReports();

    console.log("REPORT RESPONSE:", response);
    console.log("REPORT DATA:", response.data);

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
      {
        label: "All Warehouse",
        value: "ALL",
      },
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
      {
        label: "All Assets",
        value: "ALL",
      },
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
  console.log("FILTER RUN", reports.value);

  return reports.value.filter((item) => {
    const warehouseMatch =
      selectedWarehouse.value === "ALL" ||
      item.warehouseName === selectedWarehouse.value;

    const assetMatch =
      selectedAsset.value === "ALL" ||
      item.assetName === selectedAsset.value;

    return warehouseMatch && assetMatch;
  });
});

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
  XLSX.writeFile(wb, `Report_Inbound_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  XLSX.writeFile(wb, `Report_Outbound_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Report Transaction</h1>
          <p class="text-sm text-gray-500 mt-1">
            Log transaksi inbound & outbound
          </p>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div class="flex flex-wrap items-center gap-4 flex-1">
            <div class="flex flex-col gap-1.5 w-65">
              <label
                class="text-xs font-bold text-gray-400 tracking-wider uppercase"
                >Report Type</label
              >
              <div class="flex gap-2">
                <button
                  v-for="type in reportTypeOptions"
                  :key="type.value"
                  @click="reportType = type.value; handleReportTypeChange()"
                  :class="[
                    'px-4 py-2 rounded-lg font-semibold text-sm transition',
                    reportType === type.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-1.5 w-65">
              <label
                class="text-xs font-bold text-gray-400 tracking-wider uppercase"
                >Date Range</label
              >
              <BaseSelect
                v-model="dateRange"
                :items="dateOptions"
                placeholder="Select Date Range"
              />
            </div>

            <div class="flex flex-col gap-1.5 w-65">
              <label
                class="text-xs font-bold text-gray-400 tracking-wider uppercase"
                >Warehouse</label
              >
              <BaseSelect
                v-model="selectedWarehouse"
                :items="warehouseOptions"
                placeholder="All Warehouse"
              />
            </div>

            <div class="flex flex-col gap-1.5 w-65">
              <label
                class="text-xs font-bold text-gray-400 tracking-wider uppercase"
                >Asset</label
              >
              <BaseSelect
                v-model="selectedAsset"
                :items="assetOptions"
                placeholder="All Assets"
              />
            </div>
          </div>

          <div class="self-end md:self-end pt-5">
            <BaseButton color="brand" @click="exportExcel">
              <div class="flex items-center gap-2 px-1 py-0.5">
                <i class="fas fa-file-excel text-sm"></i>
                <span>Export Excel</span>
              </div>
            </BaseButton>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5"
        >
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <!-- INBOUND TABLE -->
            <table v-if="reportType === 'INBOUND'" class="w-full text-sm border-collapse whitespace-nowrap">
              <thead
                class="bg-gray-100 text-gray-400 text-xs font-bold tracking-wider uppercase"
              >
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-4 font-semibold">WO Number</th>
                  <th class="text-center px-4 py-4 font-semibold">
                    WO Category
                  </th>
                  <th class="text-left px-4 py-4 font-semibold">Warehouse</th>
                  <th class="text-left px-4 py-4 font-semibold">Storage Bin</th>
                  <th class="text-left px-4 py-4 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-4 font-semibold">Supplier</th>
                  <th class="text-left px-4 py-4 font-semibold">Label Code</th>
                  <th class="text-left px-4 py-4 font-semibold">Scanned At</th>
                  <th class="text-left px-4 py-4 font-semibold">Scanned By</th>
                  <th class="text-right px-5 py-4 font-semibold">
                    Updated Stock
                  </th>
                </tr>
              </thead>

              <tbody class="text-xs font-medium text-gray-600">
                <tr v-if="filteredReports.length === 0">
                  <td colspan="10" class="text-center py-10 text-gray-400">
                    No report data found
                  </td>
                </tr>

                <tr
                  v-for="(item, index) in filteredReports"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50/50 transition"
                >
                  <td class="px-4 py-4 font-bold text-[#004AC6]">
                    {{ item.woNumber }}
                  </td>

                  <td class="px-4 py-4 text-center">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        item.woCategory === 'INBOUND'
                          ? 'bg-[#EAF0FF] text-[#004AC6]'
                          : 'bg-[#FFF3E6] text-[#FF9933]',
                      ]"
                    >
                      {{ item.woCategory }}
                    </span>
                  </td>

                  <td class="px-4 py-4 text-gray-500">
                    {{ item.warehouseName }}
                  </td>

                  <td class="px-4 py-4 font-mono text-gray-400">
                    {{ item.storageBin }}
                  </td>

                  <td
                    class="px-4 py-4 font-semibold text-gray-800 max-w-xs truncate"
                  >
                    {{ item.assetName }}
                  </td>

                  <td class="px-4 py-4 text-gray-400">
                    {{ item.supplierName || "-" }}
                  </td>

                  <td class="px-4 py-4 font-mono text-gray-400">
                    {{ item.labelCode }}
                  </td>

                  <td class="px-4 py-4 text-gray-400">
                    {{ new Date(item.scannedAt).toLocaleString("id-ID") }}
                  </td>

                  <td class="px-4 py-4 text-gray-600 font-semibold">
                    {{ item.scannedBy }}
                  </td>

                  <td class="px-5 py-4 text-right font-bold text-gray-900">
                    {{ item.updatedStock }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- OUTBOUND TABLE -->
            <table v-else class="w-full text-sm border-collapse whitespace-nowrap">
              <thead
                class="bg-gray-100 text-gray-400 text-xs font-bold tracking-wider uppercase"
              >
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-4 font-semibold">WO Number</th>
                  <th class="text-center px-4 py-4 font-semibold">
                    WO Category
                  </th>
                  <th class="text-left px-4 py-4 font-semibold">Warehouse</th>
                  <th class="text-left px-4 py-4 font-semibold">Storage Bin</th>
                  <th class="text-left px-4 py-4 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-4 font-semibold">Supplier</th>
                  <th class="text-left px-4 py-4 font-semibold">Label Code</th>
                  <th class="text-left px-4 py-4 font-semibold">Inbound At</th>
                  <th class="text-left px-4 py-4 font-semibold">Outbound At</th>
                  <th class="text-left px-4 py-4 font-semibold">Outbound By</th>
                </tr>
              </thead>

              <tbody class="text-xs font-medium text-gray-600">
                <tr v-if="filteredReports.length === 0">
                  <td colspan="10" class="text-center py-10 text-gray-400">
                    No report data found
                  </td>
                </tr>

                <tr
                  v-for="(item, index) in filteredReports"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50/50 transition"
                >
                  <td class="px-4 py-4 font-bold text-[#004AC6]">
                    {{ item.woNumber }}
                  </td>

                  <td class="px-4 py-4 text-center">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        item.woCategory === 'INBOUND'
                          ? 'bg-[#EAF0FF] text-[#004AC6]'
                          : 'bg-[#FFF3E6] text-[#FF9933]',
                      ]"
                    >
                      {{ item.woCategory }}
                    </span>
                  </td>

                  <td class="px-4 py-4 text-gray-500">
                    {{ item.warehouseName }}
                  </td>

                  <td class="px-4 py-4 font-mono text-gray-400">
                    {{ item.storageBin }}
                  </td>

                  <td
                    class="px-4 py-4 font-semibold text-gray-800 max-w-xs truncate"
                  >
                    {{ item.assetName }}
                  </td>

                  <td class="px-4 py-4 text-gray-400">
                    {{ item.supplierName || "-" }}
                  </td>

                  <td class="px-4 py-4 font-mono text-gray-400">
                    {{ item.labelCode }}
                  </td>

                  <td class="px-4 py-4 text-gray-400">
                    {{ new Date(item.inboundAt).toLocaleString("id-ID") }}
                  </td>

                  <td class="px-4 py-4 text-gray-400">
                    {{ new Date(item.outboundAt).toLocaleString("id-ID") }}
                  </td>

                  <td class="px-4 py-4 text-gray-600 font-semibold">
                    {{ item.outboundBy || "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          class="bg-[#EFF4FF] border border-[#DCE6FF] rounded-2xl p-4 flex items-center gap-3 text-[#004AC6] text-xs font-semibold shadow-sm"
        >
          <i class="fas fa-info-circle text-base flex-shrink-0"></i>
          <span
            >Data pada report transaction tidak dapat diubah (edit) ataupun
            dihapus untuk menjaga integritas riwayat logistik.</span
          >
        </div>
      </main>
    </div>
  </MainLayout>
</template>
