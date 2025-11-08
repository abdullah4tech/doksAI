// Environment configuration
export const config = {
  // Base URL can be configured via Vite env var. Default to port 3000 to match DockSAI guide.
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',

  // Timeout (ms) for long-running operations like large PDF ingestion
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000, // 30 seconds

  // API endpoint mappings (V2 API - snake_case naming)
  API_ENDPOINTS: {
    ingest: '/api/v2/ingest',
    query: '/api/v2/query',
    compareStrategies: '/api/v2/query/compare-strategies',
    memory: '/api/v2/memory',
    cache: '/api/v2/cache',
    health: '/health',
  },

  // File upload constraints
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: ['application/pdf'] as readonly string[],

  // Default chunking parameters (align with server defaults)
  DEFAULT_CHUNK_SIZE: 1000,
  DEFAULT_CHUNK_OVERLAP: 200,
  DEFAULT_CHUNK_STRATEGY: 'auto' as const,

  // Default query parameters (align with server recommendations)
  DEFAULT_TOP_K: 5,
  DEFAULT_MIN_SCORE: 0.7,
  DEFAULT_MMR_LAMBDA: 0.5,
  DEFAULT_RETRIEVAL_STRATEGY: 'auto' as const,
} as const

export default config
