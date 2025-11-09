<script setup lang="ts">
import type { Toast } from '@/store/toast'

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  close: []
}>()

const getToastStyles = () => {
  const baseStyles =
    'flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300'

  switch (props.toast.type) {
    case 'success':
      return `${baseStyles} bg-green-50/95 border-green-200 text-green-900`
    case 'error':
      return `${baseStyles} bg-red-50/95 border-red-200 text-red-900`
    case 'warning':
      return `${baseStyles} bg-yellow-50/95 border-yellow-200 text-yellow-900`
    case 'info':
      return `${baseStyles} bg-blue-50/95 border-blue-200 text-blue-900`
    default:
      return `${baseStyles} bg-white/95 border-gray-200 text-gray-900`
  }
}

const getIconColor = () => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-gray-500'
  }
}
</script>

<template>
  <div :class="getToastStyles()" role="alert">
    <!-- Icon -->
    <div class="flex-shrink-0 mt-0.5">
      <!-- Success Icon -->
      <svg
        v-if="toast.type === 'success'"
        :class="getIconColor()"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <!-- Error Icon -->
      <svg
        v-else-if="toast.type === 'error'"
        :class="getIconColor()"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <!-- Warning Icon -->
      <svg
        v-else-if="toast.type === 'warning'"
        :class="getIconColor()"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>

      <!-- Info Icon -->
      <svg
        v-else-if="toast.type === 'info'"
        :class="getIconColor()"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold">{{ toast.title }}</p>
      <p v-if="toast.description" class="text-sm mt-1 opacity-90">{{ toast.description }}</p>
    </div>

    <!-- Close Button -->
    <button
      @click="emit('close')"
      class="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-black/5"
      aria-label="Close notification"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>
