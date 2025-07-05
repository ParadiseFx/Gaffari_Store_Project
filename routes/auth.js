const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const { authMiddleware, adminOnly, customerOnly } = require('./middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use env in production

// Registration (customers only)
router.post('/register', async (req, res) => {
    const { name, email, password, admin } = req.body;
    if (admin) return res.status(403).json({ msg: "Cannot self-register as admin" });
    const hash = await bcrypt.hash(password, 10);
    try {
        await db.query(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1,$2,$3,$4)',
            [name, email, hash, false]
        );
        res.json({ msg: 'Registered.' });
    } catch (e) {
        res.status(400).json({ msg: 'Email may already exist.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ msg: 'Invalid credentials.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ msg: 'Invalid credentials.' });
    const token = jwt.sign({ id: user.id, is_admin: user.is_admin, email: user.email }, JWT_SECRET, { expiresIn: '2d' });
    res.json({ token, is_admin: user.is_admin, name: user.name, email: user.email });
});

module.exports = router;