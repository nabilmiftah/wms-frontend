<script setup lang="ts">
import { X } from 'lucide-vue-next';
defineProps({
  open: {
    type: Boolean,
    default: false
  },

  title: {
    type: String,
    default: 'Modal Title'
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <UModal :open="open" @update:open="emit('close')">
    <template #content>
      <div class="bg-white p-6 space-y-5">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-[#0B1C30]">
            {{ title }}
          </h2>

          <UButton
            color="neutral"
            variant="ghost"
            @click="emit('close')"
          >
            <X />
          </UButton>
        </div>

        <slot />
      </div>
    </template>
  </UModal>
</template>