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
  let currentInterval = 30000 // Start with 30 seconds
  let failureCount = 0

  // Smart intervals based on status
  const INTERVALS = {
    HEALTHY: 30000, // 30 seconds when healthy
    RECOVERING: 15000, // 15 seconds when recovering from failure
    FAILED: 60000, // 1 minute when failed
    MAX_BACKOFF: 300000, // Max 5 minutes
  }

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

        // Adjust monitoring interval based on status change
        if (newStatus) {
          // API recovered - reset failure count
          failureCount = 0
          currentInterval = INTERVALS.HEALTHY
        } else {
          // API went down - use recovering interval initially
          failureCount++
          currentInterval = INTERVALS.RECOVERING
        }

        // Restart monitoring with new interval
        if (healthCheckInterval) {
          restartMonitoring()
        }
      } else {
        // Status unchanged - just update timestamp
        lastChecked.value = new Date()
      }
    } catch (error) {
      const newStatus = false

      // Check if it's a network error (user is offline)
      const isNetworkError = error instanceof TypeError && error.message.includes('Failed to fetch')

      // Only update if status actually changed or it's the first check
      if (isHealthy.value !== newStatus || isHealthy.value === null) {
        isHealthy.value = newStatus
        lastChecked.value = new Date()
        checkCount.value++

        if (isNetworkError) {
          console.warn('API health check failed: Network error (user may be offline)')
        } else {
          console.warn('API health check failed:', error)
        }

        // Increase failure count and apply exponential backoff
        failureCount++
        currentInterval = Math.min(
          INTERVALS.FAILED * Math.pow(1.5, failureCount - 1),
          INTERVALS.MAX_BACKOFF,
        )

        // Restart monitoring with backoff interval
        if (healthCheckInterval) {
          restartMonitoring()
        }
      } else {
        lastChecked.value = new Date()
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

  const startMonitoring = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval)
    }

    // Reset to healthy interval on start
    currentInterval = INTERVALS.HEALTHY
    failureCount = 0

    // Initial check
    checkHealth()

    // Set up periodic monitoring with current interval
    healthCheckInterval = setInterval(() => checkHealth(), currentInterval)

    // Pause monitoring when tab is inactive to save resources
    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  const restartMonitoring = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval)
      healthCheckInterval = setInterval(() => checkHealth(), currentInterval)
    }
  }

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab inactive - stop monitoring to save resources
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval)
        healthCheckInterval = null
      }
    } else {
      // Tab active again - check immediately and resume monitoring
      if (!healthCheckInterval) {
        checkHealth()
        healthCheckInterval = setInterval(() => checkHealth(), currentInterval)
      }
    }
  }

  const stopMonitoring = () => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval)
      healthCheckInterval = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  const reset = () => {
    isHealthy.value = null
    isLoading.value = true
    lastChecked.value = null
    checkCount.value = 0
    failureCount = 0
    currentInterval = INTERVALS.HEALTHY
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
