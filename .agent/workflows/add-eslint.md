---
description: Set up ESLint and Prettier for code quality
---

# Add ESLint & Prettier

Sets up ESLint for linting and Prettier for code formatting.

## Steps

### 1. Check for package.json
```powershell
Test-Path package.json
```
If no package.json, initialize one:
```powershell
npm init -y
```

### 2. Install ESLint
```powershell
npm install -D eslint
```

### 3. Initialize ESLint Config
```powershell
npx eslint --init
```

Choose options:
- How would you like to use ESLint? **To check syntax and find problems**
- What type of modules? **JavaScript modules (import/export)**
- Which framework? **React / Vue / None** (based on project)
- Does your project use TypeScript? **No** (unless it does)
- Where does your code run? **Browser** (or Node)
- Config format? **JavaScript**

### 4. Install Prettier
```powershell
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 5. Create Prettier Config
Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true
}
```

### 6. Update ESLint Config
Add Prettier to `.eslintrc.js`:
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended'  // Add this last
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### 7. Add npm Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

### 8. Create .prettierignore
```
node_modules
dist
build
.next
coverage
```

### 9. Create .eslintignore
```
node_modules
dist
build
.next
coverage
```

## Usage
```powershell
npm run lint       # Check for issues
npm run lint:fix   # Auto-fix issues
npm run format     # Format all files
```

## VS Code Integration
Recommend installing:
- ESLint extension
- Prettier extension

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
