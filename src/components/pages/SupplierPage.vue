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

const supplierNumber = ref("");
const supplierName = ref("");
const category = ref("");
const address = ref("");
const supplierNameError = ref("");
const categoryError = ref("");
const addressError = ref("");

const isEdit = ref(false);

const selectedId = ref<number | null>(null);

const suppliers = ref([
  {
    id: 1,
    number: "SUP_01",
    name: "PT. Jaya Abadi",
    category: "Local Supplier",
    address: "Jakarta, Indonesia",
  },
  {
    id: 2,
    number: "SUP_02",
    name: "CV. Makmur Sejahtera",
    category: "Import",
    address: "Jl. Sudirman No. 20, Bandung",
  },
  {
    id: 3,
    number: "SUP_03",
    name: "UD. Sentosa",
    category: "Local",
    address: "Jl. Diponegoro No. 30, Surabaya",
  },
]);

const categories = [
  {
    label: "Local",
    value: "local",
  },
  {
    label: "Import",
    value: "import",
  },
];

const filteredSuppliers = computed(() => {
  return suppliers.value.filter((supplier) => {
    const keyword = search.value.toLowerCase();

    return (
      supplier.number.toLowerCase().includes(keyword) ||
      supplier.name.toLowerCase().includes(keyword) ||
      supplier.category.toLowerCase().includes(keyword) ||
      supplier.address.toLowerCase().includes(keyword)
    );
  });
});

const generateSupplierNumber = () => {
  const nextNumber = suppliers.value.length + 1;

  return `SUP_${String(nextNumber).padStart(2, "0")}`;
};

const openAddModal = () => {
  supplierNumber.value = generateSupplierNumber();

  openModal.value = true;
};

const saveSupplier = () => {
  supplierNameError.value = "";
  addressError.value = "";
  categoryError.value = "";

  if (!supplierName.value) {
    supplierNameError.value = "Supplier name wajib diisi";

    return;
  }

  if (!address.value) {
    addressError.value = "Address wajib diisi";

    return;
  }
  if (!category.value) {
    categoryError.value = "Category wajib dipilih";

    return;
  }

  if (isEdit.value) {
    const index = suppliers.value.findIndex(
      (supplier) => supplier.id === selectedId.value,
    );

    suppliers.value[index] = {
      id: selectedId.value,
      number: supplierNumber.value,
      name: supplierName.value,
      category: category.value,
      address: address.value,
    };
  } else {
    suppliers.value.push({
      id: Date.now(),
      number: supplierNumber.value,
      name: supplierName.value,
      category: category.value,
      address: address.value,
    });
  }

  resetForm();
};

const resetForm = () => {
  supplierNumber.value = "";
  supplierName.value = "";
  category.value = "";
  address.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editSupplier = (supplier: any) => {
  isEdit.value = true;

  selectedId.value = supplier.id;

  supplierNumber.value = supplier.number;
  supplierName.value = supplier.name;
  category.value = supplier.category;
  address.value = supplier.address;

  openModal.value = true;
};

const deleteSupplier = (id: number) => {
  suppliers.value = suppliers.value.filter((supplier) => supplier.id !== id);
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Supplier</h1>

          <p class="text-sm text-gray-500 mt-1">Kelola master data supplier</p>
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
                placeholder="Search supplier"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>

            <BaseButton color="brand" @click="openAddModal">
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Add Supplier
              </div>
            </BaseButton>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">
                    Supplier Number
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">
                    Supplier Name
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Category</th>

                  <th class="text-left px-4 py-3 font-semibold">Address</th>

                  <th class="text-center px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="supplier in filteredSuppliers"
                  :key="supplier.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 text-gray-700">
                    {{ supplier.number }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ supplier.name }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ supplier.category }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ supplier.address }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        @click="editSupplier(supplier)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>

                      <button
                        class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        @click="deleteSupplier(supplier.id)"
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
        title="Add Supplier"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Supplier Number
            </label>

            <BaseInput
              class="block mb-2"
              v-model="supplierNumber"
              placeholder="Supplier Number"
              disabled
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Supplier Name
            </label>

            <BaseInput v-model="supplierName" placeholder="Supplier Name" />

            <p v-if="supplierNameError" class="text-red-500 text-xs mt-1">
              {{ supplierNameError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Address
            </label>

            <BaseInput v-model="address" placeholder="Supplier Address" />
            <p v-if="addressError" class="text-red-500 text-xs mt-1">
              {{ addressError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Category
            </label>

            <BaseSelect
              v-model="category"
              :items="categories"
              placeholder="Select Category"
            />

            <p v-if="categoryError" class="text-red-500 text-xs mt-1">
              {{ categoryError }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="openModal = false">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveSupplier">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
