---
description: Deploy a project to Vercel for production hosting
---

# Deploy to Vercel

Deploys projects to Vercel with automatic builds and preview URLs.

## Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Vercel account (free tier available)

## First-Time Setup

### 1. Install Vercel CLI
```powershell
npm install -g vercel
```

### 2. Login to Vercel
```powershell
vercel login
```
Follow the browser prompt to authenticate.

## Deployment Steps

### 1. Navigate to Project
```powershell
cd PROJECT_PATH
```

### 2. Deploy to Vercel

**For Preview Deployment:**
```powershell
vercel
```
This creates a preview URL for testing.

**For Production Deployment:**
```powershell
vercel --prod
```
This deploys to the production URL.

### 3. First Deployment Prompts
Vercel will ask:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (for new projects)
- Project name? Use folder name or custom
- Directory with code? **./** (current)
- Override settings? **N** (auto-detects framework)

### 4. Get Deployment URL
After deployment, Vercel outputs:
```
✅ Production: https://project-name.vercel.app
```

## Framework Auto-Detection
Vercel automatically detects:
- React / Create React App
- Next.js
- Vite
- Vue
- Svelte
- Static HTML

## Custom Configuration
Create `vercel.json` for custom settings:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

## Environment Variables
```powershell
# Add env var
vercel env add VARIABLE_NAME

# Or deploy with env
vercel --env KEY=value --prod
```

## Useful Commands
```powershell
vercel ls          # List deployments
vercel logs        # View deployment logs
vercel domains     # Manage custom domains
vercel env ls      # List env variables
```
