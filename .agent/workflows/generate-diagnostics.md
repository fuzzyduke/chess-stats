---
description: Generate diagnostic bundle before any debugging or fixes
---

# Diagnostic Bundle Generation

**When to use:** First run of any debugging session, before attempting fixes

**Purpose:** Gather comprehensive context to enable targeted fixes instead of blind attempts

---

## Step 1: Run Diagnostic Script

// turbo
```bash
npm run diagnostics
```

If the script doesn't exist, create it (see Step 2).

---

## Step 2: Create Diagnostic Script (if needed)

Create `scripts/diagnostics.js`:

```javascript
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {},
    configuration: {},
    versions: {},
    health: {},
    logs: {},
    git: {}
};

// Environment
diagnostics.environment = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd()
};

// Configuration (sanitized)
try {
    const config = JSON.parse(readFileSync('config.json', 'utf-8'));
    diagnostics.configuration = config;
} catch (e) {
    diagnostics.configuration = { error: e.message };
}

// Versions
try {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    diagnostics.versions = {
        app: pkg.version,
        dependencies: pkg.dependencies
    };
} catch (e) {
    diagnostics.versions = { error: e.message };
}

// Git info
try {
    diagnostics.git = {
        commit: execSync('git rev-parse HEAD').toString().trim(),
        branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        dirty: execSync('git status --porcelain').toString().trim() !== ''
    };
} catch (e) {
    diagnostics.git = { error: e.message };
}

// Health checks
diagnostics.health = {
    envVarsPresent: {
        EXTENDED_ACCESS_TOKEN: !!process.env.EXTENDED_ACCESS_TOKEN,
        EXTENDED_REFRESH_TOKEN: !!process.env.EXTENDED_REFRESH_TOKEN
    },
    filesExist: {
        'config.json': require('fs').existsSync('config.json'),
        '.env': require('fs').existsSync('.env'),
        'server.js': require('fs').existsSync('server.js')
    }
};

// Recent logs (if available)
try {
    const logs = readFileSync('logs/app.log', 'utf-8').split('\n').slice(-20);
    diagnostics.logs = { recent: logs };
} catch (e) {
    diagnostics.logs = { note: 'No log file found' };
}

// Write bundle
const bundlePath = `diagnostics/bundle-${Date.now()}.json`;
writeFileSync(bundlePath, JSON.stringify(diagnostics, null, 2));
console.log(`✅ Diagnostic bundle created: ${bundlePath}`);
```

Add to `package.json`:
```json
{
  "scripts": {
    "diagnostics": "node scripts/diagnostics.js"
  }
}
```

---

## Step 3: Review Diagnostic Bundle

Open the generated bundle file in `diagnostics/` directory.

**Key sections to check:**
- [ ] Environment: Node version, platform
- [ ] Configuration: Settings are correct
- [ ] Versions: Dependencies are as expected
- [ ] Git: Current commit, clean/dirty state
- [ ] Health: All required env vars present
- [ ] Logs: Recent errors or warnings

---

## Step 4: Share Bundle with AI

When asking for help, include:
```
I've generated a diagnostic bundle. Here's the summary:

Environment: Node v18.x on Windows
Commit: abc123def
Issue: [describe the problem]
Recent logs: [paste last 5-10 lines]
Health check failures: [list any]
```

This gives AI full context for targeted fixes.

---

## Step 5: Update Bundle After Changes

After applying a fix, regenerate the bundle:

```bash
npm run diagnostics
```

Compare before/after bundles to verify the fix.

---

## Diagnostic Bundle Contents

### Required Information
- ✅ Timestamp
- ✅ Node version
- ✅ OS/Platform
- ✅ Git commit hash
- ✅ Configuration snapshot (sanitized)
- ✅ Dependency versions
- ✅ Environment variables (presence check only)
- ✅ Recent log lines (last 20)
- ✅ Health check results

### Health Checks Include
- Required env vars present
- Required files exist
- Port availability (if applicable)
- External API reachability (if applicable)

---

## Success Criteria

Bundle generation is successful when:
- ✅ JSON file created in `diagnostics/` folder
- ✅ All sections populated (or marked as N/A)
- ✅ No sensitive data exposed (tokens, passwords)
- ✅ File size < 1MB
- ✅ Valid JSON format

---

**Next Step:** Use this bundle with the `fix-with-evidence` workflow for targeted debugging.
