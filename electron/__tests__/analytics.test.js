const {
    initAnalytics,
    trackEvent,
    trackPageView,
    __resetForTesting
} = require('../src/utils/analytics');

const { isSupported, getAnalytics, logEvent } = require('firebase/analytics');

jest.mock('firebase/analytics', () => ({
    getAnalytics: jest.fn(() => ({})),
    logEvent: jest.fn(),
    isSupported: jest.fn(),
}));

jest.mock('../src/utils/firebase', () => ({
    app: {},
}));

// Mock global fetch if not present
if (typeof global.fetch === 'undefined') {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true }));
}

describe('Analytics Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        __resetForTesting();
    });

    it('should initialize analytics if supported', async () => {
        isSupported.mockResolvedValue(true);
        await initAnalytics();
        expect(getAnalytics).toHaveBeenCalled();
    });

    it('should not initialize analytics if not supported', async () => {
        isSupported.mockResolvedValue(false);
        await initAnalytics();
        expect(getAnalytics).not.toHaveBeenCalled();
    });

    it('should track event if enabled', async () => {
        isSupported.mockResolvedValue(true);
        await initAnalytics(); // enable it

        await trackEvent('test_event', { param: 1 });
        expect(logEvent).toHaveBeenCalledWith(expect.any(Object), 'test_event', { param: 1 });
    });

    it('should track page view as event', async () => {
        isSupported.mockResolvedValue(true);
        await initAnalytics(); // enable it

        await trackPageView('home', { foo: 'bar' });
        expect(logEvent).toHaveBeenCalledWith(expect.any(Object), 'page_view', expect.objectContaining({ page_title: 'home', foo: 'bar' }));
    });

    it('should gracefully handle initialization error', async () => {
        isSupported.mockRejectedValue(new Error('Fail'));
        await initAnalytics();
        // Should allow subsequent calls without crash, just log warning
        await trackEvent('test');
        expect(logEvent).not.toHaveBeenCalled();
    });

    it('should handle trackEvent error', async () => {
        isSupported.mockResolvedValue(true);
        await initAnalytics();
        logEvent.mockImplementation(() => { throw new Error('Log fail'); });
        await trackEvent('buggy_event');
        // Should not crash
    });
});
