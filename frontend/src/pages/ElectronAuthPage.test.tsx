import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ElectronAuthPage from './ElectronAuthPage';
import { MemoryRouter } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';

// Mock Firebase
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../lib/firebase', () => ({
    auth: {},
    googleProvider: {},
}));

describe('ElectronAuthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location.href
        delete (window as any).location;
        window.location = { href: '' } as any;
    });

    it('automatically triggers Google sign-in on mount', async () => {
        const mockUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            displayName: 'Test User',
            photoURL: 'https://example.com/photo.jpg',
            getIdToken: vi.fn().mockResolvedValue('test-token'),
        };
        (signInWithPopup as any).mockResolvedValue({ user: mockUser });

        render(
            <MemoryRouter>
                <ElectronAuthPage />
            </MemoryRouter>
        );

        expect(screen.getByText(/Signing you in/i)).toBeInTheDocument();
        expect(signInWithPopup).toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.getByText(/Success!/i)).toBeInTheDocument();
        });

        // Check if window.location.href was updated (after 500ms)
        await waitFor(
            () => {
                expect(window.location.href).toContain('co-interview://auth-callback');
                expect(window.location.href).toContain('token=test-token');
                expect(window.location.href).toContain('uid=test-uid');
            },
            { timeout: 2000 }
        );
    });

    it('handles auth errors', async () => {
        (signInWithPopup as any).mockRejectedValue({
            code: 'auth/popup-closed-by-user',
            message: 'Popup closed',
        });

        render(
            <MemoryRouter>
                <ElectronAuthPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Sign-in was cancelled/i)).toBeInTheDocument();
        });

        // Test "Try Again"
        const retryButton = screen.getByText(/Try Again with Google/i);
        (signInWithPopup as any).mockResolvedValue({
            user: {
                uid: 'retry-uid',
                getIdToken: vi.fn().mockResolvedValue('retry-token'),
            },
        });

        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(screen.getByText(/Success!/i)).toBeInTheDocument();
        });
    });

    it('handles cancelled return to app', async () => {
        render(
            <MemoryRouter>
                <ElectronAuthPage />
            </MemoryRouter>
        );

        const cancelButton = screen.getByText(/Cancel and return to app/i);
        fireEvent.click(cancelButton);

        await waitFor(() => {
            expect(window.location.href).toContain('cancel=true');
        });
    });

    it('handles popup blocked error', async () => {
        (signInWithPopup as any).mockRejectedValue({
            code: 'auth/popup-blocked',
        });

        render(
            <MemoryRouter>
                <ElectronAuthPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Popup was blocked/i)).toBeInTheDocument();
        });
    });
});
