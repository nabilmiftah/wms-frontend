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

      <div class="flex items-center py-4 text-blue-600 text-xs font-bold italic">
        <hr class="flex-grow border-slate-100" /> 
        <span class="px-4 uppercase">Or</span> 
        <hr class="flex-grow border-slate-100" />
      </div>

      <button class="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-slate-50">
        <img src="/icon-google.png" class="w-5" alt="Google" /> 
        Google
      </button>
    </div>
  </AuthLayout>
</template>