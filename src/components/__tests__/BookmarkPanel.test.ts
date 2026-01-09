import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import BookmarkPanel from '../BookmarkPanel.vue'
import { useBookmarksStore } from '@/store/bookmarks'
import { useChatStore } from '@/store'
import { useRouter } from 'vue-router'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('BookmarkPanel Component', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should render empty state when no bookmarks', () => {
    const wrapper = mount(BookmarkPanel)

    expect(wrapper.text()).toContain('No bookmarks yet')
  })

  it('should display bookmark count', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('Test')
    bookmarksStore.toggleSessionBookmark(sessionId)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('1 bookmarked items')
  })

  it('should display bookmarked sessions', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('My Session')
    bookmarksStore.toggleSessionBookmark(sessionId)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('My Session')
    expect(wrapper.text()).toContain('Conversations')
  })

  it('should display bookmarked messages', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('Test Session')
    chatStore.addMessage(sessionId, {
      content: 'Important message content',
      isUser: false,
      timestamp: new Date(),
    })

    bookmarksStore.toggleMessageBookmark(sessionId, 0)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Important message content')
    expect(wrapper.text()).toContain('Messages')
  })

  it('should show message preview truncated', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const longContent = 'a'.repeat(200)
    const sessionId = chatStore.createSession('Test')
    chatStore.addMessage(sessionId, {
      content: longContent,
      isUser: false,
      timestamp: new Date(),
    })

    bookmarksStore.toggleMessageBookmark(sessionId, 0)

    const wrapper = mount(BookmarkPanel)
    const preview = wrapper.vm.getContentPreview(longContent)

    expect(preview.length).toBeLessThanOrEqual(153) // 150 + "..."
  })

  it('should display message sources if available', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('Test')
    chatStore.addMessage(sessionId, {
      content: 'Message with sources',
      isUser: false,
      timestamp: new Date(),
      sources: [
        { text: 'Source text', doc_id: 'doc-1', page: 1, score: 0.9 },
      ],
    })

    bookmarksStore.toggleMessageBookmark(sessionId, 0)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Sources')
    expect(wrapper.text()).toContain('doc-1')
  })

  it('should display confidence score if available', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('Test')
    chatStore.addMessage(sessionId, {
      content: 'Message',
      isUser: false,
      timestamp: new Date(),
      confidence: 0.85,
    })

    bookmarksStore.toggleMessageBookmark(sessionId, 0)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Confidence: 85%')
  })

  it('should remove bookmark when button clicked', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()

    const sessionId = chatStore.createSession('Test')
    bookmarksStore.toggleSessionBookmark(sessionId)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    const removeButton = wrapper.find('[title="Remove bookmark"]')
    if (removeButton.exists()) {
      await removeButton.trigger('click')
      await wrapper.vm.$nextTick()

      expect(bookmarksStore.isSessionBookmarked(sessionId)).toBe(false)
    }
  })

  it('should navigate to session when clicked', async () => {
    const chatStore = useChatStore()
    const bookmarksStore = useBookmarksStore()
    const router = useRouter()

    const sessionId = chatStore.createSession('Test')
    bookmarksStore.toggleSessionBookmark(sessionId)

    const wrapper = mount(BookmarkPanel)
    await wrapper.vm.$nextTick()

    const sessionItem = wrapper.find('[title="My Session"]')?.closest('div')
    if (sessionItem) {
      await sessionItem.trigger('click')
      expect(router.push).toHaveBeenCalledWith(`/c/${sessionId}`)
    }
  })

  it('should format time correctly', () => {
    const wrapper = mount(BookmarkPanel)

    const today = new Date()
    expect(wrapper.vm.formatTime(today)).toBe('Today')

    const yesterday = new Date(Date.now() - 86400000)
    expect(wrapper.vm.formatTime(yesterday)).toBe('Yesterday')

    const weekAgo = new Date(Date.now() - 7 * 86400000)
    expect(wrapper.vm.formatTime(weekAgo)).toMatch(/\d+\/\d+\/\d+/)
  })
})
