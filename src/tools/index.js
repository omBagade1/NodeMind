import { readFileTool, writeFileTool, listDirectoryTool } from './fileSystem.tools.js';
import { runCommandTool } from './terminal.tools.js';

export const tools = [readFileTool, writeFileTool, listDirectoryTool, runCommandTool];

// Fast lookup Map: 'tool_name' -> async executeFunction(args)
export const toolExecutors = new Map(
  tools.map((tool) => [tool.definition.function.name, tool.execute])
);

// Array of tool definitions formatted for Ollama's `tools` parameter
export const toolDefinitions = tools.map((tool) => tool.definition);
