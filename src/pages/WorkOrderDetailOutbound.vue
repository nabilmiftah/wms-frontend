<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft, Camera, Info } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";
import {
  getWorkOrderById,
  getFifoLabels,
  updateWorkOrderStatus,
} from "../services/workorder.service.ts";
import { scanOutbound } from "../services/assetlabel.service.ts";
import type { WorkOrder, FifoLabel, ScanRecord } from "../types/workorder.ts";
import { getOutboundReport } from "../services/report.service";

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const isCameraActive = ref(false);
const labelInput = ref("");

const wo = ref<WorkOrder | null>(null);
const suggestedLabels = ref<FifoLabel[]>([]);
const scanHistory = ref<ScanRecord[]>([]);

const woId = computed(() => route.params.id as string);

const scanned = computed(() => scanHistory.value.length);

const targetQty = computed(() => wo.value?.quantity ?? 0);

const remaining = computed(() => targetQty.value - scanned.value);

const progressPercent = computed(() =>
  targetQty.value > 0 ? Math.round((scanned.value / targetQty.value) * 100) : 0,
);

const isDone = computed(() => scanned.value >= targetQty.value);

const pendingLabels = computed(() =>
  suggestedLabels.value.filter((l) => l && !l.isOutbound),
);

const fetchWorkOrder = async () => {
  try {
    loading.value = true;

    const response = await getWorkOrderById(
      woId.value,
    );

    wo.value = response.data;

    if (response.data.labels) {
      scanHistory.value =
        response.data.labels
          .filter(
            (l: any) =>
              l.outboundAt !== null,
          )
          .map(
            (l: any) => ({
              id: l.id,

              labelCode:
                l.labelCode,

              inboundAt:
                l.inboundAt
                  ? new Date(
                      l.inboundAt,
                    )
                      .toLocaleString(
                        "id-ID",
                      )
                      .replace(
                        /\//g,
                        "-",
                      )
                  : "-",

              scannedAt:
                l.outboundAt
                  ? new Date(
                      l.outboundAt,
                    )
                      .toLocaleString(
                        "id-ID",
                      )
                      .replace(
                        /\//g,
                        "-",
                      )
                  : "-",

              scannedBy:
                "System",
            }),
          );
    } else {
      scanHistory.value = [];
    }
  } catch (error: any) {
    console.error(error);

    toast.error(
      "Failed to fetch work order",
    );
  } finally {
    loading.value = false;
  }
};

const fetchFifoLabels = async () => {
  try {
    const response = await getFifoLabels(woId.value);

    console.log("FIFO LABELS:", response.data);

    suggestedLabels.value = (response.data || [])
      .filter(Boolean)
      .map((l: FifoLabel, index: number) => ({
        ...l,
        priority: index + 1,
      }));
  } catch (error: any) {
    console.error(error);

    toast.error("Failed to fetch FIFO labels");
  }
};
onMounted(async () => {
  await fetchWorkOrder();
  await fetchFifoLabels();
});

