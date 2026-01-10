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

async function fetchStats(username) {
    try {
        // Fetch Profile Data
        const profileRes = await fetch(`https://api.chess.com/pub/player/${username}`);
        if (!profileRes.ok) throw new Error('Player not found');
        const profileData = await profileRes.json();

        // Fetch Stats Data
        const statsRes = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
        const statsData = await statsRes.json();

        displayData(profileData, statsData);
    } catch (err) {
        showError(err.message);
    }
}

function displayData(profile, stats) {
    // Profile
    document.getElementById('avatar').src = profile.avatar || 'https://www.chess.com/bundles/web/images/user-image.svg';
    document.getElementById('player-name').textContent = profile.username;

    // Country logic - fetch country name if needed, but for now just use the code url or simple text
    // Chess.com returns a URL like https://api.chess.com/pub/country/US
    const countryCode = profile.country ? profile.country.split('/').pop() : 'Unknown';
    document.getElementById('player-location').textContent = countryCode;

    document.getElementById('profile-link').href = profile.url;

    // Stats
    updateRating('rapid-rating', stats.chess_rapid);
    updateRating('blitz-rating', stats.chess_blitz);
    updateRating('bullet-rating', stats.chess_bullet);
    updateRating('daily-rating', stats.chess_daily);

    resultsContainer.classList.remove('hidden');
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
