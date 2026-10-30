const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);

const btn = $("btnFetch");
const usernameEl = $("username");
const statusEl = $("status");

const gameInfo = $("gameInfo");
const gameTitle = $("gameTitle");
const gameMeta = $("gameMeta");
const gameLink = $("gameLink");

const movesCard = $("movesCard");
const movesBody = $("movesBody");

if (btn) {
  btn.onclick = async () => {
    const rawUsername = usernameEl ? usernameEl.value.trim() : "";
    if (!rawUsername) {
      status("Enter a username");
      return;
    }

    reset();
    status("Fetching…");

    try {
      const sanitizedUsername = encodeURIComponent(rawUsername);
      const profile = await getJSON(`https://api.chess.com/pub/player/${sanitizedUsername}`);
      const archives = await getJSON(`https://api.chess.com/pub/player/${sanitizedUsername}/games/archives`);

      if (!archives.archives || archives.archives.length === 0) {
        status("No archives found for this player.");
        return;
      }

      const latestArchive = archives.archives.at(-1);
      const gamesData = await getJSON(latestArchive);

      if (!gamesData.games || gamesData.games.length === 0) {
        status("No games found in the latest archive.");
        return;
      }

      const games = gamesData.games.sort((a, b) => b.end_time - a.end_time);
      const game = games[0];

      renderGame(profile, game);
      status("Done.");
    } catch (e) {
      status("Error: " + e.message);
    }
  };
}

function status(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function reset() {
  if (gameInfo) gameInfo.classList.add("hidden");
  if (movesCard) movesCard.classList.add("hidden");
  if (movesBody) movesBody.innerHTML = "";
}

async function getJSON(url) {
  // Validate protocol
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Invalid URL protocol");
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error("Fetch failed");
  return r.json();
}

function renderGame(profile, game) {
  if (gameInfo) gameInfo.classList.remove("hidden");
  if (movesCard) movesCard.classList.remove("hidden");

  if (gameTitle) {
    gameTitle.textContent = `Last game for ${profile.name || profile.username}`;
  }

  if (gameMeta) {
    const whiteName = game.white ? game.white.username : "Unknown";
    const whiteRating = game.white ? game.white.rating : "-";
    const blackName = game.black ? game.black.username : "Unknown";
    const blackRating = game.black ? game.black.rating : "-";
    const timeControl = game.time_control || "Unknown";

    gameMeta.textContent =
      `White: ${whiteName} (${whiteRating})  |  ` +
      `Black: ${blackName} (${blackRating})  |  ` +
      `Time: ${timeControl}`;
  }

  if (gameLink) {
    // Validate scheme before setting href to avoid javascript: or data: injection
    if (isValidHttpUrl(game.url)) {
      gameLink.href = game.url;
      gameLink.style.display = "";
    } else {
      gameLink.removeAttribute("href");
      gameLink.style.display = "none";
    }
  }

  const moves = parsePGN(game.pgn || "");
  renderMoves(moves);
}

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

function renderMoves(pairs) {
  const targetBody = movesBody || (typeof global !== "undefined" ? global.movesBody : null);
  if (!targetBody) return;
  targetBody.innerHTML = "";

  pairs.forEach(p => {
    const tr = document.createElement("tr");

    const tdMove = document.createElement("td");
    tdMove.textContent = p.move != null ? String(p.move) : "";

    const tdWhite = document.createElement("td");
    tdWhite.textContent = p.white != null ? String(p.white) : "-";

    const tdWDelta = document.createElement("td");
    tdWDelta.textContent = "-";

    const tdBlack = document.createElement("td");
    tdBlack.textContent = p.black != null ? String(p.black) : "-";

    const tdBDelta = document.createElement("td");
    tdBDelta.textContent = "-";

    tr.appendChild(tdMove);
    tr.appendChild(tdWhite);
    tr.appendChild(tdWDelta);
    tr.appendChild(tdBlack);
    tr.appendChild(tdBDelta);

    targetBody.appendChild(tr);
  });
}

/* ---------- PGN PARSER (STABLE VERSION) ---------- */

function parsePGN(pgn) {
  if (typeof pgn !== "string") return [];
  // Split off headers (headers are lines starting with [Key "Value"])
  const body = pgn.includes("\n\n") ? pgn.split(/\n\n/).slice(1).join(" ") : pgn;
  const cleaned = body
    .replace(/\{[^}]*\}/g, "") // Strip comments e.g. {[%clk 0:02:59]}
    .replace(/;[^\n]*/g, "")   // Strip semicolon comments
    .replace(/\$\d+/g, "")      // Strip NAG annotations e.g. $1
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

// Export functions for Node/Jest testing if running in Node environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parsePGN,
    isValidHttpUrl,
    renderMoves
  };
}
