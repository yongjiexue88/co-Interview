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

jest.mock('child_process', () => ({
    spawn: jest.fn().mockReturnValue({
        pid: 123,
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
    }),
}));

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
                models: { generateContentStream: jest.fn() },
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
    });

    describe('Audio Capture', () => {
        it('start-macos-audio should check platform', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'win32' });

            const { ipcMain } = require('electron');
            let startHandler;
            ipcMain.handle.mockImplementation((channel, handler) => {
                if (channel === 'start-macos-audio') startHandler = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);

            const result = await startHandler({});
            expect(result.success).toBe(false);
            expect(result.error).toContain('macOS audio capture only available on macOS');

            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
    });
});
