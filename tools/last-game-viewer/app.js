const $ = (id) => document.getElementById(id);

const btn = $("btnFetch");
const usernameEl = $("username");
const statusEl = $("status");

const gameInfo = $("gameInfo");
const gameTitle = $("gameTitle");
const gameMeta = $("gameMeta");
const gameLink = $("gameLink");

const movesCard = $("movesCard");
const movesBody = $("movesBody");

btn.onclick = async () => {
  const username = usernameEl.value.trim();
  if (!username) {
    status("Enter a username");
    return;
  }

  reset();
  status("Fetching…");

  try {
    const profile = await getJSON(`https://api.chess.com/pub/player/${username}`);
    const archives = await getJSON(`https://api.chess.com/pub/player/${username}/games/archives`);

    const latestArchive = archives.archives.at(-1);
    const gamesData = await getJSON(latestArchive);

    const games = gamesData.games.sort((a, b) => b.end_time - a.end_time);
    const game = games[0];

    renderGame(profile, game);
    status("Done.");
  } catch (e) {
    status("Error: " + e.message);
  }
};

function status(msg) {
  statusEl.textContent = msg;
}

function reset() {
  gameInfo.classList.add("hidden");
  movesCard.classList.add("hidden");
  movesBody.innerHTML = "";
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Fetch failed");
  return r.json();
}

function renderGame(profile, game) {
  gameInfo.classList.remove("hidden");
  movesCard.classList.remove("hidden");

  gameTitle.textContent = `Last game for ${profile.name || profile.username}`;
  gameMeta.textContent =
    `White: ${game.white.username} (${game.white.rating})  |  ` +
    `Black: ${game.black.username} (${game.black.rating})  |  ` +
    `Time: ${game.time_control}`;

  gameLink.href = game.url;

  const moves = parsePGN(game.pgn);
  renderMoves(moves);
}

function renderMoves(pairs) {
  pairs.forEach(p => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${p.move}</td>
      <td>${p.white || "-"}</td>
      <td>-</td>
      <td>${p.black || "-"}</td>
      <td>-</td>
    `;

    movesBody.appendChild(tr);
  });
}

/* ---------- PGN PARSER (STABLE VERSION) ---------- */

function parsePGN(pgn) {
  const body = pgn.split(/\n\n/).slice(1).join(" ");
  const cleaned = body
    .replace(/\[%clk[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const regex = /(\d+)\.(?:\s*([^\s]+))?(?:\s+([^\s]+))?/g;
  const moves = [];

  let match;
  while ((match = regex.exec(cleaned))) {
    moves.push({
      move: match[1],
      white: match[2] || null,
      black: match[3] || null
    });
  }

  return moves;
}
