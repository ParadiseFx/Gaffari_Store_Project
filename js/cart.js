let productsCache = {};

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || {};
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatCurrency(amount) {
    // Format as South African Rand with 2 decimal places
    return `R${Number(amount).toFixed(2)}`;
}

function renderCart() {
    const cart = getCart();
    const productIds = Object.keys(cart);
    if (!productIds.length) {
        document.getElementById('cart-list').innerHTML = `<p style="text-align:center;color:#888;">Your cart is empty.</p>`;
        document.getElementById('cart-summary').innerHTML = '';
        return;
    }

    Promise.all(productIds.map(id => fetchProduct(id)))
        .then(products => {
            productsCache = {};
            products.forEach(p => { if (p) productsCache[p.id] = p; });
            renderCartItems(cart, products);
            renderCartSummary(cart, products);
        });
}

function fetchProduct(productId) {
    return fetch(`http://localhost:5000/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            // No conversion needed, prices are stored and displayed in ZAR
            return product;
        })
        .catch(() => null);
}

function renderCartItems(cart, products) {
    const container = document.getElementById('cart-list');
    container.innerHTML = '';
    products.forEach(product => {
        if (!product) return;
        const qty = cart[product.id];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${product.image_url || 'assets/images/placeholder.png'}" alt="${product.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${product.name}</div>
                <div class="cart-item-price">${formatCurrency(product.price)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" data-id="${product.id}" data-action="decrease">-</button>
                    <span>${qty}</span>
                    <button class="qty-btn" data-id="${product.id}" data-action="increase">+</button>
                    <button class="remove-btn" data-id="${product.id}">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const action = btn.getAttribute('data-action');
            updateQty(id, action);
        });
    });
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

function updateQty(productId, action) {
    const cart = getCart();
    if (!(productId in cart)) return;
    if (action === 'increase') {
        cart[productId]++;
    } else if (action === 'decrease') {
        cart[productId] = Math.max(1, cart[productId] - 1);
    }
    saveCart(cart);
    renderCart();
}

function removeFromCart(productId) {
    const cart = getCart();
    delete cart[productId];
    saveCart(cart);
    renderCart();
}

function renderCartSummary(cart, products) {
    let subtotal = 0;
    products.forEach(product => {
        if (!product) return;
        subtotal += Number(product.price) * cart[product.id];
    });
    
    // Calculate VAT (15% for South Africa)
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    
    document.getElementById('cart-summary').innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>VAT (15%):</span>
            <span>${formatCurrency(vat)}</span>
        </div>
        <div class="summary-row total">
            <span>Total:</span>
            <span>${formatCurrency(total)}</span>
        </div>
        <button class="cart-checkout-btn" onclick="proceedToCheckout()" ${total === 0 ? 'disabled' : ''}>Proceed to Checkout</button>
    `;
}

function proceedToCheckout() {
    window.location.href = 'checkout.html';
}