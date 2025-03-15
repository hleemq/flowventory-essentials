/**
 * Error Handler Utility
 * Provides centralized error handling and logging for the application
 */
import { toast } from 'sonner';

// Error categories for better organization
export enum ErrorCategory {
  AUTH = 'Authentication',
  DATABASE = 'Database',
  NETWORK = 'Network',
  VALIDATION = 'Validation',
  STORAGE = 'Storage',
  UNKNOWN = 'Unknown'
}

// Interface for structured error logging
interface ErrorLog {
  message: string;
  category: ErrorCategory;
  timestamp: Date;
  originalError?: any;
  context?: Record<string, any>;
}

// Keep an in-memory log of recent errors
const errorLogs: ErrorLog[] = [];
const MAX_ERROR_LOGS = 50;

/**
 * Add error to in-memory log
 * @param errorLog - Structured error log
 */
function addToErrorLog(errorLog: ErrorLog) {
  errorLogs.unshift(errorLog);
  
  // Trim log if it exceeds maximum size
  if (errorLogs.length > MAX_ERROR_LOGS) {
    errorLogs.pop();
  }
  
  // Log to console
  console.error(`[${errorLog.category}] ${errorLog.message}`, {
    timestamp: errorLog.timestamp,
    context: errorLog.context,
    originalError: errorLog.originalError
  });
}

/**
 * Determine error category based on error information
 * @param error - Original error object
 * @returns Appropriate error category
 */
function determineErrorCategory(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;
  
  // Check error message patterns
  const errorMessage = error.message || '';
  
  if (
    errorMessage.includes('auth') || 
    errorMessage.includes('Authentication') ||
    errorMessage.includes('JWT') ||
    errorMessage.includes('token') ||
    errorMessage.includes('credential') ||
    errorMessage.includes('permission')
  ) {
    return ErrorCategory.AUTH;
  }
  
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('DB') ||
    errorMessage.includes('SQL') ||
    errorMessage.includes('query') ||
    errorMessage.includes('constraint')
  ) {
    return ErrorCategory.DATABASE;
  }
  
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('offline') ||
    error.name === 'NetworkError'
  ) {
    return ErrorCategory.NETWORK;
  }
  
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required')
  ) {
    return ErrorCategory.VALIDATION;
  }
  
  if (
    errorMessage.includes('storage') ||
    errorMessage.includes('upload') ||
    errorMessage.includes('file')
  ) {
    return ErrorCategory.STORAGE;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Generate user-friendly error message from technical error
 * @param error - Original error object
 * @param category - Error category
 * @returns User-friendly error message
 */
function generateUserFriendlyMessage(error: any, category: ErrorCategory): string {
  if (!error) return 'An unknown error occurred';
  
  // Use explicit error message if available
  if (error.message) {
    // Some errors have direct user-friendly messages
    return error.message;
  }
  
  // Generate based on category
  switch (category) {
    case ErrorCategory.AUTH:
      return 'Authentication error. Please try signing in again.';
    case ErrorCategory.DATABASE:
      return 'Unable to retrieve data. Please try again later.';
    case ErrorCategory.NETWORK:
      return 'Network connection issue. Please check your internet connection.';
    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.';
    case ErrorCategory.STORAGE:
      return 'Error handling files. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Main error handler function
 * @param error - Error to handle
 * @param context - Additional context information
 * @param showToast - Whether to show toast notification
 * @returns Error log entry
 */
export function handleError(
  error: any, 
  context: Record<string, any> = {}, 
  showToast: boolean = true
): ErrorLog {
  // Determine error category
  const category = determineErrorCategory(error);
  
  // Generate user-friendly message
  const userMessage = generateUserFriendlyMessage(error, category);
  
  // Create structured error log
  const errorLog: ErrorLog = {
    message: userMessage,
    category,
    timestamp: new Date(),
    originalError: error,
    context
  };
  
  // Add to log
  addToErrorLog(errorLog);
  
  // Show toast notification if requested
  if (showToast) {
    toast.error(userMessage);
  }
  
  return errorLog;
}

/**
 * Get recent error logs
 * @param limit - Maximum number of logs to retrieve
 * @returns Array of error logs
 */
export function getRecentErrorLogs(limit: number = 10): ErrorLog[] {
  return errorLogs.slice(0, Math.min(limit, errorLogs.length));
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
  errorLogs.length = 0;
}

/**
 * Try-catch wrapper for async functions with consistent error handling
 * @param fn - Async function to execute
 * @param errorContext - Context information for error logging
 * @param showToast - Whether to show toast notification on error
 * @returns Function result or null on error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorContext: Record<string, any> = {},
  showToast: boolean = true
): Promise<{ data: T | null; error: ErrorLog | null }> {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (error) {
    const errorLog = handleError(error, errorContext, showToast);
    return { data: null, error: errorLog };
  }
}
