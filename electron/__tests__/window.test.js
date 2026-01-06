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
    desktopCapturer: {
        getSources: jest.fn().mockResolvedValue([{ id: 'screen:1' }]),
    },
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
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
            const binds = getDefaultKeybinds();
            expect(binds.moveUp).toBe('Alt+Up');
            expect(binds.toggleVisibility).toBe('Cmd+\\');
        });

        it('should return Windows/Linux keybinds on others', () => {
            Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
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

    describe('Global Shortcuts edge cases', () => {
        it('should handle registration failure gracefully', () => {
            const { globalShortcut } = require('electron');
            globalShortcut.register.mockImplementation(() => { throw new Error('Reg Fail'); });

            const keybinds = { moveUp: 'Up', toggleVisibility: 'V' };
            updateGlobalShortcuts(keybinds, mockBrowserWindow, jest.fn(), { current: null });

            // Should not throw, but log error
            expect(globalShortcut.register).toHaveBeenCalled();
        });
    });

    describe('setupWindowIpcHandlers Logic', () => {
        let handlers = {};
        let listeners = {};
        const sendToRenderer = jest.fn();
        const geminiSessionRef = { current: { close: jest.fn() } };

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            ipcMain.on.mockImplementation((channel, listener) => {
                listeners[channel] = listener;
            });
            setupWindowIpcHandlers(mockBrowserWindow, sendToRenderer, geminiSessionRef);
        });

        it('view-changed should enable mouse events if not assistant', () => {
            listeners['view-changed']({}, 'main');
            expect(mockBrowserWindow.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
        });

        it('window-minimize should minimize window', async () => {
            await handlers['window-minimize']({});
            expect(mockBrowserWindow.minimize).toHaveBeenCalled();
        });

        it('toggle-window-visibility should hide/show window', async () => {
            mockBrowserWindow.isVisible.mockReturnValue(true);
            await handlers['toggle-window-visibility']({});
            expect(mockBrowserWindow.hide).toHaveBeenCalled();

            mockBrowserWindow.isVisible.mockReturnValue(false);
            await handlers['toggle-window-visibility']({});
            expect(mockBrowserWindow.showInactive).toHaveBeenCalled();
        });

        it('update-sizes should trigger animation', async () => {
            jest.useFakeTimers();
            const mockEvent = {
                sender: {
                    executeJavaScript: jest.fn()
                        .mockResolvedValueOnce('assistant') // viewName
                        .mockResolvedValueOnce('normal'),   // layoutMode
                }
            };

            const promise = handlers['update-sizes'](mockEvent);

            // Flush microtasks to allow executeJavaScript awaits to finish
            for (let i = 0; i < 10; i++) await Promise.resolve();

            // Advance timers to trigger all animation frames
            jest.advanceTimersByTime(1000);

            // Flush again for final resolve
            for (let i = 0; i < 10; i++) await Promise.resolve();

            const result = await promise;
            expect(result.success).toBe(true);
            expect(mockBrowserWindow.setSize).toHaveBeenCalled();
            jest.useRealTimers();
        });

        it('update-keybinds should refresh shortcuts', () => {
            const newKeybinds = { moveUp: 'Shift+Up' };
            listeners['update-keybinds']({}, newKeybinds);
            const { globalShortcut } = require('electron');
            expect(globalShortcut.register).toHaveBeenCalledWith('Shift+Up', expect.any(Function));
        });
    });

    describe('Shortcut Callbacks', () => {
        it('movement shortcuts should move window if visible', () => {
            const keybinds = {
                moveUp: 'Up',
                moveDown: 'Down',
                moveLeft: 'Left',
                moveRight: 'Right'
            };
            const sendToRenderer = jest.fn();
            const geminiSessionRef = { current: null };

            const { globalShortcut } = require('electron');
            updateGlobalShortcuts(keybinds, mockBrowserWindow, sendToRenderer, geminiSessionRef);

            mockBrowserWindow.isVisible.mockReturnValue(true);
            mockBrowserWindow.getPosition.mockReturnValue([100, 100]);

            const callbacks = {};
            globalShortcut.register.mock.calls.forEach(call => callbacks[call[0]] = call[1]);

            callbacks['Up']();
            expect(mockBrowserWindow.setPosition).toHaveBeenCalledWith(100, expect.any(Number));
            callbacks['Down']();
            expect(mockBrowserWindow.setPosition).toHaveBeenCalledWith(100, expect.any(Number));
            callbacks['Left']();
            expect(mockBrowserWindow.setPosition).toHaveBeenCalledWith(expect.any(Number), 100);
            callbacks['Right']();
            expect(mockBrowserWindow.setPosition).toHaveBeenCalledWith(expect.any(Number), 100);
        });

        it('toggleVisibility and toggleClickThrough shortcuts', () => {
            const keybinds = { toggleVisibility: 'V', toggleClickThrough: 'M' };
            const { globalShortcut } = require('electron');
            updateGlobalShortcuts(keybinds, mockBrowserWindow, jest.fn(), { current: null });

            const callbacks = {};
            globalShortcut.register.mock.calls.forEach(call => callbacks[call[0]] = call[1]);

            mockBrowserWindow.isVisible.mockReturnValue(true);
            callbacks['V']();
            expect(mockBrowserWindow.hide).toHaveBeenCalled();
            mockBrowserWindow.isVisible.mockReturnValue(false);
            callbacks['V']();
            expect(mockBrowserWindow.showInactive).toHaveBeenCalled();

            callbacks['M']();
            expect(mockBrowserWindow.setIgnoreMouseEvents).toHaveBeenCalledWith(true, { forward: true });
            callbacks['M']();
            expect(mockBrowserWindow.setIgnoreMouseEvents).toHaveBeenCalledWith(false);
        });

        it('nextStep, response navigation, and scroll shortcuts', () => {
            const keybinds = {
                nextStep: 'Enter',
                previousResponse: '[',
                nextResponse: ']',
                scrollUp: 'SUp',
                scrollDown: 'SDown'
            };
            const sendToRenderer = jest.fn();
            const { globalShortcut } = require('electron');
            updateGlobalShortcuts(keybinds, mockBrowserWindow, sendToRenderer, { current: null });

            const callbacks = {};
            globalShortcut.register.mock.calls.forEach(call => callbacks[call[0]] = call[1]);

            callbacks['Enter']();
            expect(mockBrowserWindow.webContents.executeJavaScript).toHaveBeenCalled();

            callbacks['[']();
            expect(sendToRenderer).toHaveBeenCalledWith('navigate-previous-response');
            callbacks[']']();
            expect(sendToRenderer).toHaveBeenCalledWith('navigate-next-response');
            callbacks['SUp']();
            expect(sendToRenderer).toHaveBeenCalledWith('scroll-response-up');
            callbacks['SDown']();
            expect(sendToRenderer).toHaveBeenCalledWith('scroll-response-down');
        });

        it('emergencyErase should close session and quit app', () => {
            const keybinds = { emergencyErase: 'E' };
            const sendToRenderer = jest.fn();
            const closeMock = jest.fn();
            const geminiSessionRef = { current: { close: closeMock } };

            const { globalShortcut, app } = require('electron');
            updateGlobalShortcuts(keybinds, mockBrowserWindow, sendToRenderer, geminiSessionRef);

            const eraseCallback = globalShortcut.register.mock.calls.find(call => call[0] === 'E')[1];

            jest.useFakeTimers();
            eraseCallback();

            expect(mockBrowserWindow.hide).toHaveBeenCalled();
            expect(closeMock).toHaveBeenCalled();
            expect(sendToRenderer).toHaveBeenCalledWith('clear-sensitive-data');

            jest.advanceTimersByTime(400);
            expect(app.quit).toHaveBeenCalled();
            jest.useRealTimers();
        });
    });
});

