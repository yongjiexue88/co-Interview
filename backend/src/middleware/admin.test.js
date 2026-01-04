const adminMiddleware = require('./admin');
const { db } = require('../config/firebase');

// Mock Firebase config
jest.mock('../config/firebase', () => ({
    auth: {},
    db: {
        collection: jest.fn(),
    },
}));

describe('Admin Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            user: {
                uid: 'test-uid',
                email: 'user@example.com',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should return 401 if user is not authenticated', async () => {
        req.user = undefined;
        await adminMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Unauthorized' }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow access if email is in ADMIN_EMAILS list', async () => {
        req.user.email = 'yongjiexue88@gmail.com'; // Hardcoded admin email
        await adminMiddleware(req, res, next);
        expect(req.user.isAdmin).toBe(true);
        expect(next).toHaveBeenCalled();
        expect(db.collection).not.toHaveBeenCalled(); // Should short-circuit
    });

    it('should check Firestore role if email is not hardcoded', async () => {
        const mockDoc = {
            exists: true,
            data: jest.fn().mockReturnValue({ role: 'admin' }),
        };
        const mockGet = jest.fn().mockResolvedValue(mockDoc);
        const mockDocRef = { get: mockGet };
        const mockCollection = jest.fn().mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });
        db.collection.mockImplementation(mockCollection);

        await adminMiddleware(req, res, next);

        expect(db.collection).toHaveBeenCalledWith('users');
        expect(req.user.isAdmin).toBe(true);
        expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not an admin (neither email nor role)', async () => {
        const mockDoc = {
            exists: true,
            data: jest.fn().mockReturnValue({ role: 'user' }),
        };
        const mockGet = jest.fn().mockResolvedValue(mockDoc);
        const mockDocRef = { get: mockGet };
        const mockCollection = jest.fn().mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });
        db.collection.mockImplementation(mockCollection);

        await adminMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Forbidden' }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if user document does not exist', async () => {
        const mockDoc = { exists: false };
        const mockGet = jest.fn().mockResolvedValue(mockDoc);
        const mockDocRef = { get: mockGet };
        const mockCollection = jest.fn().mockReturnValue({ doc: jest.fn().mockReturnValue(mockDocRef) });
        db.collection.mockImplementation(mockCollection);

        await adminMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
        db.collection.mockImplementation(() => {
            throw new Error('DB Error');
        });

        await adminMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Internal Server Error' }));
    });
});
