
/**
 * API Middleware
 * Provides centralized handling of API requests with
 * consistent error handling, caching, and logging
 */
import { supabase } from '@/integrations/supabase/client-optimized';
import { handleError, tryCatch } from './error-handler';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  cache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
  retries?: number;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: any | null;
  status: number;
  headers?: Headers;
}

// Simple cache implementation
const apiCache: Record<string, { data: any; timestamp: number; ttl: number }> = {};

/**
 * Clear API cache
 * @param keys - Optional array of cache keys to clear
 */
export function clearApiCache(keys?: string[]): void {
  if (keys && keys.length > 0) {
    keys.forEach(key => {
      delete apiCache[key];
    });
  } else {
    Object.keys(apiCache).forEach(key => {
      delete apiCache[key];
    });
  }
}

/**
 * Make API request with consistent error handling, caching, and retries
 * @param url - Request URL
 * @param options - Request options
 * @returns API response
 */
export async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    cache = false,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retries = 0,
    timeout = 30000 // 30 seconds
  } = options;
  
  // Generate cache key for GET requests
  const cacheKey = cache && method === 'GET' ? url : '';
  
  // Check cache for GET requests
  if (cacheKey) {
    const cached = apiCache[cacheKey];
    const now = Date.now();
    
    if (cached && now - cached.timestamp < cached.ttl) {
      console.log(`Using cached data for ${url}`);
      return {
        data: cached.data,
        error: null,
        status: 200
      };
    }
  }
  
  // Add authorization header if user is logged in
  const session = await supabase.auth.getSession();
  const authHeaders: Record<string, string> = {};
  
  if (session.data.session?.access_token) {
    authHeaders['Authorization'] = `Bearer ${session.data.session.access_token}`;
  }
  
  // Prepare request options
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers
    },
    credentials: 'include'
  };
  
  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    fetchOptions.body = JSON.stringify(body);
  }
  
  // Execute request with retries
  let attemptCount = 0;
  let lastError: any = null;
  
  while (attemptCount <= retries) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      fetchOptions.signal = controller.signal;
      
      // Execute request
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // Parse response
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      // Cache successful GET requests
      if (cacheKey && response.ok) {
        apiCache[cacheKey] = {
          data,
          timestamp: Date.now(),
          ttl: cacheTTL
        };
      }
      
      // Return response
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data,
        status: response.status,
        headers: response.headers
      };
    } catch (error: any) {
      lastError = error;
      
      // Check if retry is needed
      if (attemptCount < retries) {
        // Exponential backoff
        const delay = Math.pow(2, attemptCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        attemptCount++;
      } else {
        break;
      }
    }
  }
  
  // Handle final error
  handleError(lastError, { url, method });
  
  return {
    data: null,
    error: lastError,
    status: 0
  };
}

/**
 * Make GET request
 * @param url - Request URL
 * @param options - Request options
 * @returns API response
 */
export function get<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * Make POST request
 * @param url - Request URL
 * @param body - Request body
 * @param options - Request options
 * @returns API response
 */
export function post<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'POST', body });
}

/**
 * Make PUT request
 * @param url - Request URL
 * @param body - Request body
 * @param options - Request options
 * @returns API response
 */
export function put<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body });
}

/**
 * Make PATCH request
 * @param url - Request URL
 * @param body - Request body
 * @param options - Request options
 * @returns API response
 */
export function patch<T>(url: string, body: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * Make DELETE request
 * @param url - Request URL
 * @param options - Request options
 * @returns API response
 */
export function del<T>(url: string, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * Call Supabase edge function with retries and error handling
 * @param functionName - Name of the edge function
 * @param payload - Function payload
 * @param options - Request options
 * @returns Function response
 */
export async function callFunction<T, P = any>(
  functionName: string,
  payload?: P,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload
    });
    
    if (error) throw error;
    
    return {
      data,
      error: null,
      status: 200
    };
  } catch (error) {
    handleError(error, { context: 'callFunction', functionName });
    
    return {
      data: null,
      error,
      status: 500
    };
  }
}
