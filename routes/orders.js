const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Create an order (requires authentication)
router.post('/', authMiddleware, customerOnly, async (req, res) => {
    const userId = req.user.id;
    const { items, shipping_address, city, postal_code, email, name } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ msg: 'No order items.' });
    try {
        let total = 0;
        for (const item of items) {
            const product = await db.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
            if (!product.rows.length) return res.status(400).json({ msg: 'Product not found.' });
            total += Number(product.rows[0].price) * item.quantity;
        }
        const orderRes = await db.query(
            `INSERT INTO orders (user_id, total, shipping_address, city, postal_code, email, customer_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [userId, total, shipping_address, city, postal_code, email, name]
        );
        const orderId = orderRes.rows[0].id;
        for (const item of items) {
            await db.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }
        res.status(201).json({ msg: 'Order placed', orderId });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get user's orders
router.get('/my', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const orders = await db.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [userId]
        );
        res.json(orders.rows);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get order details by ID (user or admin)
router.get('/:id', authMiddleware, async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await db.query('SELECT * FROM orders WHERE id = $1', [orderId]);
        if (!order.rows.length) return res.status(404).json({ msg: 'Order not found' });
        if (!req.user.is_admin && order.rows[0].user_id !== req.user.id)
            return res.status(403).json({ msg: 'Unauthorized' });
        const items = await db.query(
            `SELECT oi.*, p.name, p.image_url FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`, [orderId]
        );
        res.json({ ...order.rows[0], items: items.rows });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin: get all orders
router.get('/', authMiddleware, async (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ msg: 'Admin only' });
    try {
        const orders = await db.query(
            `SELECT * FROM orders ORDER BY created_at DESC`
        );
        res.json(orders.rows);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Admin: Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ msg: 'Admin only' });
    const orderId = req.params.id;
    const { status } = req.body;
    await db.query('UPDATE orders SET status=$1 WHERE id=$2', [status, orderId]);
    res.json({ msg: 'Order status updated.' });
});

module.exports = router;