const fs = require('fs');
const path = require('path');
const { pcmToWav, analyzeAudioBuffer, saveDebugAudio } = require('../src/audioUtils');

jest.mock('fs');
jest.mock('path');
jest.mock('os', () => ({
    homedir: () => '/mock/home',
}));

describe('audioUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        path.join.mockImplementation((...args) => args.join('/'));
    });

    describe('pcmToWav', () => {
        it('should correctly create a WAV file from PCM data', () => {
            const pcmBuffer = Buffer.from([0, 0, 0, 0]); // 4 bytes of silence
            const outputPath = '/mock/output.wav';
            fs.writeFileSync.mockImplementation(() => { });

            const result = pcmToWav(pcmBuffer, outputPath);

            expect(result).toBe(outputPath);
            expect(fs.writeFileSync).toHaveBeenCalledTimes(1);

            const [callPath, callBuffer] = fs.writeFileSync.mock.calls[0];
            expect(callPath).toBe(outputPath);

            // WAV header is 44 bytes, plus 4 bytes of data = 48 bytes
            expect(callBuffer.length).toBe(48);

            // Check "RIFF"
            expect(callBuffer.slice(0, 4).toString()).toBe('RIFF');
            // Check "WAVE"
            expect(callBuffer.slice(8, 12).toString()).toBe('WAVE');
        });
    });

    describe('analyzeAudioBuffer', () => {
        it('should analyze audio buffer and return correct stats', () => {
            // Create a buffer with known values (16-bit integers)
            // Values: 1000, -1000, 0, 0
            const buffer = Buffer.alloc(8);
            buffer.writeInt16LE(1000, 0);
            buffer.writeInt16LE(-1000, 2);
            buffer.writeInt16LE(0, 4);
            buffer.writeInt16LE(0, 6);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            const analysis = analyzeAudioBuffer(buffer, 'Test Audio');

            expect(analysis.sampleCount).toBe(4);
            expect(analysis.maxValue).toBe(1000);
            expect(analysis.minValue).toBe(-1000);
            expect(analysis.avgValue).toBe(0);
            expect(analysis.silencePercentage).toBe(50); // 2 out of 4 are 0 (< 100)

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should use default label if not provided', () => {
            const buffer = Buffer.alloc(4);
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            analyzeAudioBuffer(buffer);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Audio Analysis'));
            consoleSpy.mockRestore();
        });
    });

    describe('saveDebugAudio', () => {
        it('should save debug audio files and metadata', () => {
            const buffer = Buffer.from([0, 0]);
            const type = 'test_audio';
            const timestamp = 1234567890;

            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation(() => { });
            fs.writeFileSync.mockImplementation(() => { });

            const result = saveDebugAudio(buffer, type, timestamp);

            expect(fs.existsSync).toHaveBeenCalledWith('/mock/home/co-interview-debug');
            expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/home/co-interview-debug', { recursive: true });

            expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
            // 1. PCM file
            // 2. WAV file (inside pcmToWav)
            // 3. JSON metadata

            expect(result.pcmPath).toContain('test_audio_1234567890.pcm');
            expect(result.wavPath).toContain('test_audio_1234567890.wav');
            expect(result.metaPath).toContain('test_audio_1234567890.json');
        });

        it('should use default timestamp', () => {
            const buffer = Buffer.from([0, 0]);
            fs.existsSync.mockReturnValue(true);
            fs.writeFileSync.mockImplementation(() => { }); // Mock writeFileSync for the internal calls
            const result = saveDebugAudio(buffer, 'test');
            expect(result.pcmPath).toMatch(/test_\d+\.pcm/);
        });

        it('should exist correctly if directory already exists', () => {
            const buffer = Buffer.from([0, 0]);
            fs.existsSync.mockReturnValue(true);

            saveDebugAudio(buffer, 'test', 123);

            expect(fs.mkdirSync).not.toHaveBeenCalled();
        });
    });
});
