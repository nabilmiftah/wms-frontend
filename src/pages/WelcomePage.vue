<script setup>
import AuthLayout from './AuthLayout.vue';
</script>

<template>
  <AuthLayout>
    <h3 class="text-2xl font-bold text-slate-800 mb-2 text-left">Welcome Back</h3>
    <p class="text-sm text-slate-500 mb-10 text-left">Access your warehouse management dashboard.</p>

    <div class="space-y-4">
      <router-link 
        to="/signin" 
        class="block w-full bg-[#0052CC] text-white py-3 rounded-xl font-bold text-center hover:bg-blue-700 transition shadow-lg shadow-blue-100"
      >
        Sign In
      </router-link>

      <router-link 
        to="/signup" 
        class="block w-full border border-[#0052CC] text-[#0052CC] py-3 rounded-xl font-bold text-center hover:bg-blue-50 transition"
      >
        Sign Up
      </router-link>
    </div>
  </AuthLayout>
</template>