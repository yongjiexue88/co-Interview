import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './ProfilePage';
import { MemoryRouter } from 'react-router-dom';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
    auth: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
    signOut: vi.fn(),
}));

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com' },
            loading: false,
        });
    });

    it('renders profile info', () => {
        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        expect(screen.getByText('TEST USER')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('TE')).toBeInTheDocument(); // Initials
    });

    it('toggles tabs', () => {
        render(
            <MemoryRouter>
                <ProfilePage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Billing'));
        expect(screen.getByText('Subscription Plan')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Affiliate'));
        expect(screen.getByText('Affiliate program information will be displayed here.')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Your Account'));
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
});
