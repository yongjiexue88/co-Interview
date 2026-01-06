const fs = require('fs');
const os = require('os');
const path = require('path');
const storage = require('../src/storage');

jest.mock('fs');
jest.mock('os');

describe('Storage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        os.homedir.mockReturnValue('/user/home');
    });

    describe('getConfigDir', () => {
        it('should return correct path for win32', () => {
            os.platform.mockReturnValue('win32');
            const dir = storage.getConfigDir();
            expect(dir).toContain('AppData');
        });

        it('should return correct path for darwin', () => {
            os.platform.mockReturnValue('darwin');
            const dir = storage.getConfigDir();
            expect(dir).toContain('Library');
        });

        it('should return correct path for linux/others', () => {
            os.platform.mockReturnValue('linux');
            const dir = storage.getConfigDir();
            expect(dir).toContain('.config');
        });
    });

    describe('File Operations', () => {
        it('should handle read error gracefully', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => { throw new Error('Fail'); });
            const data = storage.getConfig(); // calls readJsonFile
            expect(data).toHaveProperty('onboarded', false);
        });

        it('should create directory if missing during write', () => {
            fs.existsSync.mockReturnValue(false); // dir doesn't exist
            storage.setConfig({ onboarded: true });
            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ recursive: true }));
            expect(fs.writeFileSync).toHaveBeenCalled();
        });

        it('should return false on write error', () => {
            fs.writeFileSync.mockImplementation(() => { throw new Error('Fail'); });
            const result = storage.setConfig({ onboarded: true });
            expect(result).toBe(false);
        });
    });

    describe('Initialization and Reset', () => {
        it('should reinitialize if config version is missing', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ some: 'old' }));
            storage.initializeStorage();
            expect(fs.rmSync).toHaveBeenCalled();
        });

        it('should reinitialize if config version is mismatched', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ configVersion: 999 })); // Wrong version
            storage.initializeStorage();
            expect(fs.rmSync).toHaveBeenCalled();
        });

        it('should reinitialize if config file is absent', () => {
            fs.existsSync.mockImplementation((p) => {
                return false; // config.json missing
            });
            storage.initializeStorage();
            // It should call resetConfigDir, which calls rmSync if dir exists (it doesn't in this Mock?)
            // Wait, logic: if !exists(configPath) -> needsReset=true
            // resetConfigDir -> exists(configDir) ? rm : null; mkdir...
            // Test verifies initializeStorage flow
            expect(fs.mkdirSync).toHaveBeenCalled();
        });

        it('should reinitialize on invalid JSON', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockImplementation(() => { throw new Error('Invalid JSON'); });
            storage.initializeStorage();
            expect(fs.rmSync).toHaveBeenCalled();
        });

        it('should initialize history dir if it does not exist', () => {
            fs.existsSync.mockImplementation((p) => {
                if (p.includes('config.json')) return true;
                if (p.includes('history')) return false;
                return true;
            });
            fs.readFileSync.mockReturnValue(JSON.stringify({ configVersion: 1 }));
            storage.initializeStorage();
            expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('history'), expect.any(Object));
        });
    });

    describe('Limits and Availability', () => {
        it('should create new limit entry for today if missing', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ data: [{ date: '2020-01-01', flash: { count: 10 } }] }));
            const entry = storage.incrementLimitCount('gemini-2.5-flash');
            expect(entry.date).toBe(new Date().toISOString().split('T')[0]);
            expect(entry.flash.count).toBe(1);
        });

        it('should clean old entries and keep only today', () => {
            const today = new Date().toISOString().split('T')[0];
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({
                data: [
                    { date: '2020-01-01', flash: { count: 10 } },
                    { date: today, flash: { count: 5 }, flashLite: { count: 0 } }
                ]
            }));
            const entry = storage.incrementLimitCount('gemini-2.5-flash');
            expect(entry.flash.count).toBe(6);
            // Verify write kept only today
            const call = fs.writeFileSync.mock.calls[0][1];
            const saved = JSON.parse(call);
            expect(saved.data.length).toBe(1);
        });

        it('should fall back to flash-lite after flash exhausted', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({
                data: [{
                    date: new Date().toISOString().split('T')[0],
                    flash: { count: 20 },
                    flashLite: { count: 5 }
                }]
            }));
            const model = storage.getAvailableModel();
            expect(model).toBe('gemini-2.5-flash-lite');
        });

        it('should increment flash-lite count', () => {
            fs.existsSync.mockReturnValue(true);
            const today = new Date().toISOString().split('T')[0];
            fs.readFileSync.mockReturnValue(JSON.stringify({
                data: [{ date: today, flash: { count: 20 }, flashLite: { count: 0 } }]
            }));
            const entry = storage.incrementLimitCount('gemini-2.5-flash-lite');
            expect(entry.flashLite.count).toBe(1);
        });

        it('should create defaults if today limits missing (getAvailableModel)', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ data: [] })); // No data
            const model = storage.getAvailableModel();
            expect(model).toBe('gemini-2.5-flash');
        });
    });

    describe('Session Management', () => {
        it('should preserve createdAt when saving existing session', () => {
            const now = Date.now();
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ sessionId: '123', createdAt: 999 }));
            storage.saveSession('123', { conversationHistory: [] });
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.createdAt).toBe(999);
        });

        it('should get and sort all sessions', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['100.json', '200.json']);
            fs.readFileSync.mockImplementation((p) => {
                if (p.includes('100.json')) return JSON.stringify({ createdAt: 100 });
                if (p.includes('200.json')) return JSON.stringify({ createdAt: 200 });
                return null;
            });
            const sessions = storage.getAllSessions();
            expect(sessions.length).toBe(2);
            expect(sessions[0].sessionId).toBe('200'); // Sort Desc
        });

        it('should handle readdir error', () => {
            fs.readdirSync.mockImplementation(() => { throw new Error('Fail'); });
            const sessions = storage.getAllSessions();
            expect(sessions).toEqual([]);
        });

        it('should delete specified session', () => {
            fs.existsSync.mockReturnValue(true);
            const result = storage.deleteSession('123');
            expect(result).toBe(true);
            expect(fs.unlinkSync).toHaveBeenCalled();
        });

        it('should delete all sessions', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['1.json', '2.json']);
            const result = storage.deleteAllSessions();
            expect(result).toBe(true);
            expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
        });

        it('should handle deleteSession error', () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementation(() => { throw new Error('Fail'); });
            const result = storage.deleteSession('123');
            expect(result).toBe(false);
        });
    });

    describe('Auth Data', () => {
        it('should return initial auth data', () => {
            fs.existsSync.mockReturnValue(false);
            const data = storage.getAuthData();
            expect(data.isLoggedIn).toBe(false);
        });

        it('should clear auth data', () => {
            storage.clearAuthData();
            const call = fs.writeFileSync.mock.calls[0][1];
            expect(JSON.parse(call).isLoggedIn).toBe(false);
        });

        it('should verify login status', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ isLoggedIn: true, userId: '123' }));
            expect(storage.isLoggedIn()).toBe(true);
        });
    });

    describe('Config and Preferences', () => {
        it('should update specific config key', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ onboarded: false }));
            storage.updateConfig('onboarded', true);
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.onboarded).toBe(true);
        });

        it('should manage credentials and API key', () => {
            storage.setApiKey('test-key');
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.apiKey).toBe('test-key');

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ apiKey: 'saved-key' }));
            expect(storage.getApiKey()).toBe('saved-key');
        });

        it('should manage preferences', () => {
            storage.updatePreference('theme', 'dark');
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.theme).toBe('dark');

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({ theme: 'light' }));
            const prefs = storage.getPreferences();
            expect(prefs.theme).toBe('light');
        });

        it('should set multiple preferences (setPreferences)', () => {
            const newPrefs = { theme: 'dark', fontSize: 14 };
            storage.setPreferences(newPrefs);
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.theme).toBe('dark');
            expect(saved.fontSize).toBe(14);
        });

        it('should manage keybinds', () => {
            const customBinds = { moveUp: 'U' };
            storage.setKeybinds(customBinds);
            const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1]);
            expect(saved.moveUp).toBe('U');

            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify(customBinds));
            expect(storage.getKeybinds()).toEqual(customBinds);
        });
    });


    describe('Error Handling', () => {
        beforeEach(() => {
            // Mock fs.writeFileSync to throw error
            require('fs').writeFileSync.mockImplementation(() => {
                throw new Error('Write Error');
            });
            // Mock fs.readFileSync to throw error for read ops if needed
            require('fs').readFileSync.mockReturnValue(JSON.stringify({ data: [], configVersion: 1 }));
        });

        it('should handle write errors gracefully', () => {
            // For updateConfig which returns false on error
            expect(storage.updateConfig({ version: 2 })).toBe(false);

            // setApiKey returns false on error
            expect(storage.setApiKey('abc', 'newkey')).toBe(false);

            // updatePreference returns false on error
            expect(storage.updatePreference('theme', 'dark')).toBe(false);

            // setKeybinds returns false on error
            expect(storage.setKeybinds({ moveUp: 'Up' })).toBe(false);

            // incrementLimitCount returns object even on write error (in-memory update)
            expect(storage.incrementLimitCount('123', 'audio')).toHaveProperty('date');

            // clearAuthData returns false on error
            expect(storage.clearAuthData()).toBe(false);
        });

        it('should handle read errors in getAllSessions', () => {
            require('fs').readdirSync.mockImplementation(() => { throw new Error('Read Error'); });
            const sessions = storage.getAllSessions();
            expect(sessions).toEqual([]);
        });

        it('should handle delete errors in deleteSession', () => {
            require('fs').rmSync.mockImplementation(() => { throw new Error('Delete Error'); });
            const result = storage.deleteSession('123');
            expect(result).toBe(false);
        });

        it('should return flash when both quotas exhausted', () => {
            const today = new Date().toISOString().split('T')[0];
            fs.existsSync.mockReturnValue(true);
            fs.readFileSync.mockReturnValue(JSON.stringify({
                data: [{
                    date: today,
                    flash: { count: 25 }, // Over limit
                    flashLite: { count: 25 } // Over limit
                }]
            }));
            const model = storage.getAvailableModel();
            expect(model).toBe('gemini-2.5-flash'); // Falls back to flash for paid API
        });

        it('should return null for nonexistent session', () => {
            fs.existsSync.mockReturnValue(false);
            const session = storage.getSession('nonexistent');
            expect(session).toBeNull();
        });

        it('should handle missing history dir in getAllSessions', () => {
            fs.existsSync.mockReturnValue(false);
            const sessions = storage.getAllSessions();
            expect(sessions).toEqual([]);
        });

        it('should handle null session data in getAllSessions', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['test.json']);
            fs.readFileSync.mockReturnValue('invalid json');
            const sessions = storage.getAllSessions();
            expect(sessions).toEqual([]);
        });

        it('should handle deleteAllSessions with missing directory', () => {
            fs.existsSync.mockReturnValue(false);
            const result = storage.deleteAllSessions();
            expect(result).toBe(true);
        });
    });
});
