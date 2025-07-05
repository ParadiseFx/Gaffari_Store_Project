document.addEventListener('DOMContentLoaded', () => {
  // Add theme toggle button (if not already in HTML)
  let navbar = document.querySelector('.navbar');
  if (navbar && !document.querySelector('.theme-switch-toggle')) {
    let btn = document.createElement('button');
    btn.className = 'theme-switch-toggle';
    btn.title = 'Switch theme';
    btn.innerHTML = '🌙';
    btn.onclick = toggleTheme;
    navbar.appendChild(btn);
  }

  // Set theme on load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
    updateThemeIcon();
  }

  function toggleTheme() {
    document.body.classList.toggle('theme-dark');
    const isDark = document.body.classList.contains('theme-dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const btn = document.querySelector('.theme-switch-toggle');
    if (!btn) return;
    btn.innerHTML = document.body.classList.contains('theme-dark') ? '☀️' : '🌙';
    btn.title = document.body.classList.contains('theme-dark') ? 'Switch to Light Theme' : 'Switch to Dark Theme';
  }
});