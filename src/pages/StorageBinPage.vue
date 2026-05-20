<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../components/base/BaseButton.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseModal from "../components/base/BaseModal.vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import { toast } from "vue-sonner";
import type { StorageBin } from "../types/storage-bin";
import type { Warehouse } from "../types/warehouse";
import type { Asset } from "../types/asset";

import {
  getStorageBins,
  createStorageBin,
  updateStorageBin,
  deleteStorageBin as deleteStorageBinService,
} from "../services/storage-bin.service";

import { getWarehouses } from "../services/warehouse.service";
import { getAssets, updateAsset } from "../services/asset.service";

const loading = ref(false);
const openModal = ref(false);
const search = ref("");

const warehouseId = ref("");
const category = ref("");
const remarks = ref("");
const assetId = ref("");

const warehouseError = ref("");
const categoryError = ref("");

const isEdit = ref(false);
const selectedId = ref<string | null>(null);

const openDeleteModal = ref(false);
const deleteId = ref("");

const storageBins = ref<StorageBin[]>([]);
const warehouses = ref<Warehouse[]>([]);
const assets = ref<Asset[]>([]);

const categoryOptions = [
  { label: "Small Asset", value: "SMALL_ASSET" },
  { label: "Medium Asset", value: "MEDIUM_ASSET" },
  { label: "Large Asset", value: "LARGE_ASSET" },
];

const warehouseOptions = computed(() =>
  warehouses.value.map((wh) => ({
    label: wh.whName,
    value: wh.id,
  })),
);

// Filter asset by category yang dipilih + hanya yang belum punya storageBin
// (kecuali asset yang sedang terpasang di bin yang sedang diedit)
const assetOptions = computed(() => {
  if (!category.value) return [];

  return assets.value
    .filter((asset) => {
      const sameCategory = asset.category === category.value;
      const isUnallocated = asset.storageBinId === null;
      const isCurrentBinAsset = asset.storageBinId === selectedId.value;

      return sameCategory && (isUnallocated || isCurrentBinAsset);
    })
    .map((asset) => ({
      label: `${asset.assetNumber} — ${asset.assetName}`,
      value: asset.id,
    }));
});

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    SMALL_ASSET: "Small Asset",
    MEDIUM_ASSET: "Medium Asset",
    LARGE_ASSET: "Large Asset",
  };
  return map[cat] || cat;
};

// Reset assetId kalau category berubah (supaya tidak ada mismatch)
watch(category, () => {
  assetId.value = "";
});

const fetchWarehouses = async () => {
  try {
    const response = await getWarehouses();
    warehouses.value = response.data;
  } catch (error: any) {
    console.error(error);
  }
};

const fetchAssets = async () => {
  try {
    const response = await getAssets();
    assets.value = response.data;
  } catch (error: any) {
    console.error(error);
  }
};

const fetchStorageBins = async () => {
  try {
    loading.value = true;

    const response = await getStorageBins();

    storageBins.value = response.data.sort((a: StorageBin, b: StorageBin) => {
      return a.binAddress.localeCompare(b.binAddress);
    });
  } catch (error: any) {
    console.error(error);

    toast.error("Failed to fetch storage bins");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchWarehouses();
  fetchAssets();
  fetchStorageBins();
});

const filteredStorageBins = computed(() => {
  return storageBins.value.filter((bin) => {
    const keyword = search.value.toLowerCase();

    return (
      bin.binAddress.toLowerCase().includes(keyword) ||
      bin.warehouse?.whName.toLowerCase().includes(keyword) ||
      bin.category.toLowerCase().includes(keyword) ||
      getCategoryLabel(bin.category).toLowerCase().includes(keyword) ||
      (bin.asset?.assetName ?? "").toLowerCase().includes(keyword) ||
      (bin.remarks ?? "").toLowerCase().includes(keyword)
    );
  });
});

const openAddModal = () => {
  isEdit.value = false;
  openModal.value = true;
};

const confirmDeleteStorageBin = async () => {
  try {
    await deleteStorageBinService(deleteId.value);

    toast.success("Storage bin deleted successfully");

    await fetchStorageBins();

    openDeleteModal.value = false;
  } catch (error: any) {
    console.error(error);

    toast.error(
      error.response?.data?.message || "Failed to delete storage bin",
    );
  }
};

const openDeleteConfirmation = (id: string) => {
  deleteId.value = id;
  openDeleteModal.value = true;
};

