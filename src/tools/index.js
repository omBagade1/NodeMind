import {
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  searchCodebaseTool,
} from './fileSystem.tools.js';
import { runCommandTool } from './terminal.tools.js';
import { gitStatusTool, gitDiffTool } from './git.tools.js';

export const tools = [
  readFileTool,
  writeFileTool,
  listDirectoryTool,
  searchCodebaseTool,
  runCommandTool,
  gitStatusTool,
  gitDiffTool,
];

// Fast lookup Map: 'tool_name' -> async executeFunction(args)
export const toolExecutors = new Map(
  tools.map((tool) => [tool.definition.function.name, tool.execute])
);

// Array of tool definitions formatted for Ollama's `tools` parameter
export const toolDefinitions = tools.map((tool) => tool.definition);
