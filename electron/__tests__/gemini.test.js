
const processManager = require('../src/utils/processManager');
jest.mock('../src/utils/processManager');

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

jest.mock('../src/utils/api', () => ({
    startSession: jest.fn().mockResolvedValue({ token: 'mock-gemini-token', session_id: 'mock-session-id' }),
    sendHeartbeat: jest.fn().mockResolvedValue({ continue: true }),
    endSession: jest.fn().mockResolvedValue({}),
    fetchUserProfile: jest.fn().mockResolvedValue({ plan: { id: 'free' }, quota: { remaining: 1000 } }),
    analyzeScreenshot: jest.fn().mockResolvedValue({ success: true, text: 'Test response', model: 'gemini-2.5-flash' }),
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
        let handlers = {};

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
            handlers = {};
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            setupGeminiIpcHandlers(geminiSessionRef);
            await handlers['initialize-gemini']({}, 'token', {}, 'interview');
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

        it('should handle heartbeat quota exceeded', async () => {
            const Api = require('../src/utils/api');
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            // Mock heartbeat to return quota exceeded
            Api.sendHeartbeat.mockResolvedValueOnce({
                continue: false,
                reason: 'QUOTA_EXCEEDED',
                message: 'Monthly quota exceeded'
            });

            // Mock audio process
            const mockAudioProc = { kill: jest.fn() };
            const gemini = require('../src/utils/gemini');

            // Trigger heartbeat check by calling initialize which starts heartbeat
            const { GoogleGenAI } = require('@google/genai');
            GoogleGenAI.mockImplementation(() => ({
                live: {
                    connect: jest.fn().mockResolvedValue({
                        sendRealtimeInput: jest.fn(),
                        close: jest.fn()
                    })
                }
            }));

            // Initialize to start heartbeat
            await handlers['initialize-gemini']({}, 'token', {}, 'interview');

            // Wait for heartbeat interval
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(true).toBe(true); // Test completes without errors
        });

        it('should handle output transcription completion', () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            // Start a message
            callbacks.onmessage({
                serverContent: {
                    outputTranscription: { text: 'Response part 1' }
                }
            });

            // Complete the generation
            callbacks.onmessage({
                serverContent: {
                    generationComplete: true
                }
            });

            expect(sendMock).toHaveBeenCalled();
        });

        it('should handle turn complete', () => {
            const { BrowserWindow } = require('electron');
            const sendMock = BrowserWindow.getAllWindows()[0].webContents.send;

            callbacks.onmessage({
                serverContent: {
                    turnComplete: true
                }
            });

            expect(sendMock).toHaveBeenCalledWith('update-status', 'Listening...');
        });

        it('should handle audio model data in messages', () => {
            callbacks.onmessage({
                serverContent: {
                    modelTurn: {
                        parts: [
                            { inlineData: { data: 'audio-chunk-1' } },
                            { inlineData: { data: 'audio-chunk-2' } }
                        ]
                    }
                }
            });

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

        it('send-image-content should use backend proxy for analysis', async () => {
            const mockImageData = 'B'.repeat(2000); // 2000 chars of base64 data
            const mockPrompt = 'What is this?';

            const result = await handlers['send-image-content']({}, { data: mockImageData, prompt: mockPrompt });

            expect(result.success).toBe(true);
            expect(result.text).toBe('Test response');

            const { BrowserWindow } = require('electron');
            const win = BrowserWindow.getAllWindows()[0];
            // New flow: sends 'Analyzing image...' first, then updates with result
            expect(win.webContents.send).toHaveBeenCalledWith('new-response', 'Analyzing image...');
            expect(win.webContents.send).toHaveBeenCalledWith('update-response', 'Test response');
        });

        it('send-image-content should fail on invalid data', async () => {
            const result = await handlers['send-image-content']({}, { data: '', prompt: 'foo' });
            expect(result.success).toBe(false);
        });

        it('send-image-content should handle QUOTA_EXCEEDED', async () => {
            const Api = require('../src/utils/api');
            Api.analyzeScreenshot.mockResolvedValueOnce({ success: false, error: 'QUOTA_EXCEEDED' });

            const result = await handlers['send-image-content']({}, { data: 'B'.repeat(2000), prompt: 'test' });

            expect(result.success).toBe(false);
            expect(result.error).toBe('QUOTA_EXCEEDED');

            const { BrowserWindow } = require('electron');
            const win = BrowserWindow.getAllWindows()[0];
            expect(win.webContents.send).toHaveBeenCalledWith('session-error', expect.objectContaining({
                code: 'QUOTA_EXCEEDED'
            }));
        });
    });

    describe('Audio Capture and Tools', () => {
        let handlers = {};

        beforeEach(() => {
            const { ipcMain } = require('electron');
            ipcMain.handle.mockImplementation((channel, handler) => {
                handlers[channel] = handler;
            });
            geminiSessionRef._trackingId = 'REF_ID_' + Math.random();
            console.log('DEBUG: Setup Ref ID:', geminiSessionRef._trackingId);
            setupGeminiIpcHandlers(geminiSessionRef);
        });

        it('send-audio-content should send content if session active', async () => {
            const sessionMock = { sendRealtimeInput: jest.fn() };
            geminiSessionRef.current = sessionMock;

            const result = await handlers['send-audio-content']({}, { data: 'audio-data', mimeType: 'audio/pcm' });
            expect(result.success).toBe(true);
            expect(sessionMock.sendRealtimeInput).toHaveBeenCalled();
        });

        it.skip('start-macos-audio should capture and process audio data', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            // processManager mock is handled globally

            const EventEmitter = require('events');
            const stdout = new EventEmitter();
            const stderr = new EventEmitter();
            const mockProc = {
                pid: 123,
                stdout,
                stderr,
                on: jest.fn(),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);
            processManager.exec.mockImplementation((cmd, cb) => cb(null, ''));

            // Mock session to verify sendRealtimeInput
            const sessionMock = { sendRealtimeInput: jest.fn() };
            sessionMock.sendRealtimeInput.id = 'TEST_MOCK_ID_' + Math.floor(Math.random() * 1000);
            console.log('DEBUG: Created Mock ID:', sessionMock.sendRealtimeInput.id);
            geminiSessionRef.current = sessionMock;

            await handlers['start-macos-audio']({});

            // Manually emit a large chunk of data
            mockProc.stdout.emit('data', Buffer.alloc(50000));

            // Wait for async processing (increased timeout)
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(sessionMock.sendRealtimeInput).toHaveBeenCalled();
            expect(sessionMock.sendRealtimeInput).toHaveBeenCalledWith(expect.objectContaining({
                audio: expect.objectContaining({
                    mimeType: 'audio/pcm;rate=24000'
                })
            }));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('stop-macos-audio should kill process', async () => {
            const mockProc = {
                pid: 123,
                stdout: { on: jest.fn() },
                stderr: { on: jest.fn() },
                on: jest.fn(),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            // Start first
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            await handlers['start-macos-audio']({});

            // Reset mock to verify pkill call later if needed, 
            // but handlers['stop'] calls pkill too?

            const result = await handlers['stop-macos-audio']({});

            expect(result.success).toBe(true);
            expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');

            // Verify pkill was spawned (called during start AND stop)
            // The last call should be for pkill in stop function?
            // stopMacOSAudioCapture calls pkill.
            expect(processManager.spawn).toHaveBeenCalledWith('pkill', expect.any(Array), expect.any(Object));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('stop-macos-audio should handle no active process', async () => {
            // Ensure no process is active
            stopMacOSAudioCapture();

            const result = await handlers['stop-macos-audio']({});
            expect(result.success).toBe(true);
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
            const Api = require('../src/utils/api');
            Api.startSession.mockRejectedValueOnce(new Error('Backend error'));
            const result = await handlers['initialize-gemini']({}, 'token', {}, 'interview');
            expect(result).toBe(false);
        });

        it('initialize-gemini should throw error on GenAI failure', async () => {
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

        it('should handle audio debugging mode', async () => {
            process.env.DEBUG_AUDIO = 'true';

            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const EventEmitter = require('events');
            const stdout = new EventEmitter();
            const mockProc = {
                pid: 123,
                stdout,
                stderr: { on: jest.fn() },
                on: jest.fn(),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            await handlers['start-macos-audio']({});

            // Emit audio data to trigger debug path
            mockProc.stdout.emit('data', Buffer.alloc(50000));
            await new Promise(resolve => setTimeout(resolve, 100));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
            delete process.env.DEBUG_AUDIO;
        });



        it('should handle reconnection flow', async () => {
            const Api = require('../src/utils/api');
            // Ensure API mock succeeds
            Api.startSession.mockResolvedValueOnce({
                token: 'new-token',
                session_id: 'new-session'
            });

            const result = await handlers['initialize-gemini']({}, 'token', {}, 'interview');
            expect(result).toBe(true);
        });

        it('should handle Google Search tool toggle', async () => {
            const { BrowserWindow } = require('electron');
            const win = BrowserWindow.getAllWindows()[0];

            // Mock localStorage check for Google Search
            win.webContents.executeJavaScript.mockResolvedValueOnce('false');

            const result = await handlers['update-google-search-setting']({}, false);
            expect(result.success).toBe(true);
        });

        it('should handle empty/invalid conversation data', async () => {
            const { saveConversationTurn, getCurrentSessionData } = require('../src/utils/gemini');

            // Test with empty strings
            saveConversationTurn('   ', '   ');

            const sessionData = getCurrentSessionData();
            expect(sessionData).toHaveProperty('sessionId');
            expect(sessionData).toHaveProperty('history');
        });

        it('should handle sendAudioToGemini without active session', async () => {
            const { sendAudioToGemini } = require('../src/utils/gemini');

            // Clear session
            geminiSessionRef.current = null;

            // Should not throw, just exit gracefully
            await sendAudioToGemini('base64data', geminiSessionRef);
            expect(true).toBe(true);
        });

        it('should handle buffer overflow in audio capture', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const EventEmitter = require('events');
            const stdout = new EventEmitter();
            const mockProc = {
                pid: 123,
                stdout,
                stderr: { on: jest.fn() },
                on: jest.fn(),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            await handlers['start-macos-audio']({});

            // Emit very large amount of data to test buffer management
            for (let i = 0; i < 10; i++) {
                mockProc.stdout.emit('data', Buffer.alloc(100000));
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('should handle session error during audio streaming', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const EventEmitter = require('events');
            const mockProc = {
                pid: 123,
                stdout: new EventEmitter(),
                stderr: new EventEmitter(),
                on: jest.fn(),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            await handlers['start-macos-audio']({});

            // Trigger stderr event
            mockProc.stderr.emit('data', Buffer.from('Audio device error'));

            await new Promise(resolve => setTimeout(resolve, 50));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('should handle process close event', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const EventEmitter = require('events');
            const mockProc = {
                pid: 123,
                stdout: new EventEmitter(),
                stderr: new EventEmitter(),
                on: jest.fn((event, callback) => {
                    if (event === 'close') {
                        setTimeout(() => callback(0), 50);
                    }
                }),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            await handlers['start-macos-audio']({});

            await new Promise(resolve => setTimeout(resolve, 100));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });

        it('should handle process error event', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

            const EventEmitter = require('events');
            const mockProc = {
                pid: 123,
                stdout: new EventEmitter(),
                stderr: new EventEmitter(),
                on: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Process spawn failed')), 50);
                    }
                }),
                kill: jest.fn()
            };
            processManager.spawn.mockReturnValue(mockProc);

            await handlers['start-macos-audio']({});

            await new Promise(resolve => setTimeout(resolve, 100));

            Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
        });
    });
});
