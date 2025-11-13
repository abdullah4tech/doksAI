import { vi } from 'vitest'

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store)
    return keys[index] ?? null
  }

  get length(): number {
    return Object.keys(this.store).length
  }
}

/**
 * Setup mock localStorage
 */
export function setupMockLocalStorage() {
  const mockStorage = new MockLocalStorage()
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })
  return mockStorage
}

/**
 * Create localStorage mock with spies
 */
export function createMockStorageWithSpies() {
  const storage = new MockLocalStorage()

  return {
    instance: storage,
    getItem: vi.spyOn(storage, 'getItem'),
    setItem: vi.spyOn(storage, 'setItem'),
    removeItem: vi.spyOn(storage, 'removeItem'),
    clear: vi.spyOn(storage, 'clear'),
  }
}
