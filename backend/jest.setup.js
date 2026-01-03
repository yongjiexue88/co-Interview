// backend/jest.setup.js
jest.mock('firebase-admin', () => ({
    apps: [],
    credential: {
        cert: jest.fn(),
        applicationDefault: jest.fn(),
    },
    initializeApp: jest.fn(),
    auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
        getUser: jest.fn(),
        getUserByEmail: jest.fn(),
        createUser: jest.fn(),
        createCustomToken: jest.fn(),
    })),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    data: () => ({ email: 'test@example.com', uid: 'user123' }),
                })),
                set: jest.fn(),
                update: jest.fn(),
            })),
        })),
        doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn(),
        })),
    })),
}));

jest.mock('stripe', () => {
    return jest.fn(() => ({
        webhooks: {
            constructEvent: jest.fn(),
        },
        customers: {
            create: jest.fn(),
            list: jest.fn(),
        },
    }));
});

// Suppress console logs during tests to keep output clean
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};
