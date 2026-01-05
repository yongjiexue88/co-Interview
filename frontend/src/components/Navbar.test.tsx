import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';
import { MemoryRouter } from 'react-router-dom';
import { signOut } from 'firebase/auth';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    auth: {},
    googleProvider: {},
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

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });
    });

    it('renders desktop links', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText('Proof')).toBeInTheDocument();
        expect(screen.getByText('Pricing')).toBeInTheDocument();
        expect(screen.getByText('Co-Interview')).toBeInTheDocument();
    });

    it('toggles mobile menu', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const buttons = screen.getAllByRole('button');
        const toggle = buttons[buttons.length - 1];

        fireEvent.click(toggle);
        expect(screen.getAllByText('Download for Free')[0]).toBeInTheDocument();
    });

    it('renders user avatar when logged in', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('toggles user dropdown', () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const avatarButton = screen.getByText('T').closest('button')!;
        fireEvent.click(avatarButton);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    it('handles logout', async () => {
        mockUseAuth.mockReturnValue({
            user: { displayName: 'Test User', email: 'test@example.com' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const avatarButton = screen.getByText('T').closest('button')!;
        fireEvent.click(avatarButton);

        const logoutButton = screen.getByText('Log out');
        fireEvent.click(logoutButton);

        expect(signOut).toHaveBeenCalled();
    });

    it('toggles download dropdown when logged out', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        const downloadButton = screen.getByText('Download for Free');
        fireEvent.click(downloadButton);

        expect(screen.getByText('Get for Mac (Silicon)')).toBeInTheDocument();
        expect(screen.getByText('Get for Mac (Intel)')).toBeInTheDocument();
        expect(screen.getByText('Get for Windows')).toBeInTheDocument();
    });
});
