<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Camera, Info } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";

interface SuggestedLabel {
  id: string;
  labelCode: string;
  inboundAt: string;
  priority: number;
  scanned: boolean;
}

interface ScanRecord {
  id: string;
  labelCode: string;
  inboundScan: string;
  scannedAt: string;
  scannedBy: string;
}

const router = useRouter();

const isCameraActive = ref(false);
const labelInput = ref("");

const wo = ref({
  woNumber: "WO_OUT_01",
  category: "OUTBOUND",
  warehouse: "Gudang Jogja",
  storageBin: "WH_01_001",
  assetName: "Nike Journey Run Road Running Shoes - Black",
  targetQty: 5,
});

onMounted(() => {
  const saved = localStorage.getItem("currentWO");

  if (saved) {
    const data = JSON.parse(saved);

    wo.value.woNumber = data.woNumber || wo.value.woNumber;
    wo.value.warehouse = data.warehouse || wo.value.warehouse;
    wo.value.storageBin = data.storageBin || wo.value.storageBin;
    wo.value.assetName = data.assetName || wo.value.assetName;
    wo.value.targetQty = data.targetQty || wo.value.targetQty;
  }
});

const suggestedLabels = ref<SuggestedLabel[]>([
  { id: "1", labelCode: "AST_01_000001", inboundAt: "13-04-2026 07:00:00", priority: 1, scanned: false },
  { id: "2", labelCode: "AST_01_000002", inboundAt: "13-04-2026 07:05:20", priority: 2, scanned: false },
  { id: "3", labelCode: "AST_01_000003", inboundAt: "13-04-2026 07:10:45", priority: 3, scanned: false },
  { id: "4", labelCode: "AST_01_000004", inboundAt: "13-04-2026 07:20:30", priority: 4, scanned: false },
  { id: "5", labelCode: "AST_01_000005", inboundAt: "13-04-2026 07:30:00", priority: 5, scanned: false },
]);

const scanHistory = ref<ScanRecord[]>([]);

const scanned = computed(() => scanHistory.value.length);

const remaining = computed(() => wo.value.targetQty - scanned.value);

const progressPercent = computed(() =>
  Math.round((scanned.value / wo.value.targetQty) * 100)
);

const isDone = computed(() => scanned.value >= wo.value.targetQty);

const pendingLabels = computed(() =>
  suggestedLabels.value.filter((l) => !l.scanned)
);

const processScan = (code: string) => {
  if (!code.trim()) return;

  if (scanHistory.value.find((s) => s.labelCode === code)) {
    toast.error("Label sudah pernah di-scan");
    return;
  }

  if (scanned.value >= wo.value.targetQty) {
    toast.error("Jumlah scan sudah mencapai target qty");
    return;
  }

  const nextPriority = pendingLabels.value[0];

  if (!nextPriority) {
    toast.error("Semua label sudah di-scan");
    return;
  }

  if (nextPriority.labelCode !== code) {
    toast.error(`⚠️ FIFO: Scan ${nextPriority.labelCode} terlebih dahulu sebelum ${code}`);
    return;
  }

  const suggested = suggestedLabels.value.find((l) => l.labelCode === code);

  if (suggested) suggested.scanned = true;

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
    inboundScan: suggested?.inboundAt || "-",
    scannedAt: formatted,
    scannedBy: "Current User",
  });

  labelInput.value = "";

  toast.success(`Label ${code} berhasil di-scan`);
};

const handleScan = () => processScan(labelInput.value.trim());

