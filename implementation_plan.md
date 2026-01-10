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
    - Display the last 10-20 games from that month.
    - (Future) Add "Load More" to fetch previous months.

### `index.html`
- Add a `#games-history` section below the stats grid.
- Add a "Recent Games" header.
- Create a list/table structure for games (White vs Black, Result, Date).

### `styles.css`
- Style the games list (cards or table).
- Win/Loss color coding (Green/Red).

## Verification Plan
### Manual Verification
1. Search for 'hikaru'.
2. Verify Country shows "United States" (or similar) instead of "US".
3. Verify "Recent Games" section appears.
4. Check that recent games are listed with correct result colors.

