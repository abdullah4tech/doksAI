import { computed } from 'vue'
import { useBookmarksStore } from '@/store/bookmarks'
import { useLabelsStore } from '@/store/labels'
import { useChatStore } from '@/store'

/**
 * Composable for managing bookmarks and labels
 * Provides convenient utilities for working with bookmarked messages/sessions and label assignments
 */
export const useBookmarksAndLabels = () => {
  const bookmarksStore = useBookmarksStore()
  const labelsStore = useLabelsStore()
  const chatStore = useChatStore()

  // Get sessions filtered by label
  const getSessionsByLabel = (labelId: string) => {
    return chatStore.getAllSessions.filter((session) => session.labels?.includes(labelId))
  }

  // Get all labels for a session
  const getSessionLabels = (sessionId: string) => {
    const session = chatStore.sessions[sessionId]
    if (!session?.labels) return []
    return labelsStore.getLabelsByIds(session.labels)
  }

  // Add label to session
  const addLabelToSession = (sessionId: string, labelId: string): void => {
    const session = chatStore.sessions[sessionId]
    if (!session) return

    if (!session.labels) {
      session.labels = []
    }

    if (!session.labels.includes(labelId) && session.labels.length < 10) {
      session.labels.push(labelId)
      chatStore.sessions[sessionId] = { ...session }
    }
  }

  // Remove label from session
  const removeLabelFromSession = (sessionId: string, labelId: string): void => {
    const session = chatStore.sessions[sessionId]
    if (!session?.labels) return

    const index = session.labels.indexOf(labelId)
    if (index > -1) {
      session.labels.splice(index, 1)
      chatStore.sessions[sessionId] = { ...session }
    }
  }

  // Statistics
  const stats = computed(() => ({
    totalBookmarkedMessages: bookmarksStore.allBookmarkedMessages.length,
    totalBookmarkedSessions: bookmarksStore.allBookmarkedSessions.length,
    totalLabels: labelsStore.allLabels.length,
    totalBookmarks:
      bookmarksStore.allBookmarkedMessages.length + bookmarksStore.allBookmarkedSessions.length,
  }))

  return {
    bookmarksStore,
    labelsStore,
    chatStore,
    getSessionsByLabel,
    getSessionLabels,
    addLabelToSession,
    removeLabelFromSession,
    stats,
  }
}
