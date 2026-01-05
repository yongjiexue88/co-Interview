// Analytics utility for Electron
// Tracks events using Firebase Analytics with Measurement Protocol fallback

const { getAnalytics, logEvent, isSupported } = require('firebase/analytics');
const { app } = require('./firebase');
const { app: electronApp } = require('electron');

let analyticsInstance = null;
let analyticsEnabled = false;
let clientId = null;
const MEASUREMENT_ID = 'G-3ENXT54XQN'; // Hardcoded fallback or use env
const API_SECRET = process.env.GA_API_SECRET; // Optional for verified events

// Initialize analytics
async function initAnalytics() {
    try {
        const supported = await isSupported();
        if (supported) {
            analyticsInstance = getAnalytics(app);
            analyticsEnabled = true;
            console.log('[Analytics] Firebase Analytics initialized (Web SDK)');
        } else {
            console.warn('[Analytics] Firebase Analytics SDK not supported. Using Measurement Protocol fallback.');
            analyticsEnabled = true; // Enable anyway for fallback
            // Generate or retrieve persistent client ID

            // const Store = require('electron-store');
            // const store = new Store();
            // if (!store.get('analytics_client_id')) {
            //     store.set('analytics_client_id', require('crypto').randomUUID());
            // }
            // clientId = store.get('analytics_client_id');

            // Simple in-memory fallback if store not available immediately, 
            // but ideally should persist. For now let's generate one per session to avoid crashes if store isn't setup.
            clientId = require('crypto').randomUUID();
            console.log('[Analytics] Generated Client ID:', clientId);
        }
    } catch (error) {
        console.error('[Analytics] Failed to initialize:', error);
        // Still try to enable for fallback
        analyticsEnabled = true;
    }
}

// Track an event
async function trackEvent(eventName, eventParams = {}) {
    if (!analyticsEnabled) {
        await initAnalytics();
    }

    // 1. Try Firebase SDK
    if (analyticsInstance) {
        try {
            logEvent(analyticsInstance, eventName, eventParams);
            console.log('[Analytics] Event tracked (SDK):', eventName);
            return;
        } catch (e) {
            console.warn('[Analytics] SDK tracking failed, trying fallback...');
        }
    }

    // 2. Fallback to Measurement Protocol
    // https://www.google-analytics.com/mp/collect?measurement_id=G-XXXX&api_secret=XXXX
    try {
        const body = {
            client_id: clientId || 'electron_user',
            events: [{
                name: eventName,
                params: {
                    ...eventParams,
                    app_name: 'Co-Interview',
                    app_version: electronApp ? electronApp.getVersion() : '1.0.0',
                    platform: process.platform
                }
            }]
        };

        // Note: Without an API Secret, this might be restricted.
        const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET || ''}`;

        if (typeof fetch !== 'undefined') {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(body)
            });
        }
        console.log('[Analytics] Event tracked (MP):', eventName);
    } catch (error) {
        console.error('[Analytics] Detailed tracking failed:', error);
    }
}

// Track page view
async function trackPageView(pageName, pageParams = {}) {
    await trackEvent('page_view', {
        page_title: pageName,
        ...pageParams,
    });
}

// For testing purposes
function __resetForTesting() {
    analyticsInstance = null;
    analyticsEnabled = false;
    clientId = null;
}

module.exports = {
    initAnalytics,
    trackEvent,
    trackPageView,
    __resetForTesting,
};
