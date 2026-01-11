<script setup lang="ts">
import { computed } from 'vue'
import { useBookmarksStore } from '@/store/bookmarks'
import { useRouter } from 'vue-router'
import { StarIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const bookmarksStore = useBookmarksStore()
const router = useRouter()

const isEmpty = computed(() => {
  return (
    bookmarksStore.allBookmarkedMessages.length === 0 &&
    bookmarksStore.allBookmarkedSessions.length === 0
  )
})

const totalBookmarks = computed(() => {
  return bookmarksStore.allBookmarkedMessages.length + bookmarksStore.allBookmarkedSessions.length
})

const navigateToSession = (sessionId: string, messageId?: number): void => {
  router.push(`/c/${sessionId}`)
  // In a real implementation, you'd scroll to the message
}

const removeMessageBookmark = (sessionId: string, messageId: number, event: Event): void => {
  event.stopPropagation()
  bookmarksStore.removeMessageBookmark(sessionId, messageId)
}

const removeSessionBookmark = (sessionId: string, event: Event): void => {
  event.stopPropagation()
  bookmarksStore.removeSessionBookmark(sessionId)
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return new Date(date).toLocaleDateString()
  }
}

const getContentPreview = (content: string, maxLength: number = 100): string => {
  // Remove markdown formatting for preview
  const plain = content.replace(/[#*`\[\]()]/g, '')
  return plain.length > maxLength ? plain.substring(0, maxLength) + '...' : plain
}
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50 border-r border-gray-200">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 bg-white">
      <h2 class="text-lg font-semibold text-gray-900">Bookmarks</h2>
      <p v-if="!isEmpty" class="text-sm text-gray-500 mt-1">
        {{ totalBookmarks }} bookmarked items
      </p>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Empty State -->
      <div v-if="isEmpty" class="flex items-center justify-center h-full p-4">
        <div class="text-center">
          <StarIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 font-medium">No bookmarks yet</p>
          <p class="text-sm text-gray-400">Star messages and conversations to save them here</p>
        </div>
      </div>

      <!-- Bookmarks List -->
      <template v-else>
        <!-- Bookmarked Sessions -->
        <div v-if="bookmarksStore.allBookmarkedSessions.length > 0" class="p-4">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Conversations
          </h3>
          <div class="space-y-2">
            <div
              v-for="item in bookmarksStore.allBookmarkedSessions"
              :key="item.sessionId"
              class="group p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
              @click="navigateToSession(item.sessionId)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ item.session.title || 'New Chat' }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatTime(item.bookmarkedAt) }}</p>
                </div>
                <button
                  @click="removeSessionBookmark(item.sessionId, $event)"
                  class="flex-shrink-0 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove bookmark"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bookmarked Messages -->
        <div
          v-if="bookmarksStore.allBookmarkedMessages.length > 0"
          class="p-4"
          :class="{ 'border-t border-gray-200': bookmarksStore.allBookmarkedSessions.length > 0 }"
        >
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Messages
          </h3>
          <div class="space-y-2">
            <div
              v-for="item in bookmarksStore.allBookmarkedMessages"
              :key="`${item.sessionId}-${item.messageId}`"
              class="group p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
              @click="navigateToSession(item.sessionId, item.messageId)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <!-- Session Title -->
                  <p class="text-xs font-medium text-gray-500 truncate mb-1">
                    {{ item.session.title || 'New Chat' }}
                  </p>

                  <!-- Message Content -->
                  <p class="text-sm text-gray-900 line-clamp-2 mb-2">
                    {{ getContentPreview(item.message.content, 150) }}
                  </p>

                  <!-- Metadata -->
                  <div class="flex items-center gap-3 text-xs text-gray-500">
                    <span>{{ formatTime(item.bookmarkedAt) }}</span>
                    <span v-if="item.message.confidence" class="flex items-center gap-1">
                      Confidence: {{ (item.message.confidence * 100).toFixed(0) }}%
                    </span>
                  </div>

                  <!-- Sources -->
                  <div
                    v-if="item.message.sources && item.message.sources.length > 0"
                    class="mt-2 pt-2 border-t border-gray-100"
                  >
                    <p class="text-xs font-medium text-gray-700 mb-1">Sources:</p>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="(source, idx) in item.message.sources.slice(0, 2)"
                        :key="idx"
                        class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {{ source.doc_id }} (p{{ source.page }})
                      </span>
                      <span
                        v-if="item.message.sources.length > 2"
                        class="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        +{{ item.message.sources.length - 2 }} more
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Remove Button -->
                <button
                  @click="removeMessageBookmark(item.sessionId, item.messageId, $event)"
                  class="flex-shrink-0 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove bookmark"
                >
                  <XMarkIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
