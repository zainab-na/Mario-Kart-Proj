// ── THEME MANAGER ──────────────────────────────────────────
// Runs on every page. Reads localStorage and applies theme
// before the page renders to avoid any flash.

const THEME_KEY = 'mk_theme';

// Apply saved theme immediately on page load
(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

// Toggle between light and dark
function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const next    = current === 'light' ? 'dark' : 'light';

    // Apply to <html> element
    document.documentElement.setAttribute('data-theme', next);

    // Save preference to localStorage
    localStorage.setItem(THEME_KEY, next);

    // Update toggle button icon
    updateToggleBtn(next);
}

// Set correct icon on page load
function updateToggleBtn(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    updateToggleBtn(saved);
});