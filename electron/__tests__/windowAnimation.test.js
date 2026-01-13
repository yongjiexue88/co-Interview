const { animateWindowResize } = require('../src/utils/window');
const { BrowserWindow, screen } = require('electron');

jest.mock('electron', () => ({
    BrowserWindow: {
        getAllWindows: jest.fn(),
    },
    screen: {
        getPrimaryDisplay: jest.fn().mockReturnValue({
            workAreaSize: { width: 1920, height: 1080 }
        }),
    },
    ipcMain: {
        handle: jest.fn(),
    }
}));

describe('animateWindowResize', () => {
    let mockWindow;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockWindow = {
            getSize: jest.fn().mockReturnValue([800, 600]),
            setSize: jest.fn(),
            setPosition: jest.fn(),
            setResizable: jest.fn(),
            isDestroyed: jest.fn().mockReturnValue(false),
        };
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should animate size change', async () => {
        const promise = animateWindowResize(mockWindow, 900, 700, 'test');

        // Fast-forward time
        jest.advanceTimersByTime(600); // Duration is 500ms

        await promise;

        expect(mockWindow.setSize).toHaveBeenCalled();
        expect(mockWindow.setSize).toHaveBeenCalledWith(900, 700);
        expect(mockWindow.setResizable).toHaveBeenCalledWith(false);
    });

    it('should resolve immediately if already at target size', async () => {
        mockWindow.getSize.mockReturnValue([900, 700]);
        await animateWindowResize(mockWindow, 900, 700, 'test');
        expect(mockWindow.setSize).not.toHaveBeenCalled();
    });

    it('should handle window destruction during animation', async () => {
        const promise = animateWindowResize(mockWindow, 900, 700, 'test');

        // Advance slightly
        jest.advanceTimersByTime(50);

        // Destroy window
        mockWindow.isDestroyed.mockReturnValue(true);

        // Advance remaining time
        jest.advanceTimersByTime(200);

        await promise; // Should resolve safely
        // Logic handles safety
    });
});
