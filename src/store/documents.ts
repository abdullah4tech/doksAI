import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document } from './types'
import { ragAPI, type IngestRequest } from '@/services/api'
import RagPipelineAPI from '@/services/api'
import config from '@/config'

export const useDocumentStore = defineStore('document', () => {
  const documents = ref<Record<string, Document>>({})
  const isUploading = ref(false)
  const uploadProgress = ref<Record<string, number>>({})

  const allDocuments = computed(() => {
    return Object.values(documents.value).sort(
      (a, b) => b.uploadDate.getTime() - a.uploadDate.getTime(),
    )
  })

  const readyDocuments = computed(() => {
    return allDocuments.value.filter((doc) => doc.status === 'ready')
  })

  const uploadingDocuments = computed(() => {
    return allDocuments.value.filter((doc) => doc.status === 'uploading')
  })

  const addDocument = (file: File): string => {
    const docId = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const newDocument: Document = {
      id: docId,
      name: file.name,
      size: formatFileSize(file.size),
      uploadDate: new Date(),
      status: 'uploading',
    }

    documents.value[docId] = newDocument
    uploadProgress.value[docId] = 0

    // Start the upload process
    uploadDocument(file, docId)

    return docId
  }

  const uploadDocument = async (file: File, docId: string) => {
    try {
      isUploading.value = true
      uploadProgress.value[docId] = 10

      // Validate file
      const validation = RagPipelineAPI.validatePdfFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      uploadProgress.value[docId] = 30

      // Convert to base64
      const base64 = await RagPipelineAPI.fileToBase64(file)
      uploadProgress.value[docId] = 60

      // Prepare request
      const request: IngestRequest = {
        doc_id: docId,
        pdf_base64: base64,
        overwrite: true,
        chunk_size: config.DEFAULT_CHUNK_SIZE,
        chunk_overlap: config.DEFAULT_CHUNK_OVERLAP,
      }

      uploadProgress.value[docId] = 80

      // Send to API
      const response = await ragAPI.ingestDocument(request)

      if (response.success) {
        updateDocument(docId, {
          status: 'ready',
          totalChunks: response.total_chunks,
          totalPages: response.total_pages,
          processingTime: response.processing_time_ms,
        })
        uploadProgress.value[docId] = 100
      } else {
        throw new Error(response.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Document upload error:', error)
      updateDocument(docId, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      isUploading.value = false
      // Clean up progress after a delay
      setTimeout(() => {
        delete uploadProgress.value[docId]
      }, 2000)
    }
  }

  const updateDocument = (docId: string, updates: Partial<Document>) => {
    const document = documents.value[docId]
    if (document) {
      Object.assign(document, updates)
    }
  }

  const removeDocument = (docId: string) => {
    delete documents.value[docId]
    delete uploadProgress.value[docId]
  }

  const getDocumentProgress = (docId: string): number => {
    return uploadProgress.value[docId] || 0
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    documents,
    isUploading,
    uploadProgress,
    allDocuments,
    readyDocuments,
    uploadingDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    getDocumentProgress,
  }
})
