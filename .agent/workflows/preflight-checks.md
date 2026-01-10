---
description: Run preflight checks before starting the application
---

# Preflight Checks

**When to use:** Before every application start, especially in CI/CD

**Purpose:** Fail fast with clear errors instead of expensive half-run failures

---

## Step 1: Run Preflight Script

// turbo
```bash
npm run preflight
```

If script doesn't exist, create it (see Step 2).

---

## Step 2: Create Preflight Script

Create `scripts/preflight.js`:

```javascript
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const checks = [];
let failed = false;

function check(name, condition, errorMsg) {
    const passed = typeof condition === 'function' ? condition() : condition;
    checks.push({ name, passed, error: passed ? null : errorMsg });
    if (!passed) {
        failed = true;
        console.error(`❌ ${name}: ${errorMsg}`);
    } else {
        console.log(`✅ ${name}`);
    }
}

console.log('\n🔍 Running preflight checks...\n');

// 1. Required environment variables
check(
    'Environment Variables',
    () => process.env.EXTENDED_ACCESS_TOKEN && process.env.EXTENDED_REFRESH_TOKEN,
    'Missing EXTENDED_ACCESS_TOKEN or EXTENDED_REFRESH_TOKEN in .env'
);

// 2. Required files exist
check(
    'Configuration Files',
    () => existsSync('config.json') && existsSync('.env'),
    'Missing config.json or .env file'
);

// 3. Port availability
check(
    'Port 3000 Available',
    () => {
        try {
            execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
            return false; // Port in use
        } catch {
            return true; // Port free
        }
    },
    'Port 3000 is already in use'
);

// 4. Node version
check(
    'Node Version',
    () => {
        const version = process.version.match(/^v(\d+)/)[1];
        return parseInt(version) >= 18;
    },
    'Node.js version must be >= 18'
);

// 5. Dependencies installed
check(
    'Dependencies Installed',
    () => existsSync('node_modules'),
    'node_modules not found. Run: npm install'
);

// 6. Git repository clean (warning only)
try {
    const dirty = execSync('git status --porcelain').toString().trim();
    if (dirty) {
        console.warn('⚠️  Git Working Directory: Uncommitted changes detected');
    } else {
        console.log('✅ Git Working Directory: Clean');
    }
} catch {
    console.warn('⚠️  Git Working Directory: Not a git repository');
}

console.log('\n' + '='.repeat(50));

if (failed) {
    console.error('\n❌ Preflight checks FAILED\n');
    console.error('Fix the errors above before starting the application.\n');
    process.exit(1);
} else {
    console.log('\n✅ All preflight checks PASSED\n');
    process.exit(0);
}
```

Add to `package.json`:
```json
{
  "scripts": {
    "preflight": "node scripts/preflight.js",
    "start": "npm run preflight && node src/index.js",
    "dashboard": "npm run preflight && node server.js"
  }
}
```

---

## Step 3: Preflight Checklist

The script checks:

### Critical Checks (Must Pass)
- [ ] **Environment Variables**: EXTENDED_ACCESS_TOKEN, EXTENDED_REFRESH_TOKEN present
- [ ] **Configuration Files**: config.json and .env exist
- [ ] **Port Availability**: Port 3000 is free
- [ ] **Node Version**: Node.js >= 18
- [ ] **Dependencies**: node_modules directory exists

### Warning Checks (Non-blocking)
- [ ] **Git Status**: Working directory is clean
- [ ] **Disk Space**: Sufficient space available (optional)
- [ ] **External APIs**: Can reach Extended Exchange (optional)

---

## Step 4: Handle Failures

If preflight fails:

1. **Read the error message** - It tells you exactly what's wrong
2. **Fix the issue** - Follow the suggested remediation
3. **Re-run preflight** - Verify the fix worked

**Common failures:**

| Error | Fix |
|-------|-----|
| Missing env vars | Update `.env` file with tokens |
| Port in use | Stop other process or change port |
| Node version | Upgrade Node.js to v18+ |
| Missing node_modules | Run `npm install` |
| Missing config.json | Copy from `config.json.example` |

---

## Step 5: Add Custom Checks

Extend the preflight script with project-specific checks:

```javascript
// Check external API reachability
check(
    'Extended Exchange API',
    async () => {
        try {
            const response = await fetch('https://api.extended.exchange/health');
            return response.ok;
        } catch {
            return false;
        }
    },
    'Cannot reach Extended Exchange API'
);

// Check database connection
check(
    'Database Connection',
    () => {
        // Your DB check logic
        return true;
    },
    'Cannot connect to database'
);
```

---

## Integration with CI/CD

Add to GitHub Actions:

```yaml
- name: Preflight Checks
  run: npm run preflight
  
- name: Start Application
  run: npm start
  if: success()
```

---

## Success Criteria

Preflight is successful when:
- ✅ All critical checks pass
- ✅ Clear error messages for failures
- ✅ Execution time < 5 seconds
- ✅ Exit code 0 on success, 1 on failure

---

**Benefit:** Saves expensive half-run failures by catching issues before they start.
