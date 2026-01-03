import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../lib/firebase', () => ({
    auth: {},
}));

vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(),
}));

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with loading true', () => {
        (onAuthStateChanged as any).mockImplementation(() => () => { });
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it('should update user and loading state when auth state changes', async () => {
        const mockUser = { uid: '123', email: 'test@example.com' };

        (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
            callback(mockUser);
            return () => { };
        });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
    });
});
