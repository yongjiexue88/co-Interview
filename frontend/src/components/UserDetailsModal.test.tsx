import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserDetailsModal from './UserDetailsModal';
import { UserData } from '../types/user';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    db: {},
    auth: {},
}));

// Mock useAuth
const mockGetIdToken = vi.fn().mockResolvedValue('mock-token');
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        user: { getIdToken: mockGetIdToken },
        loading: false,
    }),
}));

const mockUser: UserData = {
    id: 'user-123',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    profile: {
        displayName: 'Test User',
        photoURL: null,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-02T00:00:00Z',
        locale: 'en-US',
    },
    access: {
        planId: 'pro',
        accessStatus: 'active',
        concurrencyLimit: 3,
    },
    usage: {
        quotaSecondsUsed: 1800,
        quotaSecondsMonth: 3600,
        quotaResetAt: '2024-02-01T00:00:00Z',
    },
    preferences: {
        onboarding: {
            userPersona: 'developer',
            userRole: 'engineer',
            userExperience: 'senior',
            userReferral: 'friend',
        },
        tailor: {
            outputLanguage: 'English',
            programmingLanguage: 'TypeScript',
            audioLanguage: 'English',
            customPrompt: 'Help me with coding interviews',
        },
    },
    devicesSummary: {
        deviceCount: 2,
        lastPlatform: 'macOS',
        lastSeenAt: '2024-01-02T12:00:00Z',
    },
    security: {
        lastLoginIp: '192.168.1.1',
    },
    meta: {
        schemaVersion: 2,
        updatedAt: '2024-01-02T12:00:00Z',
        sourceOfTruth: 'backend',
    },
};

