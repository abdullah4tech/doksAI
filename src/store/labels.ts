import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Label } from './types'
import { v4 as uuidv4 } from 'uuid'

// Default label colors - 10 options
export const DEFAULT_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#06B6D4', // Cyan
  '#8B5CF6', // Indigo
]

export const useLabelsStore = defineStore('labels', () => {
  // Load labels from localStorage
  const savedLabels = localStorage.getItem('chat_labels')
  const initialLabels = savedLabels
    ? JSON.parse(savedLabels, (key, value) => {
        if (key === 'createdAt') {
          return new Date(value)
        }
        return value
      })
    : {}

  const labels = ref<Record<string, Label>>(initialLabels)

  // Persist to localStorage whenever labels change
  const persistLabels = () => {
    localStorage.setItem('chat_labels', JSON.stringify(labels.value))
  }

  const allLabels = computed(() => {
    return Object.values(labels.value).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  })

  const createLabel = (name: string, color: string): Label => {
    // Validate inputs
    if (!name.trim()) {
      throw new Error('Label name cannot be empty')
    }
    if (name.length > 20) {
      throw new Error('Label name must be 20 characters or less')
    }
    if (allLabels.value.length >= 50) {
      throw new Error('Maximum 50 labels allowed')
    }

    const label: Label = {
      id: uuidv4(),
      name: name.trim(),
      color,
      createdAt: new Date(),
    }

    labels.value[label.id] = label
    persistLabels()
    return label
  }

  const updateLabel = (labelId: string, name: string, color: string): void => {
    if (!labels.value[labelId]) {
      throw new Error('Label not found')
    }
    if (!name.trim()) {
      throw new Error('Label name cannot be empty')
    }
    if (name.length > 20) {
      throw new Error('Label name must be 20 characters or less')
    }

    labels.value[labelId].name = name.trim()
    labels.value[labelId].color = color
    persistLabels()
  }

  const deleteLabel = (labelId: string): void => {
    if (labels.value[labelId]) {
      delete labels.value[labelId]
      persistLabels()
    }
  }

  const getLabelById = (labelId: string): Label | undefined => {
    return labels.value[labelId]
  }

  const getLabelsByIds = (labelIds: string[]): Label[] => {
    return labelIds
      .map((id) => labels.value[id])
      .filter((label): label is Label => label !== undefined)
  }

  return {
    labels,
    allLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    getLabelById,
    getLabelsByIds,
  }
})
