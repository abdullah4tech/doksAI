import { vi } from 'vitest'
import {
  mockIngestSuccessResponse,
  mockQuerySuccessResponse,
  mockHealthResponse,
} from '../utils/mockData'

/**
 * Mock RagPipelineAPI class for testing
 */
export class MockRagPipelineAPI {
  baseUrl: string

  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  async ingestDocument(request: any) {
    return Promise.resolve(mockIngestSuccessResponse)
  }

  async queryDocuments(request: any) {
    return Promise.resolve(mockQuerySuccessResponse)
  }

  async getHealth() {
    return Promise.resolve(mockHealthResponse)
  }

  async getStats() {
    return Promise.resolve({
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
    })
  }

  static fileToBase64(file: File) {
    return Promise.resolve('base64-encoded-content-here')
  }

  static validatePdfFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      return { valid: false, error: 'Please select a PDF file' }
    }
    if (file.size > 100 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 100MB' }
    }
    return { valid: true }
  }
}

/**
 * Create mock API with spies
 */
export function createMockAPI() {
  const api = new MockRagPipelineAPI()
  return {
    instance: api,
    ingestDocument: vi.spyOn(api, 'ingestDocument'),
    queryDocuments: vi.spyOn(api, 'queryDocuments'),
    getHealth: vi.spyOn(api, 'getHealth'),
    getStats: vi.spyOn(api, 'getStats'),
  }
}

/**
 * Mock fetch for API calls
 */
export function mockFetch() {
  const fetchMock = vi.fn()

  global.fetch = fetchMock as any

  return {
    mockFetch,
    setup: (responses: Record<string, any>) => {
      fetchMock.mockImplementation((url: string) => {
        for (const [urlPattern, response] of Object.entries(responses)) {
          if (url.includes(urlPattern)) {
            return Promise.resolve(
              new Response(JSON.stringify(response), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }),
            )
          }
        }
        return Promise.reject(new Error(`No mock response for ${url}`))
      })
    },
    reset: () => fetchMock.mockReset(),
    clear: () => fetchMock.mockClear(),
  }
}
