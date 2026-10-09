const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const lazyEscalation = require('../middleware/lazyEscalation');
const s = require('../utils/schemas');
const c = require('../controllers/ticketController');

router.use(requireAuth, lazyEscalation);

// NOTE: /my routes must stay above /:id
router.get('/my', validate(s.ticketListQuery, 'query'), c.listMine);
router.get('/my/summary', c.mySummary);
router.post('/', validate(s.createTicketSchema), c.create);

router.get('/:id', c.getOne);
router.get('/:id/history', c.history);

router.patch('/:id/status', requireRole('admin'), validate(s.statusSchema), c.updateStatus);
router.patch('/:id/assign', requireRole('admin'), validate(s.assignSchema), c.assign);
router.patch('/:id/escalate', requireRole('admin'), validate(s.escalateSchema), c.escalate);

module.exports = router;
