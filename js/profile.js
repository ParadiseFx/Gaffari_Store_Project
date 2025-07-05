document.addEventListener('DOMContentLoaded', async () => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;
    // Load profile
    const res = await fetch('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${jwt}` } });
    const user = await res.json();
    document.querySelector('[name="name"]').value = user.name;
    document.querySelector('[name="email"]').value = user.email;
    // Save profile
    document.getElementById('profile-form').addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.querySelector('[name="name"]').value;
        await fetch('http://localhost:5000/api/users/me', {
            method: 'PATCH',
            headers: { 'Content-Type':'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({ name })
        });
        alert('Profile updated!');
    });
    // Addresses
    const addrRes = await fetch('http://localhost:5000/api/users/me/addresses', { headers: { Authorization: `Bearer ${jwt}` } });
    const addrs = await addrRes.json();
    document.getElementById('address-list').innerHTML = addrs.map(a =>
        `<div>${a.address}, ${a.city}, ${a.postal_code}</div>`
    ).join('');
    document.getElementById('add-address').onclick = async () => {
        const address = prompt('Address?');
        const city = prompt('City?');
        const postal_code = prompt('Postal code?');
        if (!address || !city || !postal_code) return;
        await fetch('http://localhost:5000/api/users/me/addresses', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify({ address, city, postal_code })
        });
        location.reload();
    };
});