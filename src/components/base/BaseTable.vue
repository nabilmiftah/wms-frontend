<script setup lang="ts">
defineProps({
  columns: {
    type: Array,
    required: true
  },

  rows: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="rounded-xl overflow-hidden border border-gray-800">
    <UTable
      :columns="columns"
      :data="rows"
    />
  </div>
</template>