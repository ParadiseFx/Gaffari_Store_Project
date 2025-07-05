document.getElementById('checkout-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const feedback = document.getElementById('checkout-feedback');
    feedback.innerHTML = `<span style="color:var(--gold);font-weight:bold;">Processing your order...</span>`;

    const fd = new FormData(this);
    const name = fd.get('name');
    const email = fd.get('email');
    const shipping_address = fd.get('address');
    const city = fd.get('city');
    const postal_code = fd.get('postal');

    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const items = [];
    
    try {
        // First fetch all product details to get ZAR prices
        const productRequests = Object.keys(cart).map(productId => 
            fetch(`http://localhost:5000/api/products/${productId}`)
                .then(res => res.json())
        );
        
        const products = await Promise.all(productRequests);
        
        // Prepare order items with ZAR prices (no conversion needed)
        for (const [productId, quantity] of Object.entries(cart)) {
            const product = products.find(p => String(p.id) === String(productId));
            if (!product) continue;
            
            items.push({
                product_id: productId,
                quantity: quantity,
                price: product.price, // Already in ZAR
                currency: 'ZAR' // Optional, but fine for clarity
            });
        }

        if (!items.length) {
            feedback.innerHTML = `<span style="color:#c00;">Your cart is empty.</span>`;
            return;
        }

        // Calculate totals in ZAR
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const vat = subtotal * 0.15; // 15% VAT for South Africa
        const total = subtotal + vat;

        const token = localStorage.getItem('jwt');
        const res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                items,
                name,
                email,
                shipping_address,
                city,
                postal_code,
                subtotal,
                vat,
                total,
                currency: 'ZAR'
            })
        });

        const data = await res.json();
        if (res.ok) {
            feedback.innerHTML = `
                <span style="color:var(--gold);font-weight:bold;">
                    Order placed! Total: R${total.toFixed(2)}<br>
                    Thank you for your purchase.
                </span>
            `;
            localStorage.removeItem('cart');
            setTimeout(() => window.location.href = "success.html", 2000);
        } else {
            feedback.innerHTML = `<span style="color:#c00;">${data.msg || "Order failed."}</span>`;
        }
    } catch (err) {
        console.error('Checkout error:', err);
        feedback.innerHTML = `
            <span style="color:#c00;">
                Order failed. Please try again.<br>
                ${err.message || ''}
            </span>
        `;
    }
});