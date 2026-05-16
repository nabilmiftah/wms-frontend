<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-950">
    <UCard class="w-96">
      <template #header>
        <h1 class="text-xl font-bold">
          Dashboard
        </h1>
      </template>

      <div class="space-y-4">
        <UInput placeholder="Masukkan nama..." />

        <UButton block>
          Submit
        </UButton>
      </div>
    </UCard>
  </div>
</template> 