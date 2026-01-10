---
description: Create a new project with proper structure and setup
---

# New Project Workflow

Creates a new project with proper folder structure, README, .gitignore, and optional framework.

## Steps

### 1. Gather Project Information
Ask the user for:
- **Project name** (will be folder name, lowercase with hyphens)
- **Project type**: static (HTML/CSS/JS), react, next, vite, node-api
- **Description** (one line)

### 2. Create Project Directory
```powershell
$projectPath = "C:\Users\graci\.gemini\antigravity\scratch\PROJECT_NAME"
New-Item -ItemType Directory -Path $projectPath -Force
cd $projectPath
```

### 3. Initialize Based on Type

**For Static (HTML/CSS/JS):**
Create these files:
- `index.html` - Basic HTML5 template
- `styles.css` - CSS with design system variables
- `script.js` - Main JavaScript file

**For React/Vite:**
```powershell
npx -y create-vite@latest ./ -- --template react
npm install
```

**For Next.js:**
```powershell
npx -y create-next-app@latest ./ --js --no-tailwind --eslint --no-src-dir --app --no-import-alias
npm install
```

**For Node API:**
```powershell
npm init -y
npm install express cors dotenv
```
Create `server.js` with basic Express setup.

### 4. Create .gitignore
```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
```

### 5. Create README.md
```markdown
# PROJECT_NAME

PROJECT_DESCRIPTION

## Getting Started

### Prerequisites
- Node.js (if applicable)

### Installation
\`\`\`bash
npm install
\`\`\`

### Running
\`\`\`bash
npm run dev
\`\`\`

## License
MIT
```

### 6. Initialize Git
```powershell
git init
git add .
git commit -m "Initial commit: PROJECT_NAME"
```

### 7. Offer Next Steps
Ask user if they want to:
- Start dev server
- Publish to GitHub
- Open in browser
