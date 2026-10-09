const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const lazyEscalation = require('../middleware/lazyEscalation');
const s = require('../utils/schemas');
const c = require('../controllers/adminController');

router.use(requireAuth, requireRole('admin'), lazyEscalation);

router.get('/tickets', validate(s.ticketListQuery, 'query'), c.listTickets);
router.get('/dashboard', c.dashboard);
router.get('/escalations', validate(s.escalationListQuery, 'query'), c.escalations);
router.post('/escalations/run', c.runEscalationCheck);
router.get('/technicians', c.technicians);

module.exports = router;
