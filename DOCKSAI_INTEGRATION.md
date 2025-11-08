# DocksAI Client Integration Guide

## Overview

This guide covers integrating the RAG Pipeline API with a DocksAI client web application. The API provides document ingestion, intelligent querying with conversational memory, and advanced retrieval strategies.

## Quick Start

### Base Configuration

```javascript
// config/api.js
const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  endpoints: {
    // V2 Enhanced Endpoints (Recommended)
    ingest: '/api/v2/ingest',
    query: '/api/v2/query',
    compare: '/api/v2/query/compare-strategies',
    memory: '/api/v2/memory',
    cache: '/api/v2/cache',
    
    // V1 Basic Endpoints
    basicIngest: '/api/ingest',
    basicQuery: '/api/query'
  },
  timeout: 30000 // 30 seconds for large PDFs
};
```

---

## API Integration

### 1. Document Upload (Ingestion)

Upload PDFs for processing with automatic or manual chunking strategies.

```javascript
// services/documentService.js

/**
 * Upload and process a PDF document
 * @param {File} file - PDF file from file input
 * @param {string} docId - Unique document identifier
 * @param {Object} options - Chunking options
 */
async function uploadDocument(file, docId, options = {}) {
  // Convert PDF to base64
  const base64 = await fileToBase64(file);
  
  const payload = {
    doc_id: docId,
    pdf_base64: base64,
    chunkStrategy: options.strategy || 'auto',
    overwrite: options.overwrite || false,
    chunk_size: options.chunkSize || 1000,
    chunk_overlap: options.overlap || 200
  };
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.ingest}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Helper: Convert File to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });
}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Ingested 5p, 23c",
  "doc_id": "project-docs",
  "total_chunks": 23,
  "total_pages": 5,
  "processing_time_ms": 1636,
  "strategy": {
    "used": "recursive",
    "reason": "Auto: recursive"
  }
}
```

---

### 2. Query Documents

Ask questions with conversational memory and advanced retrieval.

```javascript
// services/queryService.js

/**
 * Query documents with optional conversation context
 * @param {string} question - User's question
 * @param {Object} options - Query options
 */
async function queryDocuments(question, options = {}) {
  const payload = {
    question: question,
    conversationId: options.conversationId, // For follow-up questions
    retrievalStrategy: options.strategy || 'auto',
    top_k: options.topK || 5,
    min_score: options.minScore || 0.7,
    doc_id: options.docId // Optional: filter by document
  };
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "answer": {
    "text": "The document explains that...",
    "sources": [
      {
        "text": "Relevant chunk text...",
        "doc_id": "project-docs",
        "page": 3,
        "score": 0.92
      }
    ],
    "confidence": 0.89
  },
  "conversationId": "550e8400-e29b-41d4-a716-446655440000",
  "turnId": 1,
  "usedMemory": false,
  "strategy": {
    "retrieval": "similarity",
    "reasoning": "similarity via analysis"
  },
  "metadata": {
    "queryTime": 234,
    "resultsCount": 5,
    "cacheHitRate": 80.5
  }
}
```

---

### 3. Conversation Memory

Enable multi-turn conversations with context preservation.

```javascript
// services/conversationService.js

class ConversationManager {
  constructor() {
    this.conversationId = null;
    this.history = [];
  }
  
  /**
   * Start a new conversation
   */
  startConversation() {
    this.conversationId = null;
    this.history = [];
  }
  
  /**
   * Ask a question with conversation context
   */
  async ask(question, options = {}) {
    const result = await queryDocuments(question, {
      ...options,
      conversationId: this.conversationId
    });
    
    // Save conversation ID from first response
    if (!this.conversationId) {
      this.conversationId = result.conversationId;
    }
    
    // Track history
    this.history.push({
      question,
      answer: result.answer.text,
      turnId: result.turnId,
      usedMemory: result.usedMemory
    });
    
    return result;
  }
  
  /**
   * Get conversation history from server
   */
  async getHistory() {
    if (!this.conversationId) return [];
    
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.memory}/${this.conversationId}`
    );
    return await response.json();
  }
  
  /**
   * Clear conversation memory
   */
  async clear() {
    if (!this.conversationId) return;
    
    await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.memory}/${this.conversationId}`,
      { method: 'DELETE' }
    );
    
    this.startConversation();
  }
}

// Usage
const conversation = new ConversationManager();

// First question
const result1 = await conversation.ask("What is the main topic?");

// Follow-up (uses memory)
const result2 = await conversation.ask("Can you explain that in more detail?");
// Server automatically resolves "that" using conversation context
```

