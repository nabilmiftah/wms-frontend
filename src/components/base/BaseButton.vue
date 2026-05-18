<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: "primary",
  },

  loading: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
    default: "button",
  },
});
</script>

<template>
  <UButton
    :type="type"
    :loading="loading"
    :disabled="disabled"
    :color="color === 'brand' ? undefined : color"
    :class="
      color === 'brand' ? 'bg-[#004AC6] hover:bg-[#003a9c] text-white' : ''
    "
  >
    <slot />
  </UButton>
</template>
