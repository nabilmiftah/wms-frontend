<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../components/base/BaseButton.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseModal from "../components/base/BaseModal.vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import type { Asset } from "../types/asset";

import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset as deleteAssetService,
} from "../services/asset.service";

import { getSuppliers } from "../services/supplier.service";

import { toast } from "vue-sonner";

const openModal = ref(false);
const search = ref("");

const assetNumber = ref("");
const assetName = ref("");
const category = ref("");
const price = ref("");
const supplierId = ref("");

const assetNameError = ref("");
const supplierError = ref("");
const categoryError = ref("");
const priceError = ref("");

const isEdit = ref(false);

const selectedId = ref<string | null>(null);

const assets = ref<Asset[]>([]);

const loading = ref(false);

const openDeleteModal = ref(false);

const deleteId = ref("");

const remarks = ref("");

const remarksError = ref("");

const fetchAssets = async () => {
  try {
    loading.value = true;

    const response = await getAssets();

    assets.value = response.data.sort((a: Asset, b: Asset) => {
      return (
        Number(a.assetNumber.replace("AST_", "")) -
        Number(b.assetNumber.replace("AST_", ""))
      );
    });
  } catch (error: any) {
    console.error(error);

    toast.error("Failed to fetch assets");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAssets();

  fetchSuppliers();
});

const assetCategories = [
  {
    label: "Small Asset",
    value: "SMALL_ASSET",
  },
  {
    label: "Medium Asset",
    value: "MEDIUM_ASSET",
  },
  {
    label: "Large Asset",
    value: "LARGE_ASSET",
  },
];

const suppliers = ref([]);

const fetchSuppliers = async () => {
  try {
    const response = await getSuppliers();

    suppliers.value = response.data;
  } catch (error) {
    console.error(error);

    toast.error("Failed to fetch suppliers");
  }
};

const supplierOptions = computed(() => {
  return suppliers.value.map((supplier: any) => ({
    label: supplier.supName,

    value: supplier.id,
  }));
});

const filteredAssets = computed(() => {
  return assets.value.filter((asset) => {
    const keyword = search.value.toLowerCase();

    return (
      asset.assetNumber.toLowerCase().includes(keyword) ||
      asset.assetName.toLowerCase().includes(keyword) ||
      asset.category.toLowerCase().includes(keyword)
    );
  });
});

const generateAssetCode = () => {
  const nextNumber = assets.value.length + 1;

  return `AST_${String(nextNumber).padStart(2, "0")}`;
};

watch(openModal, (value) => {
  if (value && !isEdit.value) {
    assetNumber.value = generateAssetCode();
  }
});

const openAddModal = () => {
  resetForm();

  assetNumber.value = generateAssetCode();

  isEdit.value = false;

  openModal.value = true;
};

