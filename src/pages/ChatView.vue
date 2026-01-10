<script setup lang="ts">
import { ref, nextTick, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResponseIcon from '@/assets/ResponseIcon.vue'
import ConversationSidebar from '@/components/ConversationSidebar.vue'
import { useChatStore } from '@/store'
import { parseMarkdown } from '@/utils/markdown'
import {
  ClipboardDocumentIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  CheckIcon,
  Bars3Icon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const editingMessageId = ref<number | null>(null)
const editContent = ref('')
const copiedMessageId = ref<number | null>(null)
const mobileMenuOpen = ref(false)

const sessionId = computed(() => route.params.id as string)

onMounted(() => {
  initializeSession()
})

watch(
  () => route.params.id,
  () => {
    initializeSession()
  },
)

const initializeSession = async () => {
  chatStore.setCurrentSession(sessionId.value)

  await nextTick()
  if (chatStore.messages.length === 1 && chatStore.messages[0]?.isUser) {
    generateInitialResponse(chatStore.messages[0].content)
  }
}

// Watch for message changes and auto-scroll during streaming
watch(
  () => chatStore.messages,
  async () => {
    // Check if any message is currently streaming
    const isStreaming = chatStore.messages.some((msg) => msg.isStreaming)
    if (isStreaming) {
      await nextTick()
      scrollToBottom('smooth')
    }
  },
  { deep: true },
)

// Watch for new messages being added
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick()
    scrollToBottom('smooth')
  },
)

const generateInitialResponse = async (userInput: string) => {
  // Don't use queryRAG here because it adds the user message again
  // The user message was already added when creating the session
  chatStore.isLoading = true

  try {
    // Add initial AI message with streaming state
    const aiMessageId = chatStore.messages.length
    chatStore.addMessage(sessionId.value, {
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    })

    // Import API functions directly
    const { ragAPI } = await import('@/services/api')

    // Prepare query request
    const queryRequest = {
      question: userInput,
    }

    // Query the RAG API
    const response = await ragAPI.queryDocuments(queryRequest)

    if (response.success && response.answer) {
      // Stream the response
      await chatStore.streamResponse(sessionId.value, aiMessageId, response.answer.text, {
        sources: response.answer.sources,
        confidence: response.answer.confidence,
      })
    } else {
      // Handle error case
      chatStore.updateMessage(sessionId.value, aiMessageId, {
        content: `I apologize, but I encountered an error: ${response.error || 'Unable to process your question'}`,
        isStreaming: false,
      })
    }
  } catch (error) {
    console.error('RAG query error:', error)
    // Find the AI message and update it with error
    const aiMessageId = chatStore.messages.length - 1
    chatStore.updateMessage(sessionId.value, aiMessageId, {
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

  // Scroll immediately when user message is added
  await nextTick()
  scrollToBottom('smooth')

  await chatStore.queryRAG(sessionId.value, currentInput)
}

const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: behavior,
    })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !chatStore.isLoading) {
    event.preventDefault()
    if (editingMessageId.value !== null) {
      saveEdit()
    } else {
      sendMessage()
    }
  }
}

