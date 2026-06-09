let editingId = null;
let players = [];

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function loadBoard() {
  players = await apiFetch('/api/leaderboard');
  renderBoard();
}

function setFeedback(msg, isErr) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className = 'feedback ' + (isErr ? 'err' : 'ok');
  setTimeout(() => { el.textContent = ''; el.className = 'feedback'; }, 3000);
}

function renderPodium(players) {
  const el = document.getElementById('podium');
  if (!players.length) {
    el.innerHTML = '<p class="podium-empty">No players yet</p>';
    return;
  }
  const top = players.slice(0, 3);
  const order = top.length === 1 ? [top[0]]
    : top.length === 2 ? [top[1], top[0]]
      : [top[1], top[0], top[2]];

  const cls = p => ['p-2', 'p-1', 'p-3'][order.indexOf(p)];
  const emojis = ['🍄', '🐢', '🌟', '🔥', '💨', '🎯', '🌈', '⚡', '🍌', '🪄'];

  el.innerHTML = order.map(p => {
    const rank = players.indexOf(p) + 1;
    const emoji = emojis[players.indexOf(p) % emojis.length];
    return `
      <div class="p-place ${cls(p)}">
        <div class="p-emoji">${emoji}</div>
        <div class="p-name">${esc(p.name)}</div>
        <div class="p-score">${p.score} pts</div>
        <div class="p-block">${rank}</div>
      </div>`;
  }).join('');
}

function renderTable(players) {
  const tbody = document.getElementById('tbody');
  if (!players.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">🎮 No players yet — add one above!</div></td></tr>`;
    return;
  }
  tbody.innerHTML = players.map((p, i) => `
    <tr class="${i === 0 ? 'row-top' : ''}">
      <td>${i + 1}</td>
      <td>${esc(p.name)}</td>
      <td><span class="pts">${p.score}</span></td>
      <td><button class="btn-del" onclick="editPlayer('${p._id}')">Edit</button></td>
      <td><button class="btn-del" onclick="deletePlayer('${p._id}')">🗑</button></td>
    </tr>`).join('');
}

function renderBoard() {
  players.sort((a, b) => b.score - a.score);
  renderPodium(players);
  renderTable(players);
}

async function addOrUpdatePlayer() {
  const name = document.getElementById('inputName').value.trim();
  const score = document.getElementById('inputScore').value.trim();
  if (!name) return setFeedback('⚠️ Enter a player name.', true);
  if (score === '' || Number(score) < 0) return setFeedback('⚠️ Enter a valid score.', true);

  try {
    if (editingId) {
      await apiFetch(`/api/leaderboard/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, score: Number(score) })
      });
      setFeedback('✅ Player updated!');
    } else {
      await apiFetch('/api/leaderboard', {
        method: 'POST',
        body: JSON.stringify({ name, score: Number(score) })
      });
      setFeedback('✅ Player added!');
    }

    editingId = null;
    document.getElementById('inputName').value = '';
    document.getElementById('inputScore').value = '';
    document.querySelector('.btn-add').textContent = 'Add 🏎️';
    await loadBoard();
  } catch (error) {
    setFeedback(`❌ ${error.message}`, true);
  }
}

function editPlayer(id) {
  const player = players.find(p => p._id === id);
  if (!player) return;
  editingId = id;
  document.getElementById('inputName').value = player.name;
  document.getElementById('inputScore').value = player.score;
  document.querySelector('.btn-add').textContent = 'Update ✏️';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deletePlayer(id) {
  if (!confirm('Delete this leaderboard player?')) return;
  await apiFetch(`/api/leaderboard/${id}`, { method: 'DELETE' });
  await loadBoard();
}

function clearAll() {
  if (!confirm('Clear the entire leaderboard?')) return;
  Promise.all(players.map(p => apiFetch(`/api/leaderboard/${p._id}`, { method: 'DELETE' })))
    .then(loadBoard);
}

document.addEventListener('DOMContentLoaded', () => {
  loadBoard();
  document.querySelector('.btn-add').addEventListener('click', (e) => {
    e.preventDefault();
    addOrUpdatePlayer();
  });
  ['inputName', 'inputScore'].forEach(id =>
    document.getElementById(id).addEventListener('keydown', e => e.key === 'Enter' && addOrUpdatePlayer())
  );
});
