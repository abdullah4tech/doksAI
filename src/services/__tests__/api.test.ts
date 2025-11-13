import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import RagPipelineAPI, { type IngestRequest, type QueryRequest } from '../api'
import {
  mockIngestSuccessResponse,
  mockIngestErrorResponse,
  mockQuerySuccessResponse,
  mockQueryErrorResponse,
  mockHealthResponse,
} from '../../__tests__/utils/mockData'

// Mock fetch globally
global.fetch = vi.fn()

describe('RagPipelineAPI', () => {
  let api: RagPipelineAPI
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    api = new RagPipelineAPI('http://localhost:8000')
    fetchMock = global.fetch as ReturnType<typeof vi.fn>
    fetchMock.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Document Ingestion', () => {
    it('should ingest a document successfully', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockIngestSuccessResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
        chunk_size: 512,
        chunk_overlap: 50,
      }

      const response = await api.ingestDocument(request)

      expect(response.success).toBe(true)
      expect(response.doc_id).toBe('doc-001')
      expect(response.total_chunks).toBe(45)
      expect(response.total_pages).toBe(20)
    })

    it('should handle ingest errors', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockIngestErrorResponse), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const request: IngestRequest = {
        doc_id: 'doc-invalid',
        pdf_base64: 'invalid-base64',
      }

      const response = await api.ingestDocument(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('Invalid PDF')
    })

    it('should handle network errors during ingest', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
      }

      const response = await api.ingestDocument(request)

      expect(response.success).toBe(false)
      expect(response.code).toBe('NETWORK_ERROR')
    })

    it('should make correct ingest API call', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockIngestSuccessResponse)),
      )

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
      }

      await api.ingestDocument(request)

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/ingest'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        }),
      )
    })
  })

  describe('Document Querying', () => {
    it('should query documents successfully', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuerySuccessResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const request: QueryRequest = {
        question: 'What is the main topic?',
        top_k: 5,
      }

      const response = await api.queryDocuments(request)

      expect(response.success).toBe(true)
      expect(response.answer?.text).toBeDefined()
      expect(response.answer?.sources).toHaveLength(2)
    })

    it('should handle query errors', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockQueryErrorResponse), {
          status: 400,
        }),
      )

      const request: QueryRequest = {
        question: 'Invalid query',
      }

      const response = await api.queryDocuments(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('No documents')
    })

    it('should handle network errors during query', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network timeout'))

      const request: QueryRequest = {
        question: 'What is the topic?',
      }

      const response = await api.queryDocuments(request)

      expect(response.success).toBe(false)
      expect(response.code).toBe('NETWORK_ERROR')
    })

    it('should include retrieved sources in response', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuerySuccessResponse)),
      )

      const request: QueryRequest = {
        question: 'Test question',
      }

      const response = await api.queryDocuments(request)

      expect(response.answer?.sources).toHaveLength(2)
      expect(response.answer?.sources[0]).toHaveProperty('doc_id')
      expect(response.answer?.sources[0]).toHaveProperty('score')
      expect(response.answer?.sources[0]).toHaveProperty('page')
    })
  })

  describe('Health Check', () => {
    it('should get health status', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockHealthResponse)),
      )

      const response = await api.getHealth()

      expect(response.status).toBe('healthy')
      expect(response.services.api).toBe('healthy')
      expect(response.services.qdrant).toBe('healthy')
    })

    it('should handle health check errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Health check failed'))

      try {
        await api.getHealth()
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('Statistics', () => {
    it('should get collection statistics', async () => {
      const statsResponse = {
        success: true,
        collection_stats: {
          vectors_count: 1000,
          indexed_vectors_count: 1000,
          points_count: 100,
          segments_count: 5,
          disk_data_size: 1024000,
          ram_data_size: 512000,
          config: {
            params: {
              vectors: {
                size: 384,
                distance: 'cosine',
              },
            },
          },
        },
        timestamp: new Date().toISOString(),
      }

      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(statsResponse)),
      )

      const response = await api.getStats()

      expect(response.success).toBe(true)
      expect(response.collection_stats.vectors_count).toBe(1000)
    })

    it('should handle stats errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Stats not available'))

      try {
        await api.getStats()
        expect(true).toBe(false)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('File Utilities', () => {
    it('should convert file to base64', async () => {
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })

      const base64 = await RagPipelineAPI.fileToBase64(file)

      expect(typeof base64).toBe('string')
      expect(base64.length).toBeGreaterThan(0)
    })

    it('should validate PDF files', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' })

      const pdfValidation = RagPipelineAPI.validatePdfFile(pdfFile)
      const txtValidation = RagPipelineAPI.validatePdfFile(txtFile)

      expect(pdfValidation.valid).toBe(true)
      expect(txtValidation.valid).toBe(false)
      expect(txtValidation.error).toContain('PDF')
    })

    it('should validate file size', () => {
      const smallFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      const smallValidation = RagPipelineAPI.validatePdfFile(smallFile)

      expect(smallValidation.valid).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Request timeout'))

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
      }

      const response = await api.ingestDocument(request)

      expect(response.success).toBe(false)
      expect(response.code).toBe('NETWORK_ERROR')
    })

    it('should handle JSON parsing errors', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('invalid json', { status: 200 }),
      )

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
      }

      try {
        await api.ingestDocument(request)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle server errors', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
        }),
      )

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
      }

      const response = await api.ingestDocument(request)

      expect(response).toBeDefined()
    })
  })

  describe('Request/Response Transformation', () => {
    it('should include all required fields in ingest request', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockIngestSuccessResponse)),
      )

      const request: IngestRequest = {
        doc_id: 'doc-001',
        pdf_base64: 'base64-content',
        chunk_size: 512,
        chunk_overlap: 50,
        overwrite: true,
      }

      await api.ingestDocument(request)

      const callBody = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      )
      expect(callBody.doc_id).toBe('doc-001')
      expect(callBody.pdf_base64).toBe('base64-content')
    })

    it('should transform query response with metadata', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(mockQuerySuccessResponse)),
      )

      const request: QueryRequest = {
        question: 'What is this?',
      }

      const response = await api.queryDocuments(request)

      expect(response.metadata).toBeDefined()
      expect(response.metadata?.queryTime).toBeDefined()
      expect(response.metadata?.resultsCount).toBeDefined()
    })
  })
})
