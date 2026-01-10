---
description: Smart dev server startup with auto-detection
---

# Start Dev Server

Intelligently detects project type and starts the appropriate development server.

## Steps

### 1. Detect Project Type
Check for these files in order:

```powershell
# Check what exists
Test-Path package.json
Test-Path index.html
Test-Path next.config.js
Test-Path vite.config.js
```

### 2. Start Appropriate Server

**If package.json exists:**
```powershell
# Check for common dev scripts
$pkg = Get-Content package.json | ConvertFrom-Json
$scripts = $pkg.scripts
```

Priority order for npm scripts:
1. `npm run dev` (most common)
2. `npm run start`
3. `npm run serve`

```powershell
npm run dev
```

**If only static HTML (no package.json):**

Option A - Python (if available):
```powershell
python -m http.server 3000
```

Option B - npx serve:
```powershell
npx -y serve
```

Option C - VS Code Live Server:
Open with Live Server extension

### 3. Common Framework Commands

| Framework | Command | Default Port |
|-----------|---------|--------------|
| Vite | `npm run dev` | 5173 |
| Next.js | `npm run dev` | 3000 |
| Create React App | `npm start` | 3000 |
| Vue CLI | `npm run serve` | 8080 |
| Angular | `ng serve` | 4200 |
| Svelte | `npm run dev` | 5000 |

### 4. Open in Browser
After server starts, open:
```powershell
Start-Process "http://localhost:PORT"
```

### 5. Handle Port Conflicts
If port is in use:
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Or use different port
npm run dev -- --port 3001
```

## Quick Reference
```powershell
# Static site
npx -y serve

# Node/Express
node server.js
# or
npm run dev

# With nodemon
npx nodemon server.js
```
