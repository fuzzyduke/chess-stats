document.getElementById('search-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
        // Clear previous state
        hideError();
        resultsContainer.classList.add('hidden');

        fetchStats(username);
    }
});

const resultsContainer = document.getElementById('results');
const errorDiv = document.getElementById('error');
const gamesList = document.getElementById('games-list');

async function fetchStats(username) {
    try {
        // Fetch Profile Data
        const profileRes = await fetch(`https://api.chess.com/pub/player/${username}`);
        if (!profileRes.ok) throw new Error('Player not found');
        const profileData = await profileRes.json();

        // Fetch Stats Data
        const statsRes = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
        const statsData = await statsRes.json();

        // Fetch Country Name (if url exists)
        let countryName = 'Unknown';
        if (profileData.country) {
            try {
                const countryRes = await fetch(profileData.country);
                const countryData = await countryRes.json();
                countryName = countryData.name || 'Unknown';
            } catch (e) {
                console.error('Failed to fetch country', e);
            }
        }

        // Fetch Game History
        fetchGameHistory(username);

        displayData(profileData, statsData, countryName);
    } catch (err) {
        showError(err.message);
    }
}

async function fetchGameHistory(username) {
    try {
        gamesList.innerHTML = '<div style="color:#888; text-align:center">Loading history...</div>';

        // Get Archives
        const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
        const archivesData = await archivesRes.json();

        if (!archivesData.archives || archivesData.archives.length === 0) {
            gamesList.innerHTML = '<div style="text-align:center">No games found.</div>';
            return;
        }

        // Get Latest Monthly Archive
        const latestArchiveUrl = archivesData.archives[archivesData.archives.length - 1];
        const gamesRes = await fetch(latestArchiveUrl);
        const gamesData = await gamesRes.json();

        // Display last 10 games (reversed)
        const recentGames = gamesData.games.slice(-10).reverse();
        displayGames(recentGames, username);

    } catch (e) {
        console.error(e);
        gamesList.innerHTML = '<div style="color:#ff6b6b; text-align:center">Failed to load games.</div>';
    }
}

function displayData(profile, stats, countryName) {
    // Profile
    document.getElementById('avatar').src = profile.avatar || 'https://www.chess.com/bundles/web/images/user-image.svg';
    document.getElementById('player-name').textContent = profile.username;

    document.getElementById('player-location').textContent = countryName;

    document.getElementById('profile-link').href = profile.url;

    // Stats
    updateRating('rapid-rating', stats.chess_rapid);
    updateRating('blitz-rating', stats.chess_blitz);
    updateRating('bullet-rating', stats.chess_bullet);
    updateRating('daily-rating', stats.chess_daily);

    resultsContainer.classList.remove('hidden');
}

function displayGames(games, username) {
    gamesList.innerHTML = '';

    games.forEach(game => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const player = isWhite ? game.white : game.black;
        const opponent = isWhite ? game.black : game.white;
        const result = player.result;

        let resultClass = 'draw';
        if (result === 'win') resultClass = 'win';
        else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) resultClass = 'loss';

        const date = new Date(game.end_time * 1000).toLocaleDateString();

        const card = document.createElement('div');
        card.className = `game-card ${resultClass}`;
        card.innerHTML = `
            <div class="game-info">
                <span class="opponent">vs ${opponent.username} (${opponent.rating})</span>
                <span class="result">${result} as ${isWhite ? 'White' : 'Black'}</span>
            </div>
            <div class="game-meta">
                <div class="game-date">${date}</div>
                <a href="${game.url}" target="_blank" class="game-link">View Game</a>
            </div>
        `;
        gamesList.appendChild(card);
    });
}

function updateRating(id, data) {
    const el = document.getElementById(id);
    if (data && data.last) {
        el.textContent = data.last.rating;
    } else {
        el.textContent = 'Unrated';
        el.style.fontSize = '1rem';
        el.style.color = '#777';
    }
}

function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}
