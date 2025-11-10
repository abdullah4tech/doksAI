<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const reload = () => {
  window.location.reload()
}
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[10000] p-4"
  >
    <div class="modal-content bg-white rounded-2xl w-full max-w-md shadow-2xl" @click.stop>
      <div class="p-8 text-center">
        <!-- Offline Icon -->
        <div class="mb-6 flex justify-center">
          <div class="relative">
            <svg
              class="w-20 h-20 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <!-- Animated pulse -->
            <div
              class="absolute inset-0 w-20 h-20 bg-red-500 rounded-full opacity-20 animate-ping"
            ></div>
          </div>
        </div>

        <!-- Content -->
        <h2 class="text-2xl font-bold text-gray-900 mb-3">No Internet Connection</h2>
        <p class="text-gray-600 mb-6 leading-relaxed">
          It looks like you're offline. Please check your internet connection and try again.
        </p>

        <!-- Tips -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p class="text-sm font-semibold text-gray-700 mb-2">Try these steps:</p>
          <ul class="text-sm text-gray-600 space-y-1">
            <li class="flex items-start gap-2">
              <span class="text-gray-400 mt-0.5">•</span>
              <span>Check your WiFi or mobile data connection</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-gray-400 mt-0.5">•</span>
              <span>Verify that airplane mode is turned off</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-gray-400 mt-0.5">•</span>
              <span>Try restarting your router or device</span>
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3">
          <button
            @click="reload"
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Try Again
          </button>
          <button
            @click="emit('close')"
            class="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Professional modal animations */
.modal-backdrop {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content {
  animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
