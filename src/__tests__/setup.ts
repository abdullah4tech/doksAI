import { afterEach, vi } from 'vitest'

// Mock scrollTo for jsdom
Element.prototype.scrollTo = vi.fn()

afterEach(() => {
  vi.clearAllMocks()
})