const processScan = async (code: string) => {
  if (!code.trim()) return;

  if (scanHistory.value.find((s) => s.labelCode === code)) {
    toast.error("Label sudah pernah di-scan");
    return;
  }

  if (scanned.value >= targetQty.value) {
    toast.error("Jumlah scan sudah mencapai target qty");
    return;
  }

  const nextPriority = pendingLabels.value[0];

  if (!nextPriority) {
    toast.error("Semua label sudah di-scan");
    return;
  }

  if (nextPriority.labelCode !== code) {
    toast.error(
      `⚠️ FIFO: Scan ${nextPriority.labelCode} terlebih dahulu sebelum ${code}`,
    );
    return;
  }

  try {
    await scanOutbound({
      labelCode: code,
      workOrderId: woId.value,
    });

    const idx = suggestedLabels.value.findIndex((l) => l.labelCode === code);

    if (idx !== -1) {
      suggestedLabels.value[idx].isOutbound = true;
    }

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

    scanHistory.value.push({
      id: Date.now().toString(),

      labelCode: code,

      inboundAt: nextPriority.inboundAt
        ? new Date(nextPriority.inboundAt)
            .toLocaleString("id-ID")
            .replace(/\//g, "-")
        : "-",

      scannedAt: formatted,

      scannedBy: "Current User",
    });

    labelInput.value = "";

    toast.success(`Label ${code} berhasil di-scan`);
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Gagal scan label");
  }
};

const handleScan = () => processScan(labelInput.value.trim());

const handleFinish =
  async () => {
    if (
      scanHistory.value.length <
      targetQty.value
    ) {
      toast.error(
        "Scan belum selesai",
      );

      return;
    }

    if (!wo.value) {
      toast.error(
        "Work Order tidak ditemukan",
      );

      return;
    }

    try {
      await updateWorkOrderStatus(
        wo.value.id,
        "DONE",
      );

      toast.success(
        "Work Order Outbound berhasil diselesaikan!",
      );

      router.push(
        "/work-order",
      );
    } catch (
      error: any
    ) {
      console.error(
        error,
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Gagal menyelesaikan Work Order",
      );
    }
  };
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-5 overflow-auto">
        <div class="flex items-center justify-between">
          <button
            class="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-[#004AC6] transition"
            @click="router.push('/work-order')"
          >
            <ArrowLeft class="w-4 h-4" />
            Detail Process Work Order (Outbound)
          </button>
          <div class="flex items-center gap-3">
            <button
              class="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              @click="router.push('/work-order')"
            >
              Cancel
            </button>
            <button
              class="px-5 py-2 bg-[#004AC6] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition tracking-wide"
              @click="isCameraActive = !isCameraActive"
            >
              {{ isCameraActive ? "STOP SCAN" : "START SCAN" }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-10 text-gray-400">
          Loading...
        </div>

        <template v-else-if="wo">
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4"
          >
            <div class="flex items-center gap-3">
              <span class="text-base font-bold text-gray-900">{{
                wo.woNumber
              }}</span>
              <span
                class="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold"
                >Outbound</span
              >
            </div>

            <div class="flex items-center gap-8">
              <div>
                <p
                  class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  TARGET QTY
                </p>
                <p class="text-4xl font-bold text-gray-900 mt-1">
                  {{ targetQty }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  SCANNED
                </p>
                <p class="text-4xl font-bold text-[#004AC6] mt-1">
                  {{ scanned }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  SISA QTY
                </p>
                <p class="text-4xl font-bold text-red-600 mt-1">
                  {{ remaining }}
                </p>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-500 font-medium"
                  >Progress Scan</span
                >
                <span class="text-sm font-bold text-[#004AC6]">
                  {{ scanned }} / {{ targetQty }} labels scanned ({{
                    progressPercent
                  }}%)
                </span>
              </div>
              <div
                class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-orange-500 rounded-full transition-all duration-300"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-[340px_1fr] gap-5 items-start">
            <div
              class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div class="px-5 py-4 border-b border-gray-100">
                <p class="text-base font-semibold text-gray-900">
                  Suggested Labels (FIFO)
                </p>
                <p class="text-xs text-gray-400 mt-0.5">
                  Scan sesuai urutan dari atas ke bawah
                </p>
              </div>

              <div class="p-3 space-y-2 max-h-72 overflow-y-auto">
                <div
                  v-for="label in pendingLabels"
                  :key="label.id"
                  class="flex items-center gap-3 px-3 py-2.5 border rounded-xl transition"
                  :class="
                    label.id === pendingLabels[0]?.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200'
                  "
                >
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    :class="
                      label.id === pendingLabels[0]?.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    "
                  >
                    {{ label.priority }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 font-mono">
                      {{ label.labelCode }}
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      Inbound:
                      {{
                        new Date(label.inboundAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      }}
                    </p>
                  </div>
                  <span
                    v-if="label.id === pendingLabels[0]?.id"
                    class="px-2 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
                  >
                    PRIORITAS
                  </span>
                </div>

                <div
                  v-if="pendingLabels.length === 0"
                  class="text-center py-8 text-green-600 font-medium text-sm"
                >
                  Semua label sudah di-scan ✓
                </div>
              </div>

              <div
                class="mx-3 mb-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5"
              >
                <div class="flex items-center gap-1.5 mb-1">
                  <Info class="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span class="text-xs font-semibold text-blue-700"
                    >Aturan Scan Outbound:</span
                  >
                </div>
                <ul class="list-disc list-inside space-y-0.5 pl-0.5">
                  <li class="text-xs text-blue-600">
                    Scan harus sesuai urutan FIFO
                  </li>
                  <li class="text-xs text-blue-600">
                    Tidak dapat duplicate scan
                  </li>
                  <li class="text-xs text-blue-600">
                    Tidak dapat scan melebihi qty WO
                  </li>
                </ul>
              </div>
            </div>

            <div
              class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4"
            >
              <div
                class="relative rounded-xl h-48 flex flex-col items-center justify-center overflow-hidden transition"
                :class="
                  isCameraActive
                    ? 'bg-gray-900 border-2 border-[#004AC6]'
                    : 'bg-gray-900 border-2 border-dashed border-gray-600'
                "
              >
                <Camera
                  class="w-10 h-10 text-gray-500 mb-2"
                  :class="{ 'animate-pulse': isCameraActive }"
                />
                <p class="text-sm text-gray-500 text-center px-4">
                  {{
                    isCameraActive
                      ? "Arahkan kamera ke label"
                      : "Tekan START SCAN untuk mengaktifkan kamera"
                  }}
                </p>
                <template v-if="isCameraActive">
                  <span
                    class="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#004AC6] rounded-tl"
                  />
                  <span
                    class="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#004AC6] rounded-tr"
                  />
                  <span
                    class="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#004AC6] rounded-bl"
                  />
                  <span
                    class="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#004AC6] rounded-br"
                  />
                </template>
              </div>

              <div>
                <p class="text-xs font-medium text-gray-500 mb-2">
                  Atau input manual:
                </p>
                <div class="flex gap-2">
                  <input
                    v-model="labelInput"
                    type="text"
                    placeholder="Masukkan label code..."
                    :disabled="isDone"
                    class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-[#004AC6] placeholder:text-gray-300 disabled:bg-gray-50"
                    @keydown.enter="handleScan"
                  />
                  <button
                    :disabled="isDone"
                    class="px-5 py-2.5 bg-[#004AC6] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="handleScan"
                  >
                    Scan
                  </button>
                </div>
              </div>

              <div>
                <p class="text-sm font-semibold text-gray-900 mb-3">
                  Scan History
                </p>
                <div class="overflow-hidden rounded-xl border border-gray-200">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-100 text-gray-700">
                      <tr>
                        <th class="text-left px-4 py-2.5 font-semibold text-xs">
                          LABEL CODE
                        </th>
                        <th class="text-left px-4 py-2.5 font-semibold text-xs">
                          INBOUND SCAN
                        </th>
                        <th class="text-left px-4 py-2.5 font-semibold text-xs">
                          SCANNED AT
                        </th>
                        <th class="text-left px-4 py-2.5 font-semibold text-xs">
                          SCANNED BY
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="rec in scanHistory"
                        :key="rec.id"
                        class="border-t border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td
                          class="px-4 py-3 font-mono font-semibold text-gray-900 text-xs"
                        >
                          {{ rec.labelCode }}
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs">
                          {{ rec.inboundAt || "-" }}
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs">
                          {{ rec.scannedAt }}
                        </td>
                        <td class="px-4 py-3 text-gray-600 text-xs">
                          {{ rec.scannedBy }}
                        </td>
                      </tr>
                      <tr v-if="scanHistory.length === 0">
                        <td
                          colspan="4"
                          class="text-center py-6 text-gray-400 text-sm"
                        >
                          Belum ada scan
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <BaseButton color="brand" :disabled="!isDone" @click="handleFinish">
              Selesaikan Work Order
            </BaseButton>
          </div>
        </template>
      </main>
    </div>
  </MainLayout>
</template>
