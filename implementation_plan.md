# Implementation Plan - Chess.com API Integration

## Goal
Fetch and display user profile and statistics from Chess.com for a given username.

## User Review Required
None. Uses public API.

## Proposed Changes

### `script.js`
- **Fix:** Fetch full country name from the country URL provided in the profile.
- **Feat:** Implement `fetchGameHistory(username)` function.
    - Fetch list of archives: `https://api.chess.com/pub/player/{username}/games/archives`
    - Fetch the *latest* monthly archive from the list.
    - Store all games in a `allGames` variable.
    - Implement `renderPage(pageNumber)` to show 10 games at a time.
    - Add "Previous" and "Next" button event listeners.

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

