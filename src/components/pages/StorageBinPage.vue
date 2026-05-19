<script setup lang="ts">
import { ref } from "vue";

import { Pencil, Trash2, Search, Plus, Warehouse } from "lucide-vue-next";

import BaseButton from "../base/BaseButton.vue";
import BaseInput from "../base/BaseInput.vue";
import BaseModal from "../base/BaseModal.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { computed } from "vue";
import BaseSelect from "../base/BaseSelect.vue";
import { watch } from "vue";

const openModal = ref(false);
const search = ref("");

const storageBinNumber = ref("");
const warehouseId = ref("");
const assetCategoryId = ref("");
const assetId = ref("");
const warehouseError = ref("");
const assetCategoryError = ref("");
const assetError = ref("");

const isEdit = ref(false);

const selectedId = ref<number | null>(null);

const storageBins = ref([
  {
    id: 1,
    number: "WH_01_001",
    warehouseId: 1,
    assetCategoryId: 1,
    assetId: 1,
  },
  {
    id: 2,
    number: "WH_02_002",
    warehouseId: 2,
    assetCategoryId: 2,
    assetId: 2,
  },
]);

const assetCategories = ref([
  {
    id: 1,
    name: "Small Asset",
  },
  {
    id: 2,
    name: "Medium Asset",
  },
  {
    id: 3,
    name: "Large Asset",
  },
]);

const warehouses = ref([
  {
    id: 1,
    code: "WH_01",
    name: "Gudang Jakarta",
  },
  {
    id: 2,
    code: "WH_02",
    name: "Gudang Bandung",
  },
]);

const assets = ref([
  {
    id: 1,
    name: "Laptop Asus",
  },
  {
    id: 2,
    name: "Office Chair",
  },
]);

const getWarehouseName = (id: number) => {
  const warehouse = warehouses.value.find((warehouse) => warehouse.id === id);

  return warehouse?.name || "-";
};

const getCategoryName = (id: number) => {
  const category = assetCategories.value.find((category) => category.id === id);

  return category?.name || "-";
};

const getAssetName = (id: number) => {
  const asset = assets.value.find((asset) => asset.id === id);

  return asset?.name || "-";
};

const filteredStorageBins = computed(() => {
  return storageBins.value.filter((bin) => {
    const keyword = search.value.toLowerCase();

    return (
      bin.number.toLowerCase().includes(keyword) ||

      getWarehouseName(bin.warehouseId)
        .toLowerCase()
        .includes(keyword) ||

      getCategoryName(bin.assetCategoryId)
        .toLowerCase()
        .includes(keyword) ||

      getAssetName(bin.assetId)
        .toLowerCase()
        .includes(keyword)
    );
  });
});

const generateStorageBinNumber = () => {
  const warehouse = warehouses.value.find(
    (warehouse) => warehouse.id === warehouseId.value,
  );

  if (!warehouse) return "";

  const totalBin =
    storageBins.value.filter((bin) => bin.warehouseId === warehouseId.value)
      .length + 1;

  return `${warehouse.code}_${String(totalBin).padStart(3, "0")}`;
};

watch(warehouseId, () => {
  storageBinNumber.value = generateStorageBinNumber();
});

const openAddModal = () => {
  storageBinNumber.value = generateStorageBinNumber();

  openModal.value = true;
};

const saveStorageBin = () => {
  warehouseError.value = "";
  assetCategoryError.value = "";
  assetError.value = "";

  if (!warehouseId.value) {
    warehouseError.value = "Warehouse wajib dipilih";

    return;
  }

  if (!assetCategoryId.value) {
    assetCategoryError.value = "Asset category wajib dipilih";

    return;
  }

  if (!assetId.value) {
    assetError.value = "Asset wajib dipilih";

    return;
  }

  if (isEdit.value) {
    const index = storageBins.value.findIndex(
      (bin) => bin.id === selectedId.value!,
    );

    storageBins.value[index] = {
      id: selectedId.value!,
      number: storageBinNumber.value,
      warehouseId: warehouseId.value,
      assetCategoryId: assetCategoryId.value,
      assetId: assetId.value,
    };
  } else {
    storageBins.value.push({
      id: Date.now(),
      number: storageBinNumber.value,
      warehouseId: warehouseId.value,
      assetCategoryId: assetCategoryId.value,
      assetId: assetId.value,
    });
  }

  resetForm();
};

const resetForm = () => {
  storageBinNumber.value = "";
  warehouseId.value = "";
  assetCategoryId.value = "";
  assetId.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editStorageBin = (bin: any) => {
  isEdit.value = true;

  selectedId.value = bin.id;

  storageBinNumber.value = bin.number;
  warehouseId.value = bin.warehouseId;
  assetCategoryId.value = bin.assetCategoryId;
  assetId.value = bin.assetId;

  openModal.value = true;
};

const deleteStorageBin = (id: number) => {
  storageBins.value = storageBins.value.filter((bin) => bin.id !== id);
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Storage Bin</h1>

          <p class="text-sm text-gray-500 mt-1">
            Kelola master data storage bin
          </p>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5"
        >
          <div class="flex items-center justify-between gap-4">
            <div class="relative w-full max-w-md">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              />

              <BaseInput
                v-model="search"
                type="text"
                placeholder="Search storage bin"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>

            <BaseButton color="brand" @click="openAddModal">
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Add Storage Bin
              </div>
            </BaseButton>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">
                    Storage Bin Number
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Warehouse</th>

                  <th class="text-left px-4 py-3 font-semibold">
                    Asset Category
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Asset</th>

                  <th class="text-center px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="bin in filteredStorageBins"
                  :key="bin.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 text-gray-700">
                    {{ bin.number }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ getWarehouseName(bin.warehouseId) }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ getCategoryName(bin.assetCategoryId) }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ getAssetName(bin.assetId) }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        @click="editStorageBin(bin)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>

                      <button
                        class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        @click="deleteStorageBin(bin.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BaseModal
        :open="openModal"
        title="Add Storage Bin"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Storage Bin Number
            </label>

            <BaseInput
              class="block mb-2"
              v-model="storageBinNumber"
              placeholder="Storage Bin Number"
              disabled
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse
            </label>

            <BaseSelect
              v-model="warehouseId"
              :items="
                warehouses.map((warehouse) => ({
                  label: warehouse.name,
                  value: warehouse.id,
                }))
              "
              placeholder="Warehouse"
            />
            <p v-if="warehouseError" class="text-red-500 text-xs mt-1">
              {{ warehouseError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Category
            </label>

            <BaseSelect
              v-model="assetCategoryId"
              :items="
                assetCategories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))
              "
              placeholder="Asset Category"
            />
            <p v-if="assetCategoryError" class="text-red-500 text-xs mt-1">
              {{ assetCategoryError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Asset
            </label>

            <BaseSelect
              v-model="assetId"
              :items="
                assets.map((asset) => ({
                  label: asset.name,
                  value: asset.id,
                }))
              "
              placeholder="Select Asset"
            />
            <p v-if="assetError" class="text-red-500 text-xs mt-1">
              {{ assetError }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="openModal = false">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveStorageBin">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