const handleFinish = () => {
  if (!isDone.value) {
    toast.error("Scan belum selesai");
    return;
  }

  // TODO: call API selesaikan WO
  toast.success("Work Order Outbound berhasil diselesaikan!");

  router.push("/work-order");
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

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-base font-bold text-gray-900">{{ wo.woNumber }}</span>
            <span class="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Outbound</span>
          </div>

          <div class="flex items-center gap-8">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">TARGET QTY</p>
              <p class="text-4xl font-bold text-gray-900 mt-1">{{ wo.targetQty }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">SCANNED</p>
              <p class="text-4xl font-bold text-[#004AC6] mt-1">{{ scanned }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">SISA QTY</p>
              <p class="text-4xl font-bold text-red-600 mt-1">{{ remaining }}</p>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500 font-medium">Progress Scan</span>
              <span class="text-sm font-bold text-[#004AC6]">
                {{ scanned }} / {{ wo.targetQty }} labels scanned ({{ progressPercent }}%)
              </span>
            </div>
            <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-orange-500 rounded-full transition-all duration-300"
                :style="{ width: progressPercent + '%' }"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-[340px_1fr] gap-5 items-start">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <p class="text-base font-semibold text-gray-900">Suggested Labels (FIFO)</p>
              <p class="text-xs text-gray-400 mt-0.5">Scan sesuai urutan dari atas ke bawah</p>
            </div>

            <div class="p-3 space-y-2 max-h-72 overflow-y-auto">
              <div
                v-for="label in pendingLabels"
                :key="label.id"
                class="flex items-center gap-3 px-3 py-2.5 border rounded-xl transition"
                :class="label.id === pendingLabels[0]?.id
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200'"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :class="label.id === pendingLabels[0]?.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500'"
                >
                  {{ label.priority }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-900 font-mono">{{ label.labelCode }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">Inbound: {{ label.inboundAt }}</p>
                </div>
                <span
                  v-if="label.id === pendingLabels[0]?.id"
                  class="px-2 py-0.5 bg-orange-500 text-white rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
                >
                  PRIORITAS
                </span>
              </div>

              <div v-if="pendingLabels.length === 0" class="text-center py-8 text-green-600 font-medium text-sm">
                Semua label sudah di-scan ✓
              </div>
            </div>

            <div class="mx-3 mb-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
              <div class="flex items-center gap-1.5 mb-1">
                <Info class="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span class="text-xs font-semibold text-blue-700">Aturan Scan Outbound:</span>
              </div>
              <ul class="list-disc list-inside space-y-0.5 pl-0.5">
                <li class="text-xs text-blue-600">Scan harus sesuai urutan FIFO</li>
                <li class="text-xs text-blue-600">Tidak dapat duplicate scan</li>
                <li class="text-xs text-blue-600">Tidak dapat scan melebihi qty WO</li>
              </ul>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
            <div
              class="relative rounded-xl h-48 flex flex-col items-center justify-center overflow-hidden transition"
              :class="isCameraActive
                ? 'bg-gray-900 border-2 border-[#004AC6]'
                : 'bg-gray-900 border-2 border-dashed border-gray-600'"
            >
              <Camera
                class="w-10 h-10 text-gray-500 mb-2"
                :class="{ 'animate-pulse': isCameraActive }"
              />
              <p class="text-sm text-gray-500 text-center px-4">
                {{ isCameraActive ? "Arahkan kamera ke label" : "Tekan START SCAN untuk mengaktifkan kamera" }}
              </p>
              <template v-if="isCameraActive">
                <span class="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#004AC6] rounded-tl" />
                <span class="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#004AC6] rounded-tr" />
                <span class="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#004AC6] rounded-bl" />
                <span class="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#004AC6] rounded-br" />
              </template>
            </div>

            <div>
              <p class="text-xs font-medium text-gray-500 mb-2">Atau input manual:</p>
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
              <p class="text-sm font-semibold text-gray-900 mb-3">Scan History</p>
              <div class="overflow-hidden rounded-xl border border-gray-200">
                <table class="w-full text-sm">
                  <thead class="bg-gray-100 text-gray-700">
                    <tr>
                      <th class="text-left px-4 py-2.5 font-semibold text-xs">LABEL CODE</th>
                      <th class="text-left px-4 py-2.5 font-semibold text-xs">INBOUND SCAN</th>
                      <th class="text-left px-4 py-2.5 font-semibold text-xs">SCANNED AT</th>
                      <th class="text-left px-4 py-2.5 font-semibold text-xs">SCANNED BY</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="rec in scanHistory"
                      :key="rec.id"
                      class="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td class="px-4 py-3 font-mono font-semibold text-gray-900 text-xs">{{ rec.labelCode }}</td>
                      <td class="px-4 py-3 text-gray-500 text-xs">{{ rec.inboundScan }}</td>
                      <td class="px-4 py-3 text-gray-500 text-xs">{{ rec.scannedAt }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs">{{ rec.scannedBy }}</td>
                    </tr>
                    <tr v-if="scanHistory.length === 0">
                      <td colspan="4" class="text-center py-6 text-gray-400 text-sm">Belum ada scan</td>
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

      </main>
    </div>
  </MainLayout>
</template>