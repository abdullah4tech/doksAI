<template>
  <button
    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-full border border-gray-800 transition-all duration-200 hover:bg-gray-900"
    @click="handleClick"
    :title="`Last checked: ${apiStatusStore.lastChecked ? new Date(apiStatusStore.lastChecked).toLocaleTimeString() : 'Never'}`"
  >
    <!-- Status indicator dot -->
    <span class="relative flex h-2 w-2">
      <span
        v-if="apiStatusStore.isHealthy && !apiStatusStore.isLoading"
        class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"
      ></span>
      <span
        :class="[
          'relative inline-flex rounded-full h-2 w-2',
          apiStatusStore.isLoading
            ? 'bg-gray-400 animate-pulse'
            : apiStatusStore.isHealthy
              ? 'bg-green-500'
              : 'bg-red-500',
        ]"
      ></span>
    </span>

    <!-- Status text -->
    <span>{{ apiStatusStore.statusText }}</span>
  </button>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { useApiStatusStore } from '@/store/apiStatus'

const apiStatusStore = useApiStatusStore()

onMounted(() => {
  // Start smart monitoring with adaptive intervals
  apiStatusStore.startMonitoring()
})

onUnmounted(() => {
  // Stop monitoring when component unmounts (optional, could keep running globally)
  // apiStatusStore.stopMonitoring()
})

const handleClick = () => {
  // Force a health check when clicked
  apiStatusStore.checkHealth(true)
}
</script>

<style scoped></style>
