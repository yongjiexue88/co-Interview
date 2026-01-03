import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAuthStateChanged } from 'firebase/auth';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

// Mock firebase lib
vi.mock('../lib/firebase', () => ({
    auth: {},
}));

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return loading initially', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it('should set user and loading=false when auth state changes', () => {
        // Mock onAuthStateChanged to immediately call the callback with a user
        const mockUser = { uid: '123', email: 'test@example.com' };
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
            callback(mockUser as any);
            return () => {}; // Unsubscribe function
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toEqual(mockUser);
    });

    it('should set user=null and loading=false when auth state changes to null', () => {
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback: any) => {
            callback(null);
            return () => {};
        });

        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(false);
        expect(result.current.user).toBeNull();
    });
});
