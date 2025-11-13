import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDocumentStore } from '../documents'
import { setupTestPinia, createMockFile, createMockDocument, flushPromises } from '../../__tests__/utils/testHelpers'

vi.mock('@/services/api')
vi.mock('@/store/toast')

describe('Document Store', () => {
  beforeEach(() => {
    setupTestPinia()
  })

  describe('Document Addition', () => {
    it('should add a document to the store', () => {
      const store = useDocumentStore()
      const file = createMockFile('test.pdf', 1024 * 1024)

      const docId = store.addDocument(file)

      expect(docId).toBeDefined()
      expect(store.documents[docId]).toBeDefined()
      expect(store.documents[docId].name).toBe('test.pdf')
      expect(store.documents[docId].status).toBe('uploading')
    })

    it('should generate unique document IDs', () => {
      const store = useDocumentStore()
      const file1 = createMockFile('test1.pdf')
      const file2 = createMockFile('test2.pdf')

      const docId1 = store.addDocument(file1)
      const docId2 = store.addDocument(file2)

      expect(docId1).not.toBe(docId2)
    })

    it('should initialize upload progress entry', () => {
      const store = useDocumentStore()
      const file = createMockFile('test.pdf')

      const docId = store.addDocument(file)

      expect(docId in store.uploadProgress).toBe(true)
      expect(typeof store.uploadProgress[docId]).toBe('number')
    })
  })

  describe('Document Deletion', () => {
    it('should remove a document from the store', () => {
      const store = useDocumentStore()
      const file = createMockFile('test.pdf')
      const docId = store.addDocument(file)

      expect(store.documents[docId]).toBeDefined()

      store.removeDocument(docId)

      expect(store.documents[docId]).toBeUndefined()
    })

    it('should clean up upload progress when removing document', () => {
      const store = useDocumentStore()
      const file = createMockFile('test.pdf')
      const docId = store.addDocument(file)

      store.removeDocument(docId)

      expect(store.uploadProgress[docId]).toBeUndefined()
    })
  })

  describe('Document State Management', () => {
    it('should compute allDocuments sorted by date', () => {
      const store = useDocumentStore()

      const doc1 = createMockDocument({
        id: 'doc-1',
        uploadDate: new Date('2024-01-10'),
      })
      const doc2 = createMockDocument({
        id: 'doc-2',
        uploadDate: new Date('2024-01-20'),
      })

      store.documents['doc-1'] = doc1
      store.documents['doc-2'] = doc2

      const allDocs = store.allDocuments
      expect(allDocs[0].id).toBe('doc-2') // Most recent first
      expect(allDocs[1].id).toBe('doc-1')
    })

    it('should filter ready documents', () => {
      const store = useDocumentStore()

      store.documents['ready-doc'] = createMockDocument({
        id: 'ready-doc',
        status: 'ready',
      })
      store.documents['uploading-doc'] = createMockDocument({
        id: 'uploading-doc',
        status: 'uploading',
      })

      const readyDocs = store.readyDocuments
      expect(readyDocs).toHaveLength(1)
      expect(readyDocs[0].id).toBe('ready-doc')
    })

    it('should filter uploading documents', () => {
      const store = useDocumentStore()

      store.documents['ready-doc'] = createMockDocument({
        id: 'ready-doc',
        status: 'ready',
      })
      store.documents['uploading-doc'] = createMockDocument({
        id: 'uploading-doc',
        status: 'uploading',
      })

      const uploadingDocs = store.uploadingDocuments
      expect(uploadingDocs).toHaveLength(1)
      expect(uploadingDocs[0].id).toBe('uploading-doc')
    })
  })

  describe('Document Updates', () => {
    it('should update document properties', () => {
      const store = useDocumentStore()
      const docId = 'doc-1'

      store.documents[docId] = createMockDocument({ id: docId, status: 'uploading' })

      store.updateDocument(docId, {
        status: 'ready',
        totalChunks: 42,
      })

      expect(store.documents[docId].status).toBe('ready')
      expect(store.documents[docId].totalChunks).toBe(42)
    })

    it('should not throw when updating non-existent document', () => {
      const store = useDocumentStore()

      expect(() => {
        store.updateDocument('non-existent', { status: 'ready' })
      }).not.toThrow()
    })
  })

  describe('Progress Tracking', () => {
    it('should get document progress', () => {
      const store = useDocumentStore()
      const docId = 'doc-1'

      store.uploadProgress[docId] = 50

      expect(store.getDocumentProgress(docId)).toBe(50)
    })

    it('should return 0 for documents without progress', () => {
      const store = useDocumentStore()

      const progress = store.getDocumentProgress('non-existent')

      expect(progress).toBe(0)
    })
  })

  describe('File Upload', () => {
    it('should handle file validation errors', async () => {
      const store = useDocumentStore()
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      const docId = store.addDocument(invalidFile)

      await flushPromises()

      expect(store.documents[docId].status).toBe('error')
    })

    it('should initialize document with file name and size', () => {
      const store = useDocumentStore()
      const file = createMockFile('document.pdf', 512 * 1024) // 512 KB

      const docId = store.addDocument(file)

      expect(store.documents[docId].name).toBe('document.pdf')
      expect(store.documents[docId].size).toBeDefined()
      expect(store.documents[docId].uploadDate).toBeDefined()
    })
  })
})
