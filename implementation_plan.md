# Implementation Plan - Chess.com API Integration

## Goal
Fetch and display user profile and statistics from Chess.com for a given username.

## User Review Required
None. Uses public API.

## Proposed Changes

### `script.js`
- **Fix:** Fetch full country name from the country URL provided in the profile.
- **Feat:** Update `fetchGameHistory(username)`:
    - Fetch list of archives.
    - Loop through *all* archives (using `Promise.all` for parallel fetching).
    - Flatten the results into a single `allGames` array.
    - Sort by end_time (descending).
    - Update `renderPage` to handle the larger dataset.
    - Add a loading indicator showing "Loading X games..."

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

