const {
    createWindow,
    getDefaultKeybinds,
    updateGlobalShortcuts,
    setupWindowIpcHandlers,
} = require('../src/utils/window');

// Mock Electron
const mockBrowserWindow = {
    setResizable: jest.fn(),
    setContentProtection: jest.fn(),
    setVisibleOnAllWorkspaces: jest.fn(),
    setSkipTaskbar: jest.fn(),
    setHiddenInMissionControl: jest.fn(),
    setPosition: jest.fn(),
    setAlwaysOnTop: jest.fn(),
    loadFile: jest.fn(),
    webContents: {
        once: jest.fn(),
        send: jest.fn(),
        executeJavaScript: jest.fn(),
    },
    getSize: jest.fn().mockReturnValue([800, 600]),
    setSize: jest.fn(),
    minimize: jest.fn(),
    isVisible: jest.fn().mockReturnValue(true),
    isDestroyed: jest.fn().mockReturnValue(false),
    hide: jest.fn(),
    showInactive: jest.fn(),
    setIgnoreMouseEvents: jest.fn(),
    getPosition: jest.fn().mockReturnValue([100, 100]),
};

jest.mock('electron', () => ({
    app: {
        isPackaged: false,
        whenReady: jest.fn().mockResolvedValue(),
        quit: jest.fn(),
    },
    BrowserWindow: jest.fn(() => mockBrowserWindow),
    screen: {
        getPrimaryDisplay: jest.fn().mockReturnValue({
            workAreaSize: { width: 1920, height: 1080 },
        }),
    },
    ipcMain: {
        on: jest.fn(),
        handle: jest.fn(),
    },
    globalShortcut: {
        register: jest.fn(),
        unregisterAll: jest.fn(),
    },
    session: {
        defaultSession: {
            setDisplayMediaRequestHandler: jest.fn(),
        },
    },
    desktopCapturer: {},
}));

jest.mock('node:path', () => ({
    join: jest.fn((...args) => args.join('/')),
}));

jest.mock('../src/storage', () => ({
    getKeybinds: jest.fn().mockReturnValue(null),
}));

describe('Electron Window Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDefaultKeybinds', () => {
        it('should return Mac keybinds on Darwin', () => {
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            const binds = getDefaultKeybinds();
            expect(binds.moveUp).toBe('Alt+Up');
            expect(binds.toggleVisibility).toBe('Cmd+\\');
        });

        it('should return Windows/Linux keybinds on others', () => {
            Object.defineProperty(process, 'platform', { value: 'win32' });
            const binds = getDefaultKeybinds();
            expect(binds.moveUp).toBe('Ctrl+Up');
            expect(binds.toggleVisibility).toBe('Ctrl+\\');
        });
    });

    describe('updateGlobalShortcuts', () => {
        it('should register shortcuts correctly', () => {
            const keybinds = {
                moveUp: 'Alt+Up',
                toggleVisibility: 'Cmd+\\',
            };
            const sendToRenderer = jest.fn();
            const geminiSessionRef = { current: null };

            updateGlobalShortcuts(keybinds, mockBrowserWindow, sendToRenderer, geminiSessionRef);

            const { globalShortcut } = require('electron');
            expect(globalShortcut.unregisterAll).toHaveBeenCalled();
            expect(globalShortcut.register).toHaveBeenCalledWith('Alt+Up', expect.any(Function));
            expect(globalShortcut.register).toHaveBeenCalledWith('Cmd+\\', expect.any(Function));
        });
    });

    describe('createWindow', () => {
        it('should create a BrowserWindow with correct settings', () => {
            const sendToRenderer = jest.fn();
            const geminiSessionRef = { current: null };

            const win = createWindow(sendToRenderer, geminiSessionRef);

            const { BrowserWindow } = require('electron');
            expect(BrowserWindow).toHaveBeenCalledWith(expect.objectContaining({
                frame: false,
                transparent: true,
                alwaysOnTop: true,
            }));
            expect(win).toBe(mockBrowserWindow);
        });
    });

    describe('setupWindowIpcHandlers', () => {
        it('should register IPC handlers', () => {
            const sendToRenderer = jest.fn();
            const geminiSessionRef = { current: null };
            const { ipcMain } = require('electron');

            setupWindowIpcHandlers(mockBrowserWindow, sendToRenderer, geminiSessionRef);

            expect(ipcMain.on).toHaveBeenCalledWith('view-changed', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('window-minimize', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('toggle-window-visibility', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('update-sizes', expect.any(Function));
        });
    });
});
