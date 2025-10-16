<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ragAPI, type HealthResponse } from '@/services/api'

const health = ref<HealthResponse | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const checkHealth = async () => {
  try {
    isLoading.value = true
    error.value = null
    health.value = await ragAPI.getHealth()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to connect to API'
    health.value = null
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  checkHealth()
})

const getStatusColor = (status: string) => {
  return status === 'healthy' ? 'text-green-600' : 'text-red-600'
}

const getStatusBgColor = (status: string) => {
  return status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
}
</script>

<template>
  <div class="bg-white border rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold text-gray-800">API Status</h3>
      <button
        @click="checkHealth"
        :disabled="isLoading"
        class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
        :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
      >
        {{ isLoading ? 'Checking...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
      <p class="text-sm text-gray-600 mt-2">Checking API status...</p>
    </div>

    <div v-else-if="error" class="text-center py-4">
      <div class="text-red-500 mb-2">⚠️</div>
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="health" class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Overall Status:</span>
        <span
          :class="[
            'px-2 py-1 rounded text-xs font-medium',
            getStatusColor(health.status),
            getStatusBgColor(health.status),
          ]"
        >
          {{ health.status }}
        </span>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">API Service:</span>
          <span
            :class="[
              'px-2 py-1 rounded text-xs',
              getStatusColor(health.services.api),
              getStatusBgColor(health.services.api),
            ]"
          >
            {{ health.services.api }}
          </span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Vector Database (Qdrant):</span>
          <span
            :class="[
              'px-2 py-1 rounded text-xs',
              getStatusColor(health.services.qdrant),
              getStatusBgColor(health.services.qdrant),
            ]"
          >
            {{ health.services.qdrant }}
          </span>
        </div>
      </div>

      <div class="text-xs text-gray-500 pt-2 border-t">
        Last updated: {{ new Date(health.timestamp).toLocaleString() }}
      </div>
    </div>
  </div>
</template>
