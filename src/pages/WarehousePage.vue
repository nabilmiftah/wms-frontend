<script setup lang="ts">
import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../components/base/BaseButton.vue";
import BaseInput from "../components/base/BaseInput.vue";
import BaseModal from "../components/base/BaseModal.vue";
import MainLayout from "../components/layouts/MainLayout.vue";
import { ref, computed, onMounted, watch } from "vue";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse as deleteWarehouseService,
} from "../services/warehouse.service";
import type { Warehouse } from "../types/warehouse";
import { toast } from "vue-sonner";

const search = ref("");

const warehouseCode = ref("");
const warehouseName = ref("");
const city = ref("");
const remarks = ref("");
const warehouseNameError = ref("");
const cityError = ref("");
const remarksError = ref("");

const isEdit = ref(false);

const selectedId = ref<string | null>(null);
const loading = ref(false);

const openModal = ref(false);
const openDeleteModal = ref(false);

const deleteId = ref("");

const fetchWarehouses =
  async () => {
    try {
      loading.value = true;

      const response =
        await getWarehouses();

      warehouses.value =
        response.data.sort(
          (a: Warehouse, b: Warehouse) => {
            return (
              Number(
                a.whNumber.replace(
                  "WH_",
                  "",
                ),
              ) -
              Number(
                b.whNumber.replace(
                  "WH_",
                  "",
                ),
              )
            );
          },
        );
    } catch (error: any) {
      console.error(error);

      toast.error(
        "Failed to fetch warehouses",
      );
    } finally {
      loading.value = false;
    }
  };
onMounted(() => {
  fetchWarehouses();
});

const warehouses = ref<Warehouse[]>([]);

const filteredWarehouses = computed(() => {
  return warehouses.value.filter((warehouse) => {
    const keyword = search.value.toLowerCase();

    return (
      warehouse.whNumber.toLowerCase().includes(keyword) ||
      warehouse.whName.toLowerCase().includes(keyword) ||
      warehouse.whLocation.toLowerCase().includes(keyword)
    );
  });
});

const generateWarehouseCode = () => {
  const nextNumber = warehouses.value.length + 1;

  return `WH_${String(nextNumber).padStart(2, "0")}`;
};

watch(openModal, (value) => {
  if (value && !isEdit.value) {
    warehouseCode.value = generateWarehouseCode();
  }
});

const openAddModal = () => {
  warehouseCode.value = generateWarehouseCode();

  openModal.value = true;
};

const openDeleteConfirmation = (id: string) => {
  deleteId.value = id;

  openDeleteModal.value = true;
};

const confirmDeleteWarehouse = async () => {
  try {
    await deleteWarehouseService(deleteId.value);

    toast.success("Warehouse deleted successfully");

    await fetchWarehouses();

    openDeleteModal.value = false;
  } catch (error) {
    console.error(error);

    toast.error("Failed to delete warehouse");
  }
};

const saveWarehouse = async () => {
  warehouseNameError.value = "";

  cityError.value = "";

  remarksError.value = "";

  if (warehouseName.value.trim().length < 3) {
    warehouseNameError.value = "Warehouse name minimal 3 karakter";

    return;
  }

  if (city.value.trim().length < 3) {
    cityError.value = "City minimal 3 karakter";

    return;
  }

  if (remarks.value.trim().length < 5) {
    remarksError.value = "Remarks minimal 5 karakter";

    return;
  }

  try {
    loading.value = true;

    if (isEdit.value) {
      await updateWarehouse(selectedId.value, {
        whName: warehouseName.value,

        whLocation: city.value,

        remarks: remarks.value,
      });

      toast.success("Warehouse updated successfully");
    } else {
      await createWarehouse({
        whName: warehouseName.value,

        whLocation: city.value,

        remarks: remarks.value,
      });

      toast.success("Warehouse created successfully");
    }

    await fetchWarehouses();

    resetForm();
  } catch (error: any) {
    console.error(error);

    console.log("FULL ERROR:", error.response?.data);

    console.log("ERROR DETAILS:", error.response?.data?.errors);

    toast.error(error.response?.data?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  warehouseCode.value = "";
  warehouseName.value = "";
  city.value = "";
  remarks.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editWarehouse = (warehouse: Warehouse) => {
  selectedId.value = warehouse.id;

  warehouseCode.value = warehouse.whNumber;

  warehouseName.value = warehouse.whName;

  city.value = warehouse.whLocation;

  remarks.value = warehouse.remarks ?? "";

  isEdit.value = true;

  openModal.value = true;
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Warehouse</h1>

          <p class="text-sm text-gray-500 mt-1">Kelola master data warehouse</p>
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
                placeholder="Search warehouse"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>

            <BaseButton color="brand" @click="openAddModal">
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Add Warehouse
              </div>
            </BaseButton>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">
                    Warehouse Code
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">
                    Warehouse Name
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Location</th>

                  <th class="text-left px-4 py-3 font-semibold">Remarks</th>

                  <th class="text-center px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="warehouse in filteredWarehouses"
                  :key="warehouse.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 text-gray-700">
                    {{ warehouse.whNumber }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ warehouse.whName }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ warehouse.whLocation }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ warehouse.remarks }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        @click="editWarehouse(warehouse)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>

                      <button
                        class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        @click="openDeleteConfirmation(warehouse.id)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="loading" class="text-center py-10">Loading...</div>
            <div
              v-else-if="warehouses.length === 0"
              class="text-center py-10 text-gray-400"
            >
              No warehouse found
            </div>
          </div>
        </div>
      </main>

      <BaseModal
        :open="openModal"
        title="Add Warehouse"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse Code
            </label>

            <BaseInput
              v-model="warehouseCode"
              readonly
              placeholder="Auto Generated"
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse Name
            </label>

            <BaseInput v-model="warehouseName" placeholder="Warehouse Name" />

            <p v-if="warehouseNameError" class="text-red-500 text-xs mt-1">
              {{ warehouseNameError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              City
            </label>

            <BaseInput v-model="city" placeholder="City or Region" />
            <p v-if="cityError" class="text-red-500 text-xs mt-1">
              {{ cityError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Remarks
            </label>

            <BaseInput
              v-model="remarks"
              :textarea="true"
              placeholder="Provide additional details about this facility..."
            />
            <p v-if="remarksError" class="text-red-500 text-xs mt-1">
              {{ remarksError }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="openModal = false">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveWarehouse">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
      <BaseModal
        :open="openDeleteModal"
        title="Delete Warehouse"
        @close="openDeleteModal = false"
      >
        <div class="space-y-4">
          <p class="text-gray-600">
            Are you sure want to delete this warehouse?
          </p>

          <div class="flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="soft"
              @click="openDeleteModal = false"
            >
              Cancel
            </UButton>

            <BaseButton color="error" @click="confirmDeleteWarehouse">
              Delete
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
