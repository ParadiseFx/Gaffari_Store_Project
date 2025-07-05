const express = require('express');
const router = express.Router();

// (Very basic example - in production, validate all security requirements!)
router.post('/notify', async (req, res) => {
    // TODO: Validate PayFast signature, IP, etc.
    // Example: mark order as paid if payment_status == 'COMPLETE'
    res.status(200).send('OK');
});

module.exports = router;