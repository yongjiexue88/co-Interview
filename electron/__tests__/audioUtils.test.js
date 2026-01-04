const {
    pcmToWav,
    analyzeAudioBuffer,
    saveDebugAudio,
} = require('../src/audioUtils');
const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('fs');
jest.mock('os');

describe('Audio Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        os.homedir.mockReturnValue('/mock/homedir');
    });

    describe('pcmToWav', () => {
        it('should create a valid WAV file buffer and write to disk', () => {
            const mockBuffer = Buffer.alloc(100);
            const outputPath = '/mock/output.wav';

            fs.writeFileSync = jest.fn();

            const result = pcmToWav(mockBuffer, outputPath);

            expect(result).toBe(outputPath);
            expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, expect.any(Buffer));

            // Inspect the buffer written
            const writtenBuffer = fs.writeFileSync.mock.calls[0][1];
            expect(writtenBuffer.subarray(0, 4).toString()).toBe('RIFF');
            expect(writtenBuffer.subarray(8, 12).toString()).toBe('WAVE');
            expect(writtenBuffer.subarray(12, 16).toString()).toBe('fmt ');
        });
    });

    describe('analyzeAudioBuffer', () => {
        it('should analyze silence correctly', () => {
            const buffer = Buffer.alloc(200); // Zeros (silence)
            const analysis = analyzeAudioBuffer(buffer);

            expect(analysis.sampleCount).toBe(100); // 200 bytes / 2 bytes per sample (16-bit)
            expect(analysis.minValue).toBe(0);
            expect(analysis.maxValue).toBe(0);
            expect(analysis.silencePercentage).toBe(100);
        });

        it('should analyze signal correctly', () => {
            // Create a buffer with some known values
            // 20000 (0x4E20) and -20000 (0xB1E0)
            const buffer = Buffer.alloc(4);
            buffer.writeInt16LE(20000, 0);
            buffer.writeInt16LE(-20000, 2);

            const analysis = analyzeAudioBuffer(buffer);

            expect(analysis.sampleCount).toBe(2);
            expect(analysis.maxValue).toBe(20000);
            expect(analysis.minValue).toBe(-20000);
            expect(analysis.silencePercentage).toBe(0);
        });
    });

    describe('saveDebugAudio', () => {
        it('should create debug directory and save files', () => {
            const buffer = Buffer.alloc(10);
            fs.existsSync.mockReturnValue(false);
            fs.mkdirSync.mockImplementation();
            fs.writeFileSync.mockImplementation();

            saveDebugAudio(buffer, 'test-audio');

            expect(fs.existsSync).toHaveBeenCalledWith(path.join('/mock/homedir', 'co-interview-debug'));
            expect(fs.mkdirSync).toHaveBeenCalledWith(path.join('/mock/homedir', 'co-interview-debug'), { recursive: true });
            expect(fs.writeFileSync).toHaveBeenCalledTimes(3); // pcm, wav, json
        });
    });
});
