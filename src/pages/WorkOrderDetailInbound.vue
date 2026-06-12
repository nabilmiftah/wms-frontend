<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Trash2 } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";
import {
  getWorkOrderById,
  generateLabels,
  updateWorkOrderStatus,
} from "../services/workorder.service.ts";
import { scanInbound, printLabelPdf } from "../services/assetlabel.service.ts";
import type { WorkOrder, ScanRecord } from "../types/workorder.ts";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const scanning = ref(false);
const labelInput = ref("");
const wo = ref<WorkOrder | null>(null);
const scanHistory = ref<ScanRecord[]>([]);
const generatedLabels = ref<string[]>([]);
const sessionScans = ref<Set<string>>(new Set());
const prevLabelCount = ref(0);
const newlyGeneratedLabels = ref<Set<string>>(new Set());

const woId = computed(() => route.params.id as string);
const scanned = computed(() => scanHistory.value.length);
const targetQty = computed(() => wo.value?.quantity ?? 0);
const remaining = computed(() => targetQty.value - scanned.value);
const progressPercent = computed(() =>
  targetQty.value > 0 ? Math.round((scanned.value / targetQty.value) * 100) : 0,
);
const isDone = computed(() => scanned.value >= targetQty.value);

const fetchWorkOrder = async () => {
  try {
    loading.value = true;
    const response = await getWorkOrderById(woId.value);
    wo.value = response.data;

    if (response.data.labels && Array.isArray(response.data.labels)) {
      const allLabels = response.data.labels;
      const totalLabelCount = allLabels.length;

      // Labels yang sudah di-scan sebelumnya (pastai ada inboundAt)
      const scannedLabelsCodes = new Set(
        scanHistory.value.map((s) => s.labelCode),
      );

      // Labels yang newly added = total sekarang > previous count
      const hasNewLabels = totalLabelCount > prevLabelCount.value;

      // Separate scanned vs generated based on inboundAt
      const scanned = allLabels.filter((l: any) => l.inboundAt !== null);
      const unscanned = allLabels.filter((l: any) => l.inboundAt === null);

      // Update scan history dari backend (hanya yang benar-benar di-scan)
      // Exclude newly generated labels from scan history even if backend set inboundAt
      scanHistory.value = scanned
        .filter((l: any) => !newlyGeneratedLabels.value.has(l.labelCode))
        .map((l: any) => ({
          id: l.id,
          labelCode: l.labelCode,
          scannedAt: new Date(l.inboundAt)
            .toLocaleString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
            .replace(/\//g, "-"),
          scannedBy: l.scannedBy?.userName || "System",
        }));

      // Generated labels = unscanned + newly generated labels (force to green box)
      if (hasNewLabels) {
        // Ada label baru, add unscanned labels ke generated
        const newGeneratedCodes = unscanned
          .map((l: any) => l.labelCode)
          .filter((code: string) => !scannedLabelsCodes.has(code));

        generatedLabels.value = [
          ...generatedLabels.value,
          ...newGeneratedCodes,
        ];
      } else {
        // Tidak ada label baru, update generated dari unscanned
        generatedLabels.value = unscanned.map((l: any) => l.labelCode);
      }

      // Force newly generated labels to green box
      newlyGeneratedLabels.value.forEach((code) => {
        if (!generatedLabels.value.includes(code)) {
          generatedLabels.value.push(code);
        }
      });

      generatedLabels.value = [...new Set(generatedLabels.value)].sort();
      prevLabelCount.value = totalLabelCount;
      sessionScans.value.clear();
    }
  } catch (error: any) {
    console.error("fetchWorkOrder error:", error);
    toast.error(error?.response?.data?.message || "Gagal fetch work order");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWorkOrder();
});

const handleScan = async () => {
  const code = labelInput.value.trim().toUpperCase();

  if (!code) {
    toast.error("Masukkan label code");
    return;
  }

  if (sessionScans.value.has(code)) {
    toast.error("Label sudah di-scan dalam sesi ini");
    return;
  }

  if (scanned.value >= targetQty.value) {
    toast.error("Jumlah scan sudah mencapai target qty");
    return;
  }

  if (!generatedLabels.value.includes(code)) {
    toast.error("Label tidak ditemukan atau belum di-generate");
    return;
  }

  try {
    scanning.value = true;

    // Payload sesuai backend documentation: {labelCode, workOrderId}
    const response = await scanInbound({
      labelCode: code,
      workOrderId: woId.value,
    });

    const now = new Date();
    const formatted = now
      .toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/\//g, "-");

    // Tambah ke scan history
    scanHistory.value.push({
      id: response.data?.id || Date.now().toString(),
      labelCode: code,
      scannedAt: formatted,
      scannedBy: response.data?.scannedBy?.userName || "Current User",
    });

    // Remove dari generated labels
    generatedLabels.value = generatedLabels.value.filter((l) => l !== code);
    newlyGeneratedLabels.value.delete(code);
    sessionScans.value.add(code);
    labelInput.value = "";

    toast.success(`Label ${code} berhasil di-scan`);
  } catch (error: any) {
    console.error("Scan error:", error);
    const message = error?.response?.data?.message || "Gagal scan label";
    toast.error(message);
  } finally {
    scanning.value = false;
  }
};

const handleGenerateLabels = async () => {
  try {
    loading.value = true;
    await generateLabels(woId.value);
    toast.success("Labels berhasil di-generate");

    // Fetch untuk get actual label codes dari backend
    await fetchWorkOrder();

    // Track newly generated labels to force them to green box
    const response = await getWorkOrderById(woId.value);
    if (response.data.labels && Array.isArray(response.data.labels)) {
      const allLabels = response.data.labels;
      const newLabels = allLabels.filter(
        (l: any) => !newlyGeneratedLabels.value.has(l.labelCode),
      );
      newLabels.forEach((l: any) =>
        newlyGeneratedLabels.value.add(l.labelCode),
      );
    }
  } catch (error: any) {
    console.error("Generate error:", error);
    toast.error(error?.response?.data?.message || "Gagal generate labels");
  } finally {
    loading.value = false;
  }
};

const handlePrintLabel = () => {
  if (scanHistory.value.length === 0) {
    toast.error("Tidak ada label yang sudah di-scan untuk di-print");
    return;
  }
  printLabelPdf(woId.value);
};

const handleDeleteScan = (record: ScanRecord) => {
  try {
    const index = scanHistory.value.findIndex((r) => r.id === record.id);
    if (index > -1) {
      const deleted = scanHistory.value.splice(index, 1)[0];
      sessionScans.value.delete(deleted.labelCode);

      // Add back to generated labels so user can rescan
      generatedLabels.value.push(deleted.labelCode);
      generatedLabels.value.sort();

      toast.success("Scan berhasil dihapus");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Gagal menghapus scan");
  }
};

const handleFinish = async () => {
  if (!isDone.value) {
    toast.error(`Scan belum selesai. Butuh ${remaining.value} label lagi`);
    return;
  }

  if (!wo.value) {
    toast.error("Work Order tidak ditemukan");
    return;
  }

  try {
    loading.value = true;
    await updateWorkOrderStatus(wo.value.id, "DONE");
    toast.success("Work Order berhasil diselesaikan!");
    router.push("/work-order");
  } catch (error: any) {
    console.error("Finish error:", error);
    toast.error(
      error?.response?.data?.message || "Gagal menyelesaikan Work Order",
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <MainLayout>
    <div
      class="flex min-h-screen bg-gradient-to-br from-[#f5f7fb] to-[#e8ecf4]"
    >
      <main class="flex-1 p-8 overflow-auto">
        <div class="max-w-6xl mx-auto space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <button
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              @click="router.push('/work-order')"
            >
              <ArrowLeft class="w-5 h-5" />
              <span class="text-sm font-semibold"
                >Detail Process Work Order (Inbound)</span
              >
            </button>
            <div class="flex items-center gap-3">
              <span
                class="px-4 py-2 bg-white rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-gray-200"
              >
                {{ wo?.woNumber || "-" }}
              </span>
              <span
                class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                INBOUND
              </span>
            </div>
          </div>

          <div v-if="loading" class="flex justify-center py-16">
            <div class="flex flex-col items-center gap-3">
              <div
                class="w-8 h-8 border-4 border-[#004AC6] border-t-transparent rounded-full animate-spin"
              ></div>
              <p class="text-gray-400 text-sm">Loading...</p>
            </div>
          </div>

          <template v-else-if="wo">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Target QTY
                </p>
                <p class="text-3xl font-extrabold text-gray-900">
                  {{ targetQty }}
                </p>
              </div>
              <div
                class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Scanned
                </p>
                <p class="text-3xl font-extrabold text-[#004AC6]">
                  {{ scanned }}
                </p>
              </div>
              <div
                class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Sisa QTY
                </p>
                <p class="text-3xl font-extrabold text-orange-500">
                  {{ remaining }}
                </p>
              </div>
              <div
                class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Progress
                </p>
                <div class="mt-2">
                  <div class="flex items-center gap-2 mb-2">
                    <div
                      class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"
                    >
                      <div
                        class="h-full bg-gradient-to-r from-[#004AC6] to-blue-500 transition-all duration-500"
                        :style="{ width: progressPercent + '%' }"
                      />
                    </div>
                    <span class="text-sm font-bold text-[#004AC6]"
                      >{{ progressPercent }}%</span
                    >
                  </div>
                  <p class="text-xs text-gray-400">
                    {{ scanned }} / {{ targetQty }} label ter-scan
                  </p>
                </div>
              </div>
            </div>

            <!-- Info Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Warehouse
                </p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ wo.warehouse?.whName || "-" }}
                </p>
              </div>
              <div
                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Storage Bin
                </p>
                <p class="text-sm font-mono font-semibold text-gray-900">
                  {{ wo.storageBin?.binAddress || "-" }}
                </p>
              </div>
              <div
                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <p
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
                >
                  Asset
                </p>
                <p class="text-sm font-semibold text-gray-900">
                  {{ wo.asset?.assetName || "-" }}
                </p>
              </div>
            </div>

            <!-- Input Section -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                class="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
              >
                <p class="text-sm font-bold text-gray-900">Input Scan Label</p>
              </div>

              <div class="p-6 space-y-4">
                <div class="flex gap-3">
                  <input
                    v-model="labelInput"
                    type="text"
                    placeholder="Masukkan atau scan label code..."
                    :disabled="scanning"
                    class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004AC6] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition"
                    @keydown.enter="handleScan"
                  />
                  <button
                    @click="handleScan"
                    :disabled="scanning || scanned >= targetQty"
                    class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    {{ scanning ? "Scanning..." : "Scan" }}
                  </button>
                  <button
                    @click="handlePrintLabel"
                    :disabled="scanHistory.length === 0"
                    class="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    Print Label
                  </button>
                  <button
                    @click="handleGenerateLabels"
                    :disabled="generatedLabels.length > 0"
                    class="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    Generate Labels
                  </button>
                </div>

                <!-- Generated Labels Display -->
                <div
                  v-if="generatedLabels.length > 0"
                  class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl px-5 py-4"
                >
                  <p class="text-xs font-bold text-green-700 mb-3">
                    📋 Label Tergenerate ({{ generatedLabels.length }}) — Siap
                    untuk di-scan:
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="label in generatedLabels"
                      :key="label"
                      class="inline-flex items-center px-3 py-1.5 bg-white border border-green-200 text-green-700 text-xs font-mono font-semibold rounded-lg shadow-sm"
                    >
                      {{ label }}
                    </span>
                  </div>
                </div>

                <!-- Rules -->
                <div
                  class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-5 py-4"
                >
                  <p class="text-xs font-bold text-blue-700 mb-2">
                    ℹ️ Aturan Scan Inbound:
                  </p>
                  <ul class="text-xs text-blue-600 space-y-1 ml-4 list-disc">
                    <li>Generate label terlebih dahulu</li>
                    <li>Scan label dengan urutan apapun</li>
                    <li>Tidak dapat duplicate scan dalam 1 sesi</li>
                    <li>Tidak dapat scan melebihi jumlah qty WO</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Scan History -->
            <div
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                class="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
              >
                <p class="text-sm font-bold text-gray-900">Scan History</p>
              </div>

              <div class="p-6">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th
                          class="text-left px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider"
                        >
                          Label Code
                        </th>
                        <th
                          class="text-left px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider"
                        >
                          Scanned At
                        </th>
                        <th
                          class="text-left px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider"
                        >
                          Scanned By
                        </th>
                        <th
                          class="text-left px-4 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="record in scanHistory"
                        :key="record.id"
                        class="border-b border-gray-50 hover:bg-gray-50 transition"
                      >
                        <td
                          class="px-4 py-3 font-mono font-semibold text-gray-900"
                        >
                          {{ record.labelCode }}
                        </td>
                        <td class="px-4 py-3 text-gray-600">
                          {{ record.scannedAt }}
                        </td>
                        <td class="px-4 py-3 text-gray-600">
                          {{ record.scannedBy }}
                        </td>
                        <td class="px-4 py-3">
                          <button
                            @click="handleDeleteScan(record)"
                            class="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold text-xs transition-colors"
                          >
                            <Trash2 class="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>

                      <tr v-if="scanHistory.length === 0">
                        <td
                          colspan="4"
                          class="px-4 py-10 text-center text-gray-400"
                        >
                          Belum ada label yang di-scan
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  class="flex justify-end mt-6 pt-6 border-t border-gray-100"
                >
                  <button
                    @click="handleFinish"
                    :disabled="!isDone || loading"
                    class="px-8 py-3 bg-gradient-to-r from-[#004AC6] to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                  >
                    {{ loading ? "Processing..." : "Selesaikan Work Order" }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>
      </main>
    </div>
  </MainLayout>
</template>
