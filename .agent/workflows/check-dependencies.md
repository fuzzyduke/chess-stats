---
description: Audit npm packages for vulnerabilities and updates
---

# Check Dependencies

Audits npm packages for security vulnerabilities and available updates.

## Steps

### 1. Verify package.json Exists
```powershell
if (-not (Test-Path package.json)) {
    Write-Host "No package.json found. This workflow requires an npm project."
    exit
}
```

### 2. Run Security Audit
```powershell
npm audit
```

This shows:
- Vulnerability severity (low, moderate, high, critical)
- Affected packages
- Recommended actions

### 3. Fix Vulnerabilities (if found)

**Auto-fix compatible updates:**
```powershell
npm audit fix
```

**Force fix (may include breaking changes):**
```powershell
npm audit fix --force
```

### 4. Check for Outdated Packages
```powershell
npm outdated
```

Output shows:
| Package | Current | Wanted | Latest |
|---------|---------|--------|--------|
| react | 18.2.0 | 18.2.0 | 18.3.0 |

### 5. Update Packages

**Update to wanted versions (safe):**
```powershell
npm update
```

**Update specific package to latest:**
```powershell
npm install package-name@latest
```

**Update all to latest (check for breaking changes):**
```powershell
npx npm-check-updates -u
npm install
```

### 6. Interactive Update Tool
```powershell
npx npm-check -u
```
This provides an interactive UI to select which packages to update.

### 7. Check for Unused Dependencies
```powershell
npx depcheck
```

Shows:
- Unused dependencies
- Missing dependencies
- Unused devDependencies

### 8. Generate Dependency Report
```powershell
npm list --depth=0
```

For detailed tree:
```powershell
npm list
```

## Summary Report Format
```
📦 Dependency Check Report
==========================
✅ No vulnerabilities found
   OR
⚠️ 3 vulnerabilities (1 high, 2 moderate)

📊 Outdated packages: 5
   - react: 18.2.0 → 18.3.0
   - lodash: 4.17.20 → 4.17.21

🗑️ Unused dependencies: 2
   - moment
   - underscore

Recommendations:
1. Run `npm audit fix` to fix vulnerabilities
2. Update outdated packages with `npm update`
3. Remove unused: `npm uninstall moment underscore`
```

## Best Practices
- Run audit weekly or before deployments
- Review breaking changes before major updates
- Keep a changelog of dependency updates
- Test after updating dependencies
