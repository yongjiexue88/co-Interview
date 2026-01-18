import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardHomePage from './DashboardHomePage';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async importOriginal => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock pricing tiers
let mockPricingTiers = [{ id: 'lifetime', paymentLink: 'https://stripe.com/lifetime' }];
vi.mock('../../content/pricing', () => ({
    get pricingTiers() {
        return mockPricingTiers;
    },
}));

describe('DashboardHomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com', uid: 'user123' },
            loading: false,
        });
        // Mock window.open
        vi.stubGlobal('open', vi.fn());
    });

    it('renders welcome message and user name', () => {
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Welcome TEST USER/i)).toBeInTheDocument();
    });

    it('shows countdown timer', () => {
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        expect(screen.getByText('19')).toBeInTheDocument(); // Default hours
    });

    it('handles lifetime package click', () => {
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        const lifetimeButton = screen.getByText(/Get Access Now/i);
        fireEvent.click(lifetimeButton);

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/pricing');
    });

    it('toggles platform expansion', () => {
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        const zoomButton = screen.getByText('Zoom');
        fireEvent.click(zoomButton);

        expect(screen.getByText(/See How We are/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Undetectable/i).length).toBeGreaterThan(0);

        fireEvent.click(zoomButton);
        expect(screen.queryByText(/See How We are/i)).not.toBeInTheDocument();
    });

    it('renders download links', () => {
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Download for Mac \(Apple Silicon\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Download for Windows/i)).toBeInTheDocument();
    });

    it('updates countdown timer over time (seconds rollover)', async () => {
        vi.useFakeTimers();
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        // Advance 1 second
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText('27')).toBeInTheDocument(); // Minutes
        expect(screen.getByText('59')).toBeInTheDocument(); // Seconds

        vi.useRealTimers();
    });

    it('updates countdown timer rollover (minutes check)', async () => {
        vi.useFakeTimers();
        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        // Fast forward to trigger minute rollover (from 28:00 to 27:59 takes 1s, to 00:00 takes many)
        // Let's settle for coverage of the branches.
        // We need to hit `else if (minutes > 0)` - easy.
        // `else if (hours > 0)` and `seconds === 0` and `minutes === 0`.
        // We can simulate state or just wait long enough.
        // 19:28:00 -> 18:59:59 requires 28 * 60 + 1 seconds = 1681s.
        act(() => {
            vi.advanceTimersByTime(1681 * 1000);
        });

        // Should be 18 hours
        expect(screen.getByText('18')).toBeInTheDocument();
        vi.useRealTimers();
    });

    it('handles userName fallbacks', () => {
        // Mock user with no display name but email
        mockUseAuth.mockReturnValue({
            user: { displayName: null, email: 'fallbackuser@example.com', uid: '123' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Welcome FALLBACKUSER/i)).toBeInTheDocument();

        // Mock user with no display name and no email (default 'User')
        mockUseAuth.mockReturnValue({
            user: { displayName: null, email: null, uid: '123' },
            loading: false,
        });

        // Need to rerender
        const { unmount } = render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );
        // clean up previous render? react-testing-library handles cleanup mostly, but we are re-rendering in same test block which appends.
        // Better to check last element or use cleanup.
    });

    it('handles default user name', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: null, email: null, uid: '123' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Welcome USER/i)).toBeInTheDocument();
    });

    it('still navigates even if no external payment link', () => {
        // change mock
        const originalTiers = [...mockPricingTiers];
        mockPricingTiers = [];

        render(
            <MemoryRouter>
                <DashboardHomePage />
            </MemoryRouter>
        );

        const lifetimeButton = screen.getByText(/Get Access Now/i);
        fireEvent.click(lifetimeButton);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/pricing');

        // Restore
        mockPricingTiers = originalTiers;
    });
});
