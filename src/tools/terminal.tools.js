import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { resolveSafePath } from '../utils/pathGuard.js';

const execAsync = promisify(exec);

// Safety blocklist for destructive or dangerous commands
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+[\/\\]/i,
  /format\s+[a-z]:/i,
  /del\s+\/[fsq]\s+[a-z]:/i,
  /rd\s+\/s\s+\/q\s+[a-z]:/i,
  /shutdown/i,
  /mkfs/i,
];

export const runCommandTool = {
  definition: {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Execute a terminal shell command (e.g. npm test, git status, dir).',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The shell command to execute.',
          },
          cwd: {
            type: 'string',
            description: 'Working directory for the command. Defaults to current directory.',
          },
        },
        required: ['command'],
      },
    },
  },
  execute: async ({ command, cwd = '.' }) => {
    // 1. Verify working directory permissions
    const safeCwd = await resolveSafePath(cwd, 'execute');

    // 2. Check for destructive commands
    const isDangerous = BLOCKED_PATTERNS.some((pattern) => pattern.test(command));
    if (isDangerous) {
      throw new Error(`Execution blocked: The command "${command}" matched a dangerous safety pattern.`);
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: safeCwd,
        timeout: 30000, // 30-second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      let output = stdout || '';
      if (stderr) output += `\n[stderr]: ${stderr}`;
      return output.trim() || '(Command executed successfully with no output)';
    } catch (error) {
      return `Command failed (Exit code: ${error.code ?? 'unknown'}):\n${error.stderr || error.message}`;
    }
  },
};
