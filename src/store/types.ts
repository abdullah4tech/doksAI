export interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: Date
  isStreaming?: boolean
  sources?: QuerySource[]
  confidence?: number
  isBookmarked?: boolean
}

export interface ChatSession {
  id: string
  title?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isArchived?: boolean
  labels?: string[]
  isBookmarked?: boolean
}

export interface Label {
  id: string
  name: string
  color: string
  createdAt: Date
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
  text: string
  doc_id: string
  page: number
  score: number
}
