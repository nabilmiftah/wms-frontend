<script setup lang="ts">
import { ref } from "vue";

import { Pencil, Trash2, Search, Plus } from "lucide-vue-next";

import BaseButton from "../base/BaseButton.vue";
import BaseInput from "../base/BaseInput.vue";
import BaseModal from "../base/BaseModal.vue";
import MainLayout from "../layouts/MainLayout.vue";
import { computed } from "vue";

const openModal = ref(false);
const search = ref("");

const userNumber = ref("");
const userName = ref("");
const email = ref("");
const telephone = ref("");

const userNameError = ref('')
const emailError = ref('')
const phoneError = ref('')

const isEdit = ref(false);

const selectedId = ref<number | null>(null);

const users = ref([
  {
    id: 1,
    number: "USR_01",
    name: "John Doe",
    email: "john.doe@example.com",
    telephone: "+6281234567890",
  },
  {
    id: 2,
    number: "USR_02",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    telephone: "+6281234567891",
  },
  {
    id: 3,
    number: "USR_03",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    telephone: "+6281234567892",
  },
]);     


const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const keyword = search.value.toLowerCase();

    return (
      user.number.toLowerCase().includes(keyword) ||
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.telephone.toLowerCase().includes(keyword)
    );
  });
});

const generateUserNumber = () => {
  const nextNumber = users.value.length + 1;

  return `USR_${String(nextNumber).padStart(2, "0")}`;
};

const openAddModal = () => {
  userNumber.value = generateUserNumber();

  openModal.value = true;
};

const saveUser = () => {
  userNameError.value = ""
  emailError.value = ""
  phoneError.value = ""

  if (!userName.value) {
    userNameError.value =
      "User name wajib diisi"

    return
  }

  if (!email.value) {
    emailError.value =
      "Email wajib diisi"

    return
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email.value)) {
    emailError.value =
      "Email tidak valid"

    return
  }

  if (!telephone.value) {
    phoneError.value =
      "Nomor telepon wajib diisi"

    return
  }

  const phoneRegex = /^[0-9]+$/

  if (!phoneRegex.test(telephone.value)) {
    phoneError.value =
      "Nomor telepon hanya boleh angka"

    return
  }

  if (isEdit.value) {
    const index = users.value.findIndex(
      (user) =>
        user.id === selectedId.value,
    );

    users.value[index] = {
      id: selectedId.value,
      number: userNumber.value,
      name: userName.value,
      email: email.value,
      telephone: telephone.value,
    };
  } else {
    users.value.push({
      id: Date.now(),
      number: userNumber.value,
      name: userName.value,
      email: email.value,
      telephone: telephone.value,
    });
  }

  resetForm();
};

const resetForm = () => {
  userNumber.value = "";
  userName.value = "";
  email.value = "";
  telephone.value = "";

  isEdit.value = false;
  selectedId.value = null;

  openModal.value = false;
};

const editUser = (user: any) => {
  isEdit.value = true;

  selectedId.value = user.id;

  userNumber.value = user.number;
  userName.value = user.name;
  email.value = user.email;
  telephone.value = user.telephone;

  openModal.value = true;
};

const deleteUser = (id: number) => {
  users.value = users.value.filter((user) => user.id !== id);
};
</script>

<template>
  <MainLayout>
    <div class="flex min-h-screen bg-[#f5f7fb]">
      <main class="flex-1 p-8 space-y-6 overflow-auto">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User</h1>

          <p class="text-sm text-gray-500 mt-1">Kelola master data user</p>
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
                placeholder="Search user"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            </div>

            <BaseButton color="brand" @click="openAddModal">
              <div class="flex items-center gap-2">
                <Plus class="w-4 h-4" />
                Add User
              </div>
            </BaseButton>
          </div>

          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">
                    User Number
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">
                    User Name
                  </th>

                  <th class="text-left px-4 py-3 font-semibold">Email</th>

                  <th class="text-left px-4 py-3 font-semibold">Telephone</th>

                  <th class="text-center px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="border-t border-gray-100 hover:bg-gray-50 transition"
                >
                  <td class="px-4 py-3 text-gray-700">
                    {{ user.number }}
                  </td>

                  <td class="px-4 py-3 font-medium text-gray-900">
                    {{ user.name }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ user.email }}
                  </td>

                  <td class="px-4 py-3 text-gray-700">
                    {{ user.telephone }}
                  </td>

                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                        @click="editUser(user)"
                      >
                        <Pencil class="w-4 h-4" />
                      </button>

                      <button
                        class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                        @click="deleteUser(user.id)"
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
        title="Add User"
        @close="openModal = false"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              User Number
            </label>

            <BaseInput
              class="block mb-2"
              v-model="userNumber"
              placeholder="User Number"
              disabled
            />
            <label class="text-xs font-medium text-[#434655] block mb-2 italic">
              Auto-generated by system
            </label>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              User Name
            </label>

            <BaseInput v-model="userName" placeholder="User Name" />
            <p class="text-red-500 text-xs mt-1" v-if="userNameError">
              {{ userNameError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Email
            </label>

            <BaseInput v-model="email" type="email" placeholder="User Email"  " />
            <p class="text-red-500 text-xs mt-1" v-if="emailError">
              {{ emailError }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-[#434655] block mb-2">
              Telephone Number
            </label>

            <BaseInput v-model="telephone" type="tel" placeholder="08xxxxxxx" " />
            <p class="text-red-500 text-xs mt-1" v-if="phoneError">
              {{ phoneError }}
            </p>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <UButton color="neutral" variant="soft" @click="openModal = false">
              Cancel
            </UButton>

            <BaseButton color="brand" @click="saveUser">
              {{ isEdit ? "Update" : "Save" }}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  </MainLayout>
</template>
