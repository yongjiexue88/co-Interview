import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLoginPage from './AdminLoginPage';
import { MemoryRouter } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';

// Mock dependencies
vi.mock('../hooks/useAuth', () => ({
    useAuth: vi.fn(() => ({ user: null, loading: false })),
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

describe('AdminLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
});
