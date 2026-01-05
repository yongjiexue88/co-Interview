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
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/dashboard' }),
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

        // Minutes should still be 28 since it starts at 28:00
        // Seconds would have decreased to 59, minutes to 27
        expect(screen.getByText('27')).toBeInTheDocument(); // Minutes
        expect(screen.getByText('59')).toBeInTheDocument(); // Seconds

        vi.useRealTimers();
    });
});
