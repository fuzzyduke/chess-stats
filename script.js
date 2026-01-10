// Debug Logger
function log(msg) {
    const logs = document.getElementById('debug-logs');
    const time = new Date().toLocaleTimeString();
    logs.innerHTML += `[${time}] ${msg}\n`;
    logs.scrollTop = logs.scrollHeight;
    console.log(msg);
}

document.getElementById('sys-status').textContent = 'Ready';
log('System initialized. Checking dependencies...');

if (typeof Worker === 'undefined') {
    log('ERROR: Web Workers are not supported in this browser.');
    document.getElementById('sys-status').innerHTML = '<span style="color:red">Workers Not Supported</span>';
    if (typeof Worker !== 'undefined') {
        try {
            log('Test-loading Stockfish engine...');
            const configTest = new Worker('stockfish.js');
            configTest.onmessage = function (e) {
                if (e.data === 'uciok') {
                    log('Stockfish Engine Check: PASS');
                    configTest.terminate();
                }
            };
            configTest.postMessage('uci');

            // Timeout check
            setTimeout(() => {
                if (configTest) configTest.terminate();
            }, 3000);

        } catch (e) {
            log(`Stockfish Load Error: ${e.message}`);
        }
    }
}

// ... (Search listener)
document.getElementById('search-btn').addEventListener('click', () => {
    try {
        log('Search button clicked');
        const username = document.getElementById('username').value;
        if (username) {
            hideError();
            resultsContainer.classList.add('hidden');
            fetchStats(username);
        } else {
            log('Username is empty');
        }
    } catch (e) {
        log(`CRITICAL ERROR in Search Handler: ${e.message}`);
        console.error(e);
    }
});

const resultsContainer = document.getElementById('results');
const errorDiv = document.getElementById('error');
const gamesList = document.getElementById('games-list');
const paginationControls = document.getElementById('pagination-controls');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-indicator');

// Application State
let allGames = [];
let currentPage = 1;
const GAMES_PER_PAGE = 10;
let currentUsername = '';
let gameBlunders = {}; // Store blunders for each game: { gameId: [{fen, evalDiff, moveIndex}] }
let currentBlunderGameId = null;
let currentBlunderIndex = 0;
let board = null;

// Initialize Board (Hidden initially)
$(document).ready(function () {
    try {
        board = Chessboard('myBoard', {
            position: 'start',
            draggable: true,
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
        });
        $(window).resize(board.resize);
    } catch (e) {
        log('Chessboard Init Error: ' + e.message);
    }

    // Sidebar Controls
    $('#close-sidebar').on('click', () => {
        $('#board-sidebar').removeClass('open');
    });

    $('#prev-blunder').on('click', () => {
        if (currentBlunderIndex > 0) {
            showBlunder(currentBlunderIndex - 1);
        }
    });

    $('#next-blunder').on('click', () => {
        const blunders = gameBlunders[currentBlunderGameId];
        if (blunders && currentBlunderIndex < blunders.length - 1) {
            showBlunder(currentBlunderIndex + 1);
        }
    });
});

function showBlunder(index) {
    const blunders = gameBlunders[currentBlunderGameId];
    if (!blunders || !blunders[index]) return;

    currentBlunderIndex = index;
    const b = blunders[index];

    // Update UI
    $('#blunder-index').text(index + 1);
    $('#blunder-total').text(blunders.length);
    $('#eval-diff').text(`Loss: ${(b.evalDiff / 100).toFixed(2)}`);

    // Set Board Position
    board.position(b.fen);
}

function openSidebar(gameId) {
    currentBlunderGameId = gameId;
    const blunders = gameBlunders[gameId];

    if (!blunders || blunders.length === 0) {
        log('No blunders to show for ' + gameId);
        return;
    }

    // Reset to first blunder
    showBlunder(0);

    // Open Sidebar
    $('#board-sidebar').addClass('open');

    // Redraw board (needed because it was hidden)
    setTimeout(() => board.resize(), 300);
}

async function fetchStats(username) {
    allGames = [];
    currentPage = 1;
    currentUsername = username;
    paginationControls.classList.add('hidden');
    log(`Fetching stats for: ${username}`);

    try {
        log('Fetching profile data...');
        const profileRes = await fetch(`https://api.chess.com/pub/player/${username}`);
        log(`Profile response status: ${profileRes.status}`);

        if (!profileRes.ok) throw new Error('Player not found');
        const profileData = await profileRes.json();
        log('Profile data received');

        log('Fetching stats...');
        const statsRes = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
        const statsData = await statsRes.json();
        log('Stats data received');

        let countryName = 'Unknown';
        if (profileData.country) {
            try {
                log(`Fetching country: ${profileData.country}`);
                const countryRes = await fetch(profileData.country);
                const countryData = await countryRes.json();
                countryName = countryData.name || 'Unknown';
            } catch (e) {
                console.error('Failed to fetch country', e);
                log(`Country fetch failed: ${e.message}`);
            }
        }

        log('Fetching game history...');
        fetchGameHistory(username);
        displayData(profileData, statsData, countryName);
    } catch (err) {
        log(`ERROR: ${err.message}`);
        showError(err.message);
    }
}

