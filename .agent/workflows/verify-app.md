---
description: Verify application state across all projects
---

This workflow runs linting and type-checking for all sub-projects to ensure code quality.

1. Verify Frontend
// turbo
```bash
cd frontend && npm run lint && npm run type-check
```

2. Verify Backend
// turbo
```bash
cd backend && npm run lint && npm run format:check
```

3. Verify Electron
// turbo
```bash
cd electron && npm run lint && npm run format:check
```
