import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import HomeView from '@/pages/HomeView.vue'
import ChatView from '@/pages/ChatView.vue'
import { useChatStore } from '@/store'

// Mock the RAG API
vi.mock('@/services/api', () => ({
  ragAPI: {
    queryDocuments: vi.fn().mockResolvedValue({
      success: true,
      answer: {
        text: 'This is a mock response from the RAG API.',
        sources: [{ doc_id: 'document_1.pdf', page: 5 }],
        confidence: 0.95,
      },
    }),
  },
}))

// Mock network status composable
vi.mock('@/composables/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    showOfflineModal: false,
    dismissModal: vi.fn(),
  }),
}))

// Mock motion directive
const motionDirective = {
  mounted: () => {},
  updated: () => {},
}

describe('E2E User Flow', () => {
  let router: any

  beforeEach(() => {
    // Create a fresh router for each test
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
        },
        {
          path: '/c/:id',
          name: 'chat',
          component: ChatView,
          props: true,
        },
      ],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Clear pinia state between tests
    const store = useChatStore()
    Object.keys(store.sessions).forEach((key) => {
      store.clearSession(key)
    })
  })

  it('should start on home page with input field', async () => {
    const _wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
        directives: {
          motion: motionDirective,
        },
        stubs: {
          InteractiveGridPattern: true,
          ApiStatusIndicator: true,
          LogoText: { template: '<div>Doks</div>' },
          PdfModal: true,
          OfflineModal: true,
          ToastContainer: true,
        },
      },
    })

    await router.isReady()
    await flushPromises()

    // Check we're on the home page
    expect(router.currentRoute.value.path).toBe('/')

    // Check for input field
    const textarea = _wrapper.find('textarea[placeholder="Message Doks AI..."]')
    expect(textarea.exists()).toBe(true)
  })

  it('should create session and navigate to chat when message is sent', async () => {
    const _wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
        directives: {
          motion: motionDirective,
        },
        stubs: {
          InteractiveGridPattern: true,
          ApiStatusIndicator: true,
          LogoText: { template: '<div>Doks</div>' },
          PdfModal: true,
          OfflineModal: true,
          ToastContainer: true,
        },
      },
    })

    await router.isReady()
    await flushPromises()

    const store = useChatStore()

    // Type message in textarea
    const textarea = _wrapper.find('textarea[placeholder="Message Doks AI..."]')
    await textarea.setValue('What is Vue.js?')

    // Find and click send button (look for the button with Send text in the input area)
    const buttons = _wrapper.findAll('button')
    const sendButton = buttons.find((btn) => btn.text().includes('Send'))
    expect(sendButton).toBeDefined()

    await sendButton?.trigger('click')
    await flushPromises()

    // Check that session was created
    expect(store.sessions).toBeDefined()
    expect(Object.keys(store.sessions).length).toBe(1)

    // Check that we navigated to chat page
    expect(router.currentRoute.value.path).toMatch(/^\/c\//)
  })

  it('should display user message in chat', async () => {
    const _wrapper = mount(App, {
      global: {
        plugins: [router, createPinia()],
        directives: {
          motion: motionDirective,
        },
        stubs: {
          InteractiveGridPattern: true,
          ApiStatusIndicator: true,
          LogoText: { template: '<div>Doks</div>' },
          ResponseIcon: true,
          PdfModal: true,
          OfflineModal: true,
          ToastContainer: true,
        },
      },
    })

    await router.isReady()

    const store = useChatStore()
    const testMessage = 'Test question about documents'

    // Create a session with initial message
    const sessionId = store.createSession(testMessage)
    await router.push(`/c/${sessionId}`)
    await flushPromises()

    // Check that the message is displayed
    expect(store.messages[0].content).toBe(testMessage)
    expect(store.messages[0].isUser).toBe(true)
  })

  it('should generate and display AI response', async () => {
    const _wrapper = mount(ChatView, {
      props: {
        id: '',
      },
      global: {
        plugins: [router, createPinia()],
        directives: {
          motion: motionDirective,
        },
        mocks: {
          $route: {
            params: { id: '' },
          },
        },
        stubs: {
          LogoText: { template: '<div>Doks</div>' },
          ResponseIcon: true,
          RouterLink: true,
        },
      },
    })

    const store = useChatStore()

    // Create session with a user message
    const sessionId = store.createSession('What is artificial intelligence?')
    store.setCurrentSession(sessionId)

    // Trigger the response generation (simulating the onMounted behavior)
    const initialMessage = store.messages[0]
    if (initialMessage?.isUser) {
      // Simulate initial response - in real case, this would be called by onMounted
      const aiMessageId = store.messages.length
      store.addMessage(sessionId, {
        content: '',
        isUser: false,
        timestamp: new Date(),
        isStreaming: true,
      })

      // Stream a response
      await store.streamResponse(
        sessionId,
        aiMessageId,
        'Artificial intelligence is the simulation of human intelligence processes by computer systems.',
        {
          sources: [{ doc_id: 'ai_doc.pdf', page: 1 }],
          confidence: 0.95,
        },
        10, // Shorter delay for testing
      )
    }

    await flushPromises()

    // Check that AI message was added
    expect(store.messages.length).toBe(2)
    expect(store.messages[1].isUser).toBe(false)
    expect(store.messages[1].isStreaming).toBe(false)
    expect(store.messages[1].content).toContain('Artificial intelligence')
    expect(store.messages[1].sources).toBeDefined()
  })

  it('should allow sending follow-up messages in chat', async () => {
    const store = useChatStore()

    // Create initial session
    const sessionId = store.createSession('First question')
    store.setCurrentSession(sessionId)

    // Add AI response
    store.addMessage(sessionId, {
      content: 'First response',
      isUser: false,
      timestamp: new Date(),
    })

    // Check initial state
    expect(store.messages.length).toBe(2)

    // Add follow-up user message
    store.addMessage(sessionId, {
      content: 'Follow-up question',
      isUser: true,
      timestamp: new Date(),
    })

    // Check message was added
    expect(store.messages.length).toBe(3)
    expect(store.messages[2].content).toBe('Follow-up question')
    expect(store.messages[2].isUser).toBe(true)
  })

  it('should maintain message history across navigation', async () => {
    const store = useChatStore()

    // Create a session with multiple messages
    const sessionId = store.createSession('Initial question')
    store.setCurrentSession(sessionId)

    store.addMessage(sessionId, {
      content: 'AI response',
      isUser: false,
      timestamp: new Date(),
    })

    store.addMessage(sessionId, {
      content: 'Follow-up question',
      isUser: true,
      timestamp: new Date(),
    })

    const initialMessageCount = store.messages.length

    // Clear current session (simulating navigation away)
    store.setCurrentSession(null)

    // Set current session back (simulating navigation back)
    store.setCurrentSession(sessionId)

    // Check that messages are still there
    expect(store.messages.length).toBe(initialMessageCount)
    expect(store.messages[0].content).toBe('Initial question')
    expect(store.messages[1].content).toBe('AI response')
    expect(store.messages[2].content).toBe('Follow-up question')
  })

  it('should handle sending empty or whitespace messages', async () => {
    const store = useChatStore()
    const sessionId = store.createSession()

    // Try to add empty message (should be handled by UI)
    store.addMessage(sessionId, {
      content: '',
      isUser: true,
      timestamp: new Date(),
    })

    store.setCurrentSession(sessionId)

    // Check messages still contain the empty message (store doesn't validate)
    // In real app, the UI prevents this with @message.trim() check
    expect(store.messages.length).toBe(1)
  })

  it('should clear session data', async () => {
    const store = useChatStore()

    // Create multiple sessions
    const session1 = store.createSession('Question 1')
    const session2 = store.createSession('Question 2')

    expect(Object.keys(store.sessions).length).toBe(2)

    // Clear first session (session2 is currently active)
    store.clearSession(session1)

    expect(Object.keys(store.sessions).length).toBe(1)
    expect(store.sessions[session1]).toBeUndefined()
    expect(store.sessions[session2]).toBeDefined()

    // If current session is cleared, currentSessionId should be null
    store.clearSession(session2)

    expect(Object.keys(store.sessions).length).toBe(0)
    expect(store.currentSessionId).toBeNull()
  })

  it('should handle session switching', async () => {
    const store = useChatStore()

    // Create two sessions
    const session1 = store.createSession('Session 1 question')
    const session2 = store.createSession('Session 2 question')

    // Add different messages to each
    store.setCurrentSession(session1)
    store.addMessage(session1, {
      content: 'Session 1 AI response',
      isUser: false,
      timestamp: new Date(),
    })

    store.setCurrentSession(session2)
    store.addMessage(session2, {
      content: 'Session 2 AI response',
      isUser: false,
      timestamp: new Date(),
    })

    // Check session 2 is current
    expect(store.currentSessionId).toBe(session2)
    expect(store.messages.length).toBe(2)
    expect(store.messages[1].content).toBe('Session 2 AI response')

    // Switch to session 1
    store.setCurrentSession(session1)
    expect(store.currentSessionId).toBe(session1)
    expect(store.messages.length).toBe(2)
    expect(store.messages[1].content).toBe('Session 1 AI response')
  })
})
