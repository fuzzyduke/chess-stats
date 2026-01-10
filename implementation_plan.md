# Implementation Plan - Chess.com API Integration

## Goal
Fetch and display user profile and statistics from Chess.com for a given username.

## User Review Required
None. Uses public API.

## Proposed Changes

### `script.js`
- Implement `fetchStats(username)` function.
- Fetch profile data from `https://api.chess.com/pub/player/{username}`.
- Fetch stats data from `https://api.chess.com/pub/player/{username}/stats`.
- Handle errors (404 Not Found, Network errors).
- Render data to the DOM.

### `index.html`
- Update `#results` container to have structured slots for:
    - Avatar & Username
    - Country & Status
    - Ratings (Rapid, Blitz, Bullet, Daily)

### `styles.css`
- Add styles for the profile card.
- Add grid layout for stats.
- Add loading state styles.

## Verification Plan
### Manual Verification
1. Run `npm run dev`.
2. Enter valid username (e.g., 'hikaru', 'magnuscarlsen').
3. Verify profile info and ratings appear.
4. Enter invalid username.
5. Verify error message appears.
