import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import type { Toast } from '@/store/toast'
import type { Document } from '@/store/types'

/**
 * Setup Pinia store for testing
 */
export function setupTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Create a mock toast object
 */
export function createMockToast(overrides?: Partial<Toast>): Toast {
  return {
    id: 'toast-1',
    title: 'Test Toast',
    description: 'This is a test toast',
    type: 'success',
    duration: 5000,
    ...overrides,
  }
}

/**
 * Create a mock document object
 */
export function createMockDocument(overrides?: Partial<Document>): Document {
  return {
    id: 'doc-1',
    name: 'test-document.pdf',
    size: '1 MB',
    uploadDate: new Date(),
    status: 'ready',
    totalChunks: 10,
    totalPages: 5,
    processingTime: 1000,
    ...overrides,
  }
}

/**
 * Create a mock File object
 */
export function createMockFile(
  name = 'test.pdf',
  size = 1024 * 1024,
  type = 'application/pdf',
): File {
  const blob = new Blob(['test content'], { type })
  return new File([blob], name, { type })
}

/**
 * Wait for async operations to complete
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * Mock localStorage for testing
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((key) => {
        delete store[key]
      })
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    },
  }
}

/**
 * Create a mock fetch response
 */
export function createMockFetchResponse<T>(data: T, status = 200): Response {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
  return response
}

/**
 * Verify fetch was called with correct arguments
 */
export function verifyFetchCall(
  fetchMock: ReturnType<typeof vi.fn>,
  url: string,
  options?: Partial<RequestInit>,
) {
  const call = fetchMock.mock.calls.find((c) => c[0].includes(url))
  if (!call) {
    throw new Error(`Fetch was not called with URL: ${url}`)
  }

  if (options) {
    const callOptions = call[1] || {}
    Object.entries(options).forEach(([key, value]) => {
      if (JSON.stringify(callOptions[key as keyof RequestInit]) !== JSON.stringify(value)) {
        throw new Error(`Fetch options mismatch for ${key}`)
      }
    })
  }

  return call
}
