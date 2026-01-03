if (require('electron-squirrel-startup')) {
    process.exit(0);
}

const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { createWindow, updateGlobalShortcuts } = require('./utils/window');
const { setupGeminiIpcHandlers, stopMacOSAudioCapture, sendToRenderer } = require('./utils/gemini');
const storage = require('./storage');

const geminiSessionRef = { current: null };
let mainWindow = null;

function createMainWindow() {
    mainWindow = createWindow(sendToRenderer, geminiSessionRef);
    return mainWindow;
}

app.whenReady().then(async () => {
    // Initialize storage (checks version, resets if needed)
    storage.initializeStorage();

    // Register custom protocol for OAuth callback
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient('co-interview', process.execPath, [process.argv[1]]);
        }
    } else {
        app.setAsDefaultProtocolClient('co-interview');
    }

    createMainWindow();
    setupGeminiIpcHandlers(geminiSessionRef);
    setupStorageIpcHandlers();
    setupGeneralIpcHandlers();
    setupAuthIpcHandlers();
});

// Handle protocol URL on macOS
app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAuthCallback(url);
});

// Handle protocol URL on Windows/Linux (single instance)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, argv) => {
        // Windows/Linux: protocol URL is in argv
        const url = argv.find(arg => arg.startsWith('co-interview://'));
        if (url) {
            handleAuthCallback(url);
        }
        // Focus window
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Open Google Sign In (Server-Side Flow)
ipcMain.handle('auth:open-google', async () => {
    try {
        const authUrl = app.isPackaged ? 'https://co-interview.com/api/v1/auth/google' : 'http://localhost:8080/api/v1/auth/google';
        // const authUrl = 'http://localhost:8080/api/v1/auth/google'; // Force local for testing

        console.log('Opening Google Auth:', authUrl);
        await shell.openExternal(authUrl);
        return { success: true };
    } catch (error) {
        console.error('Error opening Google Auth:', error);
        return { success: false, error: error.message };
    }
});

// Open Email/Password Login (Frontend Page)
ipcMain.handle('auth:open-login', async () => {
    try {
        const authUrl = app.isPackaged ? 'https://co-interview.com/signin?electron=true' : 'http://localhost:3000/signin?electron=true';
        // const authUrl = 'http://localhost:3000/signin?electron=true'; // Force local for testing

        console.log('Opening Login Page:', authUrl);
        await shell.openExternal(authUrl);
        return { success: true };
    } catch (error) {
        console.error('Error opening Login Page:', error);
        return { success: false, error: error.message };
    }
});

