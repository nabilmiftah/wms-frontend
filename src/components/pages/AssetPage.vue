<script setup lang="ts">
import { ref } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../base/BaseButton.vue";
import BaseInput from "../base/BaseInput.vue";
import BaseModal from "../base/BaseModal.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { computed } from "vue";
import BaseSelect from "../base/BaseSelect.vue";

const openModal = ref(false);
const search = ref("");

const assetNumber = ref("");
const assetName = ref("");
const categoryId = ref("");
const price = ref("");
const supplierId = ref("");

const assetNameError = ref("");
const supplierError = ref("");
const categoryError = ref("");
const priceError = ref("");

const isEdit = ref(false);

const selectedId = ref<number | null>(null);

const assets = ref([
  {
    id: 1,
    number: "AST_01",
    name: "Laptop Asus",
    supplierId: 1,
    categoryId: 1,
    price: 1000000,
  },
  {
    id: 2,
    number: "AST_02",
    name: "Office Chair",
    supplierId: 1,
    categoryId: 2,
    price: 500000,
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

const suppliers = ref([
  {
    id: 1,
    name: "PT Maju Jaya",
  },
  {
    id: 2,
    name: "PT Sumber Makmur",
  },
]);

const filteredAssets = computed(() => {
  return assets.value.filter((asset) => {
    const keyword = search.value.toLowerCase();

    return (
      asset.number.toLowerCase().includes(keyword) ||

      asset.name.toLowerCase().includes(keyword) ||

      getCategoryName(asset.categoryId)
        .toLowerCase()
        .includes(keyword) ||

      getSupplierName(asset.supplierId)
        .toLowerCase()
        .includes(keyword)
    );
  });
});

const generateAssetCode = () => {
  const nextNumber = assets.value.length + 1;

  return `AST_${String(nextNumber).padStart(2, "0")}`;
};

const openAddModal = () => {
  assetNumber.value = generateAssetCode();

  openModal.value = true;
};

const getCategoryName = (id: number) => {
  const category = assetCategories.value.find((category) => category.id === id);

  return category?.name || "-";
};

const getSupplierName = (id: number) => {
  const supplier = suppliers.value.find((supplier) => supplier.id === id);

  return supplier?.name || "-";
};

const saveAsset = () => {
  assetNameError.value = "";
  categoryError.value = "";
  priceError.value = "";
  supplierError.value = "";

  if (!assetName.value) {
    assetNameError.value = "Asset name wajib diisi";

    return;
  }

  if (!categoryId.value) {
    categoryError.value = "Category wajib dipilih";

    return;
  }

  if (!price.value) {
    priceError.value = "Price wajib diisi";

    return;
  }

  if (!supplierId.value) {
    supplierError.value = "Supplier wajib dipilih";

    return;
  }

  if (isNaN(Number(price.value))) {
    priceError.value = "Price harus berupa angka";

    return;
  }

  if (isEdit.value) {
    const index = assets.value.findIndex(
      (asset) => asset.id === selectedId.value,
    );

    assets.value[index] = {
      id: selectedId.value,
      number: assetNumber.value,
      name: assetName.value,
      supplierId: supplierId.value,
      categoryId: categoryId.value,
      price: price.value,
    };
  } else {
    assets.value.push({
      id: Date.now(),
      number: assetNumber.value,
      name: assetName.value,
      supplierId: supplierId.value,
      categoryId: categoryId.value,
      price: price.value,
    });
  }

  resetForm();
};

const resetForm = () => {
  assetNumber.value = "";
  assetName.value = "";
  price.value = "";
  categoryId.value = "";
  supplierId.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editAsset = (asset: any) => {
  isEdit.value = true;

  selectedId.value = asset.id;

  assetNumber.value = asset.number;
  assetName.value = asset.name;
  price.value = asset.price;
  category.value = asset.category;
  supplierId.value = asset.supplierId;

  openModal.value = true;
};

const deleteAsset = (id: number) => {
  assets.value = assets.value.filter((asset) => asset.id !== id);
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
                    {{ asset.number }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ asset.name }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ getCategoryName(asset.categoryId) }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ asset.price }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ getSupplierName(asset.supplierId) }}
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
                        @click="deleteAsset(asset.id)"
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

      <BaseModal :open="openModal" title="Add Asset" @close="openModal = false">
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
              v-model="categoryId"
              :items="
                assetCategories.map((category) => ({
                  label: category.name,
                  value: category.id,
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
              :items="
                suppliers.map((supplier) => ({
                  label: supplier.name,
                  value: supplier.id,
                }))
              "
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
    </div>
  </MainLayout>
</template>
