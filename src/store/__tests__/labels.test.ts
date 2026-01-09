import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLabelsStore, DEFAULT_COLORS } from '../labels'

describe('Labels Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('createLabel', () => {
    it('should create a new label with name and color', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Important', DEFAULT_COLORS[0])

      expect(label.name).toBe('Important')
      expect(label.color).toBe(DEFAULT_COLORS[0])
      expect(label.id).toBeDefined()
      expect(label.createdAt).toBeInstanceOf(Date)
    })

    it('should trim label name', () => {
      const store = useLabelsStore()
      const label = store.createLabel('  Test Label  ', DEFAULT_COLORS[0])

      expect(label.name).toBe('Test Label')
    })

    it('should throw error if label name is empty', () => {
      const store = useLabelsStore()

      expect(() => store.createLabel('', DEFAULT_COLORS[0])).toThrow(
        'Label name cannot be empty',
      )
    })

    it('should throw error if label name exceeds 20 characters', () => {
      const store = useLabelsStore()
      const longName = 'a'.repeat(21)

      expect(() => store.createLabel(longName, DEFAULT_COLORS[0])).toThrow(
        'Label name must be 20 characters or less',
      )
    })

    it('should throw error if maximum labels reached (50)', () => {
      const store = useLabelsStore()

      // Create 50 labels
      for (let i = 0; i < 50; i++) {
        store.createLabel(`Label ${i}`, DEFAULT_COLORS[i % DEFAULT_COLORS.length])
      }

      // Try to create 51st label
      expect(() => store.createLabel('Extra Label', DEFAULT_COLORS[0])).toThrow(
        'Maximum 50 labels allowed',
      )
    })

    it('should persist label to localStorage', () => {
      const store = useLabelsStore()
      store.createLabel('Test', DEFAULT_COLORS[0])

      const stored = localStorage.getItem('chat_labels')
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(Object.keys(parsed).length).toBe(1)
    })
  })

  describe('updateLabel', () => {
    it('should update label name and color', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Original', DEFAULT_COLORS[0])

      store.updateLabel(label.id, 'Updated', DEFAULT_COLORS[1])

      const updated = store.getLabelById(label.id)
      expect(updated?.name).toBe('Updated')
      expect(updated?.color).toBe(DEFAULT_COLORS[1])
    })

    it('should throw error if label not found', () => {
      const store = useLabelsStore()

      expect(() => store.updateLabel('non-existent-id', 'Name', DEFAULT_COLORS[0])).toThrow(
        'Label not found',
      )
    })

    it('should throw error if new name is empty', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Test', DEFAULT_COLORS[0])

      expect(() => store.updateLabel(label.id, '', DEFAULT_COLORS[0])).toThrow(
        'Label name cannot be empty',
      )
    })

    it('should throw error if new name exceeds 20 characters', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Test', DEFAULT_COLORS[0])
      const longName = 'a'.repeat(21)

      expect(() => store.updateLabel(label.id, longName, DEFAULT_COLORS[0])).toThrow(
        'Label name must be 20 characters or less',
      )
    })
  })

  describe('deleteLabel', () => {
    it('should delete label', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Test', DEFAULT_COLORS[0])

      expect(store.allLabels.length).toBe(1)

      store.deleteLabel(label.id)

      expect(store.allLabels.length).toBe(0)
      expect(store.getLabelById(label.id)).toBeUndefined()
    })

    it('should not throw error if deleting non-existent label', () => {
      const store = useLabelsStore()

      expect(() => store.deleteLabel('non-existent-id')).not.toThrow()
    })

    it('should persist deletion to localStorage', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Test', DEFAULT_COLORS[0])
      store.deleteLabel(label.id)

      const stored = localStorage.getItem('chat_labels')
      const parsed = JSON.parse(stored!)
      expect(Object.keys(parsed).length).toBe(0)
    })
  })

  describe('getLabelById', () => {
    it('should return label by id', () => {
      const store = useLabelsStore()
      const label = store.createLabel('Test', DEFAULT_COLORS[0])

      const retrieved = store.getLabelById(label.id)
      expect(retrieved).toEqual(label)
    })

    it('should return undefined for non-existent id', () => {
      const store = useLabelsStore()

      expect(store.getLabelById('non-existent-id')).toBeUndefined()
    })
  })

  describe('getLabelsByIds', () => {
    it('should return multiple labels by ids', () => {
      const store = useLabelsStore()
      const label1 = store.createLabel('Label1', DEFAULT_COLORS[0])
      const label2 = store.createLabel('Label2', DEFAULT_COLORS[1])

      const retrieved = store.getLabelsByIds([label1.id, label2.id])
      expect(retrieved).toHaveLength(2)
      expect(retrieved[0]).toEqual(label1)
      expect(retrieved[1]).toEqual(label2)
    })

    it('should filter out non-existent ids', () => {
      const store = useLabelsStore()
      const label1 = store.createLabel('Label1', DEFAULT_COLORS[0])

      const retrieved = store.getLabelsByIds([label1.id, 'non-existent'])
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0]).toEqual(label1)
    })

    it('should return empty array for all non-existent ids', () => {
      const store = useLabelsStore()

      const retrieved = store.getLabelsByIds(['id1', 'id2'])
      expect(retrieved).toHaveLength(0)
    })
  })

  describe('allLabels computed', () => {
    it('should return all labels sorted by creation date descending', () => {
      const store = useLabelsStore()
      const label1 = store.createLabel('Label1', DEFAULT_COLORS[0])

      // Small delay to ensure different timestamps
      const label2 = store.createLabel('Label2', DEFAULT_COLORS[1])

      const all = store.allLabels
      expect(all).toHaveLength(2)
      expect(all[0].id).toBe(label2.id) // Newer first
      expect(all[1].id).toBe(label1.id)
    })
  })
})
