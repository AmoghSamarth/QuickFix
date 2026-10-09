const { ZodError } = require('zod');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');

// Every error leaves the API in the same shape:
// { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "title": "..." } } }
function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const fields = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_';
      if (!fields[key]) fields[key] = issue.message;
    }
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields', fields } });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) } });
  }
  if (err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Your session has expired. Please sign in again.' } });
  }
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid authentication token' } });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Request body is not valid JSON' } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side. Please try again.' } });
}

module.exports = { errorHandler, notFoundHandler };
