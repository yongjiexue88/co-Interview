const { spawn, exec } = require('child_process');

class ProcessManager {
    spawn(command, args, options) {
        return spawn(command, args, options);
    }

    exec(command, options, callback) {
        return exec(command, options, callback);
    }
}

module.exports = new ProcessManager();
