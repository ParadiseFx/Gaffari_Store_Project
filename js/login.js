document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errDiv = document.getElementById('login-error');
  errDiv.innerText = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Login failed');
    localStorage.setItem('jwt', data.token);
    localStorage.setItem('is_admin', data.is_admin);
    localStorage.setItem('user_name', data.name);
    localStorage.setItem('user_email', data.email);
    if (data.is_admin) {
      window.location.href = 'admin-products.html';
    } else {
      window.location.href = 'shop.html';
    }
  } catch (err) {
    errDiv.innerText = err.message;
  }
};