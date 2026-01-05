# Mistakes & Lessons Learned

> A log of bugs, mistakes, and solutions encountered during development.
> Reference this file when troubleshooting similar issues.

---

## Template for New Entries

```markdown
### [Date] - [Brief Description]
**Problem:** What went wrong
**Root Cause:** Why it happened
**Solution:** How it was fixed
**Prevention:** How to avoid this in the future
```

---

## 🔴 Authentication

### 2026-01-03 - Google OAuth `redirect_uri_mismatch` Error
**Problem:** Frontend local dev returned `Error 400: redirect_uri_mismatch` when trying to sign in with Google
**Root Cause:** `http://localhost:3000` was not added to "Authorized JavaScript origins" in Google Cloud Console, and Firebase auth handler URI was missing from "Authorized redirect URIs"
**Solution:** 
- Added `http://localhost:3000` to Authorized JavaScript origins
- Added `https://co-interview-481814.firebaseapp.com/__/auth/handler` to Authorized redirect URIs
**Prevention:** Always verify OAuth redirect URIs match between code config and Google Cloud Console for both dev and prod environments

### 2026-01-03 - Google OAuth `invalid_grant` Error in Packaged App
**Problem:** Packaged Electron app failed with `invalid_grant` during OAuth callback
**Root Cause:** Authorization code was being consumed twice due to browser pre-fetch requests
**Solution:** Added anti-prefetch headers and checks in `backend/src/routes/auth.js` callback handler
**Prevention:** Always add cache-control headers and prefetch detection to OAuth callback endpoints

---

## 🔴 Build & Configuration

### 2026-01-04 - Duplicate Import in PricingPage.tsx
**Problem:** Vite build failed with `Identifier 'Check' has already been declared`
**Root Cause:** Same import statement was duplicated on consecutive lines
**Solution:** Removed the duplicate import line
**Prevention:** Use ESLint `no-duplicate-imports` rule

### 2026-01-04 - Missing Axios Dependency
**Problem:** Frontend tests failed with `Failed to resolve import "axios"`
**Root Cause:** `axios` was imported in `src/lib/api.ts` but missing from `package.json` dependencies
**Solution:** `npm install axios`
**Prevention:** Check package.json when adding new imports

### 2026-01-03 - Electron `@electron/remote` Startup Crash
**Problem:** Electron app showed blank screen after build
**Root Cause:** `@electron/remote` was not properly initialized in main process
**Solution:** Ensured `require('@electron/remote/main').initialize()` is called before window creation
**Prevention:** Test builds after adding new Electron IPC dependencies

---


## 🔴 Backend

### 2026-01-04 - Stripe Webhook "No document to update" Error
**Problem:** `checkout.session.completed` event failed with "Error: 5 NOT_FOUND: No document to update" for new users
**Root Cause:** Webhook handler used `.update()` which requires an existing document. If the user document was missing (e.g. wiped DB or new signup flow issue), it failed.
**Solution:** Switched to `.set(..., { merge: true })` in `webhooks.js` to ensure upsert behavior.
**Prevention:** Always use upsert logic for critical webhook handlers dealing with potentially missing records.

---

## 🔴 Code Quality

### 2026-01-04 - Hardcoded Debug Flag Left in Production
**Problem:** `CoInterviewApp.js` always showed onboarding even for logged-in users
**Root Cause:** Debug flag `this.currentView = 'onboarding'` was left uncommented
**Solution:** Reverted to `this.currentView = config.onboarded ? 'main' : 'onboarding'`
**Prevention:** Never commit debug flags; use environment variables or feature flags instead

---

## 🟡 Workflow & Process

### 2026-01-04 - /verify-app Not Triggering /test-author
**Problem:** `test-author` workflow was never invoked because `verify-app` didn't pass required inputs
**Root Cause:** Workflow only ran lint/type-check, not coverage; no mechanism to invoke `test-author`
**Solution:** Updated `verify-app.md` to run `npm run test:coverage` and include instructions to invoke `test-author` with coverage report
**Prevention:** When creating workflows that depend on each other, explicitly define input/output contracts

---

## 🔴 Configuration & Environment

### 2026-01-04 - Firebase `invalid_client` Error
**Problem:** Local web frontend failed Google Login with `auth/invalid-credential`
**Root Cause:** Firebase Console's "Web Client Secret" was outdated/mismatched with the actual secret in Google Cloud Console
**Solution:** Manually updated Firebase Console with the correct secret from GCP
**Prevention:** When rotating secrets or setting up new environments, sync Firebase Console Authentication providers with GCP Credentials

### 2026-01-04 - Accidental Coverage Files Commit
**Problem:** `coverage/` directory was committed to the repo, cluttering history
**Root Cause:** `.gitignore` was missing `coverage/` entry
**Solution:** Removed files via `git rm -r --cached` and updated `.gitignore`
**Prevention:** Verify `.gitignore` includes build/test artifacts before first commit

