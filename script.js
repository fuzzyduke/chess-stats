// Debug Logger
function log(msg) {
    const logs = document.getElementById('debug-content');
    if (logs) {
        const time = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.textContent = `[${time}] ${msg}`;
        line.style.borderBottom = '1px solid #222';
        logs.appendChild(line);
        logs.scrollTop = logs.scrollHeight;
    }
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
let analysisQueue = [];
let autoAnalysisEnabled = false;
// isAnalyzing replaced by activeWorkers logic in processQueue

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

const fetchStatus = document.getElementById('fetch-status');

async function fetchGameHistory(username) {
    try {
        fetchStatus.textContent = 'Fetching archives list...';
        gamesList.innerHTML = ''; // Clear previous list immediately

        const archivesRes = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
        const archivesData = await archivesRes.json();

        if (!archivesData.archives || archivesData.archives.length === 0) {
            gamesList.innerHTML = '<div style="text-align:center">No games found.</div>';
            fetchStatus.textContent = '';
            return;
        }

        const archiveUrls = archivesData.archives.reverse();
        fetchStatus.textContent = `Found ${archiveUrls.length} monthly archives. Loading...`;

        allGames = [];
        let completed = 0;
        let isFirstBatch = true;

        for (let i = 0; i < archiveUrls.length; i += BATCH_SIZE) {
            const batch = archiveUrls.slice(i, i + BATCH_SIZE);
            fetchStatus.textContent = `Loading history... (${completed}/${archiveUrls.length} months)`;

            const batchPromises = batch.map(url => fetch(url).then(res => res.json()).catch(err => {
                console.warn(`Failed to fetch ${url}`, err);
                return { games: [] };
            }));

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach(data => {
                if (autoAnalysisEnabled) {
                    // Auto-queue new games immediately!
                    data.games.forEach(g => {
                        // Check cache first (optimization to avoid queue spam)
                        // Actually, queue logic checks cache too, but async.
                        // Let's fire and forget.
                        const pWhite = g.white.username.toLowerCase() === username.toLowerCase();
                        addToAnalysisQueue(g, null, null, pWhite, g.url);
                    });
                }

                if (data.games) {
                    data.games.reverse();
                    allGames.push(...data.games);
                }
            });

            completed += batch.length;

            // Render immediately after first batch if we have games
            if (isFirstBatch && allGames.length > 0) {
                renderPage(1);
                paginationControls.classList.remove('hidden');
                isFirstBatch = false;
            } else if (!isFirstBatch) {
                // Just update controls for subsequent batches
                updatePaginationControls();
            }

            if (allGames.length > GAMES_LIMIT) break;
        }

        fetchStatus.textContent = ''; // Clear status when done

        if (allGames.length === 0) {
            gamesList.innerHTML = '<div style="text-align:center">No games found.</div>';
        }

    } catch (e) {
        console.error(e);
        fetchStatus.textContent = 'Error loading games';
        if (allGames.length === 0) {
            gamesList.innerHTML = '<div style="color:#ff6b6b; text-align:center">Failed to load games.</div>';
        }
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
    addAutoAnalyzeButton();
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
                    <button id="btn-${uniqueId}" data-game-url="${game.url}" class="analyze-btn">Analyze</button>
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

        // Check if we have cached analysis for this game
        storage.get(game.url).then(cachedData => {
            if (cachedData) {
                const badge = document.getElementById(`res-${uniqueId}`);
                const btn = document.getElementById(`btn-${uniqueId}`);

                gameBlunders[uniqueId] = cachedData;

                if (btn) btn.style.display = 'none';
                if (badge) {
                    badge.textContent = `${cachedData.length} Blunders (Cached)`;
                    badge.classList.remove('hidden');
                    badge.style.cursor = 'pointer';
                    badge.style.textDecoration = 'underline';
                    badge.style.color = '#2ecc71';
                    badge.onclick = () => {
                        currentBlunderGameId = uniqueId;
                        openSidebar(uniqueId);
                    };
                }
            } else {
                if (autoAnalysisEnabled) {
                    addToAnalysisQueue(game, `btn-${uniqueId}`, `res-${uniqueId}`, isWhite, uniqueId);
                }
            }
        });

        const btn = document.getElementById(`btn-${uniqueId}`);
        btn.onclick = () => analyzeGame(game, `btn-${uniqueId}`, `res-${uniqueId}`, isWhite, uniqueId);
    });
}

// --- Analysis Logic ---

// [Old analyzeGame implementation removed]

// --- Analysis Logic ---

