import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ChatSession } from './types'
import { v4 as uuidv4 } from 'uuid'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Record<string, ChatSession>>({})
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentSession = computed(() => {
    return currentSessionId.value ? sessions.value[currentSessionId.value] : null
  })

  const messages = computed(() => {
    return currentSession.value?.messages || []
  })

  const generateSessionId = (): string => {
    return uuidv4()
  }

  const createSession = (initialMessage?: string): string => {
    const sessionId = generateSessionId()
    const newSession: ChatSession = {
      id: sessionId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (initialMessage) {
      newSession.messages.push({
        id: 0,
        content: initialMessage,
        isUser: true,
        timestamp: new Date(),
      })
    }

    sessions.value[sessionId] = newSession
    currentSessionId.value = sessionId
    return sessionId
  }

  const setCurrentSession = (sessionId: string) => {
    if (sessions.value[sessionId]) {
      currentSessionId.value = sessionId
    }
  }

  const addMessage = (sessionId: string, message: Omit<Message, 'id'>) => {
    const session = sessions.value[sessionId]
    if (!session) return

    const newMessage: Message = {
      ...message,
      id: session.messages.length,
    }

    session.messages.push(newMessage)
    session.updatedAt = new Date()
  }

  const updateMessage = (sessionId: string, messageId: number, updates: Partial<Message>) => {
    const session = sessions.value[sessionId]
    if (!session) return

    const messageIndex = session.messages.findIndex((m: Message) => m.id === messageId)
    if (messageIndex !== -1 && session.messages[messageIndex]) {
      Object.assign(session.messages[messageIndex], updates)
      session.updatedAt = new Date()
    }
  }

  const clearSession = (sessionId: string) => {
    if (sessions.value[sessionId]) {
      delete sessions.value[sessionId]
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = null
      }
    }
  }

  const getAllSessions = computed(() => {
    return Object.values(sessions.value).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    )
  })

  return {
    sessions,
    currentSessionId,
    isLoading,
    currentSession,
    messages,
    getAllSessions,
    generateSessionId,
    createSession,
    setCurrentSession,
    addMessage,
    updateMessage,
    clearSession,
  }
})
