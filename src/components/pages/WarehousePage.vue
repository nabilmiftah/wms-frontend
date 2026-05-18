<script setup lang="ts">
import { ref } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../base/BaseButton.vue";
import BaseInput from "../base/BaseInput.vue";
import BaseModal from "../base/BaseModal.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { computed } from 'vue'

const openModal = ref(false);
const search = ref('')

const warehouseCode = ref("");
const warehouseName = ref("");
const city = ref("");
const description = ref("");

const isEdit = ref(false);

const selectedId = ref<number | null>(null);

const warehouses = ref([
  {
    id: 1,
    code: "WH_01",
    name: "Gudang Jogja",
    city: "Sleman",
    description: "Gudang barang inti Jogja",
  },
  {
    id: 2,
    code: "WH_02",
    name: "Gudang Bandung",
    city: "Cimahi",
    description: "Gudang distribusi Jawa Barat",
  },
  {
    id: 3,
    code: "WH_03",
    name: "Gudang Jakarta",
    city: "Cakung",
    description: "Gudang barang impor",
  },
]);

const filteredWarehouses = computed(() => {
  return warehouses.value.filter(warehouse => {
    const keyword = search.value.toLowerCase()

    return (
      warehouse.code.toLowerCase().includes(keyword) ||
      warehouse.name.toLowerCase().includes(keyword) ||
      warehouse.city.toLowerCase().includes(keyword)
    )
  })
})

const generateWarehouseCode = () => {
  const nextNumber = warehouses.value.length + 1;

  return `WH_${String(nextNumber).padStart(2, "0")}`;
};

const openAddModal = () => {
  warehouseCode.value = generateWarehouseCode();

  openModal.value = true;
};

const saveWarehouse = () => {
  if (isEdit.value) {
    const index = warehouses.value.findIndex(
      (warehouse) => warehouse.id === selectedId.value,
    );

    warehouses.value[index] = {
      id: selectedId.value,
      code: warehouseCode.value,
      name: warehouseName.value,
      city: city.value,
      description: description.value,
    };
  } else {
    warehouses.value.push({
      id: Date.now(),
      code: warehouseCode.value,
      name: warehouseName.value,
      city: city.value,
      description: description.value,
    });
  }

  resetForm();
};

const resetForm = () => {
  warehouseCode.value = "";
  warehouseName.value = "";
  city.value = "";
  description.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editWarehouse = (warehouse: any) => {
  isEdit.value = true;

  selectedId.value = warehouse.id;

  warehouseCode.value = warehouse.code;
  warehouseName.value = warehouse.name;
  city.value = warehouse.city;
  description.value = warehouse.description;

  openModal.value = true;
};

const deleteWarehouse = (id: number) => {
  warehouses.value = warehouses.value.filter(
    (warehouse) => warehouse.id !== id,
  );
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

                  <th class="text-left px-4 py-3 font-semibold">Description</th>

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
                    {{ warehouse.code }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ warehouse.name }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ warehouse.city }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ warehouse.description }}
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
                        @click="deleteWarehouse(warehouse.id)"
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
        title="Add Warehouse"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse Code
            </label>

            <BaseInput
              class="block mb-2"
              v-model="warehouseCode"
              placeholder="Warehouse Code"
              disabled
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Warehouse Name
            </label>

            <BaseInput
              v-model="warehouseName"
              placeholder="Gudang Central Jakarta"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              City
            </label>

            <BaseInput v-model="city" placeholder="City or Region" />
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Description
            </label>

            <BaseInput
              v-model="description"
              :textarea="true"
              placeholder="Provide additional details about this facility..."
            />
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
    </div>
  </MainLayout>
</template>