---

### 4. Compare Retrieval Strategies

Test multiple strategies side-by-side for optimization.

```javascript
// services/comparisonService.js

/**
 * Compare multiple retrieval strategies
 * @param {string} question - Test question
 * @param {Array<string>} strategies - Strategies to compare
 */
async function compareStrategies(question, strategies = null) {
  const payload = {
    question: question,
    strategies: strategies || ['similarity', 'mmr', 'ensemble'],
    top_k: 5
  };
  
  const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.compare}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}
```

**Response Example**:
```json
{
  "success": true,
  "question": "What is the main feature?",
  "results": {
    "similarity": {
      "answer": "The main feature is...",
      "time_ms": 234,
      "resultsCount": 5,
      "avgScore": 0.87
    },
    "mmr": {
      "answer": "The primary feature is...",
      "time_ms": 312,
      "resultsCount": 5,
      "avgScore": 0.82
    },
    "ensemble": {
      "answer": "The key feature is...",
      "time_ms": 456,
      "resultsCount": 5,
      "avgScore": 0.91
    }
  }
}
```

---

## React Integration Examples

### Document Upload Component

```jsx
// components/DocumentUpload.jsx
import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [docId, setDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docId) return;
    
    setLoading(true);
    try {
      const response = await uploadDocument(file, docId, {
        strategy: 'auto',
        overwrite: false
      });
      setResult(response);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="upload-container">
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <input
          type="text"
          placeholder="Document ID (e.g., project-docs)"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>
      
      {result && (
        <div className="result">
          <p>✅ {result.message}</p>
          <p>Strategy: {result.strategy.used}</p>
          <p>Chunks: {result.total_chunks}</p>
        </div>
      )}
    </div>
  );
}
```

### Chat Interface Component

```jsx
// components/ChatInterface.jsx
import { useState, useRef, useEffect } from 'react';
import { ConversationManager } from '../services/conversationService';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const conversationRef = useRef(new ConversationManager());
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const result = await conversationRef.current.ask(input);
      
      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: result.answer.text,
        sources: result.answer.sources,
        metadata: {
          strategy: result.strategy.retrieval,
          confidence: result.answer.confidence,
          usedMemory: result.usedMemory
        }
      };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Query failed:', error);
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Sorry, something went wrong. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewConversation = () => {
    conversationRef.current.startConversation();
    setMessages([]);
  };
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>DocksAI Chat</h2>
        <button onClick={handleNewConversation}>New Conversation</button>
      </div>
      
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            {msg.sources && (
              <div className="sources">
                <small>Sources: {msg.sources.length} chunks</small>
              </div>
            )}
            {msg.metadata && (
              <div className="metadata">
                <small>
                  Strategy: {msg.metadata.strategy} | 
                  Confidence: {(msg.metadata.confidence * 100).toFixed(0)}%
                  {msg.metadata.usedMemory && ' | 🧠 Used memory'}
                </small>
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message loading">Thinking...</div>}
      </div>
      
      <form onSubmit={handleSend} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

---

## Advanced Features

### 1. Chunk Strategy Selection

Available strategies for different content types:

```javascript
const CHUNK_STRATEGIES = {
  auto: {
    name: 'Auto-Select',
    description: 'Auto best strategy selection',
    bestFor: ['unknown', 'mixed', 'general']
  },
  recursive: {
    name: 'Recursive',
    description: 'LangChain multi-separator splitting',
    bestFor: ['articles', 'docs', 'general']
  },
  semantic: {
    name: 'Semantic',
    description: 'Preserves boundaries',
    bestFor: ['technical', 'Q&A', 'structured']
  },
  precise: {
    name: 'Precise',
    description: 'Fixed-size LangChain splitting',
    bestFor: ['code', 'data', 'uniform']
  },
  'token-based': {
    name: 'Token-Based',
    description: 'LangChain GPT tokenizer',
    bestFor: ['API limits', 'embeddings', 'tokens']
  },
  contextual: {
    name: 'Contextual',
    description: 'Large overlap for context',
    bestFor: ['narratives', 'books', 'conversational']
  },
  hierarchical: {
    name: 'Hierarchical',
    description: 'Parent-child multi-level',
    bestFor: ['large docs', 'structured', 'summaries']
  },
  markdown: {
    name: 'Markdown',
    description: 'LangChain markdown structure',
    bestFor: ['markdown', 'GitHub', 'formatted']
  }
};

