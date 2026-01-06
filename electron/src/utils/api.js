const { app } = require('electron');
const { getAuthData } = require('../storage');

// Backend URL Configuration
// In production, this should be set via environment variable or build config
const BACKEND_URL = process.env.BACKEND_URL || 'https://api.co-interview.com';
const DEV_BACKEND_URL = 'http://localhost:8080'; // Or 8080 depending on backend port

// Helper to get active backend URL
function getBaseUrl() {
    return app.isPackaged ? BACKEND_URL : DEV_BACKEND_URL;
}

// Helper to get headers with Auth Token
function getHeaders() {
    const authData = getAuthData();
    const headers = {
        'Content-Type': 'application/json',
    };

    // We use the ID Token for authentication
    // Note: ID Tokens expire after 1 hour. We might need logic to refresh it via Firebase SDK
    // But for MVP Phase A, we assume the token in storage is valid (refreshed by Renderer login)
    if (authData.idToken) {
        headers['Authorization'] = `Bearer ${authData.idToken}`;
    }

    return headers;
}

/**
 * Fetch User Profile & Entitlements
 * Returns plan details and usage limits.
 */
async function fetchUserProfile() {
    try {
        const response = await fetch(`${getBaseUrl()}/api/v1/users/me`, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Profile fetch failed: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (fetchUserProfile):', error);
        throw error;
    }
}

/**
 * Start a Realtime Session (Managed Mode)
 * Request a session token and check concurrency limits.
 */
async function startSession(clientInfo = {}) {
    try {
        const response = await fetch(`${getBaseUrl()}/api/v1/realtime/session`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                ...clientInfo,
                mode: 'managed',
            }),
        });

        if (!response.ok) {
            const errorText = await response.json().catch(() => ({ error: 'Unknown error' }));
            const message = errorText.error || errorText.message || 'Failed to start session';

            // Check specific error codes
            if (response.status === 402) throw new Error('QUOTA_EXCEEDED');
            if (response.status === 409) throw new Error('CONCURRENCY_LIMIT');
            if (response.status === 403) throw new Error('FORBIDDEN');

            throw new Error(message);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (startSession):', error);
        throw error;
    }
}

/**
 * Send Heartbeat
 * Update server with elapsed time and check if we should continue.
 */
async function sendHeartbeat(sessionId, elapsedSeconds) {
    try {
        const response = await fetch(`${getBaseUrl()}/api/v1/realtime/heartbeat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                session_id: sessionId,
                elapsed_seconds: elapsedSeconds,
            }),
        });

        if (!response.ok) {
            // If 402/403/404, we likely need to stop
            if ([402, 403, 404].includes(response.status)) {
                return { continue: false, reason: 'server_rejection' };
            }
            // For 500s (server error), we might want to continue (fail open) vs fail closed
            // Phase A: Fail Open (allow user to continue if server glitches)
            return { continue: true, reason: 'server_error_ignored' };
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (sendHeartbeat):', error);
        // Network glitch -> assume safe to continue for short outages
        return { continue: true, error: error.message };
    }
}

/**
 * End Session
 * Report final duration and close clean.
 */
async function endSession(sessionId, durationSeconds, reason = 'user_ended') {
    try {
        await fetch(`${getBaseUrl()}/api/v1/realtime/session/${sessionId}/end`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                duration_seconds: durationSeconds,
                reason,
            }),
        });
    } catch (error) {
        // Best effort
        console.error('API Warning (endSession):', error);
    }
}
/**
 * Analyze Screenshot (Backend Proxy)
 * Sends screenshot to backend for analysis using master key.
 */
async function analyzeScreenshot(base64Image, prompt, model = 'gemini-2.5-flash') {
    try {
        const response = await fetch(`${getBaseUrl()}/api/v1/analyze/screenshot`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                image: base64Image,
                prompt: prompt,
                model: model,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            if (response.status === 402) {
                throw new Error('QUOTA_EXCEEDED');
            }
            throw new Error(errorData.error || 'Screenshot analysis failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error (analyzeScreenshot):', error);
        throw error;
    }
}

module.exports = {
    fetchUserProfile,
    startSession,
    sendHeartbeat,
    endSession,
    analyzeScreenshot,
};
