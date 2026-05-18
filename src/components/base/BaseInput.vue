<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: "",
  },

  placeholder: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    default: "text",
  },

  textarea: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <UTextarea
    v-if="textarea"
    :model-value="modelValue"
    :placeholder="placeholder"
    :rows="4"
    class="w-full"
    :ui="{
      base: 'bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#004AC6]',
    }"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <UInput
    v-else
    :disabled="disabled"
    :model-value="modelValue"
    :placeholder="placeholder"
    :type="type"
    class="w-full"
    :ui="{
      base:
        (disabled ? 'bg-[#E5EEFF]' : 'bg-white') +
        ' border border-gray-200 rounded-xl text-gray-900 placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#004AC6]',
    }"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
