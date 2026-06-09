function getToken() {
  return localStorage.getItem('mk_token') || '';
}

function getRole() {
  return localStorage.getItem('mk_role') || '';
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('mk_user') || 'null');
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(getToken());
}

function saveSession(payload) {
  localStorage.setItem('mk_token', payload.token);
  localStorage.setItem('mk_role', payload.role);
  localStorage.setItem('mk_user', JSON.stringify(payload.user));
  renderAuthButton();
}

function logout() {
  localStorage.removeItem('mk_token');
  localStorage.removeItem('mk_role');
  localStorage.removeItem('mk_user');
  renderAuthButton();
  window.location.href = 'login.html';
}

function buildAuthButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'authActionBtn';
  button.className = 'theme-toggle auth-action-btn';
  button.textContent = isLoggedIn() ? 'Logout' : 'Login';
  button.addEventListener('click', () => {
    if (isLoggedIn()) {
      logout();
    } else {
      window.location.href = 'login.html';
    }
  });
  return button;
}

function renderAuthButton() {
  const existing = document.getElementById('authActionBtn');
  if (existing) existing.remove();

  const navContainer = document.querySelector('.nav-container');
  const authButton = buildAuthButton();

  if (navContainer) {
    const themeToggle = document.getElementById('themeToggle');

    if (themeToggle && themeToggle.parentNode === navContainer) {
      navContainer.insertBefore(authButton, themeToggle);
    } else {
      navContainer.appendChild(authButton);
    }
    authButton.classList.remove('auth-floating-btn');
    authButton.classList.add('auth-nav-btn');
  } else {
    authButton.classList.add('auth-floating-btn');
    document.body.appendChild(authButton);
  }
}

async function apiFetch(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = (data && data.message) ? data.message : 'Request failed.';
    throw new Error(message);
  }

  return data;
}

function guardSession(roles = []) {
  const role = getRole();
  if (!getToken() || (roles.length && !roles.includes(role))) {
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', renderAuthButton);
window.addEventListener('storage', renderAuthButton);
