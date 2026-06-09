function togglePw(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;

  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = '👁️';
  } else {
    input.type = 'password';
    toggle.textContent = '🙈';
  }
}

function updateStrength(password) {
  const label = document.getElementById('strengthLabel');
  if (!label) return;

  if (!password) {
    label.textContent = '';
    return;
  }

  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/.test(password);
  const medium = password.length >= 8;
  label.textContent = strong ? 'Strong password ✅' : medium ? 'Medium password ⚠' : 'Weak password';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', () => updateStrength(passwordInput.value));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fname = document.getElementById('fname').value.trim();
    const lname = document.getElementById('lname').value.trim();
    const age = document.getElementById('age').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    const fnameErr = document.getElementById('fnameErr');
    const lnameErr = document.getElementById('lnameErr');
    const ageErr = document.getElementById('ageErr');
    const emailErr = document.getElementById('emailErr');
    const passwordErr = document.getElementById('passwordErr');
    const confirmErr = document.getElementById('confirmErr');
    const globalSuccess = document.getElementById('globalSuccess');

    [fnameErr, lnameErr, ageErr, emailErr, passwordErr, confirmErr].forEach(el => el.textContent = '');
    globalSuccess.style.display = 'none';

    let valid = true;
    if (!fname) { fnameErr.textContent = '⚠ First name is required.'; valid = false; }
    if (!lname) { lnameErr.textContent = '⚠ Last name is required.'; valid = false; }
    if (!age || Number(age) < 1 || Number(age) > 120) { ageErr.textContent = '⚠ Please enter a valid age.'; valid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { emailErr.textContent = '⚠ Email is required.'; valid = false; }
    else if (!emailRegex.test(email)) { emailErr.textContent = '✗ Invalid Email Format'; valid = false; }
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;
    if (!pwRegex.test(password)) { passwordErr.textContent = '⚠ Password needs 8+ chars, uppercase, lowercase, number & special character.'; valid = false; }
    if (confirm !== password) { confirmErr.textContent = '⚠ Passwords do not match.'; valid = false; }
    if (!valid) return;

    try {
      await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: fname,
          lastName: lname,
          age,
          email,
          password
        })
      });

      globalSuccess.style.display = 'block';
      globalSuccess.innerHTML = `✅ Account created successfully! <a href="login.html" style="color:#1a7a45;font-weight:700;">Log in now</a>.`;
      form.reset();
      updateStrength('');
    } catch (error) {
      globalSuccess.style.display = 'block';
      globalSuccess.textContent = `❌ ${error.message}`;
      globalSuccess.style.background = 'rgba(255,0,0,0.08)';
      globalSuccess.style.color = '#b00020';
    }
  });
});
