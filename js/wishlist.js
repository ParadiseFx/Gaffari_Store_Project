document.addEventListener('DOMContentLoaded', () => {
    const ids = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (!ids.length) {
        document.getElementById('wishlist-list').innerHTML = "<p>No products saved.</p>";
        return;
    }
    
    Promise.all(ids.map(id => 
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(product => product) // No conversion, prices are already in ZAR
    ))
    .then(products => {
        document.getElementById('wishlist-list').innerHTML = "";
        products.forEach(product => {
            if (!product) return;
            
            const div = document.createElement('div');
            div.className = 'product-card';
            div.innerHTML = `
                <img src="${product.image_url || 'assets/images/placeholder.png'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${formatCurrency(product.price)}</p>
                <a href="product.html?id=${product.id}" class="cta-btn">View</a>
                <button class="remove-wishlist-btn" data-id="${product.id}">
                    <i class="fas fa-times"></i> Remove
                </button>
            `;
            document.getElementById('wishlist-list').appendChild(div);
        });

        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                removeFromWishlist(productId);
            });
        });
    });
});

function formatCurrency(amount) {
    // Format as ZAR currency
    return `R${Number(amount).toFixed(2)}`;
}

function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Refresh the display
    document.querySelector(`.product-card button[data-id="${productId}"]`)
        .closest('.product-card')
        .remove();
    
    // Show message if wishlist is empty
    if (wishlist.length === 0) {
        document.getElementById('wishlist-list').innerHTML = "<p>No products saved.</p>";
    }
}