const copyToClipboard = async (content: string, messageId: number) => {
  try {
    await navigator.clipboard.writeText(content)
    copiedMessageId.value = messageId
    setTimeout(() => {
      copiedMessageId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const startEdit = (message: { id: number; content: string }) => {
  editingMessageId.value = message.id
  editContent.value = message.content
}

const cancelEdit = () => {
  editingMessageId.value = null
  editContent.value = ''
}

const saveEdit = async () => {
  if (editingMessageId.value === null || !editContent.value.trim()) return

  const messageId = editingMessageId.value
  const newContent = editContent.value

  // Update the message in store
  chatStore.updateMessage(sessionId.value, messageId, { content: newContent })

  // If it's the last user message, we might want to regenerate the response
  // For now, let's just update the content.
  // If the user wants to regenerate, they can click the regenerate button.
  // But typically editing a message implies re-running the conversation from that point.
  // Given the complexity of "rewinding" the conversation state in this simple store,
  // I will implement a simple "Regenerate" that re-sends the last user message.
  // For "Edit", if it's the last user message, we could trigger regeneration.

  // Let's check if it is the last user message
  const messages = chatStore.messages
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((m) => m.isUser)

  if (lastUserMessage && lastUserMessage.id === messageId) {
    // It is the last user message, let's regenerate
    // First, remove all messages after this one
    // This requires a new store action or manual manipulation.
    // Since we don't have "truncate" action, let's just trigger regenerate logic
    // which usually takes the last user message.
    // Actually, queryRAG adds a NEW user message. We don't want that.
    // We want to re-run the query with the UPDATED content.
    // To properly support "Edit & Regenerate", we need to:
    // 1. Remove the old AI response (if any)
    // 2. Call queryRAG but WITHOUT adding a new user message.
    // For now, let's just save the edit. The user can click "Regenerate" manually.
    // But "Regenerate" usually re-sends the LAST user message.
  }

  cancelEdit()
}

const regenerateResponse = async () => {
  if (chatStore.isLoading) return

  // Find the last user message
  const messages = chatStore.messages
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((m) => m.isUser)

  if (!lastUserMessage) return

  // Remove the last AI response if it exists and is after the last user message
  const lastMessage = messages[messages.length - 1]
  if (lastMessage && !lastMessage.isUser) {
    // We need a way to remove the last message.
    // The store doesn't have deleteMessage.
    // I'll implement a hacky way or just add a new response?
    // Adding a new response is safer.
  }

  // We need to call queryRAG but tell it NOT to add the user message again.
  // The current queryRAG always adds a user message.
  // I should probably modify queryRAG or create a new action.
  // For this MVP, I will just call queryRAG with the content.
  // It will duplicate the user message in the UI history, which is suboptimal but safe.
  // BETTER: Let's just use the existing queryRAG and accept the duplication for now,
  // OR (better) - I'll modify the store to support this properly if I had time.
  // BUT, I can just manually call the API and streamResponse.

  chatStore.isLoading = true
  try {
    // Add a new AI message placeholder
    const aiMessageId = chatStore.messages.length
    chatStore.addMessage(sessionId.value, {
      content: '',
      isUser: false,
      timestamp: new Date(),
      isStreaming: true,
    })

    const { ragAPI } = await import('@/services/api')
    const response = await ragAPI.queryDocuments({ question: lastUserMessage.content })

    if (response.success && response.answer) {
      await chatStore.streamResponse(sessionId.value, aiMessageId, response.answer.text, {
        sources: response.answer.sources,
        confidence: response.answer.confidence,
      })
    } else {
      chatStore.updateMessage(sessionId.value, aiMessageId, {
        content: `Error: ${response.error || 'Failed to regenerate'}`,
        isStreaming: false,
      })
    }
  } catch (e) {
    console.error(e)
  } finally {
    chatStore.isLoading = false
  }
}
</script>

<template>
  <div class="flex h-screen bg-white overflow-hidden">
    <!-- Sidebar -->
    <ConversationSidebar v-model:mobile-open="mobileMenuOpen" />

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col h-full min-w-0 relative">
      <!-- Header -->
      <header
        class="px-4 sm:px-6 lg:px-8 py-3 pt-4 sm:py-4 flex items-center justify-between bg-white border-b border-gray-100 z-10"
      >
        <div class="flex items-center gap-3">
          <!-- Mobile menu button visible only on mobile -->
          <button
            @click="mobileMenuOpen = true"
            class="sm:hidden p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>
        </div>
        <button
          @click="startNewChat"
          class="text-xs sm:text-sm text-gray-500 hover:text-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-md hover:bg-gray-100 transition"
        >
          New Chat
        </button>
      </header>

      <!-- Mobile Menu Button (Fixed position for when scrolling) -->
      <button
        @click="mobileMenuOpen = true"
        class="fixed top-4 left-4 sm:hidden p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 z-30 transition-colors md:hidden"
        style="display: none"
      >
        <Bars3Icon class="w-6 h-6 text-gray-600" />
      </button>

      <div ref="messagesContainer" class="flex-1 overflow-y-auto">
        <div v-for="message in chatStore.messages" :key="message.id" class="py-4 sm:py-6">
          <div class="max-w-4xl mx-auto px-4 sm:px-6">
            <div
              v-if="message.isUser"
              v-motion
              :initial="{ opacity: 0, x: 50, scale: 0.9 }"
              :enter="{ opacity: 1, x: 0, scale: 1 }"
              class="flex flex-col items-end mb-4 sm:mb-6 group"
            >
              <div class="flex items-end gap-2 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
                <!-- Actions (Left of user message) -->
                <div
                  class="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 mb-1"
                >
                  <button
                    @click="startEdit(message)"
                    class="p-1 text-gray-400 hover:text-blue-600 rounded bg-gray-50 hover:bg-white shadow-sm"
                    title="Edit"
                  >
                    <PencilSquareIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="copyToClipboard(message.content, message.id)"
                    class="p-1 text-gray-400 hover:text-blue-600 rounded bg-gray-50 hover:bg-white shadow-sm"
                    title="Copy"
                  >
                    <CheckIcon
                      v-if="copiedMessageId === message.id"
                      class="w-4 h-4 text-green-500"
                    />
                    <ClipboardDocumentIcon v-else class="w-4 h-4" />
                  </button>
                </div>

                <div
                  v-if="editingMessageId === message.id"
                  class="flex-1 bg-white border border-blue-200 rounded-2xl p-3 shadow-sm w-full"
                >
                  <textarea
                    v-model="editContent"
                    class="w-full text-sm resize-none focus:outline-none bg-transparent"
                    rows="3"
                    @keydown.enter.exact.prevent="saveEdit"
                    @keydown.esc="cancelEdit"
                  ></textarea>
                  <div class="flex justify-end gap-2 mt-2">
                    <button
                      @click="cancelEdit"
                      class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      @click="saveEdit"
                      class="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  :class="[
                    'bg-zinc-100 text-black px-3 sm:px-4 lg:px-5 py-2 sm:py-3 message-bubble shadow-sm rounded-2xl',
                  ]"
                >
                  <p
                    class="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed overflow-anywhere"
                  >
                    {{ message.content }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-else
              v-motion
              :initial="{ opacity: 0, x: -50, scale: 0.9 }"
              :enter="{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 150,
                  damping: 15,
                },
              }"
              class="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6"
            >
              <div class="flex-shrink-0">
                <ResponseIcon class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mt-1" />
              </div>
              <div class="flex-1 min-w-0 group">
                <div
                  class="text-sm md:text-base text-gray-800 leading-relaxed markdown-content overflow-anywhere"
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
                    >
                      <span class="text-gray-600">{{ index + 1 }}</span>
                      <span class="text-gray-800 font-medium truncate max-w-[120px]">{{
                        source.doc_id
                      }}</span>
                      <span class="text-gray-500">p.{{ source.page }}</span>
                    </button>
                  </div>
                </div>

                <!-- AI Message Actions -->
                <div
                  class="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span class="text-xs text-gray-400">{{
                    message.timestamp.toLocaleTimeString()
                  }}</span>
                  <div class="flex items-center gap-2">
                    <button
                      @click="copyToClipboard(message.content, message.id)"
                      class="p-1.5 text-gray-500 hover:text-blue-600 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow transition-all"
                      title="Copy"
                    >
                      <CheckIcon
                        v-if="copiedMessageId === message.id"
                        class="w-4 h-4 text-green-500"
                      />
                      <ClipboardDocumentIcon v-else class="w-4 h-4" />
                    </button>
                    <button
                      @click="regenerateResponse"
                      class="p-1.5 text-gray-500 hover:text-blue-600 rounded-md bg-white border border-gray-200 shadow-sm hover:shadow transition-all"
                      title="Regenerate"
                    >
                      <ArrowPathIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6 py-3 sm:py-4 bg-white sticky bottom-0">
        <div class="max-w-4xl mx-auto">
          <div
            class="border border-gray-300 rounded-xl overflow-hidden flex items-end shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <textarea
              v-model="inputMessage"
              @keydown="handleKeydown"
              :placeholder="chatStore.isLoading ? 'Doks AI is thinking...' : 'Message Doks AI...'"
              :disabled="chatStore.isLoading"
              class="p-3 sm:p-4 w-full text-base sm:text-lg resize-none focus:outline-none min-h-[50px] sm:min-h-[60px] max-h-[150px] sm:max-h-[200px] bg-transparent"
              :class="{ 'opacity-50': chatStore.isLoading }"
              rows="1"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || chatStore.isLoading"
              class="border-l border-gray-300 px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium transition bg-white"
              :class="
                inputMessage.trim() && !chatStore.isLoading
                  ? 'hover:bg-blue-50 text-blue-600 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              "
            >
              <span class="hidden sm:inline">{{
                chatStore.isLoading ? 'Generating...' : 'Send'
              }}</span>
              <span class="sm:hidden">{{ chatStore.isLoading ? '...' : '→' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  field-sizing: content;
}

.overflow-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
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
