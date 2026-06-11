<script setup lang="ts">
import { ref } from "vue";
import * as XLSX from "xlsx";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";

// State untuk memegang nilai dropdown filter (Slicing Tampilan)
const dateRange = ref("01/04/2026 - 30/04/2026");
const selectedWarehouse = ref("");
const selectedAsset = ref("");

// Options dummy untuk dropdown agar visualnya langsung kelihatan saat diklik
const dateOptions = [{ label: "01/04/2026 - 30/04/2026", value: "01/04/2026 - 30/04/2026" }];
const warehouseOptions = [
  { label: "All Warehouse", value: "" },
  { label: "Gudang Jogja", value: "Gudang Jogja" },
  { label: "Gudang Bandung", value: "Gudang Bandung" },
];
const assetOptions = [
  { label: "All Assets", value: "" },
  { label: "Nike Journey Run Road Running Shoes - Black", value: "Nike" },
  { label: "Adidas Ultraboost 22", value: "Adidas" },
];

// Data dummy agar tabel langsung terisi penuh persis seperti gambar Figma
const mockReports = ref([
  {
    woNumber: "WO_IN_01",
    woCategory: "Inbound",
    warehouse: "Gudang Jogja",
    storageBin: "WH_01_001",
    assetName: "Nike Journey Run Road Running Shoes - Black",
    supplier: "Supplier XYZ",
    labelCode: "AST_01_000001",
    scannedAt: "13-04-2026 07:00:00",
    scannedBy: "Udin Jamet",
    updatedStock: "120 pcs",
  },
  {
    woNumber: "WO_IN_01",
    woCategory: "Inbound",
    warehouse: "Gudang Jogja",
    storageBin: "WH_01_001",
    assetName: "Nike Journey Run Road Running Shoes - Black",
    supplier: "Supplier XYZ",
    labelCode: "AST_01_000002",
    scannedAt: "13-04-2026 07:02:15",
    scannedBy: "Udin Jamet",
    updatedStock: "121 pcs",
  },
  {
    woNumber: "WO_OUT_01",
    woCategory: "Outbound",
    warehouse: "Gudang Jogja",
    storageBin: "WH_01_001",
    assetName: "Nike Journey Run Road Running Shoes - Black",
    supplier: "-",
    labelCode: "AST_01_000001",
    scannedAt: "14-04-2026 09:00:00",
    scannedBy: "Udin Jamet",
    updatedStock: "119 pcs",
  },
  {
    woNumber: "WO_OUT_02",
    woCategory: "Outbound",
    warehouse: "Gudang Bandung",
    storageBin: "WH_02_014",
    assetName: "Adidas Ultraboost 22",
    supplier: "-",
    labelCode: "AST_02_000451",
    scannedAt: "15-04-2026 10:15:30",
    scannedBy: "Budi Santoso",
    updatedStock: "85 pcs",
  },
]);

function exportExcel() {
  const rows = mockReports.value.map((row) => ({
    "WO Number": row.woNumber,
    "WO Category": row.woCategory,
    "Warehouse": row.warehouse,
    "Storage Bin": row.storageBin,
    "Asset Name": row.assetName,
    "Supplier": row.supplier,
    "Label Code": row.labelCode,
    "Scanned At": row.scannedAt,
    "Scanned By": row.scannedBy,
    "Updated Stock": row.updatedStock,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report Transaction");

  XLSX.writeFile(wb, `Report_Transaction_${dateRange.value}.xlsx`);
}
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Report Transaction</h1>
          <p class="text-sm text-gray-500 mt-1">Log transaksi inbound & outbound</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex flex-wrap items-center gap-4 flex-1">
            
            <div class="flex flex-col gap-1.5 w-65">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Date Range</label>
              <BaseSelect
                v-model="dateRange"
                :items="dateOptions"
                placeholder="Select Date Range"
              />
            </div>

            <div class="flex flex-col gap-1.5 w-65">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Warehouse</label>
              <BaseSelect
                v-model="selectedWarehouse"
                :items="warehouseOptions"
                placeholder="All Warehouse"
              />
            </div>

            <div class="flex flex-col gap-1.5 w-65">
              <label class="text-xs font-bold text-gray-400 tracking-wider uppercase">Asset</label>
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

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm border-collapse whitespace-nowrap">
              <thead class="bg-gray-100 text-gray-400 text-xs font-bold tracking-wider uppercase">
                <tr class="border-b border-gray-200">
                  <th class="text-left px-4 py-4 font-semibold">WO Number</th>
                  <th class="text-center px-4 py-4 font-semibold">WO Category</th>
                  <th class="text-left px-4 py-4 font-semibold">Warehouse</th>
                  <th class="text-left px-4 py-4 font-semibold">Storage Bin</th>
                  <th class="text-left px-4 py-4 font-semibold">Asset Name</th>
                  <th class="text-left px-4 py-4 font-semibold">Supplier</th>
                  <th class="text-left px-4 py-4 font-semibold">Label Code</th>
                  <th class="text-left px-4 py-4 font-semibold">Scanned At</th>
                  <th class="text-left px-4 py-4 font-semibold">Scanned By</th>
                  <th class="text-right px-5 py-4 font-semibold">Updated Stock</th>
                </tr>
              </thead>

              <tbody class="text-xs font-medium text-gray-600">
                <tr
                  v-for="(item, index) in mockReports"
                  :key="index"
                  class="border-t border-gray-100 hover:bg-gray-50/50 transition"
                >
                  <td class="px-4 py-4 font-bold text-[#004AC6] hover:underline cursor-pointer">
                    {{ item.woNumber }}
                  </td>

                  <td class="px-4 py-4 text-center">
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        item.woCategory === 'Inbound'
                          ? 'bg-[#EAF0FF] text-[#004AC6]'
                          : 'bg-[#FFF3E6] text-[#FF9933]',
                      ]"
                    >
                      {{ item.woCategory }}
                    </span>
                  </td>

                  <td class="px-4 py-4 text-gray-500">{{ item.warehouse }}</td>
                  <td class="px-4 py-4 font-mono text-gray-400">{{ item.storageBin }}</td>
                  <td class="px-4 py-4 font-semibold text-gray-800 max-w-xs truncate">{{ item.assetName }}</td>
                  <td class="px-4 py-4 text-gray-400">{{ item.supplier }}</td>
                  <td class="px-4 py-4 font-mono text-gray-400">{{ item.labelCode }}</td>
                  <td class="px-4 py-4 text-gray-400">{{ item.scannedAt }}</td>
                  <td class="px-4 py-4 text-gray-600 font-semibold">{{ item.scannedBy }}</td>
                  
                  <td class="px-5 py-4 text-right font-bold text-gray-900">{{ item.updatedStock }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-[#EFF4FF] border border-[#DCE6FF] rounded-2xl p-4 flex items-center gap-3 text-[#004AC6] text-xs font-semibold shadow-sm">
          <i class="fas fa-info-circle text-base flex-shrink-0"></i>
          <span>Data pada report transaction tidak dapat diubah (edit) ataupun dihapus untuk menjaga integritas riwayat logistik.</span>
        </div>

      </main>
    </div>
  </MainLayout>
</template>