const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Get user profile
router.get('/me', authMiddleware, async (req, res) => {
    const user = await db.query('SELECT id, name, email FROM users WHERE id=$1', [req.user.id]);
    res.json(user.rows[0]);
});

// Update profile
router.patch('/me', authMiddleware, async (req, res) => {
    const { name } = req.body;
    await db.query('UPDATE users SET name=$1 WHERE id=$2', [name, req.user.id]);
    res.json({ msg: 'Profile updated.' });
});

// Get addresses
router.get('/me/addresses', authMiddleware, async (req, res) => {
    const addrs = await db.query('SELECT * FROM addresses WHERE user_id=$1', [req.user.id]);
    res.json(addrs.rows);
});

// Add address
router.post('/me/addresses', authMiddleware, async (req, res) => {
    const { address, city, postal_code } = req.body;
    await db.query('INSERT INTO addresses (user_id, address, city, postal_code) VALUES ($1,$2,$3,$4)', [req.user.id, address, city, postal_code]);
    res.json({ msg: 'Address added.' });
});

module.exports = router;