const processManager = require('../src/utils/processManager');
const cp = require('child_process');

jest.mock('child_process');

describe('ProcessManager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should spawn a process', () => {
        const mockSpawn = jest.fn();
        cp.spawn.mockImplementation(mockSpawn);

        processManager.spawn('ls', ['-la'], { stdio: 'pipe' });
        expect(mockSpawn).toHaveBeenCalledWith('ls', ['-la'], { stdio: 'pipe' });
    });

    it('should exec a command', () => {
        const mockExec = jest.fn();
        cp.exec.mockImplementation(mockExec);

        const callback = jest.fn();
        processManager.exec('echo hello', {}, callback);
        expect(mockExec).toHaveBeenCalledWith('echo hello', {}, callback);
    });
});
