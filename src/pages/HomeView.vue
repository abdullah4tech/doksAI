<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileIcon from '../assets/FileIcon.vue'
import LogoText from '@/components/LogoText.vue'
import PdfModal from '@/components/PdfModal.vue'
import ApiStatusIndicator from '@/components/ApiStatusIndicator.vue'
import InteractiveGridPattern from '@/components/InteractiveGridPattern.vue'
import { ref, onMounted } from 'vue'
import { useChatStore } from '@/store'
import { useMotion } from '@vueuse/motion'
import gsap from 'gsap'

const router = useRouter()
const chatStore = useChatStore()

const message = ref<string>('')
const showPdfModal = ref(false)
const logoRef = ref()
const inputContainerRef = ref()
const uploadButtonRef = ref()
const statusIndicatorRef = ref()

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

// Advanced animations on mount
onMounted(() => {
  // Animate logo with GSAP
  if (logoRef.value) {
    gsap.fromTo(
      logoRef.value,
      {
        y: -50,
        opacity: 0,
        scale: 0.8,
      },
      {
        duration: 1.2,
        y: 0,
        opacity: 1,
        scale: 1,
        ease: 'elastic.out(1, 0.6)',
        delay: 0.1,
      },
    )
  }

  // Animate input container with Motion
  if (inputContainerRef.value) {
    useMotion(inputContainerRef.value, {
      initial: {
        opacity: 0,
        y: 30,
        scale: 0.95,
      },
      enter: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 800,
          delay: 400,
          type: 'spring',
          stiffness: 100,
          damping: 15,
        },
      },
    })
  }

  // Animate upload button
  if (uploadButtonRef.value) {
    gsap.fromTo(
      uploadButtonRef.value,
      {
        scale: 0,
        rotation: 180,
        opacity: 0,
      },
      {
        duration: 0.8,
        scale: 1,
        rotation: 0,
        opacity: 1,
        ease: 'back.out(1.7)',
        delay: 0.6,
      },
    )
  }

  // Animate status indicator
  if (statusIndicatorRef.value) {
    gsap.fromTo(
      statusIndicatorRef.value,
      {
        x: -50,
        opacity: 0,
      },
      {
        duration: 0.8,
        x: 0,
        opacity: 1,
        ease: 'power3.out',
        delay: 0.8,
      },
    )
  }
})
</script>

<template>
  <div
    class="flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8 relative overflow-hidden"
  >
    <!-- Interactive Grid Pattern Background -->
    <InteractiveGridPattern
      :class="'[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]'"
      :width="30"
      :height="30"
      :squares="[60, 60]"
      squares-class-name="hover:fill-sky-300"
    />

    <!-- API Status Indicator - bottom left with animation -->
    <div
      ref="statusIndicatorRef"
      class="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 z-50"
      style="visibility: visible"
    >
      <ApiStatusIndicator />
    </div>

    <!-- Upload button - positioned responsively with animation -->
    <button
      ref="uploadButtonRef"
      @click="openPdfModal"
      class="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-13 lg:right-20 p-2 sm:p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 group hover:scale-110 hover:rotate-12 z-50 opacity-100"
      style="visibility: visible"
    >
      <FileIcon
        class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-black transition-colors"
      />
    </button>

    <!-- Main content container -->
    <div class="flex flex-col items-center w-full max-w-4xl mx-auto z-10">
      <!-- Logo with ref for GSAP -->
      <div ref="logoRef" class="relative">
        <LogoText
          class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-8 sm:mb-12 lg:mb-16 text-center"
        />
        <!-- Experimental Version Badge -->
        <div
          class="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-[10px] sm:text-sm font-bold px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md sm:shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-300 animate-pulse"
        >
          v0.1.0-beta
        </div>
      </div>

      <!-- Input container with Motion -->
      <div ref="inputContainerRef" class="w-full max-w-2xl">
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
            class="border-l border-gray-300 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium transition-all duration-200"
            :class="
              message.trim()
                ? 'text-blue-600 hover:bg-blue-50 cursor-pointer hover:scale-105'
                : 'text-gray-400 cursor-not-allowed'
            "
          >
            Send
          </button>
        </div>

        <!-- Helper text with fade-in -->
        <p
          v-motion
          :initial="{ opacity: 0, y: 10 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 800 } }"
          class="text-xs sm:text-sm text-gray-500 text-center mt-3 px-2"
        >
          Start a conversation with your documents
        </p>
      </div>
    </div>

    <Transition name="modal">
      <PdfModal v-if="showPdfModal" @close="closePdfModal" />
    </Transition>
  </div>
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
