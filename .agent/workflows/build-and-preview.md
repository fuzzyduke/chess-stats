---
description: Build production bundle and preview locally
---

# Build and Preview

Builds a production-ready bundle and serves it locally for testing.

## Steps

### 1. Check for Build Script
```powershell
$pkg = Get-Content package.json | ConvertFrom-Json
$hasBuild = $pkg.scripts.build -ne $null
```

### 2. Run Build Command

**Standard npm build:**
```powershell
npm run build
```

**Framework-specific:**
| Framework | Build Command | Output Directory |
|-----------|---------------|------------------|
| Vite | `npm run build` | `dist/` |
| Next.js | `npm run build` | `.next/` |
| CRA | `npm run build` | `build/` |
| Vue CLI | `npm run build` | `dist/` |

### 3. Verify Build Output
```powershell
# Check output directory exists
Test-Path dist
# or
Test-Path build
```

### 4. Preview Production Build

**For Vite projects:**
```powershell
npm run preview
```

**For other static builds:**
```powershell
npx -y serve dist
# or
npx -y serve build
```

**For Next.js:**
```powershell
npm run start
```

### 5. Open Preview in Browser
```powershell
Start-Process "http://localhost:4173"  # Vite preview port
# or
Start-Process "http://localhost:3000"  # serve default port
```

### 6. Analyze Bundle Size (Optional)
For Vite:
```powershell
npx vite-bundle-visualizer
```

For webpack projects:
```powershell
npx source-map-explorer build/static/js/*.js
```

## Troubleshooting

**Build fails:**
- Check for TypeScript errors
- Check for missing dependencies
- Clear cache: `rm -rf node_modules/.cache`

**Preview not working:**
- Check correct output directory
- Ensure build completed successfully
- Try different preview server

## Production Checklist
Before deploying:
- [ ] Build completes without errors
- [ ] Preview works locally
- [ ] All features functional
- [ ] No console errors
- [ ] Assets loading correctly