// Usage in upload form
<select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
  {Object.entries(CHUNK_STRATEGIES).map(([key, info]) => (
    <option key={key} value={key}>
      {info.name} - {info.bestFor.join(', ')}
    </option>
  ))}
</select>
```

### 2. Retrieval Strategy Selection

Different strategies for query optimization:

```javascript
const RETRIEVAL_STRATEGIES = {
  auto: 'Auto-select based on query analysis',
  similarity: 'Fast cosine similarity search',
  mmr: 'Maximum Marginal Relevance (diverse results)',
  ensemble: 'Combined multiple strategies',
  rerank: 'Re-rank results for better relevance',
  contextual: 'Use surrounding context',
  hybrid: 'Semantic + keyword search'
};

// Usage in query
<select value={retrievalStrategy} onChange={(e) => setRetrievalStrategy(e.target.value)}>
  {Object.entries(RETRIEVAL_STRATEGIES).map(([key, desc]) => (
    <option key={key} value={key}>{key}: {desc}</option>
  ))}
</select>
```

### 3. Cache Management

Clear embedding cache for performance testing:

```javascript
async function clearCache() {
  const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.cache}/clear`, {
    method: 'POST'
  });
  return await response.json();
}

async function getCacheStats() {
  const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.cache}/stats`);
  return await response.json();
}
```

---

## Error Handling

```javascript
// utils/errorHandler.js

export class APIError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export async function handleAPIResponse(response) {
  if (!response.ok) {
    const error = await response.json();
    throw new APIError(
      error.error || 'Request failed',
      error.code || 'UNKNOWN_ERROR',
      error
    );
  }
  return await response.json();
}

