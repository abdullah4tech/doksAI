<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '@/store'
import { useBookmarksStore } from '@/store/bookmarks'
import { useLabelsStore } from '@/store/labels'
import LogoText from '@/components/LogoText.vue'
import faviconUrl from '@/assets/favicon.png'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'

defineProps<{
  mobileOpen?: boolean
}>()

const emit = defineEmits<{
  'update:mobileOpen': [value: boolean]
}>()

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()
const bookmarksStore = useBookmarksStore()
const labelsStore = useLabelsStore()

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const isCollapsed = ref(false)
const isSidebarHovered = ref(false)

// Debounce search update
const updateSearch = useDebounceFn((value: string) => {
  debouncedSearchQuery.value = value
}, 300)

watch(searchQuery, (newValue) => {
  updateSearch(newValue)
})

// Load sidebar state from localStorage
onMounted(() => {
  const savedState = localStorage.getItem('sidebar_collapsed')
  if (savedState) {
    isCollapsed.value = JSON.parse(savedState)
  }
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Ctrl+K or Cmd+K for search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (isCollapsed.value) {
      isCollapsed.value = false
    }
    searchInput.value?.focus()
  }

  // Ctrl+N or Cmd+N for new chat
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault()
    createNewChat()
  }
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed.value))
}