async function analyzeGame(game, btnId, resId, isPlayerWhite, uniqueId) {
    // 1. Try to find visible DOM elements via Data Attribute if no direct ID provided
    let btn = btnId ? document.getElementById(btnId) : null;
    let badge = resId ? document.getElementById(resId) : null;

    if (!btn && uniqueId) {
        btn = document.querySelector(`button[data-game-url="${uniqueId}"]`);
        if (btn) {
            const badgeId = btn.id.replace('btn-', 'res-');
            badge = document.getElementById(badgeId);
        }
    }

    // Safety check for storage hit
    const cached = await storage.get(game.url);
    if (cached) {
        gameBlunders[uniqueId] = cached;

        if (btn) {
            btn.style.display = 'none';
            if (badge) {
                badge.textContent = `${cached.length} Blunders (Cached)`;
                badge.classList.remove('hidden');
                badge.style.cursor = 'pointer';
                badge.style.textDecoration = 'underline';
                badge.style.color = '#2ecc71';
                badge.onclick = () => openSidebar(uniqueId);
            }
        }
        return;
    }

    if (btn) {
        btn.disabled = true;
        if (!btn.textContent.includes('Analyzing')) btn.textContent = 'Queued...';
        btn.textContent = 'Initializing...';
    }

    log(`Starting analysis for game ${uniqueId || btnId}...`);

    return new Promise((resolve, reject) => {
        try {
            log('Creating Stockfish Worker...');
            const engine = new Worker('stockfish.js');

            engine.onerror = (e) => {
                log(`Worker Error: ${e.message}`);
                log('Review browser console for details.');
                if (btn) btn.textContent = 'Error';
                reject(e);
            };

            if (btn) btn.textContent = 'Parsing...';

            const chess = new Chess();
            chess.load_pgn(game.pgn);
            const history = chess.history({ verbose: true });
            log(`PGN parsed. Moves: ${history.length}`);

            let blunders = 0;
            let prevWhiteEval = 0;
            let lastBestEval = 0;
            let moveIndex = 0;

            // Reset blunders
            const uId = uniqueId || btnId;
            gameBlunders[uId] = [];

            log(`[${uId}] Starting engine analysis...`);

            const analyzeNextMove = () => {
                if (moveIndex >= history.length) {
                    log(`[${uId}] Finishing: ${blunders} blunders found.`);
                    engine.terminate();

                    // Save to Storage
                    storage.save(game.url, gameBlunders[uId])
                        .catch(e => console.error('Save failed', e));

                    if (btn) btn.style.display = 'none';
                    if (badge) {
                        badge.textContent = `${blunders} Blunders`;
                        badge.classList.remove('hidden');

                        // Style for clean games
                        if (blunders === 0) {
                            badge.style.color = '#7f8c8d'; // Grey for neutral
                            badge.style.textDecoration = 'none';
                            badge.style.cursor = 'default';
                        } else {
                            badge.style.color = '#e74c3c'; // Red for blunders
                            badge.style.cursor = 'pointer';
                            badge.style.textDecoration = 'underline';
                            badge.onclick = () => openSidebar(uId);
                        }
                    }
                    resolve();
                    return;
                }

                if (moveIndex % 5 === 0) log(`[${uId}] Processing move ${moveIndex}/${history.length}`);


                const tempChess = new Chess();
                for (let i = 0; i <= moveIndex; i++) {
                    tempChess.move(history[i]);
                }
                const fen = tempChess.fen();

                if (btn) btn.textContent = `Analyzing ${moveIndex + 1}/${history.length}`;
                engine.postMessage(`position fen ${fen}`);
                engine.postMessage('go depth 10');
            };

            let currentDepthScore = 0;

            engine.onmessage = (event) => {
                const line = event.data;

                if (line.includes('score cp')) {
                    const match = line.match(/score cp (-?\d+)/);
                    if (match) currentDepthScore = parseInt(match[1]);
                } else if (line.includes('score mate')) {
                    const match = line.match(/score mate (-?\d+)/);
                    if (match) {
                        const mateIn = parseInt(match[1]);
                        currentDepthScore = (mateIn > 0) ? 2000 : -2000;
                    }
                }

                if (line.includes('bestmove')) {
                    const sideToMove = (moveIndex % 2 === 0) ? 'b' : 'w';
                    let whiteEval = (sideToMove === 'w') ? currentDepthScore : -currentDepthScore;

                    // Blunder check logic
                    if (moveIndex > 0) {
                        const isWhiteMove = (moveIndex % 2 === 0);
                        let isBlunder = false;
                        let drop = 0;

                        if (isPlayerWhite && isWhiteMove) {
                            drop = lastBestEval - whiteEval;
                            if (drop > 200) isBlunder = true;
                        }

                        if (!isPlayerWhite && !isWhiteMove) {
                            drop = whiteEval - lastBestEval;
                            if (drop > 200) isBlunder = true;
                        }

                        if (isBlunder) {
                            blunders++;
                            const tempChess = new Chess();
                            for (let i = 0; i <= moveIndex; i++) {
                                tempChess.move(history[i]);
                            }
                            const blunderFen = tempChess.fen();

                            gameBlunders[uId].push({
                                fen: blunderFen,
                                evalDiff: drop,
                                moveIndex: moveIndex
                            });
                        }
                    }

                    lastBestEval = whiteEval;
                    moveIndex++;
                    setTimeout(analyzeNextMove, 0);
                }
            };

            analyzeNextMove();

        } catch (e) {
            console.error(e);
            if (btn) btn.textContent = 'Error';
            reject(e);
        }
    }); // End Promise logic
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

// --- Queue Logic ---

let processedCount = 0;
let totalToAnalyze = 0;

function addToAnalysisQueue(game, btnId, resId, isPlayerWhite, uniqueId) {
    // Avoid duplicates
    // Also check if already processed (though checks above usually handle this)
    const exists = analysisQueue.find(t => t.uniqueId === uniqueId);
    if (!exists) {
        analysisQueue.push({ game, btnId, resId, isPlayerWhite, uniqueId });
        updateProgressUI();
        processQueue();
    }
}

function updateProgressUI() {
    const btn = document.getElementById('auto-analyze-btn');
    if (btn && autoAnalysisEnabled) {
        const remaining = analysisQueue.length;
        const current = processedCount;
        // Use allGames.length to account for background fetching
        const total = Math.max(totalToAnalyze, allGames.length);
        btn.textContent = `Analyzing: ${current}/${total} (Queue: ${remaining})`;
    }
}

async function processQueue() {
    log(`[Queue] processQueue called. Queue: ${analysisQueue.length}, Active: ${activeWorkers}/${MAX_CONCURRENT}`);

    // If queue is empty
    if (analysisQueue.length === 0) {
        if (activeWorkers === 0 && autoAnalysisEnabled) {
            const btn = document.getElementById('auto-analyze-btn');
            const total = Math.max(totalToAnalyze, allGames.length);
            if (btn && processedCount >= total && document.getElementById('fetch-status').textContent === '') {
                btn.textContent = `Done! (${processedCount} games analyzed)`;
            } else if (btn) {
                btn.textContent = `Waiting for more games... (${processedCount}/${total})`;
            }
        }
        return;
    }

    if (activeWorkers >= MAX_CONCURRENT) {
        log(`[Queue] Workers full. Waiting.`);
        return;
    }

    activeWorkers++;
    const task = analysisQueue.shift();
    updateProgressUI();

    log(`[Queue] Starting task: ${task.uniqueId}`);

    // Non-blocking processing 
    runTask(task).finally(() => {
        log(`[Queue] Task finished: ${task.uniqueId}. Worker freed.`);
        activeWorkers--;
        processedCount++;
        updateProgressUI();
        processQueue();
    });

    // Start another immediately
    setTimeout(processQueue, 50);
}

async function runTask(task) {
    try {
        log(`[Runner] runTask executing for ${task.uniqueId}`);
        await Promise.race([
            analyzeGame(task.game, task.btnId, task.resId, task.isPlayerWhite, task.uniqueId),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Game Timeout")), 90000))
        ]);
        log(`[Runner] runTask completed for ${task.uniqueId}`);
    } catch (e) {
        console.error("Task failed:", e);
        log(`[Runner] Task FAILED for ${task.uniqueId}: ${e.message}`);
        if (task.btnId) {
            const btn = document.getElementById(task.btnId);
            if (btn) btn.textContent = 'Failed';
        }
    }
}

function addAutoAnalyzeButton() {
    if (document.getElementById('auto-analyze-btn')) return;

    const container = document.getElementById('games-section');
    const header = container.querySelector('h3');

    const btn = document.createElement('button');
    btn.id = 'auto-analyze-btn';
    btn.textContent = 'Auto-Analyze All Loaded';
    btn.style.marginLeft = '15px';
    btn.style.fontSize = '0.7em';
    btn.style.padding = '5px 10px';
    btn.style.cursor = 'pointer';

    btn.onclick = async () => {
        if (autoAnalysisEnabled) return;
        autoAnalysisEnabled = true;
        btn.style.cursor = 'wait';

        const totalGames = allGames.length;
        totalToAnalyze = totalGames;
        processedCount = 0;
        btn.textContent = `Queueing ${totalGames} games...`;

        let queued = 0;
        let skipped = 0;

        // Iterate ALL games
        for (let i = 0; i < allGames.length; i++) {
            const game = allGames[i];

            // Check persistence first
            const cached = await storage.get(game.url);
            if (cached) {
                skipped++;
                processedCount++;
            } else {
                // Determine ID and color
                // If this game ID is not on the current page, we don't have a DOM ID.
                // That's fine, analyzeGame supports headless.
                // We pass uniqueId as game.url for consistency or just null?
                // analyzeGame uses uniqueId as storage key.
                // Wait, analyzeGame uses `btnId` or `uniqueId` as key?
                // In headless, we MUST pass `uniqueId`.

                const pWhite = game.white.username.toLowerCase() === currentUsername.toLowerCase();
                addToAnalysisQueue(game, null, null, pWhite, game.url); // Use URL as unique ID for headless
                queued++;
            }
        }

        totalToAnalyze = queued + skipped;
        btn.textContent = `Starting... (Cached: ${skipped})`;
        updateProgressUI();
    };

    header.appendChild(btn);
}
