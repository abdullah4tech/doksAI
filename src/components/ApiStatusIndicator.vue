<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ragAPI } from '@/services/api'

const isHealthy = ref<boolean | null>(null)
const isLoading = ref(true)
let healthCheckInterval: number

const checkHealth = async () => {
  try {
    // Don't show loading for periodic checks, only initial
    if (isHealthy.value === null) {
      isLoading.value = true
    }
    
    const health = await ragAPI.getHealth()
    isHealthy.value = health.status === 'healthy'
  } catch (error) {
    isHealthy.value = false
    console.warn('API health check failed:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  checkHealth()
  // Check health every 10 seconds for more real-time updates
  healthCheckInterval = setInterval(checkHealth, 10000)
})

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }
})
</script>

<template>
  <div class="flex items-center gap-2 group cursor-pointer" @click="checkHealth">
    <div class="relative">
      <div v-if="isLoading" class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      <div
        v-else
        :class="[
          'w-2 h-2 rounded-full transition-all duration-200', 
          isHealthy ? 'bg-green-500' : 'bg-red-500',
          'group-hover:scale-110'
        ]"
      ></div>
      <div
        v-if="isHealthy && !isLoading"
        class="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"
      ></div>
    </div>
    <span class="text-xs text-gray-600 group-hover:text-gray-800 transition-colors">
      {{ isLoading ? 'Checking...' : isHealthy ? 'API Online' : 'API Offline' }}
    </span>
  </div>
</template>
