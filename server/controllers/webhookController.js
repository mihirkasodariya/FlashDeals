const verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
            console.log("✅ Webhook Verified!");
            res.status(200).send(challenge);
        } else {
            console.error("❌ Webhook Verification Failed: Token Mismatch");
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
};

const handleWebhookData = (req, res) => {
    try {
        const body = req.body;

        // WhatsApp Webhook structure check
        if (body.object === "whatsapp_business_account") {
            if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Sender mobile number
                const msgBody = message.text ? message.text.body : "";

                console.log(`📩 Received WhatsApp message from ${from}: ${msgBody}`);
                
                // You can add logic here to handle incoming messages or read receipts
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error("Webhook Error:", error.message);
        res.sendStatus(500);
    }
};

module.exports = {
    verifyWebhook,
    handleWebhookData
};
