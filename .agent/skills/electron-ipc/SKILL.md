---
name: Electron IPC Feature Development
description: How to safely add new IPC channels between the renderer and main process in the Co-Interview Electron app.
---

# Electron IPC Feature Development

Use this skill when adding new communication channels between the renderer (UI) and main (Node.js) processes.

## Architecture Overview
- **Main Process**: `electron/src/index.js` — Node.js environment with full system access.
- **Renderer Process**: `electron/src/components/` — Browser environment via `index.html`.
- **Preload Script**: `electron/src/preload.js` — Secure bridge exposing `window.coInterview`.

## Step-by-Step: Adding a New IPC Channel

### 1. Define the Handler in `index.js` (Main Process)
Add your handler inside the existing IPC setup block:
```javascript
// In electron/src/index.js
ipcMain.handle('my-new-channel', async (event, args) => {
    // Validate args first!
    if (typeof args !== 'string') {
        throw new Error('Invalid argument type');
    }
    // Perform the action
    return { success: true, data: '...' };
});
```

### 2. Expose via Preload Script
Only expose the minimal API surface. Add to `electron/src/preload.js`:
```javascript
contextBridge.exposeInMainWorld('coInterview', {
    // ... existing methods
    myNewMethod: (args) => ipcRenderer.invoke('my-new-channel', args),
});
```

### 3. Call from Renderer
In your component (e.g., `electron/src/components/views/MainView.js`):
```javascript
const result = await window.coInterview.myNewMethod('some data');
```

## Security Checklist
- [ ] **Validate all inputs** in the main process handler. Never trust data from the renderer.
- [ ] **Sanitize file paths** if the channel deals with the filesystem (use `path.resolve` and check against a whitelist).
- [ ] **Avoid exposing `ipcRenderer` directly** via preload. Only expose specific, named methods.
- [ ] **Do not use `nodeIntegration: true`** — context isolation must remain enabled.

## Testing
1.  Add a test in `electron/__tests__/` for the new IPC handler.
2.  Test manually by running `npm start` from the `electron/` directory.

## Related Files
- [index.js](file:///Users/yongjiexue/Documents/GitHub/co-Interview/electron/src/index.js) — Main process entry point.
- [preload.js](file:///Users/yongjiexue/Documents/GitHub/co-Interview/electron/src/preload.js) — Secure API bridge.
- [AGENTS.md](file:///Users/yongjiexue/Documents/GitHub/co-Interview/electron/AGENTS.md) — Repo guidelines for Electron.
