document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) fetchProduct(id);
});

function fetchProduct(id) {
    fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(product => renderProduct(product));
}

function renderProduct(product) {
    const container = document.getElementById('product-details-container');
    container.innerHTML = `
        <div class="product-image-large">
            <img src="${product.image_url || 'assets/images/placeholder.png'}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h2>${product.name}</h2>
            <div class="product-price">${formatZAR(product.price)}</div>
            <div class="product-description">${product.description || ''}</div>
            <button class="cta-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
            <button class="wishlist-btn" data-id="${product.id}" title="Add to Wishlist" style="background:none;border:none;margin-left:1rem;">
                <span style="font-size:1.5rem; color:var(--gold);">&#9829;</span>
            </button>
        </div>
    `;
    container.querySelector('.wishlist-btn').addEventListener('click', () => {
        const productId = product.id;
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (!wishlist.includes(productId)) wishlist.push(productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert("Added to wishlist!");
    });
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = (cart[productId] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
}

// Format as ZAR currency
function formatZAR(price) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(price);
}