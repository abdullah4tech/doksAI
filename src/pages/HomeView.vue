<script setup lang="ts">
import { useRouter } from 'vue-router'
import FileIcon from '../assets/FileIcon.vue'
import LogoText from '@/components/LogoText.vue'

const router = useRouter()

const startChat = () => {
  router.push('/chat')
}
</script>

<template>
  <div class="flex flex-col justify-center items-center h-[100vh] pb-15 border relative">
    <FileIcon class="left-[850px] bottom-[220px] h-10 w-10 relative fill-gray-300 hover:fill-black transition-colors duration-300 cursor-pointer" />

    <!-- Title -->
    <LogoText class="text-8xl mt-10" />

    <!-- Textarea + Button -->
    <div class="mt-20 border w-[40rem] flex items-center rounded-xl overflow-hidden">
      <textarea
        placeholder="Message Doks AI..."
        class="p-4 w-full text-lg resize-none focus:outline-none"
        rows="1"
        @keydown.enter.prevent="startChat"
      ></textarea>
      <button
        @click="startChat"
        class="border-l px-6 py-3 text-lg font-medium hover:bg-gray-100 cursor-pointer transition"
      >
        Send
      </button>
    </div>
  </div>
</template>