describe('Window Edge Cases', () => {
    let handlers = {};
    beforeEach(() => {
        const { ipcMain } = require('electron');
        ipcMain.handle.mockImplementation((channel, handler) => {
            handlers[channel] = handler;
        });
        setupWindowIpcHandlers(mockBrowserWindow);
    });

    it('update-sizes should handle different view names', async () => {
        const views = ['main', 'customize', 'help', 'history', 'unknown'];
        for (const view of views) {
            const mockEvent = {
                sender: {
                    executeJavaScript: jest.fn()
                        .mockResolvedValueOnce(view)
                        .mockResolvedValueOnce('compact'),
                }
            };
            await handlers['update-sizes'](mockEvent);
        }
        expect(mockBrowserWindow.setSize).toHaveBeenCalled();
    });

    it('update-sizes should handle destroyed window', async () => {
        mockBrowserWindow.isDestroyed.mockReturnValue(true);
        const result = await handlers['update-sizes']({});
        expect(result.success).toBe(false);
        expect(result.error).toBe('Window has been destroyed');
        mockBrowserWindow.isDestroyed.mockReturnValue(false); // Reset
    });

    it('update-sizes should handle renderer execution failure', async () => {
        const mockEvent = {
            sender: {
                executeJavaScript: jest.fn().mockRejectedValue(new Error('JS Error'))
            }
        };
        const result = await handlers['update-sizes'](mockEvent);
        // It catches error and uses defaults
        expect(result.success).toBe(true);
        expect(mockBrowserWindow.setSize).toHaveBeenCalled(); // Uses default 'main' 'normal'
    });

    it.skip('update-sizes should interrupt existing animation', async () => {
        jest.useFakeTimers();
        const mockEvent = {
            sender: {
                executeJavaScript: jest.fn().mockResolvedValue({ view: 'main', layout: 'normal' })
            }
        };

        // First resize (will be interrupted)
        handlers['update-sizes'](mockEvent);

        // Advance partially
        jest.advanceTimersByTime(50);

        // Second resize (interrupt)
        const secondResizePromise = handlers['update-sizes'](mockEvent);

        // Advance enough to finish second resize
        jest.advanceTimersByTime(1000);

        await secondResizePromise;

        expect(mockBrowserWindow.setSize).toHaveBeenCalled();
        // Should have finished
        jest.useRealTimers();
    });

    it('animateWindowResize should handle early window destruction', async () => {
        jest.useFakeTimers();
        const mockEvent = {
            sender: {
                executeJavaScript: jest.fn().mockResolvedValue({ view: 'main', layout: 'normal' })
            }
        };

        // Start resize
        const promise = handlers['update-sizes'](mockEvent);

        // Destroy window mid-animation
        mockBrowserWindow.isDestroyed.mockReturnValue(true);

        jest.advanceTimersByTime(100);

        await promise;
        // Should exit gracefully
        expect(mockBrowserWindow.setSize).toHaveBeenCalled();

        mockBrowserWindow.isDestroyed.mockReturnValue(false);
        jest.useRealTimers();
    });

    it.skip('should animate properly', async () => {
        jest.useFakeTimers();
        const mockEvent = {
            sender: {
                executeJavaScript: jest.fn().mockResolvedValue({ view: 'main', layout: 'normal' })
            }
        };

        mockBrowserWindow.getSize.mockReturnValue([100, 100]); // Start

        const promise = handlers['update-sizes'](mockEvent);

        // Advance time to complete animation (duration is 200ms in window.js?)
        // Let's assume 300ms is enough
        jest.advanceTimersByTime(1000);

        await promise;

        expect(mockBrowserWindow.setSize).toHaveBeenCalled();
        const lastCall = mockBrowserWindow.setSize.mock.calls[mockBrowserWindow.setSize.mock.calls.length - 1];
        // Expect final size
        expect(lastCall[0]).toBe(900);
        jest.useRealTimers();
    });
});

describe('createWindow Platform Specifics', () => {
    const originalPlatform = process.platform;
    afterEach(() => {
        Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
    });

    it('should configure for win32', () => {
        Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
        const sendToRenderer = jest.fn();
        const geminiSessionRef = { current: null };
        const win = createWindow(sendToRenderer, geminiSessionRef);
        expect(win.setSkipTaskbar).toHaveBeenCalledWith(true);
        expect(win.setAlwaysOnTop).toHaveBeenCalledWith(true, 'screen-saver', 1);
    });

    it('should configure for darwin', () => {
        Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
        const sendToRenderer = jest.fn();
        const geminiSessionRef = { current: null };
        const win = createWindow(sendToRenderer, geminiSessionRef);
        expect(win.setHiddenInMissionControl).toHaveBeenCalledWith(true);
    });
});
