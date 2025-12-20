import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLoginPage from './AdminLoginPage';
import { MemoryRouter } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';

// Mock dependencies
const mockUseAuth = vi.fn();
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('../lib/firebase', () => ({
    auth: {},
    googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    getAuth: vi.fn(),
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

describe('AdminLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({ user: null, loading: false });
    });

    it('renders login button', () => {
        render(
            <MemoryRouter>
                <AdminLoginPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Admin Access')).toBeInTheDocument();
        expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    });

    it('calls signInWithPopup when button is clicked', () => {
        render(
            <MemoryRouter>
                <AdminLoginPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Continue with Google'));
        expect(signInWithPopup).toHaveBeenCalled();
    });

    it('redirects to /admin if already logged in', () => {
        mockUseAuth.mockReturnValue({ user: { uid: '123' }, loading: false });
        render(
            <MemoryRouter>
                <AdminLoginPage />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    it('shows loading state', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: true });
        const { container } = render(
            <MemoryRouter>
                <AdminLoginPage />
            </MemoryRouter>
        );
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('handles login failure', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Popup closed'));

        render(
            <MemoryRouter>
                <AdminLoginPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Continue with Google'));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
            expect(alertSpy).toHaveBeenCalledWith('Failed to log in. Please try again.');
        });

        alertSpy.mockRestore();
        consoleSpy.mockRestore();
    });
});
