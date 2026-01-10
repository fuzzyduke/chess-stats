---
description: Automatically document new developments and keep docs in sync
---

# Auto-Document Workflow

This is a **behavioral workflow** that the AI should follow continuously, not just when explicitly triggered. It ensures documentation stays synchronized with code changes.

## When to Trigger

Automatically apply this workflow when ANY of the following occur:

1. **New feature/functionality added** to a project
2. **New workflow created** in the workflows library
3. **Significant code changes** that affect how something works
4. **New project created** that needs initial documentation
5. **Configuration changes** that users need to know about
6. **API changes** or new endpoints
7. **New dependencies** added to a project

## Documentation Actions

### For New Workflows
When a new workflow is created:
1. Add entry to the workflow library's README.md
2. Update the quick reference table
3. Commit and push changes

```powershell
# Example: After creating new-workflow.md
# Update README.md with new entry in appropriate category
# Then:
git add README.md workflows/new-workflow.md
git commit -m "Add new-workflow: [brief description]"
git push
```

### For New Features in a Project
When new functionality is added:
1. Check if README.md exists → create if not (use `/add-readme`)
2. Update the Features section
3. Update Usage/API sections if applicable
4. Add to CHANGELOG.md if it exists

### For New Projects
When creating a new project:
1. Always create README.md with:
   - Project description
   - Installation instructions
   - Usage examples
   - Tech stack
2. Consider adding CHANGELOG.md for tracking changes

### For Code Changes
When making significant code changes:
1. Update inline code comments if behavior changed
2. Update README if user-facing behavior changed
3. Update API docs if endpoints changed
4. Add migration notes if breaking changes

## Documentation Templates

### Feature Entry (for README)
```markdown
### Feature Name
Brief description of what it does.

**Usage:**
\`\`\`javascript
// Example code
\`\`\`
```

### Changelog Entry
```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description

### Changed
- What was modified

### Fixed
- Bug fixes
```

### Workflow Entry (for workflow library README)
```markdown
| [workflow-name](workflows/workflow-name.md) | Brief description | `/workflow-name` |
```

## Auto-Detection Checklist

Before completing any task, check:

- [ ] Did I create something new? → Document it
- [ ] Did I change how something works? → Update docs
- [ ] Did I add a dependency? → Note in README
- [ ] Did I create a new file type? → Explain its purpose
- [ ] Is there a README? → Create one if not
- [ ] Did I create a workflow? → Update workflow library README

## Commit Message Format

For documentation updates:
```
docs: [what was documented]

- Added X to README
- Updated Y section
- Created Z documentation
```

## Example Scenarios

### Scenario 1: New Workflow Created
```
Action: Created backup-project.md
Auto-Doc Steps:
1. Add to workflows/backup-project.md ✓
2. Update README.md table ✓
3. Update quick reference section ✓
4. git add . && git commit -m "Add backup-project workflow" && git push
```

### Scenario 2: New Feature in Calculator
```
Action: Added memory functions (M+, M-, MR, MC)
Auto-Doc Steps:
1. Update README.md Features section
2. Add usage instructions
3. git commit -m "docs: Add memory functions documentation"
```

### Scenario 3: New API Endpoint
```
Action: Added /api/users endpoint
Auto-Doc Steps:
1. Update API.md or README's API section
2. Add request/response examples
3. Note authentication requirements
```

## Proactive Behavior

The AI should:
1. **Always check** for documentation needs after completing work
2. **Suggest** documentation updates even if not asked
3. **Create** missing docs rather than leaving gaps
4. **Keep** docs concise but comprehensive
5. **Use** consistent formatting across all docs
