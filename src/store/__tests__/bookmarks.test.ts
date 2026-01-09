import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBookmarksStore } from '../bookmarks'
import { useChatStore } from '../index'

describe('Bookmarks Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('toggleMessageBookmark', () => {
    it('should bookmark a message', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)

      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(true)
    })

    it('should unbookmark a message', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)
      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(true)

      bookmarksStore.toggleMessageBookmark(sessionId, messageId)
      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(false)
    })

    it('should set isBookmarked flag on message', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)

      const message = chatStore.sessions[sessionId].messages[messageId]
      expect(message.isBookmarked).toBe(true)
    })

    it('should persist message bookmark to localStorage', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)

      const stored = localStorage.getItem('bookmarked_messages')
      expect(stored).toBeDefined()
      const parsed = JSON.parse(stored!)
      expect(Object.keys(parsed).length).toBe(1)
    })
  })

  describe('toggleSessionBookmark', () => {
    it('should bookmark a session', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)

      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(true)
    })

    it('should unbookmark a session', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)
      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(true)

      bookmarksStore.toggleSessionBookmark(sessionId)
      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(false)
    })

    it('should set isBookmarked flag on session', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)

      const session = chatStore.sessions[sessionId]
      expect(session.isBookmarked).toBe(true)
    })

    it('should persist session bookmark to localStorage', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)

      const stored = localStorage.getItem('bookmarked_sessions')
      expect(stored).toBeDefined()
      const parsed = JSON.parse(stored!)
      expect(Object.keys(parsed).length).toBe(1)
    })
  })

  describe('isMessageBookmarked', () => {
    it('should return true if message is bookmarked', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)

      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(true)
    })

    it('should return false if message is not bookmarked', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      expect(bookmarksStore.isMessageBookmarked(sessionId, 0)).toBe(false)
    })
  })

  describe('isSessionBookmarked', () => {
    it('should return true if session is bookmarked', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)

      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(true)
    })

    it('should return false if session is not bookmarked', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')

      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(false)
    })
  })

  describe('removeMessageBookmark', () => {
    it('should remove a bookmarked message', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      const messageId = 0
      bookmarksStore.toggleMessageBookmark(sessionId, messageId)
      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(true)

      bookmarksStore.removeMessageBookmark(sessionId, messageId)
      expect(bookmarksStore.isMessageBookmarked(sessionId, messageId)).toBe(false)
    })
  })

  describe('removeSessionBookmark', () => {
    it('should remove a bookmarked session', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      bookmarksStore.toggleSessionBookmark(sessionId)
      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(true)

      bookmarksStore.removeSessionBookmark(sessionId)
      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(false)
    })
  })

  describe('allBookmarkedMessages computed', () => {
    it('should return all bookmarked messages with full content', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test Session')
      chatStore.addMessage(sessionId, {
        content: 'Test message',
        isUser: true,
        timestamp: new Date(),
      })

      bookmarksStore.toggleMessageBookmark(sessionId, 0)

      const bookmarked = bookmarksStore.allBookmarkedMessages
      expect(bookmarked).toHaveLength(1)
      expect(bookmarked[0].message.content).toBe('Test message')
      expect(bookmarked[0].session.title).toBe('Test Session')
    })

    it('should sort by bookmark date descending', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId = chatStore.createSession('Test')
      chatStore.addMessage(sessionId, {
        content: 'Message 1',
        isUser: true,
        timestamp: new Date(),
      })
      chatStore.addMessage(sessionId, {
        content: 'Message 2',
        isUser: true,
        timestamp: new Date(),
      })

      bookmarksStore.toggleMessageBookmark(sessionId, 0)
      const message1BookmarkTime = new Date()

      bookmarksStore.toggleMessageBookmark(sessionId, 1)

      const bookmarked = bookmarksStore.allBookmarkedMessages
      expect(bookmarked[0].messageId).toBe(1) // Most recent first
      expect(bookmarked[1].messageId).toBe(0)
    })
  })

  describe('allBookmarkedSessions computed', () => {
    it('should return all bookmarked sessions', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId1 = chatStore.createSession('Session 1')
      const sessionId2 = chatStore.createSession('Session 2')

      bookmarksStore.toggleSessionBookmark(sessionId1)
      bookmarksStore.toggleSessionBookmark(sessionId2)

      const bookmarked = bookmarksStore.allBookmarkedSessions
      expect(bookmarked).toHaveLength(2)
    })

    it('should sort by bookmark date descending', () => {
      const chatStore = useChatStore()
      const bookmarksStore = useBookmarksStore()

      const sessionId1 = chatStore.createSession('Session 1')
      bookmarksStore.toggleSessionBookmark(sessionId1)

      const sessionId2 = chatStore.createSession('Session 2')
      bookmarksStore.toggleSessionBookmark(sessionId2)

      const bookmarked = bookmarksStore.allBookmarkedSessions
      expect(bookmarked[0].sessionId).toBe(sessionId2) // Most recent first
      expect(bookmarked[1].sessionId).toBe(sessionId1)
    })
  })
})
