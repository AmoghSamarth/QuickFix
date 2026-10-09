require('dotenv').config();

const bool = (v, d) => (v === undefined || v === '' ? d : ['true', '1', 'yes'].includes(String(v).toLowerCase()));

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/quickfix',
  dbSsl: bool(process.env.DB_SSL, false),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  slaMode: process.env.SLA_MODE === 'standard' ? 'standard' : 'demo',
  escalationIntervalSeconds: Number(process.env.ESCALATION_INTERVAL_SECONDS ?? 30),
  // Run the overdue check automatically when ticket lists / dashboards are fetched
  escalationOnFetch: bool(process.env.ESCALATION_ON_FETCH, true),
  escalationFetchThrottleMs: Number(process.env.ESCALATION_FETCH_THROTTLE_MS ?? 3000),
};

if (config.env === 'production' && config.jwtSecret === 'dev-only-secret-change-me') {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = config;