async function handleAuthCallback(url) {
    console.log('=== Auth callback received ===');
    console.log('URL:', url);
    console.log('mainWindow exists:', !!mainWindow);
    console.log('mainWindow.webContents exists:', !!(mainWindow && mainWindow.webContents));

    try {
        // Replace custom protocol with http:// for proper URL parsing
        // Custom protocols like co-interview:// don't parse correctly with URL class
        const normalizedUrl = url.replace('co-interview://', 'http://localhost/');
        const urlObj = new URL(normalizedUrl);
        console.log('Normalized URL:', normalizedUrl);
        console.log('Parsed pathname:', urlObj.pathname);
        console.log('Parsed host:', urlObj.host);

        // Check if this is an auth-callback
        const isAuthCallback = urlObj.pathname === '/auth-callback' || urlObj.pathname === '//auth-callback' || url.includes('auth-callback');

        console.log('Is auth callback:', isAuthCallback);

        if (isAuthCallback) {
            // Check for cancel
            if (urlObj.searchParams.get('cancel') === 'true') {
                console.log('Auth cancelled by user');
                if (mainWindow && mainWindow.webContents) {
                    mainWindow.webContents.send('auth-complete', {
                        success: false,
                        error: 'Authentication cancelled',
                    });
                }
                return;
            }

            const token = urlObj.searchParams.get('token');
            const uid = urlObj.searchParams.get('uid');
            const email = urlObj.searchParams.get('email');
            const displayName = urlObj.searchParams.get('name');
            const photoURL = urlObj.searchParams.get('photo');

            console.log('Token received:', token ? `${token.substring(0, 50)}...` : 'null');
            console.log('UID:', uid);
            console.log('Email:', email);
            console.log('DisplayName:', displayName);

            if (token) {
                const { auth, signInWithCustomToken } = require('./utils/firebase');
                try {
                    console.log('Calling signInWithCustomToken...');
                    await signInWithCustomToken(auth, token);
                    console.log('signInWithCustomToken completed successfully');

                    // Now get the FRESH ID token for storage
                    const user = auth.currentUser;
                    console.log('Current user after sign-in:', user ? user.uid : 'null');

                    if (!user) {
                        throw new Error('No current user after signInWithCustomToken');
                    }

                    const idToken = await user.getIdToken();
                    console.log('Got ID token:', idToken ? 'yes' : 'no');

                    // Verify with backend if needed (optional since we just got it from there)
                    let entitlements = null;
                    if (idToken) {
                        try {
                            const apiUrl = app.isPackaged
                                ? 'https://co-interview.com/api/v1/auth/verify'
                                : 'http://localhost:8080/api/v1/auth/verify';

                            console.log('Verifying with backend:', apiUrl);
                            const response = await fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${idToken}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (response.ok) {
                                entitlements = await response.json();
                                console.log('Backend verification successful:', entitlements);
                            } else {
                                console.warn('Backend verification failed:', response.status);
                            }
                        } catch (error) {
                            console.warn('Backend verification warning:', error.message);
                        }
                    }

                    // Store auth data
                    const authData = {
                        userId: user.uid,
                        userEmail: user.email,
                        displayName: user.displayName || displayName,
                        photoURL: user.photoURL || photoURL,
                        idToken: idToken,
                        isLoggedIn: true,
                        plan: entitlements?.plan || 'free',
                        status: entitlements?.status || 'active',
                        quotaRemainingSeconds: entitlements?.quota_remaining_seconds || null,
                        features: entitlements?.features || [],
                    };
                    console.log('Storing auth data:', { ...authData, idToken: '***' });
                    storage.setAuthData(authData);

                    // Notify renderer
                    console.log('Sending auth-complete to renderer: success=true');
                    if (mainWindow && mainWindow.webContents) {
                        mainWindow.webContents.send('auth-complete', {
                            success: true,
                            token: token, // Pass original custom token to renderer
                            userId: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            plan: entitlements?.plan || 'free',
                        });
                        console.log('auth-complete sent successfully');
                    } else {
                        console.error('Cannot send auth-complete: mainWindow or webContents is null');
                    }
                } catch (error) {
                    console.error('Sign in failed:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    console.log('Sending auth-complete to renderer: success=false');
                    if (mainWindow && mainWindow.webContents) {
                        mainWindow.webContents.send('auth-complete', {
                            success: false,
                            error: 'Authentication failed: ' + error.message,
                        });
                        console.log('auth-complete (error) sent successfully');
                    }
                }
            } else {
                console.error('No token in callback URL');
                if (mainWindow && mainWindow.webContents) {
                    mainWindow.webContents.send('auth-complete', {
                        success: false,
                        error: 'No authentication token received',
                    });
                }
            }
        } else {
            console.log('Pathname did not match auth-callback:', urlObj.pathname);
        }
    } catch (error) {
        console.error('Auth callback error:', error);
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('auth-complete', {
                success: false,
                error: error.message,
            });
        }
    }
    console.log('=== Auth callback processing complete ===');
}

