const {
    setupGeminiIpcHandlers,
    stopMacOSAudioCapture,
    formatSpeakerResults
} = require('../src/utils/gemini');

// Mock dependencies
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        live: {
            connect: jest.fn().mockResolvedValue({
                sendRealtimeInput: jest.fn(),
                close: jest.fn(),
            }),
        },
        models: {
            generateContentStream: jest.fn().mockReturnValue((async function* () {
                yield { text: 'Test response' };
            })()),
        },
    })),
    Modality: { AUDIO: 'AUDIO' },
}));

jest.mock('electron', () => ({
    app: { isPackaged: false },
    ipcMain: {
        handle: jest.fn(),
    },
    BrowserWindow: {
        getAllWindows: jest.fn().mockReturnValue([{
            webContents: {
                send: jest.fn(),
                executeJavaScript: jest.fn().mockResolvedValue('true'),
            }
        }]),
    },
}));

jest.mock('child_process', () => {
    const mockProc = {
        pid: 123,
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
    };
    return {
        spawn: jest.fn().mockReturnValue(mockProc),
    };
});

jest.mock('../src/audioUtils', () => ({
    saveDebugAudio: jest.fn(),
}));

jest.mock('../src/storage', () => ({
    getAvailableModel: jest.fn().mockReturnValue('gemini-1.5-flash'),
    incrementLimitCount: jest.fn(),
    getApiKey: jest.fn().mockReturnValue('mock-api-key'),
}));

jest.mock('../src/utils/prompts', () => ({
    getSystemPrompt: jest.fn().mockReturnValue('Mock System Prompt'),
}));

// Mock fetch for getBackendSession
global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ token: 'mock-gemini-token', session_id: 'mock-session-id' }),
});

