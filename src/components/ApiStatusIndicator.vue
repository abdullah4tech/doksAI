<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ragAPI } from '@/services/api'

const isHealthy = ref<boolean | null>(null)
const isLoading = ref(true)

const checkHealth = async () => {
  try {
    isLoading.value = true
    const health = await ragAPI.getHealth()
    isHealthy.value = health.status === 'healthy'
  } catch {
    isHealthy.value = false
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  checkHealth()
  // Check health every 30 seconds
  setInterval(checkHealth, 30000)
})
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <div v-if="isLoading" class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      <div
        v-else
        :class="['w-2 h-2 rounded-full', isHealthy ? 'bg-green-500' : 'bg-red-500']"
      ></div>
      <div
        v-if="isHealthy && !isLoading"
        class="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"
      ></div>
    </div>
    <span class="text-xs text-gray-600">
      {{ isLoading ? 'Checking...' : isHealthy ? 'API Connected' : 'API Offline' }}
    </span>
  </div>
</template>
