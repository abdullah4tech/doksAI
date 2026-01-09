import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useChatStore } from './index'

interface BookmarkedMessage {
  sessionId: string
  messageId: number
  bookmarkedAt: Date
}

interface BookmarkedSession {
  sessionId: string
  bookmarkedAt: Date
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  // Load bookmarks from localStorage
  const savedMessages = localStorage.getItem('bookmarked_messages')
  const savedSessions = localStorage.getItem('bookmarked_sessions')

  const bookmarkedMessages = ref<Record<string, BookmarkedMessage>>(
    savedMessages
      ? JSON.parse(savedMessages, (key, value) => {
          if (key === 'bookmarkedAt') {
            return new Date(value)
          }
          return value
        })
      : {},
  )

  const bookmarkedSessions = ref<Record<string, BookmarkedSession>>(
    savedSessions
      ? JSON.parse(savedSessions, (key, value) => {
          if (key === 'bookmarkedAt') {
            return new Date(value)
          }
          return value
        })
      : {},
  )

  const persistBookmarks = (): void => {
    localStorage.setItem('bookmarked_messages', JSON.stringify(bookmarkedMessages.value))
    localStorage.setItem('bookmarked_sessions', JSON.stringify(bookmarkedSessions.value))
  }

  // Get all bookmarked messages with full content
  const allBookmarkedMessages = computed(() => {
    const chatStore = useChatStore()
    return Object.values(bookmarkedMessages.value)
      .map((bm) => {
        const session = chatStore.sessions[bm.sessionId]
        if (!session) return null

        const message = session.messages.find((m) => m.id === bm.messageId)
        if (!message) return null

        return {
          ...bm,
          session,
          message,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime())
  })

  // Get all bookmarked sessions
  const allBookmarkedSessions = computed(() => {
    const chatStore = useChatStore()
    return Object.values(bookmarkedSessions.value)
      .map((bs) => {
        const session = chatStore.sessions[bs.sessionId]
        return session ? { ...bs, session } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.bookmarkedAt.getTime() - a.bookmarkedAt.getTime())
  })

  // Toggle bookmark for a message
  const toggleMessageBookmark = (sessionId: string, messageId: number): void => {
    const chatStore = useChatStore()
    const key = `${sessionId}-${messageId}`

    if (bookmarkedMessages.value[key]) {
      // Remove bookmark
      delete bookmarkedMessages.value[key]
      chatStore.updateMessage(sessionId, messageId, { isBookmarked: false })
    } else {
      // Add bookmark
      bookmarkedMessages.value[key] = {
        sessionId,
        messageId,
        bookmarkedAt: new Date(),
      }
      chatStore.updateMessage(sessionId, messageId, { isBookmarked: true })
    }

    persistBookmarks()
  }

  // Toggle bookmark for a session
  const toggleSessionBookmark = (sessionId: string): void => {
    const chatStore = useChatStore()

    if (bookmarkedSessions.value[sessionId]) {
      // Remove bookmark
      delete bookmarkedSessions.value[sessionId]
      const session = chatStore.sessions[sessionId]
      if (session) {
        session.isBookmarked = false
      }
    } else {
      // Add bookmark
      bookmarkedSessions.value[sessionId] = {
        sessionId,
        bookmarkedAt: new Date(),
      }
      const session = chatStore.sessions[sessionId]
      if (session) {
        session.isBookmarked = true
      }
    }

    persistBookmarks()
  }

  // Check if message is bookmarked
  const isMessageBookmarked = (sessionId: string, messageId: number): boolean => {
    return !!bookmarkedMessages.value[`${sessionId}-${messageId}`]
  }

  // Check if session is bookmarked
  const isSessionBookmarked = (sessionId: string): boolean => {
    return !!bookmarkedSessions.value[sessionId]
  }

  // Remove a bookmarked message
  const removeMessageBookmark = (sessionId: string, messageId: number): void => {
    const key = `${sessionId}-${messageId}`
    if (bookmarkedMessages.value[key]) {
      delete bookmarkedMessages.value[key]
      const chatStore = useChatStore()
      chatStore.updateMessage(sessionId, messageId, { isBookmarked: false })
      persistBookmarks()
    }
  }

  // Remove a bookmarked session
  const removeSessionBookmark = (sessionId: string): void => {
    if (bookmarkedSessions.value[sessionId]) {
      delete bookmarkedSessions.value[sessionId]
      const chatStore = useChatStore()
      const session = chatStore.sessions[sessionId]
      if (session) {
        session.isBookmarked = false
      }
      persistBookmarks()
    }
  }

  return {
    bookmarkedMessages,
    bookmarkedSessions,
    allBookmarkedMessages,
    allBookmarkedSessions,
    toggleMessageBookmark,
    toggleSessionBookmark,
    isMessageBookmarked,
    isSessionBookmarked,
    removeMessageBookmark,
    removeSessionBookmark,
  }
})
