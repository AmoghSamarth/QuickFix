const app = require('./app');
const config = require('./config/env');
const { pool } = require('./db/pool');
const { runEscalationCheck } = require('./services/escalationService');

async function main() {
  await pool.query('SELECT 1'); // fail fast if the DB is unreachable
  const server = app.listen(config.port, () => {
    console.log(`QuickFix API running on http://localhost:${config.port}/api  (SLA mode: ${config.slaMode})`);
  });

  let timer;
  if (config.escalationIntervalSeconds > 0) {
    timer = setInterval(() => {
      runEscalationCheck()
        .then((r) => r.escalatedCount && console.log(`[escalation] auto-escalated ${r.escalatedCount} ticket(s)`))
        .catch((e) => console.error('[escalation] check failed:', e.message));
    }, config.escalationIntervalSeconds * 1000);
    console.log(`Background escalation check every ${config.escalationIntervalSeconds}s`);
  }

  const shutdown = () => {
    clearInterval(timer);
    server.close(() => pool.end().then(() => process.exit(0)));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
