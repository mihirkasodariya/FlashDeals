const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { uploadHelp } = require('../middleware/uploadMiddleware');

// All ticket routes require authentication
router.use(authenticateToken);

router.post('/create', uploadHelp.single('attachment'), ticketController.createTicket);
router.get('/my-tickets', ticketController.getMyTickets);
router.get('/all-tickets', ticketController.getAllTickets); // Simplified for now, usually needs admin check

module.exports = router;
