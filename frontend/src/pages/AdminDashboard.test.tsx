import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from './AdminDashboard';
import { MemoryRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../lib/firebase', () => ({
    db: {},
    auth: { signOut: vi.fn() },
}));

const mockGetIdToken = vi.fn().mockResolvedValue('mock-token');
const mockUser = {
    email: 'admin@test.com',
    uid: 'admin-uid',
    getIdToken: mockGetIdToken,
};

vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockUser,
        loading: false,
    }),
}));

// Helper to create complete mock fetch implementation
const createMockFetch = (overrides: Record<string, any> = {}) => {
    return (url: string, options?: RequestInit) => {
        // Handle specific actions based on overrides - these must come BEFORE generic GETs
        if (url.includes('/seed-v2')) {
            if (overrides.seedError) return Promise.resolve({ ok: false, json: async () => ({ error: overrides.seedError }) });
            if (overrides.seedNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        if (url.includes('/terminate')) {
            if (overrides.terminateError) return Promise.resolve({ ok: false });
            if (overrides.terminateNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        if (url.includes('/disable') || url.includes('/enable')) {
            if (overrides.banError) return Promise.resolve({ ok: false });
            if (overrides.banNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        // PATCH user - logic to distinguish from user list
        // User list is usually /admin/users or /admin/users?
        // Individual user is /admin/users/ID
        // We can check if `options.method` is PATCH if we cared, but simple URL heuristic:
        // If it has /admin/users/ID (where ID is not seed/sessions etc)
        if (url.match(/\/admin\/users\/[^/?]+$/) && options?.method === 'PATCH') {
            if (overrides.saveError) return Promise.resolve({ ok: false });
            if (overrides.saveNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        if (url.includes('/admin/users') && !url.includes('/seed') && !url.includes('/disable') && !url.includes('/enable')) {
            return Promise.resolve({
                ok: true,
                json: async () => overrides.users ?? { users: [] },
            });
        }
        if (url.includes('/admin/analytics') && !url.includes('/ga')) {
            return Promise.resolve({
                ok: true,
                json: async () => overrides.analytics ?? { events: [] },
            });
        }
        if (url.includes('/admin/system/health')) {
            return Promise.resolve({
                ok: true,
                json: async () =>
                    overrides.health ?? {
                        geminiKeyConfigured: true,
                        activeSessionsCount: 0,
                        aggregateStats: { totalQuotaUsedSeconds: 0, totalQuotaUsedMinutes: 0, sampleUserCount: 0 },
                        plans: [],
                        timestamp: new Date().toISOString(),
                    },
            });
        }
        if (url.includes('/admin/sessions/active')) {
            return Promise.resolve({
                ok: true,
                json: async () => overrides.sessions ?? { sessions: [] },
            });
        }
        if (url.includes('/admin/analytics/ga')) {
            return Promise.resolve({
                ok: true,
                json: async () => overrides.ga ?? { activeUsers: 0, sessions: 0, screenPageViews: 0, eventCount: 0 },
            });
        }

        if (url.includes('/terminate')) {
            if (overrides.terminateError) return Promise.resolve({ ok: false });
            if (overrides.terminateNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        if (url.includes('/disable') || url.includes('/enable')) {
            if (overrides.banError) return Promise.resolve({ ok: false });
            if (overrides.banNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        // PATCH user
        if (url.includes('/admin/users/') && !url.includes('/disable') && !url.includes('/enable') && !url.includes('/sessions')) {
            if (overrides.saveError) return Promise.resolve({ ok: false });
            if (overrides.saveNetworkError) return Promise.reject(new Error('Network error'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        }

        // Default for other operations
        return Promise.resolve({ ok: true, json: async () => ({}) });
    };
};

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    it('shows loading state initially inside table', () => {
        (global.fetch as any).mockImplementation(() => new Promise(() => {}));
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('renders user list after API load', async () => {
        const mockUsers = [
            { id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() },
            { id: '2', email: 'user2@test.com', plan: 'pro', status: 'banned', createdAt: new Date().toISOString() },
        ];
        const mockEvents = [{ id: 'e1', eventName: 'nav_click', params: { label: 'Pricing' }, createdAt: new Date().toISOString() }];

        (global.fetch as any).mockImplementation(
            createMockFetch({
                users: { users: mockUsers },
                analytics: { events: mockEvents },
            })
        );

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('user1@test.com')).toBeInTheDocument();
            expect(screen.getByText('user2@test.com')).toBeInTheDocument();
        });
    });

    it('handles user editing success', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const editButton = screen.getByTitle('Edit Details');
        fireEvent.click(editButton);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'pro' } });

        const saveButton = screen.getByTitle('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/1'), expect.objectContaining({ method: 'PATCH' }));
        });
    });

    it('handles user editing failure', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers }, saveError: true }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const editButton = screen.getByTitle('Edit Details');
        fireEvent.click(editButton);

        const saveButton = screen.getByTitle('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to update user');
        });
        alertSpy.mockRestore();
    });

    it('handles user editing network error', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers }, saveNetworkError: true }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const editButton = screen.getByTitle('Edit Details');
        fireEvent.click(editButton);

        const saveButton = screen.getByTitle('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Update failed:', expect.any(Error));
        });
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('handles user toggle ban success', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const banButton = screen.getByTitle('Disable User');
        fireEvent.click(banButton);

        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/1/disable'), expect.objectContaining({ method: 'POST' }));
        });
        confirmSpy.mockRestore();
    });

    it('handles user toggle ban cancellation', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false); // Cancel

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const banButton = screen.getByTitle('Disable User');
        fireEvent.click(banButton);

        expect(confirmSpy).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/disable'), expect.anything());

        confirmSpy.mockRestore();
    });

    it('handles user toggle ban failure', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers }, banError: true }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const banButton = screen.getByTitle('Disable User');
        fireEvent.click(banButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to disable user');
        });
        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('opens user details modal', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const viewButton = screen.getByTitle('View Details');
        fireEvent.click(viewButton);

        await waitFor(() => {
            expect(screen.getByText(/Profile & Onboarding/i)).toBeInTheDocument();
        });
    });

    it('handles search filtering', async () => {
        const mockUsers = [
            { id: '1', email: 'john@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() },
            { id: '2', email: 'jane@test.com', plan: 'pro', status: 'active', createdAt: new Date().toISOString() },
        ];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('john@test.com')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText('Search email...');
        fireEvent.change(searchInput, { target: { value: 'jane' } });

        await waitFor(() => {
            expect(screen.queryByText('john@test.com')).not.toBeInTheDocument();
            expect(screen.getByText('jane@test.com')).toBeInTheDocument();
        });
    });

    it('handles cancel edit', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('user1@test.com')).toBeInTheDocument());

        const editButton = screen.getByTitle('Edit Details');
        fireEvent.click(editButton);

        const cancelButton = screen.getByTitle('Cancel');
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(screen.getByTitle('Edit Details')).toBeInTheDocument();
        });
    });

    it('handles active session termination success', async () => {
        const mockSessions = [
            {
                id: 'session-123',
                userId: 'user-1',
                userEmail: 'active@test.com',
                model: 'gemini-pro',
                startedAt: new Date().toISOString(),
                tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                planIdAtStart: 'pro',
            },
        ];
        (global.fetch as any).mockImplementation(createMockFetch({ sessions: { sessions: mockSessions } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('active@test.com')).toBeInTheDocument());

        const terminateButton = screen.getByText('Terminate');
        fireEvent.click(terminateButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/admin/sessions/session-123/terminate'),
                expect.objectContaining({ method: 'POST' })
            );
        });
        confirmSpy.mockRestore();
    });

    it('handles active session termination failure', async () => {
        const mockSessions = [
            {
                id: 's1',
                userId: 'u1',
                userEmail: 'a@t.com',
                startedAt: new Date().toISOString(),
                tokenExpiresAt: new Date().toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                planIdAtStart: 'free',
                model: 'gemini',
            },
        ];
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ sessions: { sessions: mockSessions }, terminateError: true }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('a@t.com')).toBeInTheDocument());

        const terminateButton = screen.getByText('Terminate');
        fireEvent.click(terminateButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to terminate session');
        });
        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('handles active session termination cancellation', async () => {
        const mockSessions = [
            {
                id: 's1',
                userId: 'u1',
                userEmail: 'a@t.com',
                startedAt: new Date().toISOString(),
                tokenExpiresAt: new Date().toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                planIdAtStart: 'free',
                model: 'gemini',
            },
        ];
        (global.fetch as any).mockImplementation(createMockFetch({ sessions: { sessions: mockSessions } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('a@t.com')).toBeInTheDocument());

        const terminateButton = screen.getByText('Terminate');
        fireEvent.click(terminateButton);

        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/terminate'), expect.anything());
        confirmSpy.mockRestore();
    });

    it('handles seed user failure', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ seedError: 'Some error' }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        const seedButton = screen.getByText('Seed Test User');
        fireEvent.click(seedButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to seed user: Some error');
        });
        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('handles seed user network error', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ seedNetworkError: true }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        const seedButton = screen.getByText('Seed Test User');
        fireEvent.click(seedButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Seed failed:', expect.any(Error));
        });
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('handles seed user cancellation', async () => {
        (global.fetch as any).mockImplementation(createMockFetch({}));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        const seedButton = screen.getByText('Seed Test User');
        fireEvent.click(seedButton);

        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/seed-v2'), expect.anything());
        confirmSpy.mockRestore();
    });

    it('handles logout', async () => {
        const { auth } = await import('../lib/firebase');
        (global.fetch as any).mockImplementation(createMockFetch({}));
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        const logoutButton = screen.getByText('Sign Out');
        fireEvent.click(logoutButton);

        expect(auth.signOut).toHaveBeenCalled();
    });

    it('handles system health fetch failure gracefuly', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/health')) return Promise.reject(new Error('Fetch failed'));
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching dashboard data:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('handles active session termination network error', async () => {
        const mockSessions = [
            {
                id: 's1',
                userId: 'u1',
                userEmail: 'a@t.com',
                startedAt: new Date().toISOString(),
                tokenExpiresAt: new Date().toISOString(),
                lastHeartbeatAt: new Date().toISOString(),
                planIdAtStart: 'free',
                model: 'gemini',
            },
        ];
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ sessions: { sessions: mockSessions }, terminateNetworkError: true }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText('a@t.com')).toBeInTheDocument());

        const terminateButton = screen.getByText('Terminate');
        fireEvent.click(terminateButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Terminate failed:', expect.any(Error));
            expect(alertSpy).toHaveBeenCalledWith('Terminate failed');
        });
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('closes user details modal', async () => {
        const mockUsers = [{ id: 'u1', email: 'details@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await screen.findByText('details@test.com');

        const viewBtn = screen.getByTitle('View Details');
        fireEvent.click(viewBtn);

        await screen.findByText('Profile & Onboarding');

        const closeBtn = screen.getByLabelText('Close modal');
        fireEvent.click(closeBtn);

        await waitFor(() => expect(screen.queryByText('Profile & Onboarding')).not.toBeInTheDocument());
    });

    it('handles GA data errors', async () => {
        (global.fetch as any).mockImplementation(
            createMockFetch({
                ga: { error: 'Config not found' },
            })
        );
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(screen.getByText('Config Required')).toBeInTheDocument();
        });
    });

    it('handles seed user cancellation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false);
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        // Wait for header button
        await waitFor(() => expect(screen.getByText('Seed Test User')).toBeInTheDocument());
        const seedBtn = screen.getByText('Seed Test User');
        fireEvent.click(seedBtn);
        expect(window.confirm).toHaveBeenCalled();
    });

    it('handles session termination cancellation', async () => {
        const mockSessions = {
            sessions: [
                {
                    id: 'sess_1',
                    userId: 'u1',
                    userEmail: 'test@test.com',
                    startedAt: new Date().toISOString(),
                    tokenExpiresAt: new Date().toISOString(),
                    planIdAtStart: 'free',
                },
            ],
        };
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/active')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSessions) });
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: [], events: [], sessions: [] }) });
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('test@test.com')).toBeInTheDocument());

        vi.spyOn(window, 'confirm').mockReturnValue(false);
        const terminateBtn = screen.getByText('Terminate');
        fireEvent.click(terminateBtn);
        expect(window.confirm).toHaveBeenCalled();
        expect(fetch).not.toHaveBeenCalledWith(expect.stringContaining('/terminate'), expect.anything());
    });

    it('handles seed user success', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({})); // Success default
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('Seed Test User')).toBeInTheDocument());

        const seedBtn = screen.getByText('Seed Test User');
        fireEvent.click(seedBtn);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Test user created!');
        });
        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('handles disable user success', async () => {
        const mockUsers = [{ id: 'u1', email: 'ban@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('ban@test.com')).toBeInTheDocument());

        const banBtn = screen.getByTitle('Disable User');
        fireEvent.click(banBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/u1/disable'), expect.any(Object));
        });
        confirmSpy.mockRestore();
    });

    it('handles enable user success', async () => {
        const mockBannedUsers = [{ id: 'u1', email: 'ban@test.com', plan: 'free', status: 'banned', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockBannedUsers } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('ban@test.com')).toBeInTheDocument());

        const unbanBtn = screen.getByTitle('Enable User');
        fireEvent.click(unbanBtn);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/u1/enable'), expect.any(Object));
        });
        confirmSpy.mockRestore();
    });

    it('handles toggle ban failure', async () => {
        const mockUsers = [{ id: 'u1', email: 'fail@test.com', status: 'active' }];
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers }, banError: true }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('fail@test.com')).toBeInTheDocument());

        const banBtn = screen.getByTitle('Disable User');
        fireEvent.click(banBtn);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Failed to disable user');
        });
        alertSpy.mockRestore();
        confirmSpy.mockRestore();
    });

    it('handles toggle ban cancellation', async () => {
        const mockUsers = [{ id: 'u1', email: 'cancel@test.com', status: 'active' }];
        (global.fetch as any).mockImplementation(createMockFetch({ users: { users: mockUsers } }));
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText('cancel@test.com')).toBeInTheDocument());

        const banBtn = screen.getByTitle('Disable User');
        fireEvent.click(banBtn);

        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/disable'), expect.anything());
        confirmSpy.mockRestore();
    });
});
