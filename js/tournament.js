let editingId = null;
let currentRegs = [];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadRegs() {
  currentRegs = await apiFetch('/api/registrations');
  renderRegs();
}

function setFeedback(msg, isErr = false) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = 'feedback ' + (isErr ? 'err' : 'ok');
  if (msg) setTimeout(() => {
    el.textContent = '';
    el.className = 'feedback';
  }, 3500);
}

function updateCounter() {
  const count = currentRegs.length;
  const max = 10;
  document.getElementById('countNum').textContent = count;
  document.getElementById('slotsLabel').textContent = `${count} / ${max}`;

  const remaining = max - count;
  document.getElementById('counterSub').textContent =
    remaining === 0 ? '// TOURNAMENT FULL //' :
    remaining === 1 ? '// 1 SLOT LEFT //' :
    `// ${remaining} SLOTS REMAINING //`;

  const bar = document.getElementById('slotsBar');
  if (bar) {
    bar.innerHTML = Array.from({ length: max }, (_, i) => {
      const cls = i < count ? 'slot-block filled' : 'slot-block';
      return `<span class="${cls}"></span>`;
    }).join('');
  }

  const fullBanner = document.getElementById('fullBanner');
  const formCard = document.getElementById('formCard');
  if (fullBanner && formCard) {
    if (count >= max) {
      fullBanner.style.display = 'block';
      formCard.style.opacity = '0.85';
    } else {
      fullBanner.style.display = 'none';
      formCard.style.opacity = '1';
    }
  }
}

function renderRegs() {
  updateCounter();
  const container = document.getElementById('participantsContainer');

  if (!currentRegs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="big">🎮</div>
        No players registered yet — be the first to sign up!
      </div>`;
    return;
  }

  // Render cards directly into container to leverage the grid container correctly
  container.innerHTML = currentRegs.map((reg, i) => `
    <article class="registration-card ${reg.isNew ? 'new-card' : ''}">
      <div class="registration-strip"></div>
      <div class="registration-head">
        <div>
          <div class="registration-rank">#${i + 1}</div>
          <h3>${esc(reg.playerName)}</h3>
          <p>${esc(reg.teamName)}</p>
        </div>
        <div class="registration-tags">
          <span class="registration-chip">Game ID: ${esc(reg.gameId)}</span>
          <span class="registration-chip">${esc(reg.status || 'Registered')}</span>
        </div>
      </div>

      <div class="registration-meta">
        <div>
          <span>Registered</span>
          <strong>${new Date(reg.createdAt).toLocaleString()}</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>${esc(reg.paymentMethod || 'Stripe')} · ${esc(reg.paymentStatus || 'Paid')}</strong>
        </div>
      </div>

      <div class="registration-actions">
        ${reg.canEdit ? `<button class="btn-del" onclick="editReg('${reg._id}')">Edit</button>` : ''}
        ${reg.canDelete ? `<button class="btn-del" onclick="removeReg('${reg._id}')">🗑 Remove</button>` : ''}
      </div>
    </article>
  `).join('');
}

async function submitReg() {
  const playerName = document.getElementById('inputPlayer').value.trim();
  const teamName = document.getElementById('inputTeam').value.trim();
  const gameId = document.getElementById('inputGameId').value.trim();

  if (!playerName) return setFeedback('⚠️ Player name is required.', true);
  if (!teamName) return setFeedback('⚠️ Team name is required.', true);
  if (!gameId) return setFeedback('⚠️ Game ID is required.', true);

  try {
    const payload = { playerName, teamName, gameId, tournamentName: 'Mariokart Tournament' };
    if (editingId) {
      await apiFetch(`/api/registrations/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      setFeedback(`✅ ${playerName} updated successfully!`);
    } else {
      await apiFetch('/api/registrations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setFeedback(`✅ ${playerName} successfully registered!`);
    }

    document.getElementById('inputPlayer').value = '';
    document.getElementById('inputTeam').value = '';
    document.getElementById('inputGameId').value = '';
    editingId = null;
    document.getElementById('registerBtn').textContent = 'Register 🏁';
    document.getElementById('cancelEditBtn').style.display = 'none';

    await loadRegs();
  } catch (error) {
    setFeedback(`❌ ${error.message}`, true);
  }
}

function editReg(id) {
  const reg = currentRegs.find(item => item._id === id);
  if (!reg) return;

  editingId = id;
  document.getElementById('inputPlayer').value = reg.playerName;
  document.getElementById('inputTeam').value = reg.teamName;
  document.getElementById('inputGameId').value = reg.gameId;
  document.getElementById('registerBtn').textContent = 'Update ✏️';
  document.getElementById('cancelEditBtn').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('inputPlayer').value = '';
  document.getElementById('inputTeam').value = '';
  document.getElementById('inputGameId').value = '';
  document.getElementById('registerBtn').textContent = 'Register 🏁';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

async function removeReg(id) {
  if (!confirm('Remove this registration?')) return;
  try {
    await apiFetch(`/api/registrations/${id}`, { method: 'DELETE' });
    await loadRegs();
  } catch (error) {
    setFeedback(`❌ ${error.message}`, true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  guardSession(['user', 'admin']);

  document.getElementById('registerBtn').addEventListener('click', async (e) => {
    e.preventDefault();

    const playerName = document.getElementById('inputPlayer').value.trim();
    const teamName = document.getElementById('inputTeam').value.trim();
    const gameId = document.getElementById('inputGameId').value.trim();

    if (!playerName) return setFeedback('⚠️ Player name is required.', true);
    if (!teamName) return setFeedback('⚠️ Team name is required.', true);
    if (!gameId) return setFeedback('⚠️ Game ID is required.', true);

    try {
      sessionStorage.setItem(
        'pendingRegistration',
        JSON.stringify({
          playerName,
          teamName,
          gameId,
          tournamentName: 'Mariokart Tournament'
        })
      );

      const response = await fetch(
        '/api/payment/create-checkout-session',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            playerName,
            teamName,
            gameId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to create Stripe session.'
        );
      }

      window.location.href = data.url;

    } catch (error) {
      setFeedback(`❌ ${error.message}`, true);
    }
  });

  document.getElementById('cancelEditBtn').addEventListener('click', (e) => {
    e.preventDefault();
    cancelEdit();
  });

  loadRegs().catch(err =>
    setFeedback(err.message, true)
  );
});