const expandAndFocusSearch = () => {
  isCollapsed.value = false
  localStorage.setItem('sidebar_collapsed', JSON.stringify(false))
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const filteredSessions = computed(() => {
  const sessions = chatStore.getAllSessions
  if (!debouncedSearchQuery.value) return sessions

  const query = debouncedSearchQuery.value.toLowerCase()
  return sessions.filter(
    (session) =>
      (session.title || 'New Chat').toLowerCase().includes(query) ||
      session.messages.some((msg) => msg.content.toLowerCase().includes(query)),
  )
})

const createNewChat = () => {
  router.push('/')
  // Close mobile sidebar
  emit('update:mobileOpen', false)
}

const selectSession = (sessionId: string) => {
  router.push(`/c/${sessionId}`)
  // Close mobile sidebar
  emit('update:mobileOpen', false)
}

const closeMobileSidebar = () => {
  emit('update:mobileOpen', false)
}

const deleteSession = (sessionId: string, event: Event) => {
  event.stopPropagation() // Prevent navigation
  if (confirm('Are you sure you want to delete this conversation?')) {
    chatStore.deleteSession(sessionId)
    if (route.params.id === sessionId) {
      router.push('/')
    }
  }
}

const archiveSession = (sessionId: string, event: Event) => {
  event.stopPropagation() // Prevent navigation
  chatStore.archiveSession(sessionId)
  if (route.params.id === sessionId) {
    router.push('/')
  }
}

const toggleSessionBookmark = (sessionId: string, event: Event) => {
  event.stopPropagation()
  bookmarksStore.toggleSessionBookmark(sessionId)
}

const formatTime = (date: Date) => {
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

// Group sessions by time
const groupedSessions = computed(() => {
  const groups: Record<string, typeof filteredSessions.value> = {}

  filteredSessions.value.forEach((session) => {
    const timeLabel = formatTime(session.updatedAt)
    if (!groups[timeLabel]) {
      groups[timeLabel] = []
    }
    groups[timeLabel].push(session)
  })

  return groups
})
</script>

<template>
  <!-- Mobile Overlay Backdrop with Blur -->
  <Transition name="fade">
    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
      @click="closeMobileSidebar"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <div
    class="bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out shadow-xl"
    :class="[
      isCollapsed ? 'w-0 sm:w-16' : 'w-[280px]',
      mobileOpen 
        ? 'fixed inset-y-0 left-0 z-50 flex flex-col h-full sm:relative' 
        : 'hidden sm:flex sm:flex-col sm:h-full sm:relative',
    ]"
    @mouseenter="isSidebarHovered = true"
    @mouseleave="isSidebarHovered = false"
  >
    <!-- Mobile Close Button -->
    <button
      v-if="mobileOpen"
      @click="closeMobileSidebar"
      class="absolute top-4 right-4 sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors z-10"
    >
      <XMarkIcon class="w-5 h-5" />
    </button>

    <!-- Logo / Expand Button Header -->
    <div class="p-4 flex items-center justify-center relative" :class="{ 'px-2': isCollapsed }">
      <Transition name="fade" mode="out-in">
        <!-- Show expand button on hover when collapsed -->
        <button
          v-if="isCollapsed && isSidebarHovered"
          key="expand-btn"
          @click="toggleSidebar"
          class="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRightIcon class="w-5 h-5 text-gray-500" />
        </button>
        <!-- Show favicon when collapsed but not hovered -->
        <img
          v-else-if="isCollapsed"
          key="favicon"
          :src="faviconUrl"
          alt="DoksAI"
          class="w-8 h-8"
        />
        <!-- Show full logo when expanded -->
        <div v-else key="logo">
          <LogoText class="text-lg font-bold text-gray-800" />
        </div>
      </Transition>
      <!-- Collapse button (only when expanded) - positioned absolutely -->
      <button
        v-if="!isCollapsed"
        @click="toggleSidebar"
        class="absolute right-4 p-1 hover:bg-gray-200 rounded-lg transition-colors hidden sm:block"
        title="Collapse sidebar"
      >
        <ChevronLeftIcon class="w-4 h-4 text-gray-500" />
      </button>
    </div>

    <!-- Header & New Chat -->
    <div class="px-4 pb-4" :class="{ 'px-2': isCollapsed }">
      <button
        @click="createNewChat"
        class="w-full h-11 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 font-medium py-2.5 px-3 rounded-lg transition-all duration-200"
      >
        <PlusIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed" class="truncate">New Chat</span>
      </button>
    </div>

    <!-- Search -->
    <div class="px-4 mb-2" :class="{ 'px-2': isCollapsed }">
      <!-- Collapsed: Search icon button -->
      <button
        v-if="isCollapsed"
        @click="expandAndFocusSearch"
        class="w-full h-10 flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm rounded-lg transition-all duration-200"
        title="Search chats (Ctrl+K)"
      >
        <MagnifyingGlassIcon class="w-5 h-5 text-gray-500" />
      </button>
      <!-- Expanded: Full search input -->
      <div v-else class="relative">
        <MagnifyingGlassIcon
          class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search chats..."
          class="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
    </div>

    <!-- Session List (hidden when collapsed) -->
    <div v-if="!isCollapsed" class="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-6 scrollbar-thin">
      <div v-for="(sessions, label) in groupedSessions" :key="label">
          <h3
            class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-1"
          >
            {{ label }}
          </h3>
          <div class="space-y-1">
            <div
              v-for="session in sessions"
              :key="session.id"
              @click="selectSession(session.id)"
              class="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors relative"
              :class="{
                'bg-white shadow-sm ring-1 ring-gray-200': route.params.id === session.id,
                'hover:bg-gray-200/50': route.params.id !== session.id,
              }"
            >
              <ChatBubbleLeftIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div v-if="!isCollapsed" class="flex-1 min-w-0">
                <p class="text-sm text-gray-700 font-medium truncate">
                  {{ session.title || 'New Chat' }}
                </p>
                <p class="text-xs text-gray-400 truncate">
                  {{ session.messages[session.messages.length - 1]?.content || 'No messages' }}
                </p>
              </div>

              <!-- Label Badges -->
              <div
                v-if="!isCollapsed && session.labels && session.labels.length > 0"
                class="flex flex-wrap gap-1 mt-1 mb-2"
              >
                <div
                  v-for="labelId in session.labels.slice(0, 2)"
                  :key="labelId"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                  :style="{ backgroundColor: labelsStore.getLabelById(labelId)?.color }"
                  :title="labelsStore.getLabelById(labelId)?.name"
                >
                  {{ labelsStore.getLabelById(labelId)?.name }}
                </div>
                <div
                  v-if="session.labels.length > 2"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700"
                >
                  +{{ session.labels.length - 2 }}
                </div>
              </div>

              <!-- Hover Actions -->
              <div
                class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-white via-white to-transparent pl-4"
                :class="{ 'from-gray-200 via-gray-200': route.params.id !== session.id && false }"
              >
                <!-- Adjust gradient if needed -->
                <button
                  @click="toggleSessionBookmark(session.id, $event)"
                  class="p-1 hover:bg-yellow-50 rounded text-gray-400 hover:text-yellow-500 transition-colors"
                  :title="
                    bookmarksStore.isSessionBookmarked(session.id) ? 'Remove bookmark' : 'Bookmark'
                  "
                >
                  <component
                    :is="bookmarksStore.isSessionBookmarked(session.id) ? StarIconSolid : StarIcon"
                    class="w-4 h-4"
                  />
                </button>
                <button
                  @click="archiveSession(session.id, $event)"
                  class="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                  title="Archive"
                >
                  <ArchiveBoxIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteSession(session.id, $event)"
                  class="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      <div v-if="filteredSessions.length === 0" class="text-center py-8">
        <p class="text-sm text-gray-500">No conversations found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

/* Fade transition for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