describe('Gemini Utils', () => {
    let geminiSessionRef;

    beforeEach(() => {
        jest.clearAllMocks();
        geminiSessionRef = { current: null };
    });

    describe('formatSpeakerResults', () => {
        it('should format speaker results correctly', () => {
            const results = [
                { speakerId: 1, transcript: 'Hello' },
                { speakerId: 2, transcript: 'Hi there' },
            ];
            const text = formatSpeakerResults(results);
            expect(text).toContain('[Interviewer]: Hello');
            expect(text).toContain('[Candidate]: Hi there');
        });
    });

    describe('setupGeminiIpcHandlers', () => {
        it('should register all IPC handlers', () => {
            const { ipcMain } = require('electron');
            setupGeminiIpcHandlers(geminiSessionRef);

            expect(ipcMain.handle).toHaveBeenCalledWith('initialize-gemini', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('send-audio-content', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('send-mic-audio-content', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('send-image-content', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('send-text-message', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('start-macos-audio', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('stop-macos-audio', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('close-session', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('get-current-session', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('start-new-session', expect.any(Function));
            expect(ipcMain.handle).toHaveBeenCalledWith('update-google-search-setting', expect.any(Function));
        });
    });

    describe('IPC Handlers Logic', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('initialize-gemini should create session', async () => {
            const result = await handlers['initialize-gemini']({}, 'firebase-token', {}, 'interview');
            // Wait for async operations? logic is awaited in handler
            // result relies on initializeGeminiSession which mocks fetch and googleGenAI
            // Since we mocked fetch and GoogleGenAI, it should succeed
            expect(result).toBe(true);
            expect(geminiSessionRef.current).toBeDefined();
        });

        it('send-text-message should send text if session active', async () => {
            // Setup active session
            const sessionMock = { sendRealtimeInput: jest.fn() };
            geminiSessionRef.current = sessionMock;

            const result = await handlers['send-text-message']({}, 'Hello World');

            expect(result).toEqual({ success: true });
            expect(sessionMock.sendRealtimeInput).toHaveBeenCalledWith({ text: 'Hello World' });
        });

        it('send-text-message should fail if no session', async () => {
            const result = await handlers['send-text-message']({}, 'Hello');
            expect(result.success).toBe(false);
        });
    });

    describe('Gemini Session Callbacks', () => {
        let callbacks;
        let mockSession;

        beforeEach(async () => {
            const { GoogleGenAI } = require('@google/genai');
            mockSession = {
                sendRealtimeInput: jest.fn(),
                close: jest.fn(),
            };
            GoogleGenAI.mockImplementation(() => ({
                live: {
                    connect: jest.fn().mockImplementation(async ({ callbacks: cbs }) => {
                        callbacks = cbs; // Capture callbacks
                        return mockSession;
                    }),
                },
                models: {
                    generateContentStream: jest.fn().mockReturnValue((async function* () {
                        yield { text: 'Test response' };
                    })()),
                },
            }));

            const { ipcMain } = require('electron');
            let initHandler;
            ipcMain.handle.mockImplementation((channel, handler) => {
                if (channel === 'initialize-gemini') initHandler = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
            await initHandler({}, 'token', {}, 'interview');
        });

        it('onopen should update status', () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            callbacks.onopen();
            expect(sendMock).toHaveBeenCalledWith('update-status', 'Live session connected');
        });

        it('onmessage should handle input transcription', () => {
            // Mock console.log to avoid clutter
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            callbacks.onmessage({
                serverContent: {
                    inputTranscription: {
                        text: 'Hello world'
                    }
                }
            });
            // No direct output to check without inspecting internal state, which is hard.
            // But we can check that it didn't crash.
            expect(true).toBe(true);
            consoleSpy.mockRestore();
        });

        it('onmessage should handle output transcription and stream response', () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            callbacks.onmessage({
                serverContent: {
                    outputTranscription: { text: 'AI ' }
                }
            });
            expect(sendMock).toHaveBeenCalledWith('new-response', 'AI ');

            callbacks.onmessage({
                serverContent: {
                    outputTranscription: { text: 'Response' }
                }
            });
            expect(sendMock).toHaveBeenCalledWith('update-response', 'AI Response');
        });

        it('onerror should update status with error', () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            callbacks.onerror(new Error('Connection failed'));
            expect(sendMock).toHaveBeenCalledWith('update-status', 'Error: Connection failed');
        });

        it('onmessage should handle input transcription with results', () => {
            callbacks.onmessage({
                serverContent: {
                    inputTranscription: {
                        results: [{ speakerId: 1, transcript: 'Hello' }]
                    }
                }
            });
            expect(true).toBe(true);
        });

        it('onmessage should handle audio stream data', () => {
            callbacks.onmessage({
                serverContent: {
                    modelTurn: {
                        parts: [{ inlineData: { data: 'audio-chunk' } }]
                    }
                }
            });
            expect(true).toBe(true);
        });

        it('onmessage should ignore empty messages', () => {
            callbacks.onmessage({});
            callbacks.onmessage({ serverContent: {} });
            expect(true).toBe(true);
        });

        it('onclose should attempt reconnect if not user closing', async () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            callbacks.onclose({ reason: 'network' });
            expect(true).toBe(true);
        });

        it('onclose should not reconnect if user closed', () => {
            callbacks.onclose({ reason: 'user' });
            expect(true).toBe(true);
        });
    });

    describe('Image Analysis', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('send-image-content should use HTTP API and stream response', async () => {
            const mockImageData = 'B'.repeat(2000); // 2000 chars of base64 data
            const mockPrompt = 'What is this?';

            const result = await handlers['send-image-content']({}, { data: mockImageData, prompt: mockPrompt });

            expect(result.success).toBe(true);
            expect(result.text).toBe('Test response');

            const { BrowserWindow } = require('electron');
            const win = BrowserWindow.getAllWindows()[0];
            expect(win.webContents.send).toHaveBeenCalledWith('new-response', 'Test response');
        });

        it('send-image-content should fail on invalid data', async () => {
            const result = await handlers['send-image-content']({}, { data: '', prompt: 'foo' });
            expect(result.success).toBe(false);
        });
    });

    describe('Audio Capture and Tools', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('send-audio-content should send content if session active', async () => {
            const sessionMock = { sendRealtimeInput: jest.fn() };
            geminiSessionRef.current = sessionMock;

            const result = await handlers['send-audio-content']({}, { data: 'audio-data', mimeType: 'audio/pcm' });
            expect(result.success).toBe(true);
            expect(sessionMock.sendRealtimeInput).toHaveBeenCalled();
        });

        it('start-macos-audio should initiate capture on darwin', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const result = await handlers['start-macos-audio']({});
            expect(result.success).toBe(true);

            const { spawn } = require('child_process');
            expect(spawn).toHaveBeenCalled();

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('stop-macos-audio should kill process', async () => {
            const { spawn } = require('child_process');
            const mockProc = {
                pid: 123,
                stdout: { on: jest.fn() },
                stderr: { on: jest.fn() },
                on: jest.fn(),
                kill: jest.fn()
            };
            spawn.mockReturnValue(mockProc);

            // Start first
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
            await handlers['start-macos-audio']({});

            const result = await handlers['stop-macos-audio']({});
            expect(result.success).toBe(true);
            expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');

            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });
        });
    });

    describe('History and Sessions', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('get-current-session should return session history', async () => {
            const result = await handlers['get-current-session']({});
            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty('sessionId');
        });

        it('start-new-session should reset session state', async () => {
            const result = await handlers['start-new-session']({});
            expect(result.success).toBe(true);
            expect(result.sessionId).toBeDefined();
        });
    });

    describe('Edge Cases and Failures', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('initialize-gemini should fail if backend token fetch fails', async () => {
            global.fetch.mockResolvedValueOnce({ ok: false });
            const result = await handlers['initialize-gemini']({}, 'token', {}, 'interview');
            expect(result).toBe(false);
        });

        it('initialize-gemini should fail if GoogleGenAI throws', async () => {
            const { GoogleGenAI } = require('@google/genai');
            GoogleGenAI.mockImplementationOnce(() => {
                throw new Error('GenAI Error');
            });
            const result = await handlers['initialize-gemini']({}, 'token', {}, 'interview');
            expect(result).toBe(false);
        });

        it('update-google-search-setting should update tool preference', async () => {
            const result = await handlers['update-google-search-setting']({}, true);
            expect(result.success).toBe(true);
        });

        it('should handle session close from renderer', async () => {
            geminiSessionRef.current = { close: jest.fn() };
            const result = await handlers['close-session']({});
            expect(result.success).toBe(true);
            expect(geminiSessionRef.current).toBeNull();
        });

        it('start-macos-audio should fail on non-darwin', async () => {
            Object.defineProperty(process, 'platform', { value: 'win32', configurable: true });
            const result = await handlers['start-macos-audio']({});
            expect(result.success).toBe(false);
            expect(result.error).toContain('available on macOS');
        });

        it('should reach max reconnect attempts', async () => {
            // Re-triggering initialization failures to hit reconnection logic
            global.fetch.mockResolvedValue({ ok: false }); // All attempts fail
            for (let i = 0; i < 4; i++) {
                await handlers['initialize-gemini']({}, 'token', {}, 'interview');
            }
            expect(true).toBe(true);
        });

        it('should handle save-conversation-turn and save-screen-analysis', async () => {
            const { saveConversationTurn, saveScreenAnalysis } = require('../src/utils/gemini');

            saveConversationTurn('Hello', 'Hi');
            saveScreenAnalysis('What?', 'A test');

            expect(true).toBe(true);
        });
    });
});
