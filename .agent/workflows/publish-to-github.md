---
description: Publish a project to GitHub with smart duplicate checking and naming
---

# Publish Project to GitHub

Use this workflow when the user wants to push a new project to GitHub.

## Prerequisites
- GitHub CLI (`gh`) must be installed and authenticated
- Git must be available

## Steps

### 1. Verify GitHub CLI is authenticated
```powershell
gh auth status
```
If this fails, ask the user to run `gh auth login` first.

### 2. Check if repository already exists on GitHub
Before creating, always check if a repo with this name already exists:
```powershell
gh repo view USERNAME/REPO_NAME 2>$null
```
- If it EXISTS: Ask user if they want to push to existing repo or create a new one with a different name
- If it DOESN'T EXIST: Proceed to create

### 3. Naming Conventions
Use these naming patterns to avoid duplicates:
- **Base name**: Use the project folder name (e.g., `calculator`, `flappy-game`)
- **If duplicate exists**: Append version or descriptor:
  - `calculator-v2`
  - `calculator-react`
  - `calculator-2024`

### 4. Initialize Git (if not already)
```powershell
cd PROJECT_PATH
git init
git add .
git commit -m "Initial commit: PROJECT_NAME"
```

### 5. Create GitHub repo and push
```powershell
# Create public repo and push in one command
gh repo create REPO_NAME --public --source=. --push

# Or for private repo:
gh repo create REPO_NAME --private --source=. --push
```

### 6. Confirm success
```powershell
gh repo view REPO_NAME --web
```
This opens the new repo in the browser.

## Example Usage
For a project at `C:\Users\graci\.gemini\antigravity\scratch\my-app`:
```powershell
cd C:\Users\graci\.gemini\antigravity\scratch\my-app
gh repo view graci/my-app 2>$null  # Check if exists
git init
git add .
git commit -m "Initial commit: my-app"
gh repo create my-app --public --source=. --push
```

## Error Handling
- **Repo already exists**: Offer to rename or push to existing
- **Auth failed**: Run `gh auth login`
- **Git not found**: Ensure GitHub Desktop is installed or install Git separately
