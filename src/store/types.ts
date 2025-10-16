export interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: Date
  isStreaming?: boolean
  sources?: QuerySource[]
  confidence?: number
}

export interface ChatSession {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  name: string
  size: string
  uploadDate: Date
  status: 'uploading' | 'ready' | 'error'
  totalChunks?: number
  totalPages?: number
  processingTime?: number
  errorMessage?: string
}

export interface QuerySource {
  doc_id: string
  page: number
  chunk_id: string
  text: string
  score: number
}
