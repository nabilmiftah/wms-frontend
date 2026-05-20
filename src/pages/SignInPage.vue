<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AuthLayout from "./AuthLayout.vue";
import { toast } from "vue-sonner";
import { login } from "../services/auth.service";

const router = useRouter();

const loading = ref(false);

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;

    const response = await login({
      email: email.value,
      password: password.value,
    });

    console.log(response);

    localStorage.setItem("token", response.data.token);

    localStorage.setItem("user", JSON.stringify(response.data.user));

    toast.success("Login successful");

    router.push("/dashboard");
  } catch (error) {
    console.error(error);

    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    loading.value = false;
  }
};


</script>

<template>
  <AuthLayout>
    <h3 class="text-2xl font-bold text-slate-800 mb-2">Sign In</h3>
    <p class="text-sm text-slate-500 mb-8">
      Access your warehouse management dashboard.
    </p>

    <form @submit.prevent class="space-y-5">
      <div>
        <label class="block text-xs font-bold text-slate-800 mb-2">Email</label>
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          class="w-full px-4 py-3 text-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div class="relative">
        <label class="block text-xs font-bold text-slate-800 mb-2"
          >Password</label
        >
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="********"
          class="w-full px-4 py-3 rounded-xl text-black border border-slate-200 outline-none"
        />
        <button
          @click="showPassword = !showPassword"
          class="absolute right-4 top-10 text-slate-400"
        >
          <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
        </button>
      </div>

      <button
        type="button"
        :disabled="loading"
        @click.prevent="handleLogin"
        class="w-full bg-[#0052CC] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? "Loading..." : "Login" }}
      </button>

      <div
        class="flex items-center my-6 text-blue-600 text-xs font-bold italic"
      >
        <hr class="flex-grow border-slate-100" />
        <span class="px-4 uppercase">Or</span>
        <hr class="flex-grow border-slate-100" />
      </div>

      <button
        class="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700"
      >
        <img src="/icon-google.png" class="w-5" /> Google
      </button>

      <p class="text-center text-xs mt-6 text-slate-500">
        Don't have an account?
        <router-link to="/signup" class="text-blue-600 font-bold underline"
          >register here</router-link
        >
      </p>
    </form>
  </AuthLayout>
</template>
