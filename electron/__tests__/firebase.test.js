const {
    getIdToken,
    getCurrentUser,
    signOut,
    onAuthChange,
    auth,
    googleProvider
} = require('../src/utils/firebase');

// Mock Firebase dependencies
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({
        currentUser: null,
        signOut: jest.fn(),
    })),
    GoogleAuthProvider: jest.fn(),
    signInWithCredential: jest.fn(),
    signInWithCustomToken: jest.fn(),
    onAuthStateChanged: jest.fn(),
}));

describe('Electron Firebase Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset auth.currentUser
        auth.currentUser = null;
    });

    describe('getIdToken', () => {
        it('should return null if no user is logged in', async () => {
            const token = await getIdToken();
            expect(token).toBeNull();
        });

        it('should return token if user is logged in', async () => {
            const mockToken = 'mock-id-token';
            const mockUser = {
                getIdToken: jest.fn().mockResolvedValue(mockToken),
            };
            auth.currentUser = mockUser;

            const token = await getIdToken();
            expect(token).toBe(mockToken);
            expect(mockUser.getIdToken).toHaveBeenCalledWith(true);
        });

        it('should return null if error occurs', async () => {
            const mockUser = {
                getIdToken: jest.fn().mockRejectedValue(new Error('Network Error')),
            };
            auth.currentUser = mockUser;

            const token = await getIdToken();
            expect(token).toBeNull();
        });
    });

    describe('getCurrentUser', () => {
        it('should return null if no user', () => {
            const user = getCurrentUser();
            expect(user).toBeNull();
        });

        it('should return user info', () => {
            auth.currentUser = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test',
                photoURL: 'pic.jpg',
            };
            const user = getCurrentUser();
            expect(user).toEqual({
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test',
                photoURL: 'pic.jpg',
            });
        });
    });

    describe('signOut', () => {
        it('should call auth.signOut and return true', async () => {
            auth.signOut.mockResolvedValue();
            const result = await signOut();
            expect(auth.signOut).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false on error', async () => {
            auth.signOut.mockRejectedValue(new Error('Sign out failed'));
            const result = await signOut();
            expect(result).toBe(false);
        });
    });

    describe('onAuthChange', () => {
        it('should call onAuthStateChanged', () => {
            const { onAuthStateChanged } = require('firebase/auth');
            const callback = jest.fn();
            onAuthChange(callback);
            expect(onAuthStateChanged).toHaveBeenCalledWith(expect.any(Object), callback);
        });
    });
});
