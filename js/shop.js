let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    document.getElementById('product-search').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
        renderProducts(filtered);
    });

    document.getElementById('category-filter').addEventListener('change', function() {
        const cat = this.value;
        if (!cat) renderProducts(allProducts);
        else renderProducts(allProducts.filter(p => p.category === cat));
    });
});

function fetchProducts() {
    fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(products => {
            // No conversion needed, prices are already in ZAR
            allProducts = products;
            
            // Populate category filter
            const catSet = new Set(products.map(p => p.category).filter(Boolean));
            const catFilter = document.getElementById('category-filter');
            catSet.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                catFilter.appendChild(opt);
            });
            renderProducts(allProducts);
        });
}

function renderProducts(products) {
    const container = document.getElementById('shop-product-list');
    container.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <a href="product.html?id=${product.id}">
                <img src="${product.image_url || 'assets/images/placeholder.png'}" alt="${product.name}">
                <h3>${product.name}</h3>
            </a>
            <p>${formatCurrency(product.price)}</p>
            <button class="wishlist-btn" data-id="${product.id}" title="Add to Wishlist" style="background:none;border:none;position:absolute;top:14px;right:14px;">
                <span style="font-size:1.5rem; color:var(--gold);">&#9829;</span>
            </button>
            <button class="cta-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            if (!wishlist.includes(productId)) wishlist.push(productId);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            btn.style.color = "#c00";
            alert("Added to wishlist!");
        });
    });
}

function formatCurrency(amount) {
    // Format as ZAR
    return `R${Number(amount).toFixed(2)}`;
}



document.getElementById('search-btn').onclick = async function() {
  const query = document.getElementById('search-input').value.trim();
  fetchAndRenderProducts(query);
};

document.getElementById('search-input').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('search-btn').click();
  }
});

async function fetchAndRenderProducts(searchQuery = '') {
  let url = '/api/products';
  if (searchQuery) url = `/api/products/search?q=${encodeURIComponent(searchQuery)}`;
  const res = await fetch(url);
  const products = await res.json();
  
  // No conversion needed, prices are already in ZAR
  renderProducts(products);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2000); // Toast disappears after 2 seconds
}

// Attach to all "Add to Cart" buttons
document.querySelectorAll('.btn.btn-primary').forEach(btn => {
  btn.addEventListener('click', function() {
    showToast('Item added to cart!');
    // Your existing add-to-cart logic goes here
    function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = (cart[productId] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    alert("Added to cart!");
}
  });
});


function filterProducts() {
  const query = document.getElementById('product-search').value.toLowerCase();
  const selected = document.getElementById('category-filter').value;
  document.querySelectorAll('.product-card').forEach(card => {
    const title = card.querySelector('.product-title').textContent.toLowerCase();
    const cardCategory = card.getAttribute('data-category');
    const matchesSearch = title.includes(query);
    const matchesCategory = !selected || cardCategory === selected;
    card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
  });
}

window.addToCart = function(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || {};
  cart[productId] = (cart[productId] || 0) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast('Item added to cart!');
}