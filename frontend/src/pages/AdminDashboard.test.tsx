import { render, screen, waitFor } from '@testing-library/react';
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
    it('calls seed endpoint when Seed Test User is clicked and confirmed', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/admin/users/seed-v2')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ success: true }),
                });
            }
            if (url.includes('/admin/users') || url.includes('/admin/analytics')) {
                return Promise.resolve({ ok: true, json: async () => ({ users: [], events: [] }) });
            }
            return Promise.reject(new Error('Unknown URL'));
        });

        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm');
        confirmSpy.mockImplementation(() => true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Seed Test User')).toBeInTheDocument();
        });

        const seedButton = screen.getByText('Seed Test User');
        seedButton.click();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/seed-v2'),
                expect.objectContaining({
                    method: 'POST',
                })
            );
            expect(alertSpy).toHaveBeenCalledWith('Test user created!');
        });
    });
});
