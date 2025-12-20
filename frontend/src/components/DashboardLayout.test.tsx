import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardLayout from './DashboardLayout';
import { MemoryRouter } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    auth: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
    signOut: vi.fn(),
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
// We'll mock useLocation to return a mocked value we can change, OR we rely on MemoryRouter.
// DashboardLayout uses useLocation(). existing mock forces '/dashboard'.
// We should change the mock to let useLocation work naturally with MemoryRouter or mock it to listen to some state.
// simplest is to remove useLocation from the mock return and let react-router-dom handle it, but we need `vi.importActual`.
// The existing mock implementation:
/*
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/dashboard' }), // This forces pathname
    };
});
*/
// I will change this mock to allow variable pathnames or use actual useLocation.
let mockPathname = '/dashboard';
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: mockPathname }),
    };
});

describe('DashboardLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com' },
            loading: false,
        });
    });

    it('renders sidebar links', () => {
        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Pricing')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('handles sign out', async () => {
        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(signOut).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('shows loading state', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        const { container } = render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('redirects to signin if not logged in', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });

        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    it('updates countdown timer over time', async () => {
        vi.useFakeTimers();
        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        // Initial hours
        expect(screen.getByText('19')).toBeInTheDocument();

        // Advance 1 second
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // 19:28:00 -> 19:27:59
        // 28 mins -> 27 mins, 00 secs -> 59 secs.
        // Wait, start is 19:28:00.
        // after 1s: 19:27:59.
        expect(screen.getByText('27')).toBeInTheDocument(); // Minutes
        expect(screen.getByText('59')).toBeInTheDocument(); // Seconds

        vi.useRealTimers();
    });

    it('handles logout error', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(signOut).mockRejectedValueOnce(new Error('Logout failed'));

        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('highlights active route link', () => {
        // Change mock pathname
        mockPathname = '/dashboard/pricing';

        render(
            <MemoryRouter>
                <DashboardLayout />
            </MemoryRouter>
        );

        const pricingLink = screen.getByText('Pricing').closest('a');
        expect(pricingLink).toHaveClass('bg-white/10');

        const homeLink = screen.getByText('Home').closest('a');
        expect(homeLink).not.toHaveClass('bg-white/10');
    });
});
