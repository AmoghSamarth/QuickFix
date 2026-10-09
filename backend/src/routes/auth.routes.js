const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../utils/schemas');
const c = require('../controllers/authController');

router.post('/login', validate(loginSchema), c.login);
router.get('/me', requireAuth, c.me);

module.exports = router;
