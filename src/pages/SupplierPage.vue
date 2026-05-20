<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../components/base/BaseButton.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseModal from "../components/base/BaseModal.vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import BaseSelect from "../components/base/BaseSelect.vue";
import { toast } from "vue-sonner";
import type { Supplier } from "../types/supplier";

import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier as deleteSupplierService,
} from "../services/supplier.service";

const loading = ref(false);
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

const openDeleteModal = ref(false);

const deleteId = ref("");

const suppliers = ref<Supplier[]>([]);

const categories = [
  {
    label: "Local",
    value: "LOCAL",
  },
  {
    label: "Import",
    value: "IMPORT",
  },
];

const fetchSuppliers = async () => {
  try {
    loading.value = true;

    const response = await getSuppliers();

    suppliers.value = response.data.sort((a: any, b: any) => {
      return (
        Number(a.supNumber.replace("SUP_", "")) -
        Number(b.supNumber.replace("SUP_", ""))
      );
    });
  } catch (error: any) {
    console.error(error);

    toast.error("Failed to fetch suppliers");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSuppliers();
});

const filteredSuppliers = computed(() => {
  return suppliers.value.filter((supplier) => {
    const keyword = search.value.toLowerCase();

    return (
      supplier.supNumber.toLowerCase().includes(keyword) ||
      supplier.supName.toLowerCase().includes(keyword) ||
      supplier.supCategory.toLowerCase().includes(keyword) ||
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

  isEdit.value = false;

  openModal.value = true;
};

const confirmDeleteSupplier = async () => {
  try {
    await deleteSupplierService(deleteId.value);

    toast.success("Supplier deleted successfully");

    await fetchSuppliers();

    openDeleteModal.value = false;
  } catch (error) {
    console.error(error);

    toast.error("Failed to delete supplier");
  }
};

const openDeleteConfirmation = (id: string) => {
  deleteId.value = id;

  openDeleteModal.value = true;
};

const saveSupplier = async () => {
  supplierNameError.value = "";

  addressError.value = "";

  categoryError.value = "";

  if (supplierName.value.trim().length < 3) {
    supplierNameError.value = "Supplier name minimal 3 karakter";

    return;
  }

  if (address.value.trim().length < 5) {
    addressError.value = "Address minimal 5 karakter";

    return;
  }

  if (!category.value) {
    categoryError.value = "Category wajib dipilih";

    return;
  }

  try {
    loading.value = true;

    if (isEdit.value) {
      await updateSupplier(selectedId.value, {
        supName: supplierName.value,

        supCategory: category.value,

        address: address.value,
      });

      toast.success("Supplier updated successfully");
    } else {
      await createSupplier({
        supName: supplierName.value,

        supCategory: category.value,

        address: address.value,
      });

      toast.success("Supplier created successfully");
    }

    await fetchSuppliers();

    resetForm();
  } catch (error: any) {
    console.error(error);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
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

const editSupplier = (supplier: Supplier) => {
  isEdit.value = true;

  selectedId.value = Number(supplier.id);

  supplierNumber.value = supplier.supNumber;

  supplierName.value = supplier.supName;

  category.value = supplier.supCategory;

  address.value = supplier.address;

  openModal.value = true;
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
                    {{ supplier.supNumber }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ supplier.supName }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ supplier.supCategory === "LOCAL" ? "Local" : "Import" }}
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
                        @click="openDeleteConfirmation(supplier.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredSuppliers.length === 0">
                  <td colspan="5" class="text-center py-6 text-gray-400">
                    No supplier found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BaseModal
        :open="openModal"
        :title="isEdit ? 'Edit Supplier' : 'Add Supplier'"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Supplier Number
            </label>

            <BaseInput
              v-model="supplierNumber"
              readonly
              placeholder="Auto Generated"
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
            <UButton color="neutral" variant="soft" @click="resetForm">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveSupplier">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
      <BaseModal
        :open="openDeleteModal"
        title="Delete Supplier"
        @close="openDeleteModal = false"
      >
        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Are you sure want to delete this supplier?
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="openDeleteModal = false"
            >
              Cancel
            </UButton>

            <BaseButton color="error" @click="confirmDeleteSupplier">
              Delete
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
