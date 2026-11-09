import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export const gitStatusTool = {
  definition: {
    type: 'function',
    function: {
      name: 'git_status',
      description: 'Check the current git status (modified, staged, untracked files).',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  execute: async () => {
    try {
      const { stdout } = await execAsync('git status -s', { cwd: process.cwd() });
      return stdout.trim() || 'Working directory is clean. No uncommitted changes.';
    } catch (error) {
      return `Git status error: ${error.message}`;
    }
  },
};

export const gitDiffTool = {
  definition: {
    type: 'function',
    function: {
      name: 'git_diff',
      description: 'Show line-by-line git diff of uncommitted changes.',
      parameters: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            description: 'Optional relative path to a specific file to diff.',
          },
        },
      },
    },
  },
  execute: async ({ file = '' } = {}) => {
    try {
      const cmd = file ? `git diff -- "${file}"` : 'git diff';
      const { stdout } = await execAsync(cmd, { cwd: process.cwd() });
      return stdout.trim() || 'No changes to diff.';
    } catch (error) {
      return `Git diff error: ${error.message}`;
    }
  },
};
