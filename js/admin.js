let users = [];
let registrations = [];
let contacts = [];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function showStatus(msg, isErr = false) {
  const el = document.getElementById('statusBox');
  el.textContent = msg;
  el.className = isErr ? 'global-success err' : 'global-success ok';
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

async function loadAdminData() {
  const [usersData, regsData, contactsData, summary] = await Promise.all([
    apiFetch('/api/admin/users'),
    apiFetch('/api/admin/registrations'),
    apiFetch('/api/admin/contact-submissions'),
    apiFetch('/api/admin/summary')
  ]);
  users = usersData;
  registrations = regsData;
  contacts = contactsData;
  document.getElementById('summaryUsers').textContent = summary.userCount;
  document.getElementById('summaryRegs').textContent = summary.registrationCount;
  document.getElementById('summaryContacts').textContent = summary.contactCount ?? contacts.length;
  document.getElementById('summaryPaid').textContent = summary.paidCount;
  renderUsers();
  renderContacts();
  renderRegs();
}

function renderUsers() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${esc(u.firstName)} ${esc(u.lastName)}</td>
      <td>${esc(u.email)}</td>
      <td>${u.age}</td>
      <td>${esc(u.role)}</td>
      <td>
        <button class="admin-btn admin-btn-danger admin-btn-small" onclick="deleteUser('${u._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderContacts() {
  const tbody = document.getElementById('contactsBody');
  tbody.innerHTML = contacts.map(c => `
    <tr>
      <td>${esc(c.firstName)} ${esc(c.lastName)}</td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.character)}</td>
      <td style="max-width:320px;white-space:normal;">${esc(c.message || '—')}</td>
      <td>${esc(c.status || 'New')}</td>
      <td>${formatDate(c.createdAt)}</td>
      <td>
        <button class="admin-btn admin-btn-secondary admin-btn-small" onclick="markReviewed('${c._id}')">Mark Reviewed</button>
        <button class="admin-btn admin-btn-danger admin-btn-small" onclick="deleteContact('${c._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderRegs() {
  const tbody = document.getElementById('regsBody');
  tbody.innerHTML = registrations.map(r => `
    <tr>
      <td>${esc(r.playerName)}</td>
      <td>${esc(r.teamName)}</td>
      <td>${esc(r.gameId)}</td>
      <td>${esc(r.status || 'Registered')}</td>
      <td>${esc(r.paymentStatus || 'Unpaid')}</td>
      <td>
        <button class="admin-btn admin-btn-danger admin-btn-small" onclick="deleteReg('${r._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deleteUser(id) {
  if (!confirm('Delete this user and their registrations?')) return;
  await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  showStatus('User deleted.');
  await loadAdminData();
}

async function deleteContact(id) {
  if (!confirm('Delete this contact submission?')) return;
  await apiFetch(`/api/admin/contact-submissions/${id}`, { method: 'DELETE' });
  showStatus('Contact submission deleted.');
  await loadAdminData();
}

async function markReviewed(id) {
  await apiFetch(`/api/admin/contact-submissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Reviewed' })
  });
  showStatus('Contact submission marked as reviewed.');
  await loadAdminData();
}

async function deleteReg(id) {
  if (!confirm('Delete this registration?')) return;
  await apiFetch(`/api/admin/registrations/${id}`, { method: 'DELETE' });
  showStatus('Registration deleted.');
  await loadAdminData();
}

document.addEventListener('DOMContentLoaded', () => {
  guardSession(['admin']);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  loadAdminData().catch(err => showStatus(err.message, true));
});
