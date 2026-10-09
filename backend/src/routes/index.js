const router = require('express').Router();
const config = require('../config/env');
const C = require('../config/constants');

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Lets the frontend build dropdowns / badges / allowed transitions without hardcoding them.
router.get('/meta', (req, res) => {
  res.json({
    categories: C.CATEGORIES,
    priorities: C.PRIORITIES,
    statuses: C.STATUSES,
    transitions: C.TRANSITIONS,
    categoryTeams: C.CATEGORY_TEAM,
    sla: { mode: config.slaMode, minutesByPriority: C.SLA_MINUTES[config.slaMode] },
    escalationTarget: C.ESCALATION_TARGET,
  });
});

router.use('/auth', require('./auth.routes'));
router.use('/tickets', require('./ticket.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
