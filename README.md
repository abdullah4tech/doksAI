# Doks AI - RAG Pipeline Frontend

A modern Vue.js frontend for the RAG (Retrieval-Augmented Generation) Pipeline API. This application provides a chat interface for querying PDF documents using AI-powered document retrieval and generation.

## Features

- 📄 **PDF Document Upload**: Drag-and-drop or browse to upload PDF files
- 💬 **Chat Interface**: Interactive chat with AI responses based on uploaded documents
- 🔍 **Smart Search**: Query specific documents or search across all uploaded files
- 📊 **Real-time Status**: Live API health monitoring and upload progress
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Streaming Responses**: Real-time response streaming for better UX

## Prerequisites

Before running this frontend, make sure you have:

1. **RAG Pipeline API** running (default: http://localhost:5000)
2. **Node.js** (v20.19.0 or higher) or **Bun**
3. The RAG Pipeline API should have:
   - Google Gemini API key configured
   - Qdrant vector database running
   - All required Python dependencies installed

## Quick Start

1. **Clone and install dependencies:**

   ```sh
   bun install
   # or
   npm install
   ```

2. **Configure environment (optional):**

   ```sh
   cp .env.example .env
   # Edit .env to change API URL if needed
   ```

3. **Start development server:**

   ```sh
   bun dev
   # or
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:5173`

## Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Optional: Custom settings (defaults will be used if not specified)
# VITE_DEFAULT_CHUNK_SIZE=1000
# VITE_DEFAULT_CHUNK_OVERLAP=200
# VITE_DEFAULT_TOP_K=8
```

## Usage

### 1. Upload Documents

1. Click the file icon in the bottom right corner of the home page
2. Drag and drop PDF files or click "Browse Files"
3. Monitor upload progress in the modal
4. Check API status in the health check panel

### 2. Start Chatting

1. Type your initial question on the home page
2. Click "Send" to create a new chat session
3. The AI will respond based on your uploaded documents

### 3. Advanced Features

- **Document-specific queries**: Use the document selector in chat to search specific files
- **Source citations**: AI responses include source documents, pages, and relevance scores
- **Confidence scores**: See how confident the AI is in its responses
- **Session management**: Multiple chat sessions with persistent history

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── HealthCheck.vue  # API status monitoring
│   ├── PdfModal.vue     # Document upload modal
│   └── LogoText.vue     # Logo component
├── pages/               # Page components
│   ├── HomeView.vue     # Landing page
│   └── ChatView.vue     # Chat interface
├── services/            # API service layer
│   └── api.ts           # RAG API client
├── store/               # Pinia state management
│   ├── index.ts         # Chat store
│   ├── documents.ts     # Document store
│   └── types.ts         # TypeScript types
├── config/              # Configuration
│   └── index.ts         # App configuration
└── assets/              # Static assets
```

## Available Scripts

```sh
# Development
bun dev                  # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Code Quality
bun lint                 # Run ESLint
bun run format           # Format code with Prettier
bun run type-check       # TypeScript type checking
```

## Technology Stack

- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: Bun (or npm)

## Troubleshooting

### API Connection Issues

1. **Check API Status**: The health check component shows real-time API status
2. **Verify API URL**: Ensure `VITE_API_BASE_URL` matches your API server
3. **Check CORS**: The API should have CORS enabled for your frontend domain

### Upload Issues

1. **File Size**: PDFs must be under 50MB
2. **File Type**: Only PDF files are supported
3. **API Health**: Ensure both API and Qdrant services are running

### Chat Issues

1. **No Documents**: Upload at least one PDF before querying
2. **Empty Responses**: Check if documents were processed successfully
3. **Slow Responses**: Large documents may take time to process
