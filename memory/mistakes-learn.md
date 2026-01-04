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

### 2026-01-03 - Electron `@electron/remote` Startup Crash
**Problem:** Electron app showed blank screen after build
**Root Cause:** `@electron/remote` was not properly initialized in main process
**Solution:** Ensured `require('@electron/remote/main').initialize()` is called before window creation
**Prevention:** Test builds after adding new Electron IPC dependencies

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

## 📝 Notes

- Keep entries concise but include enough detail to be useful
- Group by category (Auth, Build, Code Quality, Workflow, etc.)
- Mark resolved issues for reference
