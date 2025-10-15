<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileIcon from '../assets/FileIcon.vue'
import LogoText from '@/components/LogoText.vue'
import PdfModal from '@/components/PdfModal.vue'
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
  <div class="flex flex-col justify-center items-center h-[100vh] pb-15 border relative">
    <FileIcon
      @click="openPdfModal"
      class="left-[850px] bottom-[220px] h-10 w-10 relative fill-gray-300 hover:fill-black transition-colors duration-300 cursor-pointer"
    />

    <LogoText class="text-8xl mt-10" />

    <div class="mt-20 border w-[40rem] flex items-center rounded-xl overflow-hidden">
      <textarea
        placeholder="Message Doks AI..."
        class="p-4 w-full text-lg resize-none focus:outline-none"
        rows="1"
        v-model="message"
        @keydown.enter.prevent="startChat"
      ></textarea>
      <button
        @click="startChat"
        class="border-l px-6 py-3 text-lg font-medium hover:bg-gray-100 cursor-pointer transition"
      >
        Send
      </button>
    </div>

    <PdfModal v-if="showPdfModal" @close="closePdfModal" />
  </div>
</template>
