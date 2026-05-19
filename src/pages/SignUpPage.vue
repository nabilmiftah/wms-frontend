<script setup>
import AuthLayout from './AuthLayout.vue';
import { ref } from 'vue';

const name = ref('');
const email = ref('');
const password = ref('');
const rePassword = ref('');
</script>

<template>
  <AuthLayout>
    <h3 class="text-2xl font-bold text-slate-800 mb-2">Sign Up</h3>
    <p class="text-sm text-slate-500 mb-8">Access your warehouse management dashboard.</p>

    <form @submit.prevent class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">Nama</label>
        <input v-model="name" type="text" placeholder="Your Name" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">Email</label>
        <input v-model="email" type="email" placeholder="your@email.com" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>
      
      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">Password</label>
        <input v-model="password" type="password" placeholder="********" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">Re-Password</label>
        <input v-model="rePassword" type="password" placeholder="********" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
      </div>

      <button class="w-full bg-[#0052CC] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition mt-4 shadow-lg shadow-blue-100">
        Register
      </button>
      
      <div class="flex items-center my-4 text-blue-600 text-xs font-bold italic">
        <hr class="flex-grow border-slate-100" /> <span class="px-4 uppercase">Or</span> <hr class="flex-grow border-slate-100" />
      </div>

      <button type="button" class="w-full border border-slate-200 py-3 rounded-xl flex items-center justify-center gap-3 font-bold text-slate-700 hover:bg-slate-50 transition">
        <img src="/icon-google.png" class="w-5" alt="Google" /> Google
      </button>

      <p class="text-center text-[11px] mt-6 text-slate-500">
        Do you have an account? <router-link to="/signin" class="text-blue-600 font-bold underline">login here</router-link>
      </p>
    </form>
  </AuthLayout>
</template>