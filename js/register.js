document.getElementById('register-form').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errDiv = document.getElementById('register-error');
  errDiv.innerText = '';
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password, admin: false}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Registration failed');
    window.location.href = 'login.html';
  } catch (err) {
    errDiv.innerText = err.message;
  }
};