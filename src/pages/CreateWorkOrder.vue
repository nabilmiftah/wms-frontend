<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";
import { createWorkOrder } from "../services/workorder.service.ts";
import { getWarehouses } from "../services/warehouse.service";
import { getStorageBins } from "../services/storage-bin.service.ts";
import { getAssets } from "../services/asset.service";
import type { Warehouse } from "../types/warehouse";
import type { StorageBin } from "../types/storage-bin.ts";
import type { Asset } from "../types/asset";

const props = defineProps<{ type: "inbound" | "outbound" }>();

const router = useRouter();

const isInbound = computed(() => props.type === "inbound");

const loading = ref(false);

const warehouseId = ref("");
const storageBinId = ref("");
const assetId = ref("");
const qty = ref<number | null>(null);
const remarks = ref("");

const warehouseError = ref("");
const storageBinError = ref("");
const assetError = ref("");
const qtyError = ref("");

const warehouses = ref<Warehouse[]>([]);
const storageBins = ref<StorageBin[]>([]);
const assets = ref<Asset[]>([]);

const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses();
    warehouses.value = response.data;
  } catch (error: any) {
    console.error(error);
  }
};

const fetchStorageBins = async (whId: string) => {
  try {
    const response = await getStorageBins();
    storageBins.value = response.data.filter((sb: StorageBin) => sb.warehouseId === whId);
  } catch (error: any) {
    console.error(error);
  }
};

const fetchAssets = async (sbId: string) => {
  try {
    const response = await getAssets();
    assets.value = response.data.filter((a: Asset) => a.storageBinId === sbId);
  } catch (error: any) {
    console.error(error);
  }
};

onMounted(() => {
  fetchWarehouses();
});

watch(warehouseId, (val) => {
  storageBinId.value = "";
  assetId.value = "";
  storageBins.value = [];
  assets.value = [];
  if (val) fetchStorageBins(val);
});

watch(storageBinId, (val) => {
  assetId.value = "";
  assets.value = [];
  if (val) fetchAssets(val);
});

const warehouseOptions = computed(() =>
  warehouses.value.map((wh) => ({ label: wh.whName, value: wh.id }))
);

const storageBinOptions = computed(() =>
  storageBins.value.map((sb) => ({ label: sb.binAddress, value: sb.id }))
);

const assetOptions = computed(() =>
  assets.value.map((a) => ({ label: `${a.assetNumber} — ${a.assetName}`, value: a.id }))
);

const saveWorkOrder = async () => {
  warehouseError.value = "";
  storageBinError.value = "";
  assetError.value = "";
  qtyError.value = "";

  if (!warehouseId.value) {
    warehouseError.value = "Warehouse wajib dipilih";
    return;
  }

  if (!storageBinId.value) {
    storageBinError.value = "Storage Bin wajib dipilih";
    return;
  }

  if (!assetId.value) {
    assetError.value = "Asset wajib dipilih";
    return;
  }

  if (!qty.value || qty.value <= 0) {
    qtyError.value = "Qty wajib diisi dan harus lebih dari 0";
    return;
  }

  try {
    loading.value = true;

    const response = await createWorkOrder({
      type: props.type.toUpperCase() as "INBOUND" | "OUTBOUND",
      warehouseId: warehouseId.value,
      storageBinId: storageBinId.value,
      assetId: assetId.value,
      quantity: qty.value,
      remarks: remarks.value || undefined,
    });

    const newWO = response.data;

    toast.success("Work Order berhasil dibuat");

    if (props.type === "inbound") {
      router.push(`/work-order/${newWO.id}/inbound`);
    } else {
      router.push(`/work-order/${newWO.id}/outbound`);
    }
  } catch (error: any) {
    console.error(error);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-gradient-to-br from-[#f5f7fb] to-[#e8ecf4]">
      <main class="flex-1 p-8 overflow-auto">
        <div class="max-w-4xl mx-auto space-y-6">

          <!-- Header -->
          <div class="flex items-center justify-between">
            <button
              class="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-[#004AC6] transition-colors"
              @click="router.push('/work-order')"
            >
              <ArrowLeft class="w-5 h-5" />
              {{ isInbound ? "Buat Work Order Inbound" : "Buat Work Order Outbound" }}
            </button>
            <span
              :class="[
                'px-4 py-2 rounded-full text-xs font-bold tracking-wider shadow-sm',
                isInbound 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              ]"
            >
              {{ isInbound ? "INBOUND" : "OUTBOUND" }}
            </span>
          </div>

          <!-- Form Card -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <p class="text-lg font-bold text-gray-900">Formulir Work Order</p>
              <p class="text-sm text-gray-500 mt-1">
                Silakan isi detail untuk membuat work order {{ isInbound ? "inbound" : "outbound" }} baru.
              </p>
            </div>

            <div class="p-8 space-y-6">
              <!-- Read-only Fields -->
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">WO Category</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                    {{ isInbound ? 'Inbound' : 'Outbound' }}
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">WO Number</label>
                  <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                    Auto Generated
                  </div>
                  <p class="text-xs text-gray-400 italic">Auto-generated by system</p>
                </div>
              </div>

              <!-- Warehouse & Storage Bin -->
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Warehouse Name <span class="text-red-500">*</span>
                  </label>
                  <BaseSelect v-model="warehouseId" :items="warehouseOptions" placeholder="Pilih Warehouse" />
                  <p v-if="warehouseError" class="text-red-500 text-xs mt-1 font-medium">{{ warehouseError }}</p>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Storage Bin Address <span class="text-red-500">*</span>
                  </label>
                  <BaseSelect
                    v-model="storageBinId"
                    :items="storageBinOptions"
                    placeholder="Pilih Storage Bin"
                    :disabled="!warehouseId"
                  />
                  <p v-if="storageBinError" class="text-red-500 text-xs mt-1 font-medium">{{ storageBinError }}</p>
                  <p v-if="!warehouseId" class="text-xs text-gray-400 mt-1">Pilih warehouse terlebih dahulu</p>
                </div>
              </div>

              <!-- Asset -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Asset Name <span class="text-red-500">*</span>
                </label>
                <BaseSelect
                  v-model="assetId"
                  :items="assetOptions"
                  placeholder="Pilih Asset"
                  :disabled="!storageBinId"
                />
                <p v-if="assetError" class="text-red-500 text-xs mt-1 font-medium">{{ assetError }}</p>
                <p v-if="!storageBinId" class="text-xs text-gray-400 mt-1">Pilih storage bin terlebih dahulu</p>
              </div>

              <!-- Qty -->
              <div class="space-y-2 max-w-xs">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Quantity <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="qty"
                  type="number"
                  placeholder="0"
                  min="1"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-[#004AC6] focus:border-transparent placeholder:text-gray-300"
                />
                <p v-if="qtyError" class="text-red-500 text-xs mt-1 font-medium">{{ qtyError }}</p>
              </div>

              <!-- Remarks -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Remarks
                  <span class="text-xs text-gray-400 font-normal ml-1">{{ remarks.length }}/500</span>
                </label>
                <textarea
                  v-model="remarks"
                  maxlength="500"
                  rows="3"
                  placeholder="Catatan tambahan..."
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none resize-vertical font-[inherit] transition focus:ring-2 focus:ring-[#004AC6] focus:border-transparent placeholder:text-gray-300"
                />
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  @click="router.push('/work-order')"
                  class="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <BaseButton color="brand" :disabled="loading" @click="saveWorkOrder">
                  {{ loading ? "Menyimpan..." : "Simpan Work Order" }}
                </BaseButton>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </MainLayout>
</template>