app.on('window-all-closed', () => {
    stopMacOSAudioCapture();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopMacOSAudioCapture();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

function setupStorageIpcHandlers() {
    // ============ CONFIG ============
    ipcMain.handle('storage:get-config', async () => {
        try {
            return { success: true, data: storage.getConfig() };
        } catch (error) {
            console.error('Error getting config:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:set-config', async (event, config) => {
        try {
            storage.setConfig(config);
            return { success: true };
        } catch (error) {
            console.error('Error setting config:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:update-config', async (event, key, value) => {
        try {
            storage.updateConfig(key, value);
            return { success: true };
        } catch (error) {
            console.error('Error updating config:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ CREDENTIALS ============
    ipcMain.handle('storage:get-credentials', async () => {
        try {
            return { success: true, data: storage.getCredentials() };
        } catch (error) {
            console.error('Error getting credentials:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:set-credentials', async (event, credentials) => {
        try {
            storage.setCredentials(credentials);
            return { success: true };
        } catch (error) {
            console.error('Error setting credentials:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:get-api-key', async () => {
        try {
            return { success: true, data: storage.getApiKey() };
        } catch (error) {
            console.error('Error getting API key:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:set-api-key', async (event, apiKey) => {
        try {
            storage.setApiKey(apiKey);
            return { success: true };
        } catch (error) {
            console.error('Error setting API key:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ PREFERENCES ============
    ipcMain.handle('storage:get-preferences', async () => {
        try {
            return { success: true, data: storage.getPreferences() };
        } catch (error) {
            console.error('Error getting preferences:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:set-preferences', async (event, preferences) => {
        try {
            storage.setPreferences(preferences);
            return { success: true };
        } catch (error) {
            console.error('Error setting preferences:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:update-preference', async (event, key, value) => {
        try {
            storage.updatePreference(key, value);
            return { success: true };
        } catch (error) {
            console.error('Error updating preference:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ KEYBINDS ============
    ipcMain.handle('storage:get-keybinds', async () => {
        try {
            return { success: true, data: storage.getKeybinds() };
        } catch (error) {
            console.error('Error getting keybinds:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:set-keybinds', async (event, keybinds) => {
        try {
            storage.setKeybinds(keybinds);
            return { success: true };
        } catch (error) {
            console.error('Error setting keybinds:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ HISTORY ============
    ipcMain.handle('storage:get-all-sessions', async () => {
        try {
            return { success: true, data: storage.getAllSessions() };
        } catch (error) {
            console.error('Error getting sessions:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:get-session', async (event, sessionId) => {
        try {
            return { success: true, data: storage.getSession(sessionId) };
        } catch (error) {
            console.error('Error getting session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:save-session', async (event, sessionId, data) => {
        try {
            storage.saveSession(sessionId, data);
            return { success: true };
        } catch (error) {
            console.error('Error saving session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:delete-session', async (event, sessionId) => {
        try {
            storage.deleteSession(sessionId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting session:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('storage:delete-all-sessions', async () => {
        try {
            storage.deleteAllSessions();
            return { success: true };
        } catch (error) {
            console.error('Error deleting all sessions:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ LIMITS ============
    ipcMain.handle('storage:get-today-limits', async () => {
        try {
            return { success: true, data: storage.getTodayLimits() };
        } catch (error) {
            console.error('Error getting today limits:', error);
            return { success: false, error: error.message };
        }
    });

    // ============ CLEAR ALL ============
    ipcMain.handle('storage:clear-all', async () => {
        try {
            storage.clearAllData();
            return { success: true };
        } catch (error) {
            console.error('Error clearing all data:', error);
            return { success: false, error: error.message };
        }
    });
}

function setupGeneralIpcHandlers() {
    ipcMain.handle('get-app-version', async () => {
        return app.getVersion();
    });

    ipcMain.handle('quit-application', async event => {
        try {
            stopMacOSAudioCapture();
            app.quit();
            return { success: true };
        } catch (error) {
            console.error('Error quitting application:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('open-external', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external URL:', error);
            return { success: false, error: error.message };
        }
    });

    ipcMain.on('update-keybinds', (event, newKeybinds) => {
        if (mainWindow) {
            // Also save to storage
            storage.setKeybinds(newKeybinds);
            updateGlobalShortcuts(newKeybinds, mainWindow, sendToRenderer, geminiSessionRef);
        }
    });

    // Debug logging from renderer
    ipcMain.on('log-message', (event, msg) => {
        console.log(msg);
    });
}

function setupAuthIpcHandlers() {
    // Get auth data
    ipcMain.handle('auth:get-data', async () => {
        try {
            return { success: true, data: storage.getAuthData() };
        } catch (error) {
            console.error('Error getting auth data:', error);
            return { success: false, error: error.message };
        }
    });

    // Set auth data
    ipcMain.handle('auth:set-data', async (event, authData) => {
        try {
            storage.setAuthData(authData);
            return { success: true };
        } catch (error) {
            console.error('Error setting auth data:', error);
            return { success: false, error: error.message };
        }
    });

    // Clear auth data (logout)
    ipcMain.handle('auth:logout', async () => {
        try {
            storage.clearAuthData();
            return { success: true };
        } catch (error) {
            console.error('Error clearing auth data:', error);
            return { success: false, error: error.message };
        }
    });

    // Check if logged in
    ipcMain.handle('auth:is-logged-in', async () => {
        try {
            return { success: true, data: storage.isLoggedIn() };
        } catch (error) {
            console.error('Error checking login status:', error);
            return { success: false, error: error.message };
        }
    });

    // Open auth URL in browser
    ipcMain.handle('auth:open-signin', async () => {
        try {
            // Open the website auth page in browser
            // Use localhost in development, production URL in build
            const authUrl = app.isPackaged ? 'https://co-interview.com/electron-auth' : 'http://localhost:3000/electron-auth';

            console.log('Opening auth URL:', authUrl);
            await shell.openExternal(authUrl);
            return { success: true };
        } catch (error) {
            console.error('Error opening auth URL:', error);
            return { success: false, error: error.message };
        }
    });

    // Open signup URL in browser
    ipcMain.handle('auth:open-signup', async () => {
        try {
            await shell.openExternal('https://co-interview.com/electron-auth?mode=signup');
            return { success: true };
        } catch (error) {
            console.error('Error opening signup URL:', error);
            return { success: false, error: error.message };
        }
    });
}
