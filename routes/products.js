const express = require('express');
const db = require('../db');
const { authMiddleware } = require('./auth');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
});

// Get product by id
router.get('/:id', async (req, res) => {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ msg: "Product not found" });
    res.json(result.rows[0]);
});

// Admin: Add a product
router.post('/', authMiddleware, async (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ msg: "Admin only" });
    const { name, category, price, stock_quantity, image_url, description } = req.body;
    await db.query(
        'INSERT INTO products (name, category, price, stock_quantity, image_url, description) VALUES ($1,$2,$3,$4,$5,$6)',
        [name, category, price, stock_quantity, image_url, description]
    );
    res.json({ msg: "Product added." });
});

// Admin: Delete product
router.delete('/:id', authMiddleware, async (req, res) => {
    if (!req.user.is_admin) return res.status(403).json({ msg: "Admin only" });
    await db.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ msg: "Product deleted." });
});

// Search products by name, description, or category
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const result = await db.query(
      `SELECT * FROM products WHERE
        LOWER(name) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(category) LIKE LOWER($1)
      ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ msg: 'Search failed.' });
  }
});

module.exports = router;