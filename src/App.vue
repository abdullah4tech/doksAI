<script setup lang="ts">
import ToastContainer from '@/components/ToastContainer.vue'
import OfflineModal from '@/components/OfflineModal.vue'
import { useNetworkStatus } from '@/composables/useNetworkStatus'

const { showOfflineModal, dismissModal } = useNetworkStatus()
</script>

<template>
  <router-view />
  <ToastContainer />

  <!-- Offline Detection Modal -->
  <Transition name="modal">
    <OfflineModal v-if="showOfflineModal" @close="dismissModal" />
  </Transition>
</template>

<style scoped>
/* Modal entrance/exit animations */
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}
</style>
