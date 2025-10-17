<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoText from '@/components/LogoText.vue'
import ResponseIcon from '@/assets/ResponseIcon.vue'
import { useChatStore } from '@/store'
import { parseMarkdown } from '@/utils/markdown'

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
  // Don't use queryRAG here because it adds the user message again
  // The user message was already added when creating the session
  chatStore.isLoading = true

  try {
    // Add initial AI message with streaming state
    const aiMessageId = chatStore.messages.length
    chatStore.addMessage(sessionId, {
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    })

    // Import API functions directly
    const { ragAPI } = await import('@/services/api')
    const config = await import('@/config')

    // Prepare query request
    const queryRequest = {
      question: userInput,
      top_k: config.default.DEFAULT_TOP_K,
      min_score: config.default.DEFAULT_MIN_SCORE,
    }

    // Query the RAG API
    const response = await ragAPI.queryDocuments(queryRequest)

    if (response.success && response.answer) {
      // Stream the response
      await chatStore.streamResponse(sessionId, aiMessageId, response.answer.text, {
        sources: response.answer.sources,
        confidence: response.answer.confidence,
      })
    } else {
      // Handle error case
      chatStore.updateMessage(sessionId, aiMessageId, {
        content: `I apologize, but I encountered an error: ${response.error || 'Unable to process your question'}`,
        isStreaming: false,
      })
    }
  } catch (error) {
    console.error('RAG query error:', error)
    // Find the AI message and update it with error
    const aiMessageId = chatStore.messages.length - 1
    chatStore.updateMessage(sessionId, aiMessageId, {
      content: `I apologize, but I encountered an error while processing your question: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      isStreaming: false,
    })
  } finally {
    chatStore.isLoading = false
  }

  scrollToBottom()
}

const startNewChat = () => {
  router.push('/')
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || chatStore.isLoading) return

  const currentInput = inputMessage.value
  inputMessage.value = ''

  await chatStore.queryRAG(sessionId, currentInput)
  scrollToBottom()
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

// Function to determine border radius based on message content
const getMessageBorderRadius = (content: string) => {
  // Check for explicit line breaks
  if (content.includes('\n')) {
    return 'rounded-2xl'
  }

  // Estimate if text will wrap based on character count and average character width
  // This is a rough approximation - in practice, actual text wrapping depends on font, container width, etc.
  // For mobile (sm): max-width is ~65% of screen, for desktop ~70%
  // Assuming average character width and container constraints
  const estimatedMaxCharsPerLine = 35 // Rough estimate for the container width
  const isLikelyMultiLine = content.length > estimatedMaxCharsPerLine

  return isLikelyMultiLine ? 'rounded-2xl' : 'rounded-full'
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
            <div
              :class="[
                'max-w-[70%] bg-zinc-100 text-black px-5 py-3 message-bubble',
                getMessageBorderRadius(message.content),
              ]"
            >
              <p class="text-sm md:text-base whitespace-pre-wrap break-words">
                {{ message.content }}
              </p>
            </div>
          </div>

          <div v-else class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <ResponseIcon class="h-6 w-6 text-gray-600 mt-1" />
            </div>
            <div class="flex-1 min-w-0">
              <div
                class="text-sm md:text-base text-gray-800 leading-relaxed markdown-content"
                v-html="parseMarkdown(message.content)"
              ></div>
              <span
                v-if="message.isStreaming"
                class="inline-block w-2 h-5 bg-gray-800 ml-1 animate-pulse"
              ></span>

              <!-- Sources Section -->
              <div
                v-if="message.sources && message.sources.length > 0 && !message.isStreaming"
                class="mt-4 pt-3 border-t border-gray-200"
              >
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(source, index) in message.sources"
                    :key="index"
                    class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer border border-gray-200"
                    @click="
                      () => {
                        /* Could open source details */
                      }
                    "
                  >
                    <span class="text-gray-600">{{ index + 1 }}</span>
                    <span class="text-gray-800 font-medium truncate max-w-[120px]">{{
                      source.doc_id
                    }}</span>
                    <span class="text-gray-500">p.{{ source.page }}</span>
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3 text-xs text-gray-500 mt-2">
                <span>{{ message.timestamp.toLocaleTimeString() }}</span>
                <span
                  v-if="message.confidence && !message.isStreaming"
                  class="flex items-center gap-1"
                >
                  <span>Confidence:</span>
                  <span class="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                    {{ Math.round(message.confidence * 100) }}%
                  </span>
                </span>
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom markdown styling */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: #1f2937;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin: 0.75rem 0;
  font-style: italic;
  color: #6b7280;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background-color: #f3f4f6;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 0.875rem;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #d1d5db;
  padding: 0.5rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}
</style>