const saveStorageBin = async () => {
  warehouseError.value = "";
  categoryError.value = "";

  if (!warehouseId.value) {
    warehouseError.value = "Warehouse wajib dipilih";
    return;
  }

  if (!category.value) {
    categoryError.value = "Category wajib dipilih";
    return;
  }

  try {
    loading.value = true;

    if (isEdit.value && selectedId.value) {
      // Update storage bin (category & remarks)
      await updateStorageBin(selectedId.value, {
        category: category.value as
          | "SMALL_ASSET"
          | "MEDIUM_ASSET"
          | "LARGE_ASSET",
        remarks: remarks.value || undefined,
      });

      // Handle perubahan asset:
      const currentBin = storageBins.value.find(
        (b) => b.id === selectedId.value,
      );
      const prevAssetId = currentBin?.asset?.id ?? null;

      // Kalau ada asset sebelumnya & diganti / dikosongkan → lepas asset lama
      if (prevAssetId && prevAssetId !== assetId.value) {
        await updateAsset(prevAssetId, { storageBinId: null });
      }

      // Kalau ada asset baru dipilih → alokasikan ke bin ini
      if (assetId.value && assetId.value !== prevAssetId) {
        await updateAsset(assetId.value, { storageBinId: selectedId.value });
      }

      toast.success("Storage bin updated successfully");
    } else {
      // Create storage bin dulu
      const res = await createStorageBin({
        warehouseId: warehouseId.value,
        category: category.value as
          | "SMALL_ASSET"
          | "MEDIUM_ASSET"
          | "LARGE_ASSET",
        remarks: remarks.value || undefined,
      });

      // Kalau ada asset dipilih → alokasikan ke bin baru
      if (assetId.value) {
        const newBinId = res.data.id;
        await updateAsset(assetId.value, { storageBinId: newBinId });
      }

      toast.success("Storage bin created successfully");
    }

    await fetchAssets();
    await fetchStorageBins();

    resetForm();
  } catch (error: any) {
    console.error(error);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  warehouseId.value = "";
  category.value = "";
  remarks.value = "";
  assetId.value = "";
  warehouseError.value = "";
  categoryError.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editStorageBin = (bin: StorageBin) => {
  isEdit.value = true;

  selectedId.value = bin.id;
  warehouseId.value = bin.warehouseId;
  category.value = bin.category;
  remarks.value = bin.remarks || "";
  assetId.value = bin.asset?.id || "";

  openModal.value = true;
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
                  <th class="text-left px-4 py-3 font-semibold">Bin Address</th>

                  <th class="text-left px-4 py-3 font-semibold">Warehouse</th>

                  <th class="text-left px-4 py-3 font-semibold">Category</th>

                  <th class="text-left px-4 py-3 font-semibold">Asset</th>

                  <th class="text-left px-4 py-3 font-semibold">Remarks</th>

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
                    {{ bin.binAddress }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ bin.warehouse?.whName || "-" }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ getCategoryLabel(bin.category) }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ bin.asset?.assetName || "-" }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ bin.remarks || "-" }}
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
                        @click="openDeleteConfirmation(bin.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredStorageBins.length === 0">
                  <td colspan="6" class="text-center py-6 text-gray-400">
                    No storage bin found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <!-- Modal Add / Edit -->
      <BaseModal
        :open="openModal"
        :title="isEdit ? 'Edit Storage Bin' : 'Add Storage Bin'"
        @close="resetForm"
      >
        <div class="space-y-4">
          <!-- Warehouse (disabled saat edit) -->
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse
            </label>

            <BaseSelect
              v-model="warehouseId"
              :items="warehouseOptions"
              placeholder="Select Warehouse"
              :disabled="isEdit"
            />

            <p v-if="warehouseError" class="text-red-500 text-xs mt-1">
              {{ warehouseError }}
            </p>

            <label
              v-if="isEdit"
              class="text-xs font-medium text-[#434655] block mt-1 italic"
            >
              Warehouse cannot be changed after creation
            </label>
          </div>

          <!-- Category -->
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Category
            </label>

            <BaseSelect
              v-model="category"
              :items="categoryOptions"
              placeholder="Select Category"
            />

            <p v-if="categoryError" class="text-red-500 text-xs mt-1">
              {{ categoryError }}
            </p>
          </div>

          <!-- Asset (opsional, difilter by category) -->
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Asset
              <span class="text-gray-400 font-normal">(optional)</span>
            </label>

            <BaseSelect
              v-model="assetId"
              :items="assetOptions"
              placeholder="Select Asset"
              :disabled="!category"
            />

            <label class="text-xs text-gray-400 block mt-1 italic">
              {{
                category
                  ? "Hanya menampilkan asset dengan category yang sama & belum dialokasikan"
                  : "Pilih category terlebih dahulu"
              }}
            </label>
          </div>

          <!-- Remarks -->
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Remarks
            </label>

            <BaseInput
              v-model="remarks"
              placeholder="Additional notes (optional)"
            />
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="resetForm">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveStorageBin">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>

      <!-- Modal Delete Confirmation -->
      <BaseModal
        :open="openDeleteModal"
        title="Delete Storage Bin"
        @close="openDeleteModal = false"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Are you sure want to delete this storage bin?
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="openDeleteModal = false"
            >
              Cancel
            </UButton>

            <BaseButton color="error" @click="confirmDeleteStorageBin">
              Delete
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
