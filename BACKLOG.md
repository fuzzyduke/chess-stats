# Chess Training Dojo - Product Backlog

**Last Updated:** 2026-01-11  
**Status:** Active Development  
**Current Phase:** Phase 2 (Interactive Training)

---

## 🐛 Critical Bugs (Fix First)

- [ ] **Button state management in showBlunder**
  - File: `script.js` line 119-153
  - Issue: Prev/Next buttons don't update disabled state
  - Fix: Add button state logic (attempted in step 2837, needs retry)
  - Priority: HIGH
  - Estimate: 15 minutes

- [ ] **Board resize on sidebar open**
  - File: `script.js` line 171
  - Issue: Board sometimes doesn't render correctly on first open
  - Fix: Increase timeout or add resize listener
  - Priority: MEDIUM
  - Estimate: 10 minutes

---

## ✅ Completed Features

### Phase 1: Blunder Detection & Storage
- [x] Python worker with Stockfish analysis
- [x] Supabase database schema (`blunder_positions` table)
- [x] Hybrid storage (IndexedDB for free, Supabase for premium)
- [x] Blunder detection (200+ centipawn loss)
- [x] Full game history analysis (all archives)
- [x] Badge display on game cards ("X Blunders (Server)")

### Phase 2: Basic UI
- [x] Sidebar with chessboard display
- [x] Blunder navigation (Prev/Next buttons)
- [x] Keyboard shortcuts (Arrow keys, Escape)
- [x] Turn indicator (White/Black to play)
- [x] Board orientation (flips based on turn)
- [x] Link to original game on Chess.com
- [x] Evaluation loss display

---

## 🚀 Phase 2: Interactive Training (In Progress)

### High Priority

- [ ] **Fix button state updates**
  - Add disabled styling to prev/next buttons
  - Visual feedback when at boundaries
  - File: `script.js` showBlunder function
  - Estimate: 15 minutes

- [ ] **Improve board responsiveness**
  - Make board size adaptive to sidebar width
  - Better mobile support
  - File: `styles.css` .sidebar section
  - Estimate: 30 minutes

- [ ] **Add loading states**
  - Show spinner while fetching blunders
  - "Loading position..." text
  - File: `script.js` loadServerGameBlunders
  - Estimate: 20 minutes

### Medium Priority

- [ ] **Move input validation**
  - Enable dragging pieces on board
  - Validate against best move
  - Show "Correct!" or "Try again" feedback
  - File: `script.js` new function handleUserMove
  - Estimate: 1 hour
  - **Blocks:** Play vs Engine feature

- [ ] **Move ranking system**
  - Run Stockfish with multipv=5
  - Show "Your move was #3 out of 20"
  - Display top 3 moves with evaluations
  - File: `script.js` new function rankUserMove
  - Estimate: 1.5 hours

- [ ] **Brilliancy detection**
  - Detect moves gaining 300+ centipawns
  - Store in `blunder_positions` with type='brilliancy'
  - Add "X Brilliancies" badge
  - File: `scripts/analyze_worker.py` line 230
  - Estimate: 30 minutes

### Low Priority

- [ ] **Undo button**
  - Allow user to undo their move attempt
  - File: `index.html` + `script.js`
  - Estimate: 20 minutes

- [ ] **Hint system**
  - "Get Hint" button shows best move
  - Highlight squares or show arrow
  - File: `script.js` new function showHint
  - Estimate: 45 minutes

---

## 🎮 Phase 3: Play vs Engine (Planned)

**Prerequisites:** Move input validation complete

- [ ] **Engine rating selector**
  - Dropdown: 800, 1000, 1200, 1500, 1800, 2000, 3000
  - Configure Stockfish UCI_Elo
  - File: `index.html` + `script.js`
  - Estimate: 30 minutes
  - **See:** `brain/.../engine_play_implementation.md` for full spec

- [ ] **Interactive game mode**
  - "Play From This Position" button
  - User makes moves, engine responds
  - Detect checkmate/draw/stalemate
  - File: `script.js` new functions
  - Estimate: 2 hours

- [ ] **Game result tracking**
  - Save training games to database
  - Show win/loss/draw statistics
  - Track improvement over time
  - File: New table `training_games`
  - Estimate: 1.5 hours

---

## 🎨 UX Improvements

### High Priority

- [ ] **Smoother animations**
  - Fade transitions between blunders
  - Smooth board orientation flip
  - File: `styles.css`
  - Estimate: 30 minutes

- [ ] **Better mobile support**
  - Responsive sidebar (full screen on mobile)
  - Touch-friendly buttons
  - Swipe gestures for prev/next
  - File: `styles.css` + `script.js`
  - Estimate: 2 hours

- [ ] **Progress indicators**
  - "Analyzing game X/Y" during worker run
  - Progress bar in UI
  - File: `index.html` + `script.js`
  - Estimate: 45 minutes

### Medium Priority

- [ ] **Blunder categories**
  - Group by type: Tactics, Endgame, Opening
  - Filter blunders by category
  - File: `scripts/analyze_worker.py` + `script.js`
  - Estimate: 2 hours

- [ ] **Difficulty rating**
  - Rate blunders: Easy, Medium, Hard
  - Based on eval drop and position complexity
  - File: `scripts/analyze_worker.py`
  - Estimate: 1 hour

- [ ] **Spaced repetition**
  - Track which blunders user solved
  - Show difficult blunders more often
  - File: New table `user_progress`
  - Estimate: 3 hours

---

## 📊 Analytics & Tracking

- [ ] **User statistics dashboard**
  - Total blunders found
  - Most common mistake types
  - Improvement trend graph
  - File: New `stats.html` page
  - Estimate: 4 hours

- [ ] **Opening analysis**
  - Blunders by opening (ECO code)
  - "You struggle with the Sicilian Defense"
  - File: `scripts/analyze_worker.py` + new UI
  - Estimate: 3 hours

---

## 🔧 Technical Debt

### High Priority

- [ ] **Error handling improvements**
  - Better error messages for user
  - Retry logic for failed API calls
  - File: `script.js` + `analyze_worker.py`
  - Estimate: 1 hour

- [ ] **Incremental analysis**
  - Only analyze new games (not full history)
  - `--incremental` flag for worker
  - File: `scripts/analyze_worker.py`
  - Estimate: 1.5 hours

- [ ] **Environment variables**
  - Move Supabase credentials to .env
  - Don't hardcode in source
  - File: `storage.js` + `analyze_worker.py`
  - Estimate: 30 minutes

---

## 🎯 Next Sprint (Recommended)

**Goal:** Complete Phase 2 - Interactive Training

**Duration:** 1-2 days

**Tasks:**
1. Fix button state bug (15 min)
2. Improve board responsiveness (30 min)
3. Add loading states (20 min)
4. Implement move input validation (1 hour)
5. Add move ranking system (1.5 hours)
6. Implement brilliancy detection (30 min)

**Total:** ~4.5 hours

**Outcome:** Users can practice blunders interactively with feedback

---

## 💡 Product Vision

**Subscription tiers:**
- Free: 100 blunders, client-side analysis
- Pro ($5/mo): Unlimited, server analysis, statistics
- Coach ($15/mo): AI explanations, personalized training

**Future features:**
- Multiplayer training competitions
- AI coach with GPT-4 explanations
- Opening/endgame trainers
- Lichess integration
- Chrome extension

---

**For Gemini/Claude:** Start with "Next Sprint" tasks. All specs are in brain directory. Follow requirements documentation process from `llmscouncil/DEV_BEST_PRACTICES.md`!
