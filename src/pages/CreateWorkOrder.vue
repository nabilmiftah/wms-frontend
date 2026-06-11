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
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto max-w-3xl">

        <div class="flex items-center justify-between">
          <button
            class="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-[#004AC6] transition"
            @click="router.push('/work-order')"
          >
            <ArrowLeft class="w-4 h-4" />
            {{ isInbound ? "Buat Work Order Inbound" : "Buat Work Order Outbound" }}
          </button>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-bold tracking-wide',
              isInbound ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
            ]"
          >
            {{ isInbound ? "INBOUND" : "OUTBOUND" }}
          </span>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <p class="text-base font-semibold text-gray-900">Formulir Work Order</p>
            <p class="text-sm text-gray-500 mt-0.5">
              Silakan isi detail untuk membuat work order {{ isInbound ? "inbound" : "outbound" }} baru.
            </p>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="text-sm font-medium text-[#434655] block mb-2">WO Category</label>
                <BaseInput :model-value="isInbound ? 'Inbound' : 'Outbound'" disabled />
              </div>
              <div>
                <label class="text-sm font-medium text-[#434655] block mb-2">WO Number</label>
                <BaseInput model-value="Auto Generated" disabled />
                <label class="text-xs font-medium text-[#434655] block mt-1 italic">
                  Auto-generated by system
                </label>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-5">
              <div>
                <label class="text-sm font-medium text-[#434655] block mb-2">
                  Warehouse Name <span class="text-red-500">*</span>
                </label>
                <BaseSelect v-model="warehouseId" :items="warehouseOptions" placeholder="Pilih Warehouse" />
                <p v-if="warehouseError" class="text-red-500 text-xs mt-1">{{ warehouseError }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-[#434655] block mb-2">
                  Storage Bin Address Number <span class="text-red-500">*</span>
                </label>
                <BaseSelect
                  v-model="storageBinId"
                  :items="storageBinOptions"
                  placeholder="Pilih Storage Bin"
                  :disabled="!warehouseId"
                />
                <p v-if="storageBinError" class="text-red-500 text-xs mt-1">{{ storageBinError }}</p>
                <p v-if="!warehouseId" class="text-xs text-gray-400 mt-1">Pilih warehouse terlebih dahulu</p>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium text-[#434655] block mb-2">
                Asset Name <span class="text-red-500">*</span>
              </label>
              <BaseSelect
                v-model="assetId"
                :items="assetOptions"
                placeholder="Pilih Asset"
                :disabled="!storageBinId"
              />
              <p v-if="assetError" class="text-red-500 text-xs mt-1">{{ assetError }}</p>
              <p v-if="!storageBinId" class="text-xs text-gray-400 mt-1">Pilih storage bin terlebih dahulu</p>
            </div>

            <div class="max-w-[260px]">
              <label class="text-sm font-medium text-[#434655] block mb-2">
                Qty <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="qty"
                type="number"
                placeholder="0"
                min="1"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none transition focus:ring-2 focus:ring-[#004AC6] placeholder:text-gray-300"
              />
              <p v-if="qtyError" class="text-red-500 text-xs mt-1">{{ qtyError }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-[#434655] block mb-2">
                Remarks
                <span class="text-xs text-gray-400 font-normal ml-1">{{ remarks.length }}/500</span>
              </label>
              <textarea
                v-model="remarks"
                maxlength="500"
                rows="3"
                placeholder="Catatan tambahan..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none resize-vertical font-[inherit] transition focus:ring-2 focus:ring-[#004AC6] focus:border-transparent placeholder:text-gray-300"
              />
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <UButton color="neutral" variant="soft" @click="router.push('/work-order')">
                Batal
              </UButton>
              <BaseButton color="brand" :disabled="loading" @click="saveWorkOrder">
                {{ loading ? "Menyimpan..." : "Simpan Work Order" }}
              </BaseButton>
            </div>
          </div>
        </div>

      </main>
    </div>
  </MainLayout>
</template>