describe('UserDetailsModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('returns null when user is null', () => {
        const { container } = render(<UserDetailsModal isOpen={true} onClose={() => {}} user={null} />);

        expect(container.firstChild).toBeNull();
    });

    it('renders user email and id', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
            expect(screen.getByText('user-123')).toBeInTheDocument();
        });
    });

    it('renders profile and onboarding section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Profile & Onboarding')).toBeInTheDocument();
            expect(screen.getByText('developer')).toBeInTheDocument();
            expect(screen.getByText('engineer')).toBeInTheDocument();
        });
    });

    it('renders tailor preferences section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Tailor Preferences')).toBeInTheDocument();
            expect(screen.getByText('TypeScript')).toBeInTheDocument();
            expect(screen.getByText('Help me with coding interviews')).toBeInTheDocument();
        });
    });

    it('renders access and usage section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Access & Usage')).toBeInTheDocument();
            expect(screen.getByText('pro')).toBeInTheDocument();
            expect(screen.getByText('active')).toBeInTheDocument();
        });
    });

    it('renders devices and security section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Devices & Security')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument(); // Device count
            expect(screen.getByText('macOS')).toBeInTheDocument();
        });
    });

    it('displays session history section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Session History')).toBeInTheDocument();
            expect(screen.getByText('No sessions found')).toBeInTheDocument();
        });
    });

    it('displays sessions when available', async () => {
        const mockSessions = [
            {
                id: 'session-1',
                model: 'gemini-pro',
                status: 'completed',
                startedAt: '2024-01-02T10:00:00Z',
                endedAt: '2024-01-02T10:30:00Z',
                durationSeconds: 1800,
                chargedSeconds: 1800,
                endReason: 'user_ended',
            },
        ];

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: mockSessions }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('30m 0s')).toBeInTheDocument(); // Duration
        });
    });

    it('shows loading state for sessions', async () => {
        // Delay fetch to capture loading state
        (global.fetch as any).mockImplementation(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({ sessions: [] }),
                            }),
                        100
                    )
                )
        );

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
        const onClose = vi.fn();

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={onClose} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });

        // Find and click the close button (X icon)
        const buttons = screen.getAllByRole('button');
        const closeButton = buttons[0]; // First button is close
        fireEvent.click(closeButton);

        expect(onClose).toHaveBeenCalled();
    });

    it('handles reset quota cancellation', async () => {
        const onRefresh = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false); // Cancel
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} onRefresh={onRefresh} />);

        await waitFor(() => {
            expect(screen.getByText('Reset Quota to 0')).toBeInTheDocument();
        });

        const resetButton = screen.getByText('Reset Quota to 0');
        fireEvent.click(resetButton);

        expect(confirmSpy).toHaveBeenCalled();
        expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/reset-quota'), expect.anything());

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('handles reset quota success', async () => {
        const onRefresh = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        // Mock sessions fetch
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        // Mock reset quota fetch
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} onRefresh={onRefresh} />);

        // Wait for sessions to load so button is interactive
        await waitFor(() => {
            expect(screen.getByText('Reset Quota to 0')).toBeInTheDocument();
        });

        const resetButton = screen.getByText('Reset Quota to 0');
        fireEvent.click(resetButton);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/admin/users/user-123/reset-quota'),
                expect.objectContaining({ method: 'POST' })
            );
            expect(alertSpy).toHaveBeenCalledWith('Quota reset successfully!');
            expect(onRefresh).toHaveBeenCalled();
        });

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
    });

    it('handles reset quota failure', async () => {
        const onRefresh = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock sessions fetch
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        // Mock reset quota fetch failure
        (global.fetch as any).mockResolvedValueOnce({
            ok: false,
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} onRefresh={onRefresh} />);

        await waitFor(() => {
            expect(screen.getByText('Reset Quota to 0')).toBeInTheDocument();
        });

        const resetButton = screen.getByText('Reset Quota to 0');
        fireEvent.click(resetButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/reset-quota'), expect.anything());
            expect(alertSpy).toHaveBeenCalledWith('Failed to reset quota');
        });

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('handles reset quota network error', async () => {
        const onRefresh = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Mock sessions fetch
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        // Mock reset quota network error
        (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'));

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} onRefresh={onRefresh} />);

        await waitFor(() => {
            expect(screen.getByText('Reset Quota to 0')).toBeInTheDocument();
        });

        const resetButton = screen.getByText('Reset Quota to 0');
        fireEvent.click(resetButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Reset quota error:', expect.any(Error));
            expect(alertSpy).toHaveBeenCalledWith('Failed to reset quota');
        });

        confirmSpy.mockRestore();
        alertSpy.mockRestore();
        consoleSpy.mockRestore();
    });

    it('handles session fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        (global.fetch as any).mockRejectedValue(new Error('Fetch failed'));

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch session history:', expect.any(Error));
            // Still renders the modal scaffolding
            expect(screen.getByText('Session History')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });

    it('shows raw JSON toggle', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('View Raw JSON')).toBeInTheDocument();
        });
    });

    it('displays user initials when no photo', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('T')).toBeInTheDocument(); // First letter of email
        });
    });

    it('displays schema version badge', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('v2')).toBeInTheDocument();
        });
    });

    it('helper functions handle missing data', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        const emptyUser = { ...mockUser, preferences: { ...mockUser.preferences, onboarding: null as any } };
        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={emptyUser} />);

        await waitFor(() => {
            // Accessing the Not Set fallbacks
            const notSetElements = screen.getAllByText('Not set');
            expect(notSetElements.length).toBeGreaterThan(0);
        });
    });

    it('helper formatDate handles invalid dates', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ sessions: [] }),
        });

        const userWithBadDate = { ...mockUser, profile: { ...mockUser.profile, createdAt: 'invalid-date' } };
        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={userWithBadDate} />);

        await waitFor(() => {
            expect(screen.getByText('invalid-date')).toBeInTheDocument();
        });
    });
    it('handles missing sessions data from API', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({}), // No sessions key
        });

        render(<UserDetailsModal isOpen={true} onClose={() => {}} user={mockUser} />);

        await waitFor(() => {
            expect(screen.getByText('Session History')).toBeInTheDocument();
        });
        // Implicitly we are checking it doesn't crash and likely shows "No sessions found" or similar empty state if that text exists,
        // or just renders the section without items.
    });
});
