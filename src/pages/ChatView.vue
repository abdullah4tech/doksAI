<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoText from '@/components/LogoText.vue'
import ResponseIcon from '@/assets/ResponseIcon.vue'
import { useChatStore } from '@/store'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()

const sessionId = route.params.id as string

onMounted(async () => {
  chatStore.setCurrentSession(sessionId)

  await nextTick()
  if (chatStore.messages.length === 1 && chatStore.messages[0]?.isUser) {
    generateInitialResponse(chatStore.messages[0].content)
  }
})

const generateInitialResponse = async (userInput: string) => {
  chatStore.isLoading = true

  const aiMessageId = chatStore.messages.length
  chatStore.addMessage(sessionId, {
    content: '',
    isUser: false,
    timestamp: new Date(),
    isStreaming: true,
  })

  await nextTick()
  scrollToBottom()

  setTimeout(() => {
    const fullResponse = `I understand you're asking about: "${userInput}". This is where the RAG pipeline response would appear. The response is now being streamed character by character to provide a better user experience, similar to how ChatGPT displays its responses.`
    streamText(fullResponse, aiMessageId, 30)
  }, 500)
}

const startNewChat = () => {
  router.push('/')
}

const streamText = async (text: string, messageId: number, delay: number = 30) => {
  if (!chatStore.currentSession) return

  for (let i = 0; i <= text.length; i++) {
    chatStore.updateMessage(sessionId, messageId, {
      content: text.substring(0, i),
    })
    await nextTick()
    scrollToBottom()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  chatStore.updateMessage(sessionId, messageId, { isStreaming: false })
  chatStore.isLoading = false
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || chatStore.isLoading) return

  const currentInput = inputMessage.value
  inputMessage.value = ''
  chatStore.isLoading = true

  chatStore.addMessage(sessionId, {
    content: currentInput,
    isUser: true,
    timestamp: new Date(),
  })

  await nextTick()
  scrollToBottom()

  const aiMessageId = chatStore.messages.length
  chatStore.addMessage(sessionId, {
    content: '',
    isUser: false,
    timestamp: new Date(),
    isStreaming: true,
  })

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
  if (event.key === 'Enter' && !event.shiftKey && !chatStore.isLoading) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="flex flex-col h-[100vh] bg-white">
    <header class="px-50 pt-7 py-4 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <LogoText class="text-2xl font-semibold" />
      </RouterLink>
      <button @click="startNewChat" class="text-sm text-gray-500 hover:text-gray-700">
        New Chat
      </button>
    </header>

    <div ref="messagesContainer" class="flex-1 overflow-y-auto">
      <div v-for="message in chatStore.messages" :key="message.id" class="py-6">
        <div class="max-w-4xl mx-auto px-6">
          <div v-if="message.isUser" class="flex justify-end mb-4">
            <div class="max-w-[70%] bg-gray-400 text-white rounded-full px-4 py-3">
              <p class="text-sm md:text-base">{{ message.content }}</p>
            </div>
          </div>

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

    <div class="px-6 py-4">
      <div class="max-w-4xl mx-auto">
        <div class="border rounded-xl overflow-hidden flex items-end shadow-sm bg-white">
          <textarea
            v-model="inputMessage"
            @keydown="handleKeydown"
            :placeholder="chatStore.isLoading ? 'Doks AI is thinking...' : 'Message Doks AI...'"
            :disabled="chatStore.isLoading"
            class="p-4 w-full text-lg resize-none focus:outline-none min-h-[60px] max-h-[200px] bg-white"
            :class="{ 'opacity-50': chatStore.isLoading }"
            rows="1"
          ></textarea>
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || chatStore.isLoading"
            class="border-l px-6 py-4 text-lg font-medium transition bg-white"
            :class="
              inputMessage.trim() && !chatStore.isLoading
                ? 'hover:bg-blue-50 text-blue-600 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
            "
          >
            {{ chatStore.isLoading ? 'Generating...' : 'Send' }}
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
