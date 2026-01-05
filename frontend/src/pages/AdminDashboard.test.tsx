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

describe('AdminDashboard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        global.fetch = vi.fn();
    });

    it('shows loading state initially inside table', () => {
        // Mock fetch to never resolve immediately to check loading state
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

        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/admin/users')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ users: mockUsers }),
                });
            }
            if (url.includes('/admin/analytics')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ events: mockEvents }),
                });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('user1@test.com')).toBeInTheDocument();
            expect(screen.getByText('user2@test.com')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users'), expect.any(Object));
    });
    it('handles user editing', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/admin/users')) {
                return Promise.resolve({ ok: true, json: async () => ({ users: mockUsers }) });
            }
            if (url.includes('/admin/analytics')) {
                return Promise.resolve({ ok: true, json: async () => ({ events: [] }) });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

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

        (global.fetch as any).mockImplementationOnce(() => Promise.resolve({ ok: true }));

        const saveButton = screen.getByTitle('Save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/admin/users/1'), expect.objectContaining({ method: 'PATCH' }));
        });
    });

    it('handles user toggle ban', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/admin/users')) {
                return Promise.resolve({ ok: true, json: async () => ({ users: mockUsers }) });
            }
            if (url.includes('/admin/analytics')) {
                return Promise.resolve({ ok: true, json: async () => ({ events: [] }) });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

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
    });

    it('opens user details modal', async () => {
        const mockUsers = [{ id: '1', email: 'user1@test.com', plan: 'free', status: 'active', createdAt: new Date().toISOString() }];
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/admin/users')) {
                return Promise.resolve({ ok: true, json: async () => ({ users: mockUsers }) });
            }
            if (url.includes('/admin/analytics')) {
                return Promise.resolve({ ok: true, json: async () => ({ events: [] }) });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });

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

    it('renders analytics cards', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/ga')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ activeUsers: 150, sessions: 200, screenPageViews: 500, eventCount: 1000 }),
                });
            }
            return Promise.resolve({ ok: true, json: async () => ({ users: [], events: [] }) });
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('150')).toBeInTheDocument();
            expect(screen.getByText('200')).toBeInTheDocument();
            expect(screen.getByText('500')).toBeInTheDocument();
        });
    });
});
