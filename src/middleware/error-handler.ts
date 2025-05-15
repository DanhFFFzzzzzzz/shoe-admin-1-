import { NextApiRequest, NextApiResponse } from 'next';

export function errorHandler(
  err: any,
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  console.error('Error:', err);

  // Default error status and message
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  // Return JSON response
  return res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

// Middleware to ensure JSON responses
export function ensureJsonResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  // Set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Override res.json to ensure consistent format
  const originalJson = res.json;
  res.json = function(data: any) {
    if (typeof data === 'object' && data !== null) {
      if (!('success' in data)) {
        data = {
          success: true,
          data,
        };
      }
    } else {
      data = {
        success: true,
        data,
      };
    }
    return originalJson.call(this, data);
  };

  next();
}

// Middleware to handle 404 errors
export function notFoundHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`,
  });
}

// Middleware to handle method not allowed
export function methodNotAllowedHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(405).json({
    success: false,
    message: `Method ${req.method} not allowed`,
  });
} 