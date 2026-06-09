// ── All players loaded from players.json via fetch ──
let allPlayers = [];

// Character emojis for card back avatar
const AVATARS = {
    'Mario':          '🍄',
    'Luigi':          '💚',
    'Peach':          '🌸',
    'Rosalina':       '⭐',
    'Waluigi':        '🟣',
    'Daisy':          '🌼',
    'Yoshi':          '🦎',
    'Toad':           '🍄',
    'Koopa':          '🐢',
    'Birdo':          '🎀',
    'Diddy Kong':     '🐵',
    'Bowser Jr.':     '👦',
    'Dry Bones':      '💀',
    'Donkey Kong':    '🦍',
    'Bowser':         '🔥',
    'Wario':          '💛',
    'Metal Mario':    '⚙️',
    'Baby Mario':     '👶',
    'Baby Luigi':     '👶',
    'Pink Gold Peach':'✨'
};

// ── Fetch players.json on page load ──
fetch('/players')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        allPlayers = data;                 // store full array globally
        displayPlayers(allPlayers, false); // render all on first load
        setupFilters();                    // attach filter listeners
    })
    .catch(function() {
        document.getElementById('playersContainer').innerHTML =
            '<p style="color:#cc0000;font-weight:700;">⚠️ Could not load players.json</p>';
    });

// ── Attach real-time listeners to search + filters ──
function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('gameFilter').addEventListener('change', applyFilters);
    document.getElementById('rankFilter').addEventListener('change', applyFilters);
}

// ── Read all filter values and filter the array ──
function applyFilters() {
    const search     = document.getElementById('searchInput').value.trim().toLowerCase();
    const typeFilter = document.getElementById('gameFilter').value;
    const rankFilter = document.getElementById('rankFilter').value;

    let filtered = allPlayers.filter(function(player) {

        // Search by name
        const matchName = player.name.toLowerCase().includes(search);

        // Filter by type (Lightweight / All-Rounder / Heavyweight)
        const matchType = typeFilter === '' || player.type === typeFilter;

        // Filter by rank
        let matchRank = true;
        if      (rankFilter === '1')    matchRank = player.rank === 1;
        else if (rankFilter === '2')    matchRank = player.rank === 2;
        else if (rankFilter === '3')    matchRank = player.rank === 3;
        else if (rankFilter === 'top3') matchRank = player.rank <= 3;
        else if (rankFilter === 'top5') matchRank = player.rank <= 5;

        return matchName && matchType && matchRank;
    });

    // Sort: top ranked players always appear first
    filtered.sort(function(a, b) { return a.rank - b.rank; });

    displayPlayers(filtered, true);
    updateResultsInfo(filtered.length, search, typeFilter, rankFilter);
}

// ── Reset all filters ──
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('gameFilter').value  = '';
    document.getElementById('rankFilter').value  = '';
    displayPlayers(allPlayers, true);
    updateResultsInfo(allPlayers.length, '', '', '');
}

// ── Build and inject player cards into DOM ──
function displayPlayers(players, animate) {
    const container = document.getElementById('playersContainer');
    const noResults = document.getElementById('noResults');
    const countEl   = document.getElementById('playerCount');

    countEl.textContent = players.length;

    if (players.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    container.innerHTML = '';

    players.forEach(function(player, index) {
        const card = document.createElement('div');
        card.className = 'flip-card';

        // Staggered flip animation on filter change
        if (animate) {
            card.classList.add('flipping');
            card.style.animationDelay = (index * 60) + 'ms';
            setTimeout(function() { card.classList.remove('flipping'); }, 600 + index * 60);
        }

        const avatar     = AVATARS[player.name] || '🏎️';
        const isRank1    = player.rank === 1;

        const imgOrEmoji = player.image
            ? `<img src="${player.image}" alt="${player.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
               <span class="img-fallback" style="display:none">${avatar}</span>`
            : `<span class="img-fallback">${avatar}</span>`;

        // Diamond badge only for rank 1
        const diamondBadge = isRank1
            ? `<div class="diamond-badge">💎 Diamond</div>`
            : '';

        card.innerHTML = `
            <div class="flip-card-inner">

                <!-- FRONT -->
                <div class="flip-front">
                    <div class="player-img-wrap">
                        ${imgOrEmoji}
                        ${diamondBadge}
                    </div>
                    <div class="player-front-info">
                        <div>
                            <h3>${player.name}</h3>
                            <p class="player-type-tag">${player.type}</p>
                            <div class="player-stats">
                                <div class="stat-row">
                                    <span class="stat-label">Speed</span>
                                    <div class="stat-bar"><div class="stat-fill" style="width:${player.speed}%"></div></div>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Handling</span>
                                    <div class="stat-bar"><div class="stat-fill" style="width:${player.handling}%"></div></div>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Drift</span>
                                    <div class="stat-bar"><div class="stat-fill" style="width:${player.drift}%"></div></div>
                                </div>
                            </div>
                        </div>
                        <span class="rank-badge ${player.badge}">${player.badgeLabel}</span>
                    </div>
                    <p class="flip-hint">Hover to see more ↻</p>
                </div>

                <!-- BACK -->
                <div class="flip-back">
                    <div class="back-avatar">${avatar}</div>
                    <div class="back-name">${player.name}</div>
                    <div class="back-type">${player.type}</div>
                    <div class="back-desc">${player.desc}</div>
                    <div class="back-rank">${player.badgeLabel}</div>
                </div>

            </div>`;

        container.appendChild(card);
    });
}

// ── Update results info text ──
function updateResultsInfo(count, search, type, rank) {
    const el = document.getElementById('resultsInfo');
    if (!search && !type && !rank) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `Showing <span>${count}</span> player${count !== 1 ? 's' : ''} matching your filters`;
}