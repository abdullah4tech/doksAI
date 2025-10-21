// RAG Pipeline API Service
export interface IngestRequest {
  doc_id: string
  pdf_base64: string
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
  error?: string
  code?: string
}

export interface QueryRequest {
  question: string
  top_k?: number
  doc_id?: string
  min_score?: number
}

export interface QuerySource {
  doc_id: string
  page: number
  chunk_id: string
  text: string
  score: number
}

export interface QueryResponse {
  success: boolean
  answer?: {
    text: string
    sources: QuerySource[]
    confidence: number
  }
  query_time_ms?: number
  total_results?: number
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

  constructor(baseUrl: string = config.API_BASE_URL) {
    this.baseUrl = baseUrl
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
      const response = await fetch(`${this.baseUrl}/ingest`, {
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
      const response = await fetch(`${this.baseUrl}/query/enhanced`, {
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
      const response = await fetch(`${this.baseUrl}/health`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Health API error:', error)
      throw error
    }
  }

  async getStats(): Promise<StatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/query/stats`)
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
