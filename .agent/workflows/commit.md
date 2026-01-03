---
description: Run all quality gates and commit changes
---

This workflow runs linting, formatting, type-checking, and tests for the frontend, backend, and electron projects before staging and committing changes.

1. Run frontend quality gates
// turbo
```bash
cd frontend && npm run format:fix && npm run lint:fix && npm run type-check && npm run test && npm run build
```

2. Run backend quality gates
// turbo
```bash
cd backend && npm run format:fix && npm run lint:fix && npm run test
```

3. Run electron quality gates
// turbo
```bash
cd electron && npm run format:fix && npm run lint:fix
```

4. Stage all changes
// turbo
```bash
git add .
```

5. Commit changes
// turbo
```bash
git commit -m "chore: quality gate pass and updates"
```
