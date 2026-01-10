---
description: Deploy a static site to GitHub Pages for free hosting
---

# Deploy to GitHub Pages

Deploys static HTML/CSS/JS sites to GitHub Pages for free hosting.

## Prerequisites
- Project must be pushed to GitHub (use `/publish-to-github` first if not)
- GitHub CLI authenticated

## Steps

### 1. Check if Repo Exists on GitHub
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
gh repo view --json name
```
If not on GitHub, run `/publish-to-github` workflow first.

### 2. Determine Deploy Method

**For Static Sites (no build step):**
- Deploy directly from main branch

**For Sites with Build Step (React, Vite, Next):**
- Need to build first and deploy the dist/build folder

### 3. Enable GitHub Pages

**Option A: Deploy from main branch (static sites)**
```powershell
gh api repos/{owner}/{repo}/pages -X POST -f source='{"branch":"main","path":"/"}'
```

**Option B: Use gh-pages branch (build sites)**
```powershell
# Install gh-pages if needed
npm install -D gh-pages

# Add deploy script to package.json
# "deploy": "gh-pages -d dist"

# Build and deploy
npm run build
npx gh-pages -d dist
```

### 4. Configure GitHub Pages in Repo Settings
```powershell
# Enable pages on gh-pages branch
gh api repos/{owner}/{repo}/pages -X POST -f source='{"branch":"gh-pages","path":"/"}'
```

### 5. Get the Live URL
```powershell
gh api repos/{owner}/{repo}/pages -q .html_url
```

The site will be live at: `https://USERNAME.github.io/REPO_NAME/`

### 6. Verify Deployment
Open the URL in browser to confirm it's working.

## Notes
- First deployment may take 1-2 minutes to propagate
- Custom domains can be configured in repo settings
- For single-page apps, may need to add a 404.html that redirects to index.html
