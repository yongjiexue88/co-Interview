---
description: Run tests and save progress
---

This workflow does two things:
1. Runs tests to verify current state
2. Updates memory files with progress and learnings

## Phase 1: Run Tests
1. Run frontend tests
// turbo
```bash
cd frontend && npm run test
```

2. Run backend tests
// turbo
```bash
cd backend && npm run test
```

3. Run electron tests
// turbo
```bash
cd electron && npm run test
```

## Phase 2: Update Memory Files

4. Update `memory/progress-todo.md`
- Review changes made in this session
- Move completed items from "🚧 Remaining TODO Items" to "✅ Completed Work"
- Add new TODO items discovered during work
- Update dates and descriptions

5. Update `memory/mistakes-learn.md`
If any bugs were encountered or mistakes were made during this session:
- Add a new entry with the date
- Document: Problem, Root Cause, Solution, Prevention
- Categorize under appropriate section (Auth, Build, Code Quality, Workflow, etc.)

## Entry Template for mistakes-learn.md
```markdown
### [YYYY-MM-DD] - [Brief Description]
**Problem:** What went wrong
**Root Cause:** Why it happened
**Solution:** How it was fixed
**Prevention:** How to avoid this in the future
```

## Phase 3: Save Progress
6. Stage memory file changes
// turbo
```bash
git add memory/
```

7. Commit progress update
```bash
git commit -m "docs(memory): update progress and learnings"
```
