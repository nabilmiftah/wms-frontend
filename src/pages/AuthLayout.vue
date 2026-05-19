<template>
  <div class="flex min-h-screen bg-white font-inter">
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
      <div class="w-full max-w-md border border-blue-100 rounded-[40px] p-10 shadow-sm">
        <div class="flex items-center gap-2 mb-8">
          <img src="/logo-wms.png" alt="Logo" class="w-10" />
          <h2 class="text-xl font-bold text-[#001D4A] tracking-tight">
            LOGISTICS <span class="text-blue-600">CORE</span>
          </h2>
        </div>
        <slot></slot>
      </div>
    </div>

    <div class="hidden lg:block lg:w-1/2 relative overflow-hidden">
      <img 
        src="/wms-bg.png" 
        class="absolute inset-0 w-full h-full object-cover" 
        alt="Warehouse Background"
      />
      <div class="absolute inset-0 bg-black/10"></div>
    </div>
  </div>
</template>