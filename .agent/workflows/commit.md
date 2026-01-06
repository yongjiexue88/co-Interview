---
description: Run all quality gates and commit changes
---

// turbo-all

This workflow verifies code quality, ensures test coverage, then commits changes.

## Phase 1: Lint & Type Check (from /verify-app)

1. Verify Frontend
```bash
cd frontend && npm run lint && npm run type-check
```

2. Verify Backend
```bash
cd backend && npm run lint && npm run format:check
```

3. Verify Electron
```bash
cd electron && npm run lint && npm run format:check
```

## Phase 2: Test Coverage (from /verify-app)

4. Run Frontend Tests with Coverage
```bash
cd frontend && npm run test:coverage
```

5. Run Backend Tests with Coverage
```bash
cd backend && npm run test:coverage
```

6. Run Electron Tests with Coverage
```bash
cd electron && npm run test:coverage
```

### Coverage Evaluation
After running coverage, check the terminal output for coverage percentages:
- Frontend: Look for "All files" line coverage %
- Backend: Look for "All files" line coverage %
- Electron: Look for "All files" line coverage %

**Coverage Requirements:**
- Backend & Frontend: ≥ 95% line coverage
- Electron: ≥ 85% line coverage (real-time audio has complex async testing challenges)

**If Backend OR Frontend has < 95% line coverage, OR Electron has < 85% line coverage:**
Invoke `/test-author` workflow with coverage details before proceeding.

## Phase 2.5: Update Test Coverage Report

After all coverage requirements are met (≥95%), update the comprehensive test report:

7. Update Test Coverage Report
Capture the final coverage percentages from the previous test runs and update `memory/test_coverage_report.md` with:
- Current line coverage percentages for Backend, Frontend, and Electron
- Overall status (All tests passing / X failing tests)
- Any new test areas or blockers discovered during this run
- Timestamp of the report update

Review the test output from steps 4-6 and synthesize:
- What features/components were tested
- Any new test failures or warnings
- Coverage improvements or regressions

Update the report to reflect the current state of the test suite.

## Phase 3: Auto-fix & Build

8. Frontend format fix, lint fix, and build
```bash
cd frontend && npm run format:fix && npm run lint:fix && npm run build
```

9. Backend format fix and lint fix
```bash
cd backend && npm run format:fix && npm run lint:fix
```

10. Electron format fix and lint fix
```bash
cd electron && npm run format:fix && npm run lint:fix
```

## Phase 4: Commit

11. Stage all changes
```bash
git add .
```

12. Commit changes
Generate a conventional commit message based on the changes made (e.g., feat:, fix:, chore:, refactor:, docs:, test:).
Analyze staged files with `git diff --cached --stat` to determine the appropriate type and scope.
```bash
git commit -m "<type>(<optional-scope>): <description>"
```