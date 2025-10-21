import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ragAPI } from '@/services/api'

export interface ApiStatus {
  isHealthy: boolean | null
  isLoading: boolean
  lastChecked: Date | null
  checkCount: number
}

export const useApiStatusStore = defineStore('apiStatus', () => {
  // State
  const isHealthy = ref<boolean | null>(null)
  const isLoading = ref(true)
  const lastChecked = ref<Date | null>(null)
  const checkCount = ref(0)

  let healthCheckInterval: number | null = null

  // Getters
  const status = computed(
    (): ApiStatus => ({
      isHealthy: isHealthy.value,
      isLoading: isLoading.value,
      lastChecked: lastChecked.value,
      checkCount: checkCount.value,
    }),
  )

  const statusText = computed(() => {
    if (isLoading.value) return 'Checking...'
    return isHealthy.value ? 'API Online' : 'API Offline'
  })

  const statusColor = computed(() => {
    if (isLoading.value) return 'gray'
    return isHealthy.value ? 'green' : 'red'
  })

  // Actions
  const checkHealth = async (force = false) => {
    try {
      // Don't show loading for periodic checks, only initial or forced
      if (isHealthy.value === null || force) {
        isLoading.value = true
      }

      const health = await ragAPI.getHealth()
      const newStatus = health.status === 'healthy'

      // Only update if status actually changed or it's the first check
      if (isHealthy.value !== newStatus || isHealthy.value === null) {
        isHealthy.value = newStatus
        lastChecked.value = new Date()
        checkCount.value++

        // Log status changes
        console.log(`API Status changed: ${newStatus ? 'Online' : 'Offline'}`)
      }
    } catch (error) {
      const newStatus = false

      // Only update if status actually changed or it's the first check
      if (isHealthy.value !== newStatus || isHealthy.value === null) {
        isHealthy.value = newStatus
        lastChecked.value = new Date()
        checkCount.value++

        console.warn('API health check failed:', error)
      }
    } finally {
      isLoading.value = false
    }
  }

  const markApiError = () => {
    // Immediately mark API as unhealthy when an API call fails
    if (isHealthy.value !== false) {
      console.log('API marked as offline due to failed request')
      isHealthy.value = false
      lastChecked.value = new Date()
      checkCount.value++
    }
  }

  const startMonitoring = (intervalMs = 3000) => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval)
    }

    // Initial check
    checkHealth()

    // Set up periodic monitoring
    healthCheckInterval = setInterval(() => checkHealth(), intervalMs)
  }

  const stopMonitoring = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval)
      healthCheckInterval = null
    }
  }

  const reset = () => {
    isHealthy.value = null
    isLoading.value = true
    lastChecked.value = null
    checkCount.value = 0
    stopMonitoring()
  }

  return {
    // State
    isHealthy,
    isLoading,
    lastChecked,
    checkCount,

    // Getters
    status,
    statusText,
    statusColor,

    // Actions
    checkHealth,
    markApiError,
    startMonitoring,
    stopMonitoring,
    reset,
  }
})
