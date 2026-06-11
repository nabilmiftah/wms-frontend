<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import BaseButton from "../components/base/BaseButton.vue";
import { toast } from "vue-sonner";

const props = defineProps<{ type: "inbound" | "outbound" }>();

const router = useRouter();

const isInbound = computed(() => props.type === "inbound");

const loading = ref(false);

const woNumber = ref(isInbound.value ? "WO_IN_07" : "WO_OUT_05");
const warehouseId = ref("");
const storageBinId = ref("");
const assetId = ref("");
const qty = ref<number | null>(null);
const remarks = ref("");

const warehouseError = ref("");
const storageBinError = ref("");
const assetError = ref("");
const qtyError = ref("");

// ─── Dummy Data (ganti dengan API saat BE siap) ───────────────────────────
const warehouses = ref([
  { id: "wh1", name: "Gudang Jogja" },
  { id: "wh2", name: "Gudang Bandung" },
  { id: "wh3", name: "Gudang Jakarta" },
]);

const allStorageBins = ref([
  { id: "sb1", address: "WH_01_001", warehouseId: "wh1" },
  { id: "sb2", address: "WH_01_002", warehouseId: "wh1" },
  { id: "sb3", address: "WH_01_003", warehouseId: "wh1" },
  { id: "sb4", address: "WH_02_001", warehouseId: "wh2" },
  { id: "sb5", address: "WH_02_012", warehouseId: "wh2" },
  { id: "sb6", address: "WH_03_002", warehouseId: "wh3" },
]);

const allAssets = ref([
  { id: "a1", name: "Nike Journey Run Road Running Shoes - Black", storageBinId: "sb1" },
  { id: "a2", name: "Adidas Ultraboost 22 - White", storageBinId: "sb2" },
  { id: "a3", name: "Puma Velocity Nitro 2 - Grey", storageBinId: "sb3" },
  { id: "a4", name: "Puma Velocity Nitro 2 - White", storageBinId: "sb5" },
  { id: "a5", name: "New Balance 574 - Navy", storageBinId: "sb6" },
]);

const filteredStorageBins = computed(() =>
  allStorageBins.value.filter((sb) => sb.warehouseId === warehouseId.value)
);

const filteredAssets = computed(() =>
  allAssets.value.filter((a) => a.storageBinId === storageBinId.value)
);

const warehouseOptions = computed(() =>
  warehouses.value.map((wh) => ({ label: wh.name, value: wh.id }))
);

const storageBinOptions = computed(() =>
  filteredStorageBins.value.map((sb) => ({ label: sb.address, value: sb.id }))
);

const assetOptions = computed(() =>
  filteredAssets.value.map((a) => ({ label: a.name, value: a.id }))
);

watch(warehouseId, () => {
  storageBinId.value = "";
  assetId.value = "";
});

watch(storageBinId, () => {
  assetId.value = "";
});

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

    // TODO: panggil API create WO saat BE siap
    console.log("Submit WO:", {
      woNumber: woNumber.value,
      type: props.type,
      warehouseId: warehouseId.value,
      storageBinId: storageBinId.value,
      assetId: assetId.value,
      qty: Number(qty.value),
      remarks: remarks.value,
    });

    toast.success("Work Order berhasil dibuat");

    // Simpan data WO ke localStorage sementara sampai BE siap
    const selectedWarehouse = warehouses.value.find((w) => w.id === warehouseId.value);
    const selectedStorageBin = allStorageBins.value.find((s) => s.id === storageBinId.value);
    const selectedAsset = allAssets.value.find((a) => a.id === assetId.value);

    const woData = {
      woNumber: woNumber.value,
      warehouse: selectedWarehouse?.name || "",
      storageBin: selectedStorageBin?.address || "",
      assetName: selectedAsset?.name || "",
      targetQty: qty.value,
      remarks: remarks.value,
    };

    localStorage.setItem("currentWO", JSON.stringify(woData));

    if (props.type === "inbound") {
      router.push("/work-order/1/inbound");
    } else {
      router.push("/work-order/3/outbound");
    }
  } catch (error: any) {
    console.error(error);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  warehouseId.value = "";
  storageBinId.value = "";
  assetId.value = "";
  qty.value = null;
  remarks.value = "";
  warehouseError.value = "";
  storageBinError.value = "";
  assetError.value = "";
  qtyError.value = "";
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
                <label class="text-sm font-medium text-[#434655] block mb-2">WO Number</label>
                <BaseInput v-model="woNumber" disabled placeholder="Auto Generated" />
                <label class="text-xs font-medium text-[#434655] block mt-1 italic">
                  Auto-generated by system
                </label>
              </div>
              <div>
                <label class="text-sm font-medium text-[#434655] block mb-2">WO Category</label>
                <BaseInput :model-value="isInbound ? 'Inbound' : 'Outbound'" disabled />
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