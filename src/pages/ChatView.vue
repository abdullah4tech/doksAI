<script setup lang="ts">
import { ref, nextTick } from 'vue'
import FileIcon from '../assets/FileIcon.vue'
import LogoText from '@/components/LogoText.vue'
import ResponseIcon from '@/assets/ResponseIcon.vue'

interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: Date
  isStreaming?: boolean
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const isGenerating = ref(false)
let messageIdCounter = 0

const streamText = async (text: string, messageId: number, delay: number = 30) => {
  const messageIndex = messages.value.findIndex((m) => m.id === messageId)
  if (messageIndex === -1) return

  const message = messages.value[messageIndex]
  if (!message) return

  for (let i = 0; i <= text.length; i++) {
    message.content = text.substring(0, i)
    await nextTick()
    scrollToBottom()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  message.isStreaming = false
  isGenerating.value = false
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isGenerating.value) return

  // Add user message
  const userMessage: Message = {
    id: messageIdCounter++,
    content: inputMessage.value,
    isUser: true,
    timestamp: new Date(),
  }
  messages.value.push(userMessage)

  const currentInput = inputMessage.value
  inputMessage.value = ''
  isGenerating.value = true

  // Scroll to bottom
  await nextTick()
  scrollToBottom()

  // Add empty AI message that will be streamed
  const aiMessageId = messageIdCounter++
  const aiMessage: Message = {
    id: aiMessageId,
    content: '',
    isUser: false,
    timestamp: new Date(),
    isStreaming: true,
  }
  messages.value.push(aiMessage)

  // Simulate streaming response (replace with actual API call)
  setTimeout(() => {
    const fullResponse = `I understand you're asking about: "${currentInput}". This is where the RAG pipeline response would appear. The response is now being streamed character by character to provide a better user experience, similar to how ChatGPT displays its responses.`
    streamText(fullResponse, aiMessageId, 30)
  }, 500)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !isGenerating.value) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="flex flex-col h-[100vh] bg-white">
    <!-- Header -->
    <header class="px-50 pt-7 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <LogoText class="text-2xl font-semibold" />
      </div>
      <button class="text-sm text-gray-500 hover:text-gray-700">New Chat</button>
    </header>

    <!-- Messages Container -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto">
      <!-- Messages -->
      <div v-for="message in messages" :key="message.id" class="py-6">
        <div class="max-w-4xl mx-auto px-6">
          <!-- User Message (bubble style) -->
          <div v-if="message.isUser" class="flex justify-end mb-4">
            <div class="max-w-[70%] bg-gray-400 text-white rounded-full px-4 py-3">
              <p class="text-sm md:text-base">{{ message.content }}</p>
            </div>
          </div>

          <!-- AI Response (plain text style like ChatGPT) -->
          <div v-else class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <ResponseIcon class="h-6 w-6 text-gray-600 mt-1" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm md:text-base text-gray-800 leading-relaxed">
                {{ message.content }}
                <span
                  v-if="message.isStreaming"
                  class="inline-block w-2 h-5 bg-gray-800 ml-1 animate-pulse"
                ></span>
              </div>
              <div class="text-xs text-gray-500 mt-2">
                {{ message.timestamp.toLocaleTimeString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="border rounded-xl overflow-hidden flex items-end shadow-sm bg-white">
          <textarea
            v-model="inputMessage"
            @keydown="handleKeydown"
            :placeholder="isGenerating ? 'Doks AI is thinking...' : 'Message Doks AI...'"
            :disabled="isGenerating"
            class="p-4 w-full text-lg resize-none focus:outline-none min-h-[60px] max-h-[200px] bg-white"
            :class="{ 'opacity-50': isGenerating }"
            rows="1"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isGenerating"
            class="border-l px-6 py-4 text-lg font-medium transition bg-white"
            :class="
              inputMessage.trim() && !isGenerating
                ? 'hover:bg-blue-50 text-blue-600 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            "
          >
            {{ isGenerating ? 'Generating...' : 'Send' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  field-sizing: content;
}
</style>
