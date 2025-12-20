---
description: Verify application state across all projects
---

This workflow verifies code quality and test coverage for all sub-projects.
## Phase 1: Linting & Type Checking
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
## Phase 2: Test Coverage Analysis
4. Run Frontend Tests with Coverage
// turbo
```bash
cd frontend && npm run test:coverage
```
5. Run Backend Tests with Coverage
// turbo
```bash
cd backend && npm run test:coverage
```
6. Run Electron Tests with Coverage
// turbo
```bash
cd electron && npm run test:coverage
```
## Phase 3: Coverage Evaluation
After running coverage, check the terminal output for coverage percentages:
- Frontend: Look for "All files" line coverage %
- Backend: Look for "All files" line coverage %
- Electron: Look for "All files" line coverage %
**If ANY project has < 99% line coverage:**
7. Invoke test-author workflow with the following context:
   - Current coverage percentages for each project
   - Top 10 uncovered files from each project's coverage report (found in `coverage/coverage-summary.json` or terminal output)
   - Constraint: "No production logic changes allowed"
Example invocation:
```
/test-author
Coverage Report:
- Frontend: 65% lines (target: 99%)
- Backend: 72% lines (target: 99%)
- Electron: 100% lines (✓ passing)
Top Uncovered Files (Frontend):
1. src/components/Hero.tsx - 45% coverage
2. src/pages/BlogPostPage.tsx - 52% coverage
...
Top Uncovered Files (Backend):
1. src/routes/webhooks.js - 38% coverage
2. src/middleware/auth.js - 61% coverage
...
Constraints: No production logic changes allowed.
```