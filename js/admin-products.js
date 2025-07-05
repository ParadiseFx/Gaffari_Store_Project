document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    document.getElementById('add-product-form').addEventListener('submit', async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        const jwt = localStorage.getItem('jwt');
        await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify(data)
        });
        loadProducts();
        e.target.reset();
    });
});

async function loadProducts() {
    const res = await fetch('http://localhost:5000/api/products');
    const products = await res.json();
    document.getElementById('products-table').innerHTML = products.map(p =>
        `<div style="display:flex;align-items:center;gap:1rem;">
            <img src="${p.image_url || 'assets/images/placeholder.png'}" style="width:36px;height:36px;border-radius:6px;">
            <div style="flex:1;">${p.name}</div>
            <div style="font-weight:600;">${formatZAR(p.price)}</div>
            <button class="delete-btn" data-id="${p.id}">Delete</button>
        </div>`
    ).join('');
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async () => {
            const jwt = localStorage.getItem('jwt');
            await fetch(`http://localhost:5000/api/products/${btn.getAttribute('data-id')}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${jwt}` }
            });
            loadProducts();
        };
    });
}

function formatZAR(price) {
    // Display as South African Rand (ZAR)
    return `R${Number(price).toFixed(2)}`;
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

// Update the function that fetches products to accept a search query
async function fetchAndRenderProducts(searchQuery = '') {
  let url = '/api/products';
  if (searchQuery) url = `/api/products/search?q=${encodeURIComponent(searchQuery)}`;
  const res = await fetch(url);
  const products = await res.json();
  document.getElementById('products-table').innerHTML = products.map(p =>
      `<div style="display:flex;align-items:center;gap:1rem;">
          <img src="${p.image_url || 'assets/images/placeholder.png'}" style="width:36px;height:36px;border-radius:6px;">
          <div style="flex:1;">${p.name}</div>
          <div style="font-weight:600;">${formatZAR(p.price)}</div>
          <button class="delete-btn" data-id="${p.id}">Delete</button>
      </div>`
  ).join('');
  document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
          const jwt = localStorage.getItem('jwt');
          await fetch(`http://localhost:5000/api/products/${btn.getAttribute('data-id')}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${jwt}` }
          });
          loadProducts();
      };
  });
}