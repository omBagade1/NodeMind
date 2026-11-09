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

export const searchCodebaseTool = {
  definition: {
    type: 'function',
    function: {
      name: 'search_codebase',
      description:
        'Search for a keyword or text pattern across files in the workspace. Returns matching file paths and line numbers.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The string or keyword to search for.',
          },
          directory: {
            type: 'string',
            description: 'Subdirectory to search in. Defaults to "." (entire workspace).',
          },
        },
        required: ['query'],
      },
    },
  },
  execute: async ({ query, directory = '.' }) => {
    const safeDir = await resolveSafePath(directory, 'read');
    const results = [];
    const maxResults = 25;

    async function searchRecursively(currentPath) {
      if (results.length >= maxResults) return;

      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= maxResults) break;

        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.relative(process.cwd(), fullPath);

        if (entry.isDirectory()) {
          if (['node_modules', '.git', 'dist', 'build', '.cache'].includes(entry.name)) {
            continue;
          }
          await searchRecursively(fullPath);
        } else if (entry.isFile()) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (results.length < maxResults && line.toLowerCase().includes(query.toLowerCase())) {
                results.push(`${relPath}:${index + 1}: ${line.trim()}`);
              }
            });
          } catch {
            // Skip unreadable/binary files
          }
        }
      }
    }

    await searchRecursively(safeDir);

    if (results.length === 0) {
      return `No matches found for query "${query}".`;
    }

    return results.join('\n');
  },
};
