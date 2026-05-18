<script>
import AppSidebar from '../sidebar/AppSidebar.vue';
</script>

<template>
    <div class="flex min-h-screen bg-[#f5f7fb]">
        <AppSidebar />

        <main class="flex-1 overflow-auto p-8">
            <slot />
        </main>
    </div>
</template>