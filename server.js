const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payfast', require('./routes/payfast'));
app.use('/api/auth', require('./routes/auth')); // <-- FIXED LINE

// Error handler or 404
app.use((req, res) => res.status(404).json({ msg: "Not found" }));

app.listen(5000, () => console.log('Server listening on port 5000'));