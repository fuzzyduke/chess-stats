---
description: Generate a professional README for the project
---

# Add README

Generates a professional README.md with badges, screenshots, and proper documentation.

## Steps

### 1. Analyze Project
Examine the project to understand:
- Project name (from folder or package.json)
- Description
- Tech stack used
- How to install/run
- Main features

### 2. Generate README Template

Create `README.md` with this structure:

```markdown
# 🚀 Project Name

Brief description of what this project does and who it's for.

![Project Screenshot](screenshot.png)

## ✨ Features

- Feature 1
- Feature 2
- Feature 3

## 🛠️ Tech Stack

- HTML5 / CSS3 / JavaScript
- (or) React / Next.js / etc.

## 📦 Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/USERNAME/REPO_NAME.git
\`\`\`

2. Navigate to project
\`\`\`bash
cd REPO_NAME
\`\`\`

3. Install dependencies (if applicable)
\`\`\`bash
npm install
\`\`\`

## 🚀 Usage

\`\`\`bash
npm run dev
\`\`\`

Or open `index.html` in your browser.

## 📁 Project Structure

\`\`\`
├── index.html
├── styles.css
├── script.js
└── README.md
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Your Name**
- GitHub: [@username](https://github.com/username)
```

### 3. Optional Badges
Add badges at the top for:
```markdown
![GitHub stars](https://img.shields.io/github/stars/USERNAME/REPO)
![GitHub forks](https://img.shields.io/github/forks/USERNAME/REPO)
![GitHub issues](https://img.shields.io/github/issues/USERNAME/REPO)
![License](https://img.shields.io/github/license/USERNAME/REPO)
```

### 4. Add Screenshot
If project has UI:
- Take a screenshot
- Save as `screenshot.png` in project root
- Reference in README

### 5. Customize for Project Type

**For Games:**
- Add "How to Play" section
- Add controls/keybindings

**For APIs:**
- Add API endpoints documentation
- Add example requests/responses

**For Libraries:**
- Add API reference
- Add more code examples

### 6. Commit README
```powershell
git add README.md
git commit -m "Add README documentation"
git push
```
