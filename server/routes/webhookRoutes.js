const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// GET for verification (Meta Challenge)
router.get('/whatsapp', webhookController.verifyWebhook);

// POST for receiving message/status events
router.post('/whatsapp', webhookController.handleWebhookData);

module.exports = router;
