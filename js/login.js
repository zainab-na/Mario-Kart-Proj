document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;
    const globalSuccess = document.getElementById('globalSuccess');
    const identifierErr = document.getElementById('identifierErr');
    const passwordErr = document.getElementById('passwordErr');

    identifierErr.textContent = '';
    passwordErr.textContent = '';
    globalSuccess.style.display = 'none';

    let valid = true;
    if (!identifier) {
      identifierErr.textContent = '⚠ Username or email is required.';
      valid = false;
    }
    if (!password) {
      passwordErr.textContent = '⚠ Password is required.';
      valid = false;
    }
    if (!valid) return;

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      saveSession(data);
      globalSuccess.textContent = data.role === 'admin'
        ? '✅ Admin login successful! Redirecting to admin panel...'
        : '✅ Login successful! Redirecting...';
      globalSuccess.style.display = 'block';

      setTimeout(() => {
        window.location.href = data.role === 'admin' ? 'admin.html' : 'home.html';
      }, 900);
    } catch (error) {
      globalSuccess.style.display = 'block';
      globalSuccess.textContent = `❌ ${error.message}`;
      globalSuccess.style.background = 'rgba(255,0,0,0.08)';
      globalSuccess.style.color = '#b00020';
    }
  });
});

function togglePw() {
  const input = document.getElementById('password');
  const toggle = document.getElementById('eyeToggle');
  if (!input || !toggle) return;

  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = '👁️';
  } else {
    input.type = 'password';
    toggle.textContent = '🙈';
  }
}