// Usage
try {
  const result = await queryDocuments(question);
} catch (error) {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'INVALID_QUESTION':
        alert('Please enter a valid question');
        break;
      case 'NO_CHUNKS':
        alert('No relevant content found');
        break;
      case 'DOCUMENT_EXISTS':
        alert('Document already exists. Enable overwrite?');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Environment Configuration

```javascript
// .env.local (for Next.js)
NEXT_PUBLIC_RAG_API_URL=http://localhost:3000
NEXT_PUBLIC_RAG_TIMEOUT=30000

// .env (for Create React App)
REACT_APP_RAG_API_URL=http://localhost:3000
REACT_APP_RAG_TIMEOUT=30000

// Usage
const API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 
                process.env.REACT_APP_RAG_API_URL ||
                'http://localhost:3000';
```

---

## Testing

### Unit Tests

```javascript
// __tests__/services/documentService.test.js
import { uploadDocument } from '../services/documentService';

describe('Document Service', () => {
  it('should upload PDF successfully', async () => {
    const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadDocument(mockFile, 'test-doc');
    
    expect(result.success).toBe(true);
    expect(result.doc_id).toBe('test-doc');
    expect(result.total_chunks).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```javascript
// __tests__/integration/chat.test.js
import { ConversationManager } from '../services/conversationService';

describe('Chat Integration', () => {
  let conversation;
  
  beforeEach(() => {
    conversation = new ConversationManager();
  });
  
  it('should maintain conversation context', async () => {
    const result1 = await conversation.ask('What is DocksAI?');
    expect(result1.usedMemory).toBe(false);
    
    const result2 = await conversation.ask('Tell me more about it');
    expect(result2.usedMemory).toBe(true); // Should use memory
    expect(result2.conversationId).toBe(result1.conversationId);
  });
});
```

---

## Performance Optimization

### 1. Request Debouncing

```javascript
import { debounce } from 'lodash';

const debouncedQuery = debounce(async (question) => {
  return await queryDocuments(question);
}, 500);

// Usage in search-as-you-type
<input onChange={(e) => debouncedQuery(e.target.value)} />
```

### 2. Response Caching

```javascript
class CachedQueryService {
  constructor() {
    this.cache = new Map();
  }
  
  async query(question, options = {}) {
    const key = JSON.stringify({ question, ...options });
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = await queryDocuments(question, options);
    this.cache.set(key, result);
    
    return result;
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

### 3. Progress Tracking

```javascript
async function uploadWithProgress(file, docId, onProgress) {
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    
    xhr.addEventListener('load', () => {
      resolve(JSON.parse(xhr.responseText));
    });
    
    xhr.addEventListener('error', reject);
    
    const base64 = await fileToBase64(file);
    xhr.open('POST', `${API_CONFIG.baseURL}/api/v2/ingest`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ doc_id: docId, pdf_base64: base64 }));
  });
}
```

---

## Production Deployment

### Environment Variables

```bash
# Production API endpoint
REACT_APP_RAG_API_URL=https://api.docksai.com
REACT_APP_RAG_TIMEOUT=60000
REACT_APP_MAX_FILE_SIZE=10485760  # 10MB
```

### CORS Configuration

Ensure the RAG API server allows your domain:

```javascript
// Server-side (already configured in src/index.ts)
app.use(cors({
  origin: ['https://docksai.com', 'https://app.docksai.com'],
  credentials: true
}));
```

### Security

```javascript
// Add API key authentication if needed
const API_KEY = process.env.REACT_APP_API_KEY;

async function authenticatedRequest(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-API-Key': API_KEY
    }
  });
}
```

---

## Complete Example App

```jsx
// App.jsx - Full DocksAI Integration
import { useState } from 'react';
import { DocumentUpload } from './components/DocumentUpload';
import { ChatInterface } from './components/ChatInterface';

export default function DocksAI() {
  const [activeTab, setActiveTab] = useState('chat');
  
  return (
    <div className="docksai-app">
      <header>
        <h1>DocksAI - Intelligent Document Assistant</h1>
        <nav>
          <button 
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={activeTab === 'upload' ? 'active' : ''}
            onClick={() => setActiveTab('upload')}
          >
            📄 Upload
          </button>
        </nav>
      </header>
      
      <main>
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'upload' && <DocumentUpload />}
      </main>
    </div>
  );
}
```

---

## API Reference Quick Links

- **Swagger Docs**: http://localhost:3000/swagger
- **Health Check**: http://localhost:3000/health
- **Cache Stats**: http://localhost:3000/api/cache/stats
- **Test Interface**: http://localhost:3000/test/v2

---

## Support & Troubleshooting

### Common Issues

1. **"Question cannot be empty"**: Ensure question length is 1-1000 chars
2. **"No chunks generated"**: PDF might be empty or corrupted
3. **"Document already exists"**: Set `overwrite: true` or use different doc_id
4. **CORS errors**: Check server CORS configuration
5. **Timeout errors**: Increase timeout for large PDFs

### Debug Mode

```javascript
// Enable verbose logging
const DEBUG = true;

async function debugQuery(question) {
  if (DEBUG) console.log('Query:', question);
  
  const start = performance.now();
  const result = await queryDocuments(question);
  const duration = performance.now() - start;
  
  if (DEBUG) {
    console.log('Result:', result);
    console.log('Duration:', duration + 'ms');
    console.log('Strategy:', result.strategy);
    console.log('Cache hit rate:', result.metadata.cacheHitRate + '%');
  }
  
  return result;
}
```

---

## Next Steps

1. ✅ Test upload with sample PDF
2. ✅ Test basic query
3. ✅ Test conversation memory with follow-ups
4. ✅ Compare retrieval strategies for your use case
5. ✅ Integrate into DocksAI UI components
6. ✅ Add error handling and loading states
7. ✅ Deploy to production

For more details, see:
- `README.md` - Setup and configuration
- `ALL_FIXES_APPLIED.md` - API fixes and validation
- `INFRASTRUCTURE_IMPROVED.md` - Performance improvements

**Happy building with DocksAI! 🚀**
