---
description: Run tests and save progress
---

This workflow runs tests and updates the progress tracking files as per user rules.

1. Run frontend tests and save progress
// turbo
```bash
cd frontend && npm run test
```

2. Run backend tests and save progress
// turbo
```bash
cd backend && npm run test
```

3. Update progress files
// turbo
```bash
# This step assumes the user's custom logic for saving to /progress is handled within the tests or scripts
# If not, add specific copy/save commands here.
```