## 🟡 Tool Usage

### 2026-01-05 - `replace_file_content` Context Mismatch
**Problem:** `replace_file_content` failed repeatedly when editing `auth.js` due to 'The content of the file does not match the target content' error.
**Root Cause:** The file was large and complex; relying on exact string matching for large blocks is fragile if whitespace or surrounding code varies slightly.
**Solution:** Used `overwrite=true` (via `write_to_file` or essentially overwriting the whole file) to force the correct content.
**Prevention:** For major refactors of large files, consider overwriting the file if localized edits are flaky, or ensure `TargetContent` includes sufficient unique context without being excessive.

### 2026-01-05 - Missing Jest Mock for V2 Schema Update
**Problem:** `backend/__tests__/routes/admin.test.js` failed with `TypeError` in `seed-v2` test.
**Root Cause:** A new test case using `adminAuth.createUser` was added (likely during V2 schema work), but the file's top-level `jest.mock` for firebase auth was not updated to include `createUser`.
**Solution:** Added `createUser: jest.fn()` to the mock.
**Prevention:** When adding new dependencies or methods in code, always search for associated test mocks and update them immediately.

---

## 🔴 Google Analytics 4

### 2026-01-05 - GA4 `PERMISSION_DENIED` Error
**Problem:** Backend failed to fetch GA4 data with `PERMISSION_DENIED` error
**Root Cause:** The service account email added to GA4 was different from the one actually in `service-account.json`. Also, the Property ID was missing from Cloud Run env vars.
**Solution:** Checked `service-account.json` for the actual `client_email`, added that exact account to GA4, and updated `deploy-backend.yml`.
**Prevention:** Always verify the actual identity in the credential file being used, not just the project-level defaults.

---

## 🔴 Testing

### 2026-01-05 - Jest Mock Hoisting & `ReferenceError`
**Problem:** `session.test.js` failed with `ReferenceError: Cannot access 'mockDb' before initialization`
**Root Cause:** `jest.mock` calls are hoisted by Jest, but variables referenced in mock factories must be defined before use (or mocked differently).
**Solution:** restructuring mock definitions to use literal mock factories or ensuring variables are available. Also, `admin.firestore` needed to be mocked as both a function and an object with properties (like `FieldValue`).
**Prevention:** Use `jest.doMock` if order matters, or define mock objects inside the factory function instead of referencing outside variables.

### 2026-01-05 - Vitest `--watchAll` Flag Error
**Problem:** Frontend tests failed when run with `--watchAll=false`
**Root Cause:** `--watchAll` is a Jest-specific flag. Vitest uses different flags or no flags for single runs.
**Solution:** Ran tests with simple `npm run test` or `vitest run` for non-watch mode.
**Prevention:** Check the test runner (Vitest vs Jest) before applying CLI flags.

---

### 2026-01-05 - Electron Test Failure due to State Persistence
**Problem:** `analytics.test.js` failed when run as part of a suite but passed individually.
**Root Cause:** Singleton utility held state (`analyticsEnabled`) between tests. Also Node environment lacked `fetch`.
**Solution:** Added `__resetForTesting` hook to `analytics.js` and mocked `global.fetch` in tests.
**Prevention:** Singleton utilities should expose reset hooks for testing; web APIs should be mocked in Node test environments.

---

### 2026-01-05 - Electron `coInterview` Undefined Race Condition
**Problem:** Users blocked on onboarding or seeing blank views; console shows `TypeError: coInterview is not defined` or `Cannot read properties of undefined (reading '... theme/storage')`.
**Root Cause:** Components accessed the global `coInterview` object during initialization before it was fully defined or assigned to `window` in `renderer.js`. Overwriting the automatic ID-based global `window.coInterview` with the JS object also caused timing issues.
**Solution:** 
- Refactored all storage access to use direct `ipcRenderer.invoke` calls, bypassing `coInterview.storage`.
- Prefixed all global `coInterview` usages with `window.` and added optional chaining (`window.coInterview?.`).
- Corrected configuration key mismatch (`onboarded` vs `onboardingComplete`) in onboarding completion logic.
- **Improved robustness:** Added `getCurrentView()` and `getLayoutMode()` directly to `CoInterviewApp` class and updated `window.js` to use a resilient script that checks both the app element and the global object.
**Prevention:** Avoid relying on global objects for core functionality like storage in Electron renderers; use direct IPC or ensure initialization order is guaranteed. Use optional chaining and robust retrieval scripts/methods on elements.

---

## 📝 Notes

- Keep entries concise but include enough detail to be useful
- Group by category (Auth, Build, Code Quality, Workflow, etc.)
- Mark resolved issues for reference
