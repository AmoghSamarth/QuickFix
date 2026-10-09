const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { query } = require('../db/pool');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Verifies the Bearer token and loads the user from the database, so the role always comes
 * from the DB - never from client-supplied state.
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');

  const payload = jwt.verify(token, config.jwtSecret); // throws -> errorHandler maps to 401
  const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [payload.sub]);
  if (!rows[0]) throw new AppError(401, 'Account no longer exists', 'UNAUTHORIZED');
  req.user = rows[0];
  next();
});

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission to perform this action', 'FORBIDDEN'));
  }
  next();
};

module.exports = { requireAuth, requireRole };
