// Environment configuration
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  API_TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: ['application/pdf'] as readonly string[],
  DEFAULT_CHUNK_SIZE: 1000,
  DEFAULT_CHUNK_OVERLAP: 200,
  DEFAULT_TOP_K: 8,
  DEFAULT_MIN_SCORE: 0.0,
} as const

export default config
