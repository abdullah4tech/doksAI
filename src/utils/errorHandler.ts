import { useToastStore } from '@/store/toast'

export interface ErrorDetails {
  message: string
  code?: string
  statusCode?: number
  endpoint?: string
  requestData?: unknown
  timestamp?: string
  stack?: string
}

/**
 * Map of technical error messages to user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Your session is invalid. Please log in again.',
  USER_NOT_FOUND: 'No account found with this email.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  UNAUTHORIZED: 'You need to be logged in to do this.',

  // Document errors
  DOCUMENT_EXISTS:
    'This document already exists. Use a different name or overwrite the existing one.',
  DOCUMENT_NOT_FOUND: 'Document not found. It may have been deleted.',
  INVALID_DOC_ID: 'Invalid document name. Please use a valid name.',
  INVALID_PDF_DATA: 'Invalid PDF file. Please upload a valid PDF.',
  EMPTY_PDF: 'This PDF has no readable text. Please upload a different file.',
  PDF_PROCESSING_ERROR: 'Failed to process PDF. Please try again.',

  // Query errors
  INVALID_QUESTION: 'Please enter a valid question.',
  QUESTION_TOO_LONG: 'Your question is too long. Please make it shorter.',
  NO_RESULTS: 'No relevant information found. Try rephrasing your question.',

  // System errors
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is currently unavailable. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  NOT_FOUND: 'The requested resource was not found.',

  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
}

/**
 * Get user-friendly error message from error code or technical message
 */
function getUserFriendlyMessage(error: ErrorDetails): string {
  // Check if we have a specific error code mapping
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code] as string
  }

  // Check if the error message itself matches a known pattern
  const lowerMessage = error.message.toLowerCase()

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR as string
  }
  if (lowerMessage.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT as string
  }
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('not authenticated')) {
    return ERROR_MESSAGES.UNAUTHORIZED as string
  }
  if (lowerMessage.includes('already exists')) {
    return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS as string
  }
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('incorrect password')) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS as string
  }
  if (lowerMessage.includes('not found')) {
    return ERROR_MESSAGES.NOT_FOUND as string
  }

  // If we have a user-facing message, use it
  if (error.message && error.message.length < 150) {
    return error.message
  }

  // Fallback to generic error
  return ERROR_MESSAGES.INTERNAL_ERROR as string
}

/**
 * Send error logs to server for logging
 */
async function logErrorToServer(context: string, error: ErrorDetails): Promise<void> {
  try {
    // Only send errors to server in production, or if explicitly enabled
    if (import.meta.env.DEV) {
      // In development, you can optionally enable server logging
      return
    }

    // Send error to server logging endpoint
    await fetch('/api/logs/error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          endpoint: error.endpoint,
          requestData: error.requestData,
          timestamp: error.timestamp || new Date().toISOString(),
          stack: error.stack,
        },
      }),
    }).catch(() => {
      // Silently fail if logging endpoint is not available
    })
  } catch {
    // Ignore logging errors
  }
}

/**
 * Handle error by sending to server for logging and showing user-friendly toast
 */
export function handleError(
  context: string,
  error: unknown,
  options?: {
    showToast?: boolean
    toastDuration?: number
    customUserMessage?: string
  },
): void {
  const { showToast = true, toastDuration = 5000, customUserMessage } = options || {}

  // Build error details
  const err = error as Record<string, unknown>
  const errorDetails: ErrorDetails = {
    message: (err.message as string) || 'Unknown error',
    code: err.code as string | undefined,
    statusCode: (err.statusCode as number | undefined) || (err.status as number | undefined),
    endpoint: err.endpoint as string | undefined,
    requestData: err.requestData,
    timestamp: new Date().toISOString(),
    stack: err.stack as string | undefined,
  }

  // Send to server for logging
  logErrorToServer(context, errorDetails)

  // Show user-friendly toast
  if (showToast) {
    const toastStore = useToastStore()
    const userMessage = customUserMessage || getUserFriendlyMessage(errorDetails)

    toastStore.error(userMessage, undefined, toastDuration)
  }
}

/**
 * Handle success with optional toast
 */
export function handleSuccess(
  message: string,
  options?: {
    showToast?: boolean
    toastDuration?: number
    description?: string
  },
): void {
  const { showToast = true, toastDuration = 3000, description } = options || {}

  if (showToast) {
    const toastStore = useToastStore()
    toastStore.success(message, description, toastDuration)
  }
}

/**
 * Handle warning with optional toast
 */
export function handleWarning(
  message: string,
  options?: {
    showToast?: boolean
    toastDuration?: number
    description?: string
  },
): void {
  const { showToast = true, toastDuration = 4000, description } = options || {}

  if (showToast) {
    const toastStore = useToastStore()
    toastStore.warning(message, description, toastDuration)
  }
}

/**
 * Enhanced error class that includes additional context
 */
export class AppError extends Error {
  code?: string
  statusCode?: number
  endpoint?: string
  requestData?: unknown

  constructor(
    message: string,
    options?: {
      code?: string
      statusCode?: number
      endpoint?: string
      requestData?: unknown
    },
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options?.code
    this.statusCode = options?.statusCode
    this.endpoint = options?.endpoint
    this.requestData = options?.requestData
  }
}