const BATCH_SIZE = 5;
const GAMES_LIMIT = 5000;

async function fetchGameHistory(username) {
    try {
        gamesList.innerHTML = '<div style="color:#888; text-align:center">Fetching archives list...</div>';
        const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
        const archivesData = await archivesRes.json();

        if (!archivesData.archives || archivesData.archives.length === 0) {
            gamesList.innerHTML = '<div style="text-align:center">No games found.</div>';
            return;
        }

        const archiveUrls = archivesData.archives.reverse();
        gamesList.innerHTML = `<div style="color:#888; text-align:center">Found ${archiveUrls.length} monthly archives. Loading...</div>`;

        allGames = [];
        let completed = 0;

        for (let i = 0; i < archiveUrls.length; i += BATCH_SIZE) {
            const batch = archiveUrls.slice(i, i + BATCH_SIZE);
            gamesList.innerHTML = `<div style="color:#888; text-align:center">Loading history... (${completed}/${archiveUrls.length} months)</div>`;

            const batchPromises = batch.map(url => fetch(url).then(res => res.json()).catch(err => {
                console.warn(`Failed to fetch ${url}`, err);
                return { games: [] };
            }));

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach(data => {
                if (data.games) {
                    data.games.reverse();
                    allGames.push(...data.games);
                }
            });

            completed += batch.length;
            if (allGames.length > GAMES_LIMIT) break;
        }

        gamesList.innerHTML = '';
        if (allGames.length > 0) {
            renderPage(1);
            updatePaginationControls();
            paginationControls.classList.remove('hidden');
        } else {
            gamesList.innerHTML = '<div style="text-align:center">No games found.</div>';
        }

    } catch (e) {
        console.error(e);
        gamesList.innerHTML = '<div style="color:#ff6b6b; text-align:center">Failed to load games.</div>';
    }
}

function renderPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * GAMES_PER_PAGE;
    const endIndex = startIndex + GAMES_PER_PAGE;
    const gamesToDisplay = allGames.slice(startIndex, endIndex);

    displayGames(gamesToDisplay, currentUsername);
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) renderPage(currentPage - 1);
});

nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(allGames.length / GAMES_PER_PAGE);
    if (currentPage < totalPages) renderPage(currentPage + 1);
});

function displayData(profile, stats, countryName) {
    document.getElementById('avatar').src = profile.avatar || 'https://www.chess.com/bundles/web/images/user-image.svg';
    document.getElementById('player-name').textContent = profile.username;
    document.getElementById('player-location').textContent = countryName;
    document.getElementById('profile-link').href = profile.url;

    updateRating('rapid-rating', stats.chess_rapid);
    updateRating('blitz-rating', stats.chess_blitz);
    updateRating('bullet-rating', stats.chess_bullet);
    updateRating('daily-rating', stats.chess_daily);
    resultsContainer.classList.remove('hidden');
}

function displayGames(games, username) {
    gamesList.innerHTML = '';

    games.forEach((game, index) => {
        const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
        const player = isWhite ? game.white : game.black;
        const opponent = isWhite ? game.black : game.white;
        const result = player.result;

        let resultClass = 'draw';
        if (result === 'win') resultClass = 'win';
        else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) resultClass = 'loss';

        const date = new Date(game.end_time * 1000).toLocaleDateString();
        const uniqueId = `game-${index}`;

        const card = document.createElement('div');
        card.className = `game-card ${resultClass}`;
        card.innerHTML = `
            <div class="game-info">
                <span class="opponent">vs ${opponent.username} (${opponent.rating})</span>
                <span class="result">${result} as ${isWhite ? 'White' : 'Black'}</span>
            </div>
            <div class="game-meta">
                <div class="game-date">${date}</div>
                <div>
                    <a href="${game.url}" target="_blank" class="game-link">View Game</a>
                    <button id="btn-${uniqueId}" class="analyze-btn">Analyze</button>
                    <span id="res-${uniqueId}" class="blunder-badge hidden"></span>
                </div>
            </div>
        `;

        // Store game data on the button for easier access
        // We can't pass objects easily in onclick string, so we store in a global map or just look it up.
        // Simplest: lookup in the 'games' array passed to this function. 
        // But 'games' is local.
        // We can attach the PGN to the DOM element dataset.
        // PGNs can be large, but usually fit.

        gamesList.appendChild(card);

        // Attach event listener directly to avoid string escaping hell
        const btn = document.getElementById(`btn-${uniqueId}`);
        btn.onclick = () => analyzeGame(game, `btn-${uniqueId}`, `res-${uniqueId}`, isWhite);
    });
}

// --- Analysis Logic ---

// [Old analyzeGame implementation removed]

// --- Analysis Logic ---

