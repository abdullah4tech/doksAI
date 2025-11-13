import { vi } from 'vitest'

export class MockRagPipelineAPI {
  baseUrl: string

  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  async ingestDocument() {
    return { success: true }
  }

  async queryDocuments() {
    return { success: true }
  }

  async getHealth() {
    return { status: 'healthy', services: { api: 'healthy', qdrant: 'healthy' } }
  }

  async getStats() {
    return { success: true, collection_stats: {} }
  }

  static fileToBase64() {
    return Promise.resolve('base64-content')
  }

  static validatePdfFile(file: File) {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please select a PDF file' }
    }
    return { valid: true }
  }
}

export const ragAPI = new MockRagPipelineAPI()
export default MockRagPipelineAPI
