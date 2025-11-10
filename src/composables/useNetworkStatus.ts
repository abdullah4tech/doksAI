import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine)
  const showOfflineModal = ref(false)

  const handleOnline = () => {
    isOnline.value = true
    showOfflineModal.value = false
    console.log('🟢 Network: Online')
  }

  const handleOffline = () => {
    isOnline.value = false
    showOfflineModal.value = true
    console.log('🔴 Network: Offline')
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    if (!navigator.onLine) {
      showOfflineModal.value = true
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  const dismissModal = () => {
    showOfflineModal.value = false
  }

  return {
    isOnline,
    showOfflineModal,
    dismissModal,
  }
}
