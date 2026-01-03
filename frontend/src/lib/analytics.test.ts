import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackEvent, trackPageView } from './analytics';
import { logEvent } from 'firebase/analytics';

// Mock the firebase module to avoid real network calls and initialization
vi.mock('./firebase', async importOriginal => {
    const actual = await importOriginal<typeof import('./firebase')>();
    return {
        ...actual,
        db: {
            collection: vi.fn(),
        },
        analytics: {
            logEvent: vi.fn(),
        },
        app: {},
    };
});

// Mock firebase/analytics
vi.mock('firebase/analytics', () => ({
    logEvent: vi.fn(),
    isSupported: vi.fn().mockResolvedValue(true),
    getAnalytics: vi.fn(),
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(),
}));

describe('Analytics Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('trackEvent calls logEvent with correct parameters', async () => {
        const eventName = 'test_click';
        const params = { button_id: 'submit' };

        await trackEvent(eventName, params);

        expect(logEvent).toHaveBeenCalledTimes(1);
        // The first arg is the analytics instance, which is the mock object
        expect(logEvent).toHaveBeenCalledWith(expect.anything(), eventName, params);
    });

    it('trackPageView calls trackEvent with page_view and path', async () => {
        const path = '/home';

        await trackPageView(path);

        expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'page_view', { page_path: path });
    });
});
