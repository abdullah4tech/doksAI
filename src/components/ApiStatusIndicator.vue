<script setup lang="ts">
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

const getTimeSinceLastCheck = () => {
  if (!apiStatusStore.lastChecked) return ''

  const now = new Date()
  const diff = now.getTime() - apiStatusStore.lastChecked.getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) {
    return `${seconds}s ago`
  } else {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }
}
</script>

<template>
  <div
    v-motion
    :initial="{ opacity: 0, scale: 0.8 }"
    :enter="{
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    }"
    class="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:bg-gray-50 px-2 py-1 rounded-md hover:scale-105"
    @click="handleClick"
    :title="`Last checked: ${apiStatusStore.lastChecked ? new Date(apiStatusStore.lastChecked).toLocaleTimeString() : 'Never'} | Checks: ${apiStatusStore.checkCount}`"
  >
    <div class="relative">
      <!-- Loading indicator -->
      <div
        v-if="apiStatusStore.isLoading"
        class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
      ></div>

      <!-- Status indicator -->
      <div
        v-else
        :class="[
          'w-2 h-2 rounded-full transition-all duration-300 ease-in-out',
          apiStatusStore.isHealthy ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200',
          'group-hover:scale-125 shadow-sm',
        ]"
      ></div>

      <!-- Ping animation for healthy status -->
      <div
        v-if="apiStatusStore.isHealthy && !apiStatusStore.isLoading"
        class="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"
      ></div>

      <!-- Connection pulse for offline status -->
      <div
        v-if="apiStatusStore.isHealthy === false && !apiStatusStore.isLoading"
        class="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-pulse opacity-50"
      ></div>
    </div>

    <div class="flex flex-col">
      <span
        :class="[
          'text-xs font-medium transition-colors duration-200',
          apiStatusStore.isHealthy
            ? 'text-green-700'
            : apiStatusStore.isHealthy === false
              ? 'text-red-700'
              : 'text-gray-600',
          'group-hover:text-gray-900',
        ]"
      >
        {{ apiStatusStore.statusText }}
      </span>

      <!-- Last check time for better feedback -->
      <span
        v-if="apiStatusStore.lastChecked && !apiStatusStore.isLoading"
        class="text-xs text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
      >
        {{ getTimeSinceLastCheck() }}
      </span>
    </div>

    <!-- Manual refresh icon -->
    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        ></path>
      </svg>
    </div>
  </div>
</template>
