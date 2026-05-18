<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: "",
  },

  items: {
    type: Array,
    default: () => [],
  },

  placeholder: {
    type: String,
    default: "Select Option",
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <USelect
    :model-value="modelValue"
    :items="items"
    :placeholder="placeholder"
    class="w-full"
    :ui="{
      base: 'bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-[#94A3B8] hover:bg-gray-200',
      content: 'bg-white border border-gray-200 rounded-xl shadow-lg ',
      item: ' text-gray-900 ',
      active: ' bg-white text-gray-900',
    }"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
