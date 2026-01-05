import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardHomePage from './DashboardHomePage';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock pricing tiers
vi.mock('../../content/pricing', () => ({
    pricingTiers: [{ id: 'lifetime', paymentLink: 'https://stripe.com/lifetime' }],
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

        const lifetimeButton = screen.getByText(/Get Lifetime package/i);
        fireEvent.click(lifetimeButton);

        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('stripe.com/lifetime?client_reference_id=user123'), '_blank');
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

    it('updates countdown timer over time', async () => {
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
});
