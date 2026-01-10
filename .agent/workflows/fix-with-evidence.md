---
description: Evidence-driven fix workflow with change budgets and micro-tests
---

# Fix with Evidence

**When to use:** After diagnostic bundle is generated and issue is identified

**Purpose:** Apply targeted fixes with constraints to avoid "boiling the ocean"

---

## Prerequisites

- [ ] Diagnostic bundle generated (`generate-diagnostics` workflow)
- [ ] Issue clearly identified
- [ ] Preflight checks passing

---

## Step 1: Extract Evidence

From the diagnostic bundle, extract:

**Required Evidence:**
- [ ] Exact failing line + stack trace
- [ ] Which inputs triggered the failure
- [ ] Last known good commit (if applicable)
- [ ] Suspected component boundary
- [ ] Recent log lines around failure

**Document in a file:**
```
evidence.md:
- Error: HTTP 403 Forbidden
- Location: server.js:163
- Input: GET /api/v1/info/markets/STRK-USD/stats
- Last good: commit abc123 (2 days ago)
- Component: Token Manager
- Logs: "Failed to fetch price: HTTP 403"
```

---

## Step 2: Define Change Budget

**Set strict constraints for the fix:**

Choose ONE budget level:

### Minimal (Recommended)
- Touch max 2 files
- No refactors
- No dependency changes
- No new services
- Fix only the failing component

### Medium
- Touch max 5 files
- Minor refactors allowed
- No dependency upgrades
- No architectural changes

### Large (Avoid if possible)
- Touch max 10 files
- Refactors allowed
- Dependency updates allowed
- Document why this is necessary

**Document your budget:**
```
CHANGE_BUDGET.md:
- Max files: 2
- Allowed: Update tokenManager.js, server.js
- Forbidden: Refactors, new dependencies, architectural changes
- Reason: Token refresh logic fix
```

---

## Step 3: Propose Fix

Before making ANY changes, document:

**Fix Proposal:**
```markdown
## Proposed Fix

**Problem:** JWT refresh token expired, causing 403 errors

**Root Cause:** Refresh token has 7-day expiry, not being updated

**Proposed Solution:**
1. Add token expiry check in tokenManager.js
2. Log clear error when refresh token expires
3. Update error message in server.js to guide user

**Files to Change:**
- src/tokenManager.js (add expiry check)
- server.js (improve error message)

**Expected Impact:**
- Users get clear error message
- No more silent 403 failures
- Easier to diagnose token issues

**Possible Side Effects:**
- None (read-only changes)

**Rollback Steps:**
- git revert <commit>

**Change Budget:** Minimal (2 files)
```

---

## Step 4: Create Micro-Test

Before full run, create a tiny test for the fix:

```javascript
// test/tokenManager.test.js
import { getTokenManager } from '../src/tokenManager.js';

// Test: Token expiry detection
const manager = getTokenManager();
const isExpired = manager.isRefreshTokenExpired();
console.log('Refresh token expired:', isExpired);

// Expected: Should return true/false, not crash
```

Run micro-test:
```bash
node test/tokenManager.test.js
```

**Micro-test must pass before proceeding.**

---

## Step 5: Apply Fix (Within Budget)

Make ONLY the changes documented in the proposal.

**Checklist:**
- [ ] Changes match proposal exactly
- [ ] No scope creep
- [ ] Within change budget
- [ ] Comments added explaining why
- [ ] No formatting changes (use separate commit)

---

## Step 6: Run Micro-Test Again

```bash
node test/tokenManager.test.js
```

**Expected:** Test passes with fix applied.

---

## Step 7: Run Preflight Checks

// turbo
```bash
npm run preflight
```

**Must pass before full run.**

---

## Step 8: Full Application Test (Dry Run if possible)

```bash
npm run start:dry
```

Or if no dry-run mode:
```bash
npm start
```

**Monitor for:**
- [ ] Application starts successfully
- [ ] No new errors in logs
- [ ] Original issue is fixed
- [ ] No regressions

---

## Step 9: Generate Post-Fix Diagnostic Bundle

```bash
npm run diagnostics
```

**Compare before/after bundles:**
- [ ] Error no longer appears
- [ ] No new errors introduced
- [ ] Health checks still passing

---

## Step 10: Document the Fix

Create `fixes/fix-<issue-number>.md`:

```markdown
# Fix: JWT Token Expiry Error Messages

**Issue:** Users getting 403 errors with no clear guidance

**Evidence:**
- Diagnostic bundle: bundle-1234567890.json
- Error: HTTP 403 in server.js:163

**Fix Applied:**
- Added token expiry check in tokenManager.js
- Improved error message in server.js

**Files Changed:**
- src/tokenManager.js (+15 lines)
- server.js (+5 lines)

**Testing:**
- Micro-test: PASSED
- Preflight: PASSED
- Full run: PASSED
- Regression: NONE

**Verification:**
- Before: Silent 403 errors
- After: Clear "Token expired" message with instructions

**Commit:** abc123def
```

---

## Change Budget Enforcement

**If you exceed the budget:**

1. **STOP immediately**
2. **Revert changes**: `git reset --hard`
3. **Re-evaluate**: Is the budget too small?
4. **Document why** you need a larger budget
5. **Get approval** before proceeding

**Red flags:**
- "While I'm here, let me also..."
- "This would be easier if I refactor..."
- "Let me upgrade this dependency..."
- "I'll just clean up this code..."

**These are scope creep. Resist them.**

---

## Micro-Test Guidelines

**Good micro-tests:**
- Test ONE function/component
- Run in < 1 second
- No external dependencies (mock them)
- Clear pass/fail output

**Bad micro-tests:**
- Test entire application
- Require database/API
- Take > 5 seconds
- Vague output

---

## Success Criteria

Fix is successful when:
- ✅ Evidence clearly documented
- ✅ Change budget defined and followed
- ✅ Fix proposal written and approved
- ✅ Micro-test created and passing
- ✅ Preflight checks passing
- ✅ Full run successful
- ✅ No regressions
- ✅ Post-fix diagnostic bundle clean
- ✅ Fix documented

---

## Rollback Procedure

If fix causes new issues:

```bash
# Revert the commit
git revert <commit-hash>

# Or reset to before fix
git reset --hard <previous-commit>

# Re-run preflight
npm run preflight

# Verify rollback worked
npm run diagnostics
```

---

**This workflow prevents:**
- ❌ Blind trial-and-error
- ❌ Scope creep
- ❌ Expensive full runs
- ❌ "Boiling the ocean" refactors
- ❌ New bugs introduced

**This workflow enables:**
- ✅ Evidence-driven fixes
- ✅ Constrained changes
- ✅ Fast iteration
- ✅ Clear documentation
- ✅ Easy rollback
