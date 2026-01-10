document.getElementById('search-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    if (username) {
        fetchStats(username);
    }
});

async function fetchStats(username) {
    // Placeholder for API logic
    console.log(`Fetching stats for ${username}`);
}