const saveAsset = async () => {
  assetNameError.value = "";

  categoryError.value = "";

  priceError.value = "";

  supplierError.value = "";

  remarksError.value = "";

  if (assetName.value.trim().length < 3) {
    assetNameError.value = "Asset name minimal 3 karakter";

    return;
  }

  if (!category.value) {
    categoryError.value = "Category wajib dipilih";

    return;
  }

  if (!price.value) {
    priceError.value = "Price wajib diisi";

    return;
  }

  if (isNaN(Number(price.value))) {
    priceError.value = "Price harus berupa angka";

    return;
  }

  try {
    loading.value = true;

    if (isEdit.value) {
      await updateAsset(selectedId.value!, {
        assetName: assetName.value,

        category: category.value,

        price: price.value,

        remarks: remarks.value,

        supplierId: supplierId.value,
      });

      toast.success("Asset updated successfully");
    } else {
      await createAsset({
        assetName: assetName.value,

        category: category.value,

        price: price.value,

        remarks: remarks.value,

        supplierId: supplierId.value,
      });

      toast.success("Asset created successfully");
    }

    await fetchAssets();

    resetForm();
  } catch (error: any) {
    console.error(error);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  assetNumber.value = "";

  assetName.value = "";

  category.value = "";

  price.value = "";

  remarks.value = "";

  supplierId.value = "";

  assetNameError.value = "";

  categoryError.value = "";

  priceError.value = "";

  supplierError.value = "";

  remarksError.value = "";

  isEdit.value = false;

  selectedId.value = null;

  openModal.value = false;
};

const editAsset = (asset: Asset) => {
  isEdit.value = true;

  selectedId.value = asset.id;

  assetNumber.value = asset.assetNumber;

  assetName.value = asset.assetName;

  price.value = asset.price;

  category.value = asset.category;

  remarks.value = asset.remarks || "";

  supplierId.value = asset.supplierId || "";

  openModal.value = true;
};

const openDeleteConfirmation = (id: string) => {
  deleteId.value = id;

  openDeleteModal.value = true;
};

const confirmDeleteAsset = async () => {
  try {
    await deleteAssetService(deleteId.value);

    toast.success("Asset deleted successfully");

    await fetchAssets();

    openDeleteModal.value = false;
  } catch (error) {
    console.error(error);

    toast.error("Failed to delete asset");
  }
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Asset</h1>

          <p class="text-sm text-gray-500 mt-1">Kelola master data asset</p>
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
                placeholder="Search asset"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>

            <BaseButton color="brand" @click="openAddModal">
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Add Asset
              </div>
            </BaseButton>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">
                    Asset Number
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Asset Name</th>

                  <th class="text-left px-4 py-3 font-semibold">Category</th>

                  <th class="text-left px-4 py-3 font-semibold">Price</th>

                  <th class="text-left px-4 py-3 font-semibold">Supplier</th>

                  <th class="text-center px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="asset in filteredAssets"
                  :key="asset.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 text-gray-700">
                    {{ asset.assetNumber }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ asset.assetName }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{
                      asset.category === "SMALL_ASSET"
                        ? "Small Asset"
                        : asset.category === "MEDIUM_ASSET"
                          ? "Medium Asset"
                          : "Large Asset"
                    }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    Rp
                    {{ Number(asset.price).toLocaleString("id-ID") }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ asset.supplier?.supName || "-" }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        @click="editAsset(asset)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>

                      <button
                        class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        @click="openDeleteConfirmation(asset.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredAssets.length === 0">
                  <td colspan="7" class="text-center py-6 text-gray-400">
                    No asset found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BaseModal
        :open="openModal"
        :title="isEdit ? 'Edit Asset' : 'Add Asset'"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Asset Number
            </label>

            <BaseInput
              class="block mb-2"
              v-model="assetNumber"
              placeholder="Asset Number"
              disabled
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Asset Name
            </label>

            <BaseInput v-model="assetName" placeholder="Adidas" />
            <p v-if="assetNameError" class="text-red-500 text-xs mt-1">
              {{ assetNameError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Category
            </label>

            <BaseSelect
              v-model="category"
              :items="
                assetCategories.map((category) => ({
                  label: category.label,
                  value: category.value,
                }))
              "
              placeholder="Select Category"
            />

            <p v-if="categoryError" class="text-red-500 text-xs mt-1">
              {{ categoryError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Price
            </label>

            <BaseInput v-model="price" placeholder="RP 100.000" />
            <p v-if="priceError" class="text-red-500 text-xs mt-1">
              {{ priceError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Supplier
            </label>

            <BaseSelect
              v-model="supplierId"
              :items="supplierOptions"
              placeholder="Select Supplier"
            />
            <p v-if="supplierError" class="text-red-500 text-xs mt-1">
              {{ supplierError }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="openModal = false">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveAsset">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
      <BaseModal
        :open="openDeleteModal"
        title="Delete Asset"
        @close="openDeleteModal = false"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Are you sure want to delete this asset?
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="openDeleteModal = false"
            >
              Cancel
            </UButton>

            <BaseButton color="error" @click="confirmDeleteAsset">
              Delete
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
