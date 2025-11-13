import type { Document } from '@/store/types'
import type { IngestResponse, QueryResponse, HealthResponse } from '@/services/api'

/**
 * Mock documents data
 */
export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    name: 'Example Document 1.pdf',
    size: '2.5 MB',
    uploadDate: new Date('2024-01-15'),
    status: 'ready',
    totalChunks: 45,
    totalPages: 20,
    processingTime: 2500,
  },
  {
    id: 'doc-002',
    name: 'Example Document 2.pdf',
    size: '1.2 MB',
    uploadDate: new Date('2024-01-14'),
    status: 'ready',
    totalChunks: 22,
    totalPages: 10,
    processingTime: 1200,
  },
  {
    id: 'doc-003',
    name: 'Uploading Document.pdf',
    size: '3 MB',
    uploadDate: new Date('2024-01-16'),
    status: 'uploading',
  },
  {
    id: 'doc-004',
    name: 'Error Document.pdf',
    size: '5 MB',
    uploadDate: new Date('2024-01-16'),
    status: 'error',
    errorMessage: 'File size exceeds limit',
  },
]

/**
 * Mock API ingest response - success
 */
export const mockIngestSuccessResponse: IngestResponse = {
  success: true,
  message: 'Document ingested successfully',
  doc_id: 'doc-001',
  total_chunks: 45,
  total_pages: 20,
  processing_time_ms: 2500,
  strategy: {
    used: 'recursive',
    reason: 'Optimal for complex documents',
  },
}

/**
 * Mock API ingest response - error
 */
export const mockIngestErrorResponse: IngestResponse = {
  success: false,
  error: 'Invalid PDF format',
  code: 'INVALID_FORMAT',
  doc_id: 'doc-invalid',
}

/**
 * Mock API query response - success
 */
export const mockQuerySuccessResponse: QueryResponse = {
  success: true,
  answer: {
    text: 'This is a sample answer based on the retrieved documents.',
    sources: [
      {
        text: 'Sample text from document chunk 1',
        doc_id: 'doc-001',
        page: 5,
        score: 0.95,
      },
      {
        text: 'Sample text from document chunk 2',
        doc_id: 'doc-002',
        page: 12,
        score: 0.87,
      },
    ],
    confidence: 0.92,
  },
  conversationId: 'conv-12345',
  turnId: 1,
  usedMemory: true,
  strategy: {
    retrieval: 'mmr',
    reasoning: 'Maximum Marginal Relevance for diversity',
  },
  metadata: {
    queryTime: 250,
    resultsCount: 2,
    cacheHitRate: 0.75,
  },
}

/**
 * Mock API query response - error
 */
export const mockQueryErrorResponse: QueryResponse = {
  success: false,
  error: 'No documents found for query',
  code: 'NO_DOCUMENTS',
}

/**
 * Mock API health response
 */
export const mockHealthResponse: HealthResponse = {
  status: 'healthy',
  services: {
    api: 'healthy',
    qdrant: 'healthy',
  },
  timestamp: new Date().toISOString(),
}

/**
 * Mock API health response - degraded
 */
export const mockHealthDegradedResponse: HealthResponse = {
  status: 'degraded',
  services: {
    api: 'healthy',
    qdrant: 'unhealthy',
  },
  timestamp: new Date().toISOString(),
}
