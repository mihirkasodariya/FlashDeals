const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { uploadSupportS3 } = require('../middleware/s3UploadMiddleware');

// All ticket routes require authentication
router.use(authenticateToken);

router.post('/create', uploadSupportS3.single('attachment'), ticketController.createTicket);
router.get('/my-tickets', ticketController.getMyTickets);

// Admin-only ticket routes
router.get('/all-tickets', isAdmin, ticketController.getAllTickets);
router.put('/update-status/:id', isAdmin, ticketController.updateTicketStatus);
router.post('/reply/:id', ticketController.replyToTicket);
router.delete('/:id', isAdmin, ticketController.deleteTicket);

module.exports = router;
