import { ApiError } from '../errors/ApiError.js';
import { config } from '../config/index.js';

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const isBadJson = err.type === 'entity.parse.failed';
  const statusCode = isBadJson ? 400 : err instanceof ApiError ? err.statusCode : 500;
  const message = isBadJson
    ? 'Request body must be valid JSON'
    : statusCode === 500
      ? 'Internal server error'
      : err.message;

  if (statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}] ${statusCode}:`, err);
  }

  res.status(statusCode).json({
    error: message,
    ...(config.env !== 'production' && statusCode === 500 ? { detail: err.message } : {}),
  });
}
