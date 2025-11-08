// RAG Pipeline API Service - V2 API (snake_case naming)

// Chunk strategies supported by the server
export type ChunkStrategy =
  | 'auto'
  | 'recursive'
  | 'semantic'
  | 'precise'
  | 'token-based'
  | 'contextual'
  | 'hierarchical'
  | 'markdown'

// Retrieval strategies supported by the server
export type RetrievalStrategy =
  | 'auto'
  | 'similarity'
  | 'mmr'
  | 'ensemble'
  | 'rerank'
  | 'contextual'
  | 'hybrid'

export interface IngestRequest {
  doc_id: string // required, 1-255 chars
  pdf_base64: string // required, base64 encoded PDF
  chunkStrategy?: ChunkStrategy
  overwrite?: boolean
  chunk_size?: number
  chunk_overlap?: number
}

export interface IngestResponse {
  success: boolean
  message?: string
  doc_id?: string
  total_chunks?: number
  total_pages?: number
  processing_time_ms?: number
  strategy?: {
    used: string
    reason: string
  }
  error?: string
  code?: string
}

export interface QueryRequest {
  question: string // required, 1-1000 chars
  conversationId?: string // optional, UUID for conversation context
  retrievalStrategy?: RetrievalStrategy
  top_k?: number
  min_score?: number
  mmr_lambda?: number
  doc_id?: string // optional, filter by specific document
}

export interface QuerySource {
  text: string
  doc_id: string
  page: number
  score: number
}

export interface QueryResponse {
  success: boolean
  answer?: {
    text: string
    sources: QuerySource[]
    confidence: number
  }
  conversationId?: string
  turnId?: number
  usedMemory?: boolean
  strategy?: {
    retrieval: string
    reasoning: string
  }
  metadata?: {
    queryTime: number
    resultsCount: number
    cacheHitRate: number
  }
  error?: string
  code?: string
}

export interface HealthResponse {
  status: string
  services: {
    api: string
    qdrant: string
  }
  timestamp: string
}

export interface StatsResponse {
  success: boolean
  collection_stats: {
    vectors_count: number
    indexed_vectors_count: number
    points_count: number
    segments_count: number
    disk_data_size: number
    ram_data_size: number
    config: {
      params: {
        vectors: {
          size: number
          distance: string
        }
      }
    }
  }
  timestamp: string
}

import config from '@/config'

class RagPipelineAPI {
  private baseUrl: string
  private endpoints: typeof config.API_ENDPOINTS
  private timeout: number

  constructor(baseUrl: string = config.API_BASE_URL) {
    this.baseUrl = baseUrl
    this.endpoints = config.API_ENDPOINTS
    this.timeout = config.API_TIMEOUT
  }

  // Helper: fetch with timeout using AbortController
  private async fetchWithTimeout(input: RequestInfo, init?: RequestInit) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    try {
      const options = Object.assign({}, init || {}, { signal: controller.signal })
      const res = await fetch(input, options)
      clearTimeout(timeoutId)
      return res
    } catch (err) {
      clearTimeout(timeoutId)
      throw err
    }
  }

  // Helper method to handle API failures and notify the status store
  private handleApiError(error: unknown, endpoint: string) {
    console.error(`${endpoint} API error:`, error)

    // Import the store dynamically to avoid circular dependencies
    import('@/store/apiStatus')
      .then(({ useApiStatusStore }) => {
        const apiStatusStore = useApiStatusStore()
        apiStatusStore.markApiError()
      })
      .catch(() => {
        // Fallback if store import fails
        console.warn('Could not update API status store')
      })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
    }
  }

  async ingestDocument(request: IngestRequest): Promise<IngestResponse> {
    try {
      const url = `${this.baseUrl}${this.endpoints.ingest}`
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return this.handleApiError(error, 'Ingest') as IngestResponse
    }
  }

  async queryDocuments(request: QueryRequest): Promise<QueryResponse> {
    try {
      const url = `${this.baseUrl}${this.endpoints.query}`
      const response = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return this.handleApiError(error, 'Query') as QueryResponse
    }
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      const url = `${this.baseUrl}${this.endpoints.health}`
      const response = await this.fetchWithTimeout(url)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Health API error:', error)
      throw error
    }
  }

  async getStats(): Promise<StatsResponse> {
    try {
      // Use cache endpoint stats if available
      const url = `${this.baseUrl}${this.endpoints.cache}/stats`
      const response = await this.fetchWithTimeout(url)
      const data = await response.json()
      return data
    } catch (error) {
      // Import the store dynamically to handle the error
      import('@/store/apiStatus')
        .then(({ useApiStatusStore }) => {
          const apiStatusStore = useApiStatusStore()
          apiStatusStore.markApiError()
        })
        .catch(() => {
          console.warn('Could not update API status store')
        })

      console.error('Stats API error:', error)
      throw error
    }
  }

  // Helper function to convert file to base64
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1]
        if (!base64) {
          reject(new Error('Failed to convert file to base64'))
          return
        }
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  // Helper function to validate file
  static validatePdfFile(file: File): { valid: boolean; error?: string } {
    if (!config.SUPPORTED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Please select a PDF file' }
    }

    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(config.MAX_FILE_SIZE / (1024 * 1024))}MB`,
      }
    }

    return { valid: true }
  }
}

export const ragAPI = new RagPipelineAPI()
export default RagPipelineAPI
