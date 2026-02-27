const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
    try {
        const { subject, description, category, priority } = req.body;
        const userId = req.user.userId;

        // Generate a random ticket ID like #FD-1234
        const ticketId = `#FD-${Math.floor(1000 + Math.random() * 9000)}`;

        const ticket = new Ticket({
            userId,
            subject,
            description,
            category: category || 'General',
            priority: priority || 'Medium',
            ticketId,
            attachment: req.file ? `/public/help/${req.file.filename}` : null
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.userId;
        const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllTickets = async (req, res) => {
    try {
        // This would be for the admin, but for now we'll allow it
        const tickets = await Ticket.find().populate('userId', 'name mobile').sort({ createdAt: -1 });

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets
};
