const mongoose = require('mongoose');
require('dotenv').config();
const Ticket = require('./models/Ticket');

async function checkTickets() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Ticket.countDocuments();
        console.log(`Total tickets: ${count}`);
        const tickets = await Ticket.find().limit(5);
        console.log('Sample tickets:', JSON.stringify(tickets, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTickets();
