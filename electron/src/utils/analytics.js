// Analytics utility for Electron
// Tracks events using Firebase Analytics

const { getAnalytics, logEvent, isSupported } = require('firebase/analytics');
const { app } = require('./firebase');

let analyticsInstance = null;
let analyticsEnabled = false;

// Initialize analytics
async function initAnalytics() {
    try {
        const supported = await isSupported();
        if (supported) {
            analyticsInstance = getAnalytics(app);
            analyticsEnabled = true;
            console.log('[Analytics] Firebase Analytics initialized');
        } else {
            console.warn('[Analytics] Firebase Analytics not supported in this environment');
        }
    } catch (error) {
        console.error('[Analytics] Failed to initialize:', error);
        analyticsEnabled = false;
    }
}

// Track an event
async function trackEvent(eventName, eventParams = {}) {
    if (!analyticsEnabled) {
        // Initialize on first call if not already done
        await initAnalytics();
    }

    if (!analyticsEnabled || !analyticsInstance) {
        console.log('[Analytics] Event not tracked (disabled):', eventName, eventParams);
        return;
    }

    try {
        logEvent(analyticsInstance, eventName, eventParams);
        console.log('[Analytics] Event tracked:', eventName, eventParams);
    } catch (error) {
        console.error('[Analytics] Failed to track event:', eventName, error);
    }
}

// Track page view
async function trackPageView(pageName, pageParams = {}) {
    await trackEvent('page_view', {
        page_title: pageName,
        ...pageParams,
    });
}

module.exports = {
    initAnalytics,
    trackEvent,
    trackPageView,
};
