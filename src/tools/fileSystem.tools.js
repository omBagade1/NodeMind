import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveSafePath } from '../utils/pathGuard.js';

const MAX_OUTPUT_CHARS = 10000;

export const readFileTool = {
  definition: {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the text content of a file at a given path.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The relative or absolute path of the file to read.',
          },
        },
        required: ['path'],
      },
    },
  },
  execute: async ({ path: filePath }) => {
    const safePath = await resolveSafePath(filePath, 'read');
    const content = await fs.readFile(safePath, 'utf-8');

    if (content.length > MAX_OUTPUT_CHARS) {
      return (
        content.slice(0, MAX_OUTPUT_CHARS) +
        `\n... [Truncated: content exceeded ${MAX_OUTPUT_CHARS} characters]`
      );
    }
    return content;
  },
};

export const writeFileTool = {
  definition: {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write or overwrite content to a file at a given path.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The relative or absolute path of the file to write.',
          },
          content: {
            type: 'string',
            description: 'The complete text content to write into the file.',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  execute: async ({ path: filePath, content }) => {
    const safePath = await resolveSafePath(filePath, 'write');
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, content, 'utf-8');
    return `Successfully wrote ${content.length} characters to ${filePath}`;
  },
};

export const listDirectoryTool = {
  definition: {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List all files and subdirectories inside a directory.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The directory path to list. Defaults to "." (current workspace).',
          },
        },
      },
    },
  },
  execute: async ({ path: dirPath = '.' } = {}) => {
    const safePath = await resolveSafePath(dirPath, 'read');
    const entries = await fs.readdir(safePath, { withFileTypes: true });

    if (entries.length === 0) {
      return 'Directory is empty.';
    }

    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(safePath, entry.name);
        if (entry.isDirectory()) {
          return `📁 ${entry.name}/`;
        }
        const stats = await fs.stat(fullPath);
        return `📄 ${entry.name} (${stats.size} bytes)`;
      })
    );

    return items.join('\n');
  },
};
