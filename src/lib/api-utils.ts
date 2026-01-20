/**
 * API Response Utilities
 *
 * Consistent, secure error handling for API routes.
 * Ensures proper JSON responses and prevents information leakage.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Create an error response with proper JSON formatting
 *
 * @param message - User-facing error message (don't include internal details)
 * @param status - HTTP status code
 */
export function apiError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * Create a successful JSON response
 *
 * @param data - Data to return in the response body
 */
export function apiSuccess<T>(data: T): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  /** 404 - Resource not found */
  notFound: (resource = 'Resource') => apiError(`${resource} not found`, 404),

  /** 500 - Generic server error (don't expose internal details) */
  serverError: () => apiError('Internal server error', 500),

  /** 401 - Unauthorized */
  unauthorized: () => apiError('Unauthorized', 401),

  /** 400 - Bad request */
  badRequest: (message = 'Bad request') => apiError(message, 400),

  /** 500 - Configuration error */
  configError: () => apiError('Service not configured', 500),

  /** 502 - External service error */
  externalError: () => apiError('External service unavailable', 502),
} as const;
