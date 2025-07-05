document.addEventListener('DOMContentLoaded', () => {
    fetchAllOrders();
});

async function fetchAllOrders() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
        document.getElementById('orders-list').innerHTML = `<p style="color:#c00;">Admin login required.</p>`;
        return;
    }

    const res = await fetch('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    if (!res.ok) {
        document.getElementById('orders-list').innerHTML = `<p style="color:#c00;">Unable to load orders.</p>`;
        return;
    }
    const orders = await res.json();
    renderOrders(orders, jwt);
}

function renderOrders(orders, jwt) {
    const container = document.getElementById('orders-list');
    if (!orders.length) {
        container.innerHTML = `<p style="text-align:center;color:#888;">No orders found.</p>`;
        return;
    }
    container.innerHTML = '';
    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <div class="order-card-header">
                <span>Order #${order.id} by User #${order.user_id}</span>
                <span>${new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div class="order-card-items">
                <em>View details</em>
            </div>
            <div>
                <span class="order-card-total">Total: ${formatZAR(order.total)}</span>
                <span class="order-card-status ${order.paid ? '' : 'unpaid'}">${order.paid ? 'Paid' : 'Unpaid'}</span>
            </div>
        `;
        div.querySelector('.order-card-items').addEventListener('click', () => showOrderDetails(order.id, div, jwt));
        container.appendChild(div);
    });
}

async function showOrderDetails(orderId, cardDiv, jwt) {
    const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    if (!res.ok) return;
    const order = await res.json();
    const itemsHtml = order.items.map(item =>
        `<div>
            <img src="${item.image_url || 'assets/images/placeholder.png'}" alt="" style="width:36px;height:36px;border-radius:6px;vertical-align:middle;">
            <span style="margin-left:0.7rem;">${item.name}</span>
            <span style="margin-left:1.5rem;">x ${item.quantity}</span>
            <span style="margin-left:1.5rem;color:var(--gold);">${formatZAR(item.price)}</span>
        </div>`
    ).join('');
    cardDiv.querySelector('.order-card-items').innerHTML = itemsHtml;
}

function formatZAR(amount) {
    // Format as South African Rand (ZAR)
    return `R${Number(amount).toFixed(2)}`;
}