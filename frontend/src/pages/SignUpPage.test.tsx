import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpPage from './SignUpPage';
import { MemoryRouter } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    auth: {},
    googleProvider: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: vi.fn(),
    sendEmailVerification: vi.fn(),
    signInWithPopup: vi.fn(),
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
    };
});

// Mock analytics
vi.mock('../lib/analytics', () => ({
    trackEvent: vi.fn(),
}));

describe('SignUpPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });
    });

    it('renders signup form', () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows loading state', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        const { container } = render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows error when fields are empty', async () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        const submitButton = screen.getByRole('button', { name: /create account/i });
        fireEvent.click(submitButton);

        expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
    });

    it('shows error when passwords do not match', async () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'different' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    });

    it('handles successful email signup', async () => {
        const mockUser = { email: 'test@example.com' };
        vi.mocked(createUserWithEmailAndPassword).mockResolvedValueOnce({ user: mockUser } as any);
        vi.mocked(sendEmailVerification).mockResolvedValueOnce(undefined as any);

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(createUserWithEmailAndPassword).toHaveBeenCalled();
            expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
            expect(screen.getByText('Check your info')).toBeInTheDocument();
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    it('handles firebase signup errors', async () => {
        vi.mocked(createUserWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/email-already-in-use' });

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
    });

    it('handles google signup', async () => {
        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Continue with Google'));

        expect(signInWithPopup).toHaveBeenCalled();
    });

    it('redirects if user is already logged in', () => {
        mockUseAuth.mockReturnValue({
            user: { email: 'already@logged.in' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <SignUpPage />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
});
