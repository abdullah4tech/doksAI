<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileIcon from '../assets/FileIcon.vue'
import LogoText from '@/components/LogoText.vue'
import PdfModal from '@/components/PdfModal.vue'
import ApiStatusIndicator from '@/components/ApiStatusIndicator.vue'
import { ref } from 'vue'
import { useChatStore } from '@/store'

const router = useRouter()
const chatStore = useChatStore()

const message = ref<string>('')
const showPdfModal = ref(false)

const startChat = () => {
  if (!message.value.trim()) return

  const sessionId = chatStore.createSession(message.value.trim())
  router.push(`/c/${sessionId}`)
}

const openPdfModal = () => {
  showPdfModal.value = true
}

const closePdfModal = () => {
  showPdfModal.value = false
}
</script>

<template>
  <div class="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 relative">
    <!-- API Status Indicator - bottom left -->
    <div class="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8">
      <ApiStatusIndicator />
    </div>

    <!-- Upload button - positioned responsively -->
    <button
      @click="openPdfModal"
      class="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 group"
    >
      <FileIcon
        class="h-5 w-5 sm:h-6 sm:w-6 fill-gray-600 group-hover:fill-black transition-colors"
      />
    </button>

    <!-- Main content container -->
    <div class="flex flex-col items-center w-full max-w-4xl mx-auto">
      <!-- Logo -->
      <LogoText
        class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 sm:mb-12 lg:mb-16 text-center"
      />

      <!-- Input container -->
      <div class="w-full max-w-2xl">
        <div
          class="border border-gray-300 flex items-center rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <textarea
            placeholder="Message Doks AI..."
            class="p-3 sm:p-4 w-full text-base sm:text-lg resize-none focus:outline-none bg-transparent"
            rows="1"
            v-model="message"
            @keydown.enter.prevent="startChat"
          ></textarea>
          <button
            @click="startChat"
            :disabled="!message.trim()"
            class="border-l border-gray-300 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium transition-colors duration-200"
            :class="
              message.trim()
                ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            "
          >
            Send
          </button>
        </div>

        <!-- Helper text -->
        <p class="text-xs sm:text-sm text-gray-500 text-center mt-3 px-2">
          Start a conversation with your documents
        </p>
      </div>
    </div>

    <PdfModal v-if="showPdfModal" @close="closePdfModal" />
  </div>
</template>
