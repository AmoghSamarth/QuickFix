const config = require('../config/env');
const { runEscalationCheck } = require('../services/escalationService');

let lastRun = 0;

/**
 * Runs the overdue check when tickets are fetched (throttled), so escalation state is never stale
 * even if the background timer is off. Failures never break the actual request.
 */
module.exports = async (req, res, next) => {
  if (config.escalationOnFetch && Date.now() - lastRun >= config.escalationFetchThrottleMs) {
    lastRun = Date.now();
    try {
      await runEscalationCheck();
    } catch (err) {
      console.error('Escalation check on fetch failed:', err.message);
    }
  }
  next();
};
