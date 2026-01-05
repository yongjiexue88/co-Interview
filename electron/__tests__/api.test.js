const { fetchUserProfile, startSession, sendHeartbeat, endSession } = require('../src/utils/api');
const { getAuthData } = require('../src/storage');
const { app } = require('electron');

// Mock dependencies
jest.mock('electron', () => ({
    app: {
        isPackaged: false,
    },
}));

jest.mock('../src/storage', () => ({
    getAuthData: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('api.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getAuthData.mockReturnValue({ idToken: 'test-token' });
    });

    describe('fetchUserProfile', () => {
        it('fetches profile successfully', async () => {
            const mockUser = { email: 'test@example.com', plan: 'pro' };
            fetch.mockResolvedValue({
                ok: true,
                json: async () => mockUser,
            });

            const result = await fetchUserProfile();
            expect(result).toEqual(mockUser);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/users/me'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                    }),
                })
            );
        });

        it('handles fetch error', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized',
            });

            await expect(fetchUserProfile()).rejects.toThrow('Profile fetch failed: 401 Unauthorized');
        });
    });

    describe('startSession', () => {
        it('starts session successfully', async () => {
            const mockSession = { session_id: '123' };
            fetch.mockResolvedValue({
                ok: true,
                json: async () => mockSession,
            });

            const result = await startSession({ device: 'mac' });
            expect(result).toEqual(mockSession);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/realtime/session'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"device":"mac"'),
                })
            );
        });

        it('handles quota exceeded (402)', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 402,
                json: async () => ({ error: 'Out of time' }),
            });

            await expect(startSession()).rejects.toThrow('QUOTA_EXCEEDED');
        });

        it('handles concurrency limit (409)', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 409,
                json: async () => ({ error: 'Too many sessions' }),
            });

            await expect(startSession()).rejects.toThrow('CONCURRENCY_LIMIT');
        });
    });

    describe('sendHeartbeat', () => {
        it('sends heartbeat and continues', async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ continue: true }),
            });

            const result = await sendHeartbeat('123', 60);
            expect(result.continue).toBe(true);
        });

        it('handles rejection (402)', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 402,
            });

            const result = await sendHeartbeat('123', 60);
            expect(result.continue).toBe(false);
            expect(result.reason).toBe('server_rejection');
        });

        it('fails open for 500 errors', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 500,
            });

            const result = await sendHeartbeat('123', 60);
            expect(result.continue).toBe(true);
            expect(result.reason).toBe('server_error_ignored');
        });

        it('handles network error (fails open)', async () => {
            fetch.mockRejectedValue(new Error('Network Error'));

            const result = await sendHeartbeat('123', 60);
            expect(result.continue).toBe(true);
            expect(result.error).toBe('Network Error');
        });
    });

    describe('endSession', () => {
        it('ends session successfully', async () => {
            fetch.mockResolvedValue({ ok: true });

            await endSession('123', 300);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/realtime/session/123/end'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"duration_seconds":300'),
                })
            );
        });
    });
});
