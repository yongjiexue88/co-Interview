import { render, screen, waitFor } from '@testing-library/react';
import ElectronAuthPage from './ElectronAuthPage';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock window.electronAPI
const mockSend = vi.fn();
const mockReceive = vi.fn();

Object.defineProperty(window, 'electronAPI', {
    value: {
        send: mockSend,
        receive: mockReceive,
    },
    writable: true,
});

vi.mock('../lib/firebase', () => ({
    auth: {},
    googleProvider: {},
}));

vi.mock('firebase/auth', () => ({
    signInWithPopup: vi.fn().mockResolvedValue({
        user: {
            uid: '123',
            email: 'test@example.com',
            displayName: 'Test User',
            getIdToken: vi.fn().mockResolvedValue('mock-token'),
        },
    }),
    createUserWithEmailAndPassword: vi.fn(),
}));

describe('ElectronAuthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        render(
            <MemoryRouter initialEntries={['/electron-auth?token=test_token&uid=123']}>
                <Routes>
                    <Route path="/electron-auth" element={<ElectronAuthPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Expect to see the loading text
        expect(screen.getByText(/Authenticating for desktop app/i)).toBeInTheDocument();

        // Wait for success state
        await waitFor(() => {
            expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            expect(screen.getByText(/Returning to Co-Interview app/i)).toBeInTheDocument();
        });
    });
});
