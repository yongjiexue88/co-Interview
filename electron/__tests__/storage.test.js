const storage = require('../src/storage');
const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('fs');
jest.mock('os');
jest.mock('path');

describe('Storage Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        os.homedir.mockReturnValue('/mock/home');
        os.platform.mockReturnValue('darwin');
        path.join.mockImplementation((...args) => args.join('/'));
        path.dirname.mockImplementation(p => p.split('/').slice(0, -1).join('/'));
        fs.existsSync.mockReturnValue(false);
    });

    describe('initializeStorage', () => {
        it('should initialize config dir if not exists', () => {
            fs.existsSync.mockReturnValue(false);
            storage.initializeStorage();
            // Should create dirs and write defaults
            expect(fs.mkdirSync).toHaveBeenCalled();
            expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
        });

        it('should not reset if valid config exists', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ configVersion: 1 }));
            storage.initializeStorage();
            expect(fs.rmSync).not.toHaveBeenCalled();
            expect(fs.mkdirSync).toHaveBeenCalledTimes(1); // history dir check
        });
    });

    describe('Config Operations', () => {
        it('should get default config if file missing', () => {
            expect(storage.getConfig()).toEqual(expect.objectContaining({ layout: 'normal' }));
        });

        it('should write config update', () => {
            storage.setConfig({ dark: true });
            expect(fs.writeFileSync).toHaveBeenCalled();
        });
    });

    describe('Auth Data', () => {
        it('should read auth data', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ isLoggedIn: true, userId: '123' }));
            const auth = storage.getAuthData();
            expect(auth.isLoggedIn).toBe(true);
            expect(auth.userId).toBe('123');
        });

        it('should check isLoggedIn', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ isLoggedIn: true, userId: '123' }));
            expect(storage.isLoggedIn()).toBe(true);
        });
    });

    describe('Limits and Quotas', () => {
        it('current rate limit logic should work', () => {
            // Mock getTodayDateString implicitly via Date?
            // Or just test incrementLimitCount logic if we rely on file I/O mocking

            // No existing limit file
            fs.existsSync.mockReturnValue(false);

            storage.incrementLimitCount('gemini-2.5-flash');

            const writeCall = fs.writeFileSync.mock.calls[0];
            const writtenData = JSON.parse(writeCall[1]);
            expect(writtenData.data[0].flash.count).toBe(1);
        });
    });
});
