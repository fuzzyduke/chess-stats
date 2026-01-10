# Implementation Plan - Chess.com API Integration

## Goal
Fetch and display user profile and statistics from Chess.com for a given username.

## User Review Required
None. Uses public API.

## Proposed Changes

### `script.js`
- **Fix:** Fetch full country name from the country URL provided in the profile.
- **Feat:** Update `fetchGameHistory(username)` (Full History + Batch).
- **Feat:** Integrate **Stockfish.js** & **Chess.js** for client-side analysis.
    - Load `chess.js` (via CDN) for PGN parsing.
    - Load `stockfish.js` (locally served) for the engine.
    - Implement `analyzeGame(gameIndex, btnElement)`:
        - Triggered by "Analyze" button click.
        - Parse PGN, run Stockfish on moves.
        - Detect Blunders (Evaluation swing > 200cp).
        - Update the specific game card with blunder count.

### `index.html`
- Import `chess.js` (CDN).
- Do NOT import `stockfish.js` via script tag (loaded dynamically as Worker).

### `styles.css`
- Add styles for `.analyze-btn` (standard button).
- Add styles for `.blunder-tag` (result badge).

### `index.html`
- Add a `#games-history` section below the stats grid.
- Add a "Recent Games" header.
- Add a pagination container with `<button id="prev-btn">`, `<span id="page-indicator">`, and `<button id="next-btn">`.

### `styles.css`
- Style the games list (cards or table).
- Win/Loss color coding (Green/Red).
- Style pagination buttons (primary color, disabled state).

## Verification Plan
### Manual Verification
1. Search for 'hikaru'.
2. Verify Country shows "United States" (or similar) instead of "US".
3. Verify "Recent Games" section appears.
4. Check that recent games are listed with correct result colors.

