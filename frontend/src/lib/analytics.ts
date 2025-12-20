import { logEvent } from 'firebase/analytics';
import { analytics, db, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Cache IP address to avoid redundant requests
let cachedIp: string | null = null;

const getPublicIp = async () => {
    if (cachedIp) return cachedIp;
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        cachedIp = data.ip;
        return data.ip;
    } catch (error) {
        // Fail silently or warn in dev
        if (import.meta.env.DEV) console.warn('Failed to fetch public IP:', error);
        return null; // Return null if IP fetch fails
    }
};

// Helper to log analytic events safely
export const trackEvent = async (eventName: string, eventParams?: { [key: string]: any }) => {
    try {
        // 1. Log to Google Analytics (Firebase)
        const analyticsInstance = await analytics;
        if (analyticsInstance) {
            logEvent(analyticsInstance, eventName, eventParams);

            // Log to console in development for debugging
            if (import.meta.env.DEV) {
                // console.log(`[Analytics] Event: ${eventName}`, eventParams);
            }
        }

        // 2. Log to Firestore for Admin Dashboard (Fire and forget)
        // We don't await this to avoid blocking UI interactions
        try {
            const user = auth.currentUser;
            const ip = await getPublicIp();

            await addDoc(collection(db, 'analytics_events'), {
                eventName,
                params: eventParams || {},
                createdAt: serverTimestamp(),
                clientTimestamp: new Date().toISOString(),
                url: window.location.pathname,
                userId: user?.uid || null,
                userEmail: user?.email || null,
                ip: ip,
                userAgent: navigator.userAgent,
            });
        } catch (dbError) {
            console.warn('Failed to log event to Firestore:', dbError);
        }
    } catch (error) {
        console.error('Failed to log analytics event:', error);
    }
};

// Use this for page views specifically if manual tracking is needed beyond SPA hook
export const trackPageView = async (page_path: string) => {
    trackEvent('page_view', { page_path });
};
