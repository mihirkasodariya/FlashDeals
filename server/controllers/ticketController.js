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
        const tickets = await Ticket.find()
            .populate('userId', 'name mobile')
            .populate('messages.senderId', 'name profileImage')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            tickets
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Ticket status updated successfully',
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        res.json({
            success: true,
            message: 'Support ticket deleted permanently'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const replyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;
        const userRole = req.user.role; // Assuming role is in token

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        // Check if user is admin OR the owner of the ticket
        if (userRole !== 'admin' && ticket.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only reply to your own tickets' });
        }

        if (ticket.status === 'Closed' || ticket.status === 'Resolved') {
            return res.status(400).json({ success: false, message: 'This ticket is settled and cannot be replied to' });
        }

        ticket.messages.push({
            senderId: userId,
            senderRole: userRole === 'admin' ? 'admin' : 'user',
            message
        });

        // Auto-set status to 'In Review' if admin replies to an 'Open' ticket
        if (userRole === 'admin' && ticket.status === 'Open') {
            ticket.status = 'In Review';
        }

        await ticket.save();

        // Populate the last message sender for immediate frontend update
        const populatedTicket = await Ticket.findById(ticket._id).populate('messages.senderId', 'name profileImage');

        res.json({
            success: true,
            message: 'Response sent successfully',
            ticket: populatedTicket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    updateTicketStatus,
    deleteTicket,
    replyToTicket
};
