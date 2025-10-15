export interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatSession {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
