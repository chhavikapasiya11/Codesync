const { spawn } = require('child_process');

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('terminal-output', ({ sessionId, codeToRun, language }) => {
      let command, args;

      switch (language) {
        case 'javascript':
          command = 'node';
          args = ['-e', codeToRun];
          break;

        case 'python':
          command = 'python';
          args = ['-c', codeToRun];
          break;

        case 'c':
        case 'cpp':
        case 'java':
        case 'go':
        case 'php':
        case 'ruby':
          return socket.emit('terminal-result', {
            output: '',
            error: `${language.toUpperCase()} execution not supported locally. Use Judge0 or Docker.`,
          });

        default:
          return socket.emit('terminal-result', {
            output: '',
            error: 'Unsupported language',
          });
      }

      const child = spawn(command, args, { timeout: 5000 });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', () => {
        io.to(sessionId).emit('terminal-result', { output, error });
      });
    });
  });
};
