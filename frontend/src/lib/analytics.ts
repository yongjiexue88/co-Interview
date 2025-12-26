import { logEvent, Analytics } from "firebase/analytics";
import { analytics, db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Helper to log analytic events safely
export const trackEvent = async (eventName: string, eventParams?: { [key: string]: any }) => {
    try {
        // 1. Log to Google Analytics (Firebase)
        const analyticsInstance = await analytics;
        if (analyticsInstance) {
            logEvent(analyticsInstance, eventName, eventParams);

            // Log to console in development for debugging
            if (import.meta.env.DEV) {
                console.log(`[Analytics] Event: ${eventName}`, eventParams);
            }
        }

        // 2. Log to Firestore for Admin Dashboard (Fire and forget)
        // We don't await this to avoid blocking UI interactions
        try {
            await addDoc(collection(db, 'analytics_events'), {
                eventName,
                params: eventParams || {},
                createdAt: serverTimestamp(),
                url: window.location.pathname
            });
        } catch (dbError) {
            console.warn("Failed to log event to Firestore:", dbError);
        }

    } catch (error) {
        console.error("Failed to log analytics event:", error);
    }
};

// Use this for page views specifically if manual tracking is needed beyond SPA hook
export const trackPageView = async (page_path: string) => {
    trackEvent("page_view", { page_path });
};