async function analyzeGame(game, btnId, resId, isPlayerWhite) {
    const btn = document.getElementById(btnId);
    const badge = document.getElementById(resId);

    // UI Update
    btn.disabled = true;
    btn.textContent = 'initializing...';
    log(`Starting analysis for game ${btnId}...`);

    try {
        // Use local Stockfish file
        log('Creating Stockfish Worker...');
        const engine = new Worker('stockfish.js');

        engine.onerror = (e) => {
            log(`Worker Error: ${e.message}`);
            log('Review browser console for details.');
            btn.textContent = 'Error';
        };

        btn.textContent = 'Parsing...';

        const chess = new Chess();
        chess.load_pgn(game.pgn);
        const history = chess.history({ verbose: true });
        log(`PGN parsed. Moves: ${history.length}`);

        let blunders = 0;
        let prevWhiteEval = 0; // Start at 0 cp
        let lastBestEval = 0;

        // Reset blunders for this game
        gameBlunders[btnId] = [];

        let moveIndex = 0;

        // Setup Engine Loop

        const analyzeNextMove = () => {
            if (moveIndex >= history.length) {
                // Done
                engine.terminate();

                btn.style.display = 'none';
                badge.textContent = `${blunders} Blunders`;
                badge.classList.remove('hidden');

                if (blunders > 0) {
                    badge.style.cursor = 'pointer';
                    badge.style.textDecoration = 'underline';
                    badge.onclick = () => openSidebar(btnId);
                }
                return;
            }

            // Reconstruct board to this move
            const tempChess = new Chess();
            for (let i = 0; i <= moveIndex; i++) {
                tempChess.move(history[i]);
            }
            const fen = tempChess.fen();

            btn.textContent = `Analyzing ${moveIndex + 1}/${history.length}`;
            engine.postMessage(`position fen ${fen}`);
            engine.postMessage('go depth 10');
        };

        let currentDepthScore = 0; // Holder for evaluations

        engine.onmessage = (event) => {
            const line = event.data;

            // Parse Score
            if (line.includes('score cp')) {
                const match = line.match(/score cp (-?\d+)/);
                if (match) currentDepthScore = parseInt(match[1]);
            } else if (line.includes('score mate')) {
                const match = line.match(/score mate (-?\d+)/);
                if (match) {
                    const mateIn = parseInt(match[1]);
                    // High scores for mate
                    currentDepthScore = (mateIn > 0) ? 2000 : -2000;
                }
            }

            // Move Finished
            if (line.includes('bestmove')) {
                // Determine evaluation from White's perspective
                // Stockfish gives score for "Side to Move"
                // If moveIndex=0 (White moved), Side to Move is Black.
                // So Score of 100 means Black is +100.

                const sideToMove = (moveIndex % 2 === 0) ? 'b' : 'w'; // After move 0 (White), it's Black's turn

                let whiteEval = (sideToMove === 'w') ? currentDepthScore : -currentDepthScore;

                // Correction: Stockfish 10 sometimes reports score from white's perspective?
                // Standard UCI is "side to move". Let's stick with that assumption.

                // Blunder Check
                // A blunder is when YOU moved, and your position got worse.
                // If I am White:
                // Compare "Eval Before My Move" vs "Eval After My Move"
                // Actually, "Eval After My Move" is what we just calculated (`whiteEval`).
                // "Eval Before My Move" was the `whiteEval` from the previous iteration.

                if (moveIndex > 0) {
                    const isWhiteMove = (moveIndex % 2 === 0);
                    let isBlunder = false;
                    let drop = 0;

                    // Case: Player is White
                    if (isPlayerWhite && isWhiteMove) {
                        drop = lastBestEval - whiteEval;
                        if (drop > 200) isBlunder = true;
                    }

                    // Case: Player is Black
                    if (!isPlayerWhite && !isWhiteMove) {
                        drop = whiteEval - lastBestEval;
                        if (drop > 200) isBlunder = true;
                    }

                    if (isBlunder) {
                        blunders++;
                        // Capture FEN
                        // Reconstruct FEN for this move index to save it
                        const tempChess = new Chess();
                        for (let i = 0; i <= moveIndex; i++) {
                            tempChess.move(history[i]);
                        }
                        const blunderFen = tempChess.fen();

                        gameBlunders[btnId].push({
                            fen: blunderFen,
                            evalDiff: drop,
                            moveIndex: moveIndex
                        });
                    }
                }

                // Store for next comparison
                lastBestEval = whiteEval;

                moveIndex++;
                analyzeNextMove();
            }
        };

        // Start
        analyzeNextMove();

    } catch (e) {
        console.error(e);
        btn.textContent = 'Error';
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

function updateRating(id, rating) {
    const el = document.getElementById(id);
    if (rating && rating.last && rating.last.rating) {
        el.textContent = rating.last.rating;
        el.className = 'rating';
    } else {
        el.textContent = 'Unrated';
        el.className = 'rating unrated';
    }
}
