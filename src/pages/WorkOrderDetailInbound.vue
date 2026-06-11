<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, Scan, Printer, Trash2, Info } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";

interface ScanRecord {
  id: string;
  labelCode: string;
  scannedAt: string;
  scannedBy: string;
}

const router = useRouter();

const loading = ref(false);

const labelInput = ref("");

const wo = ref({
  woNumber: "WO_IN_01",
  category: "INBOUND",
  warehouse: "Gudang Jogja",
  storageBin: "WH_01_001",
  assetName: "Nike Journey Run Road Running Shoes - Black",
  targetQty: 10,
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

const scanHistory = ref<ScanRecord[]>([]);

const scanned = computed(() => scanHistory.value.length);

const remaining = computed(() => wo.value.targetQty - scanned.value);

const progressPercent = computed(() =>
  Math.round((scanned.value / wo.value.targetQty) * 100)
);

const isDone = computed(() => scanned.value >= wo.value.targetQty);

const handleScan = () => {
  const code = labelInput.value.trim();

  if (!code) return;

  if (scanHistory.value.find((s) => s.labelCode === code)) {
    toast.error("Label sudah pernah di-scan sebelumnya");
    return;
  }

  if (scanned.value >= wo.value.targetQty) {
    toast.error("Jumlah scan sudah mencapai target qty");
    return;
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
    scannedAt: formatted,
    scannedBy: "Current User",
  });

  labelInput.value = "";

  toast.success(`Label ${code} berhasil di-scan`);
};

const handleDelete = (id: string) => {
  scanHistory.value = scanHistory.value.filter((s) => s.id !== id);

  toast.success("Label berhasil dihapus");
};

const handlePrintLabel = () => {
  if (!scanHistory.value.length) {
    toast.error("Belum ada label yang di-scan untuk di-print");
    return;
  }

  const labelCards = scanHistory.value
    .map(
      (record) => `
    <div class="label-card">
      <div class="label-top">
        <div class="label-info">
          <div class="asset-number">AST_01</div>
          <div class="asset-name">${wo.value.assetName}</div>
          <div class="price">Rp. 0</div>
        </div>
        <div class="qr-section">
          <div class="label-number-text">${record.labelCode}</div>
          <div class="qr-placeholder">QR</div>
        </div>
      </div>
      <div class="label-bottom">
        <span class="brand">WMS Solution</span>
        <span class="supplier">-</span>
      </div>
    </div>
  `
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Print Label</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .page { width: 210mm; min-height: 297mm; padding: 2.7cm 2cm 3cm 2cm; background: white; }
    .label-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1cm; }
    .label-card { border: 1.5px solid #000; border-radius: 4px; padding: 10px 12px 8px 12px; display: flex; flex-direction: column; justify-content: space-between; min-height: 95px; page-break-inside: avoid; }
    .label-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .label-info { flex: 1; min-width: 0; }
    .asset-number { font-size: 8pt; color: #333; margin-bottom: 2px; }
    .asset-name { font-size: 11pt; font-weight: bold; color: #000; line-height: 1.3; margin-bottom: 6px; word-break: break-word; }
    .price { font-size: 8pt; color: #333; }
    .qr-section { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
    .label-number-text { font-size: 6pt; color: #333; margin-bottom: 2px; font-family: monospace; text-align: right; }
    .qr-placeholder { width: 80px; height: 80px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10pt; font-weight: bold; color: #999; }
    .label-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding-top: 5px; border-top: 0.5px solid #ccc; }
    .brand { font-size: 7pt; color: #444; }
    .supplier { font-size: 7pt; color: #444; text-align: right; }
    @media print { body { margin: 0; } .page { width: 210mm; padding: 2.7cm 2cm 3cm 2cm; } .label-card { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="page"><div class="label-grid">${labelCards}</div></div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    toast.error("Pop-up diblokir browser. Izinkan pop-up untuk Print Label.");
    return;
  }

  printWindow.document.write(html);

  printWindow.document.close();
};

const handleFinish = () => {
  if (!isDone.value) {
    toast.error("Scan belum selesai, qty belum terpenuhi");
    return;
  }

  // TODO: call API selesaikan WO
  toast.success("Work Order berhasil diselesaikan!");

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
            Detail Process Work Order (Inbound)
          </button>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-sm font-semibold text-gray-700">
              {{ wo.woNumber }}
            </span>
            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide">
              INBOUND
            </span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div class="flex items-center gap-0">
            <div class="pr-6">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">TARGET QTY</p>
              <p class="text-4xl font-bold text-gray-900 mt-1">{{ wo.targetQty }}</p>
            </div>
            <div class="w-px h-10 bg-gray-200 mx-2" />
            <div class="px-6">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">SCANNED</p>
              <p class="text-4xl font-bold text-[#004AC6] mt-1">{{ scanned }}</p>
            </div>
            <div class="w-px h-10 bg-gray-200 mx-2" />
            <div class="px-6">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">SISA QTY</p>
              <p class="text-4xl font-bold text-red-600 mt-1">{{ remaining }}</p>
            </div>
            <div class="w-px h-10 bg-gray-200 mx-2" />
            <div class="flex-1 px-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-500">{{ scanned }} / {{ wo.targetQty }} label ter-scan</span>
                <span class="text-sm font-bold text-[#004AC6]">{{ progressPercent }}%</span>
              </div>
              <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[#004AC6] rounded-full transition-all duration-300"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200 flex items-center gap-8">
          <div>
            <p class="text-xs text-gray-400 font-medium">Warehouse</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ wo.warehouse }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium">Storage Bin</p>
            <p class="text-sm font-semibold text-gray-900 font-mono mt-0.5">{{ wo.storageBin }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 font-medium">Asset</p>
            <p class="text-sm font-semibold text-gray-900 mt-0.5">{{ wo.assetName }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <p class="text-base font-semibold text-gray-900">Input Scan Label</p>

          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <Scan class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="labelInput"
                type="text"
                placeholder="Masukkan atau scan label code..."
                :disabled="isDone"
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-[#004AC6] placeholder:text-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                @keydown.enter="handleScan"
              />
            </div>
            <button
              :disabled="isDone"
              class="px-5 py-2.5 bg-[#004AC6] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleScan"
            >
              Scan
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition"
              @click="handlePrintLabel"
            >
              <Printer class="w-4 h-4" />
              Print Label
            </button>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div class="flex items-center gap-2 mb-1.5">
              <Info class="w-4 h-4 text-blue-500 shrink-0" />
              <span class="text-sm font-semibold text-blue-700">Aturan Scan Inbound:</span>
            </div>
            <ul class="list-disc list-inside space-y-0.5 pl-1">
              <li class="text-sm text-blue-600">Tidak dapat duplicate scan</li>
              <li class="text-sm text-blue-600">Tidak dapat scan melebihi jumlah qty WO</li>
              <li class="text-sm text-blue-600">Label harus sesuai asset dan storage bin</li>
            </ul>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <p class="text-base font-semibold text-gray-900">Scan History</p>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">LABEL CODE</th>
                  <th class="text-left px-4 py-3 font-semibold">SCANNED AT</th>
                  <th class="text-left px-4 py-3 font-semibold">SCANNED BY</th>
                  <th class="text-center px-4 py-3 font-semibold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in scanHistory"
                  :key="record.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 font-mono font-semibold text-gray-900">{{ record.labelCode }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ record.scannedAt }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ record.scannedBy }}</td>
                  <td class="px-4 py-3 text-center">
                    <button
                      class="text-red-500 text-sm font-semibold hover:bg-red-50 px-2 py-1 rounded-lg transition"
                      @click="handleDelete(record.id)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>

                <tr v-if="scanHistory.length === 0">
                  <td colspan="4" class="text-center py-8 text-gray-400">
                    Belum ada label yang di-scan
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end">
            <BaseButton color="brand" :disabled="!isDone" @click="handleFinish">
              Selesaikan Work Order
            </BaseButton>
          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>