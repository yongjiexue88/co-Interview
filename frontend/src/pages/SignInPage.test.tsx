import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignInPage from './SignInPage';
import { MemoryRouter } from 'react-router-dom';
import * as firebaseAuth from 'firebase/auth';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    auth: { currentUser: null },
    googleProvider: {},
}));

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithCustomToken: vi.fn(),
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

describe('SignInPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false,
        });
    });

    it('renders login form', () => {
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Log in to Co-Interview')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows loading state', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true,
        });

        const { container } = render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('handles successful email login', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({ user: { uid: '123', email: 'test@example.com' } } as any);

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles login errors', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/wrong-password' });

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
        });
    });

    it('handles google login', async () => {
        vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({ user: { uid: '123', email: 'test@google.com' } } as any);

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Google'));

        await waitFor(() => {
            expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('handles electron google login trigger', async () => {
        const mockIpcRenderer = {
            invoke: vi.fn().mockResolvedValue(undefined),
            on: vi.fn(),
            removeListener: vi.fn(),
        };

        // Mock window.require
        const originalRequire = window.require;
        window.require = vi.fn().mockReturnValue({ ipcRenderer: mockIpcRenderer }) as any;

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Google'));

        expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('auth:open-google');

        // Cleanup
        window.require = originalRequire;
    });

    it('redirects if user is already logged in', () => {
        mockUseAuth.mockReturnValue({
            user: { uid: '123' },
            loading: false,
        });

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('handles electron auth-complete event', async () => {
        const mockIpcRenderer: any = {
            on: vi.fn(),
            removeListener: vi.fn(),
            invoke: vi.fn(),
        };
        const originalRequire = window.require;
        window.require = vi.fn().mockReturnValue({ ipcRenderer: mockIpcRenderer }) as any;

        const { unmount } = render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        // Find the callback registered
        const callback = mockIpcRenderer.on.mock.calls.find((call: any) => call[0] === 'auth-complete')[1];

        // Trigger callback
        await act(async () => {
            await callback({}, { success: true, token: 'fake-token' });
        });

        expect(firebaseAuth.signInWithCustomToken).toHaveBeenCalledWith(expect.anything(), 'fake-token');

        unmount();
        expect(mockIpcRenderer.removeListener).toHaveBeenCalled();
        window.require = originalRequire;
    });

    it('handles electron token exchange on success', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
            user: {
                uid: '123',
                email: 'test@example.com',
                getIdToken: vi.fn().mockResolvedValue('id-token'),
            },
        } as any);

        // Mock fetch
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ custom_token: 'custom-token' }),
        }) as any;

        // Mock window.location.search and href
        const originalLocation = window.location;
        delete (window as any).location;
        window.location = {
            search: '?electron=true',
            hostname: 'localhost',
            href: '',
            origin: 'http://localhost:3000',
        } as any;

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(window.location.href).toContain('co-interview://auth-callback');
            expect(window.location.href).toContain('token=custom-token');
        });

        (window as any).location = originalLocation;
        global.fetch = originalFetch;
    });

    it('handles email login errors like auth/invalid-email', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/invalid-email' });

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        act(() => {
            fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'invalid@example.com' } });
            fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
        });

        act(() => {
            fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        });

        await waitFor(
            () => {
                expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
                expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
            },
            { timeout: 3000 }
        );
    });

    it('handles google login errors', async () => {
        vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({
            code: 'auth/popup-blocked',
            message: 'Popup blocked',
        });

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Google'));

        await waitFor(() => {
            expect(screen.getByText(/Login failed: Popup blocked/i)).toBeInTheDocument();
        });
    });
    it('handles electron google login ipc failure', async () => {
        const mockIpcRenderer = {
            invoke: vi.fn().mockRejectedValue(new Error('IPC Failed')),
            on: vi.fn(),
            removeListener: vi.fn(),
        };
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const originalRequire = window.require;
        window.require = vi.fn().mockReturnValue({ ipcRenderer: mockIpcRenderer }) as any;

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Google'));

        await waitFor(() => {
            expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('auth:open-google');
            expect(consoleSpy).toHaveBeenCalledWith('Electron Google Auth trigger failed:', expect.any(Error));
        });

        consoleSpy.mockRestore();
        window.require = originalRequire;
    });

    it('handles electron auth-complete with error', async () => {
        const mockIpcRenderer: any = {
            on: vi.fn(),
            removeListener: vi.fn(),
            invoke: vi.fn(),
        };
        const originalRequire = window.require;
        window.require = vi.fn().mockReturnValue({ ipcRenderer: mockIpcRenderer }) as any;

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        const callback = mockIpcRenderer.on.mock.calls.find((call: any) => call[0] === 'auth-complete')[1];

        await act(async () => {
            await callback({}, { error: 'Auth failed from main process' });
        });

        expect(screen.getByText('Auth failed from main process')).toBeInTheDocument();
        window.require = originalRequire;
    });

    it('handles electron auth-complete with token sign-in failure', async () => {
        const mockIpcRenderer: any = {
            on: vi.fn(),
            removeListener: vi.fn(),
            invoke: vi.fn(),
        };
        const originalRequire = window.require;
        window.require = vi.fn().mockReturnValue({ ipcRenderer: mockIpcRenderer }) as any;
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        vi.mocked(firebaseAuth.signInWithCustomToken).mockRejectedValueOnce(new Error('Token invalid'));

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        const callback = mockIpcRenderer.on.mock.calls.find((call: any) => call[0] === 'auth-complete')[1];

        await act(async () => {
            await callback({}, { success: true, token: 'bad-token' });
        });

        expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
        expect(consoleSpy).toHaveBeenCalledWith('Renderer custom token sign-in failed:', expect.any(Error));

        consoleSpy.mockRestore();
        window.require = originalRequire;
    });

    it('handles miscellaneous auth errors', async () => {
        // cancelled-popup-request
        vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({ code: 'auth/cancelled-popup-request' });
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText('Google'));
        await waitFor(() => expect(screen.getByText('Only one sign-in popup can be open at a time.')).toBeInTheDocument());

        // network-request-failed
        vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({ code: 'auth/network-request-failed' });
        fireEvent.click(screen.getByText('Google'));
        await waitFor(() => expect(screen.getByText('Network error. Please check your internet connection.')).toBeInTheDocument());

        // invalid-credential / invalid_client
        vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({ message: 'Something invalid_client here' });
        fireEvent.click(screen.getByText('Google'));
        await waitFor(() => expect(screen.getByText(/Configuration Error: Invalid Client ID/i)).toBeInTheDocument());

        // Generic error
        vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce({ message: 'Unknown error', code: 'unknown' });
        fireEvent.click(screen.getByText('Google'));
        await waitFor(() => expect(screen.getByText('Login failed: Unknown error')).toBeInTheDocument());
    });

    it('handles electron token exchange failure', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockResolvedValueOnce({
            user: {
                uid: '123',
                email: 'test@example.com',
                getIdToken: vi.fn().mockResolvedValue('id-token'),
            },
        } as any);

        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockRejectedValue(new Error('Network fail')) as any;

        const originalLocation = window.location;
        delete (window as any).location;
        window.location = {
            search: '?electron=true',
            hostname: 'localhost',
            href: '',
            origin: 'http://localhost:3000',
        } as any;
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Token exchange failed:', expect.any(Error));
        });

        consoleSpy.mockRestore();
        (window as any).location = originalLocation;
        global.fetch = originalFetch;
    });

    it('navigates to signup page', () => {
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Sign up/i));
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('navigates to forgot password page', () => {
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Forgot Password/i));
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('handles electron IPC setup failure', () => {
        const originalRequire = window.require;
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        // Mock require to throw
        window.require = vi.fn().mockImplementation(() => {
            throw new Error('Require failed');
        }) as any;

        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );

        expect(consoleSpy).toHaveBeenCalledWith('Electron IPC setup failed:', expect.any(Error));

        consoleSpy.mockRestore();
        window.require = originalRequire;
    });

    it('handles user-not-found error', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/user-not-found' });
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'notfound@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(screen.getByText('Invalid email or password.')).toBeInTheDocument());
    });

    it('handles generic email login error', async () => {
        vi.mocked(firebaseAuth.signInWithEmailAndPassword).mockRejectedValueOnce({ code: 'auth/unknown', message: 'Fail' });
        render(
            <MemoryRouter>
                <SignInPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => expect(screen.getByText('Failed to log in. Please try again.')).toBeInTheDocument());
    });
});
