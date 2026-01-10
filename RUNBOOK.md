# AI Agent Runbook

**Purpose:** Essential information for AI agents to work efficiently.

**Read this FIRST before making any changes.**

---

## 🎯 Project Overview

**Name:** chess-stats
**Type:** Static Web Application (HTML/CSS/JS)
**Purpose:** Display user statistics from Chess.com API
**Architecture:** Client-side only

---

## 🚀 Quick Start Commands

### Running
```bash
# Start local dev server
npm run dev
```

### Testing
```bash
# Run preflight checks
npm run preflight

# Generate diagnostic bundle
npm run diagnostics
```

---

## 📁 Project Structure

```
chess-stats/
├── index.html          # Main entry point
├── styles.css          # Styles
├── script.js           # Logic
├── scripts/            # Utility scripts (diagnostics, preflight)
├── .agent/workflows/   # AI workflows
└── README.md
```

---

## ⚠️ What NOT to Do

- ❌ Do not overcomplicate with frameworks (React/Vue) unless requested
- ❌ Do not commit secrets (though none expected for this public API)

---

## ✅ Best Practices

- Use the provided workflows in `.agent/workflows/`
- Respect change budgets (max 2 files for bugs)
- Use `npm run preflight` before starting

---

## 🐛 Common Failure Patterns

- **CORS Issues:** Chess.com API might require handling headers or proxy if called directly from browser (needs verification).

---

## 🔄 Workflows

Available in `.agent/workflows/`. Use `generate-diagnostics` for debugging.

---

**Last Updated:** 2026-01-10
