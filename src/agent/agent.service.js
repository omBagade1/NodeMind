import { Ollama } from 'ollama';
import { config } from '../config/index.js';
import { ApiError } from '../errors/ApiError.js';
import { getSystemPrompt } from './prompts.js';
import { toolDefinitions, toolExecutors } from '../tools/index.js';

const { host, model, timeoutMs } = config.ollama;

// Setup fetch with timeout to prevent hanging connections
const fetchWithTimeout = async (input, init = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const ollama = new Ollama({ host, fetch: fetchWithTimeout });

/**
 * Runs the agent loop until the model finishes or reaches max iterations.
 * 
 * @param {string} prompt - User instruction or engineering goal.
 * @param {object} [options={}] - Config options (maxIterations, workspaceDir, history).
 * @returns {Promise<{ reply: string, steps: Array, iterations: number }>}
 */
export async function runAgent(prompt, options = {}) {
  const { maxIterations = 10, workspaceDir = process.cwd(), history = [] } = options;

  // Working Memory: Seed messages with System Prompt, past history, and user prompt
  const messages = [
    { role: 'system', content: getSystemPrompt(workspaceDir) },
    ...history,
    { role: 'user', content: prompt },
  ];

  const steps = [];

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    let response;

    try {
      response = await ollama.chat({
        model,
        messages,
        tools: toolDefinitions,
      });
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new ApiError(504, `Ollama timed out after ${timeoutMs / 1000}s.`);
      }
      throw new ApiError(502, `Ollama error: ${error.message}`, { cause: error });
    }

    const assistantMessage = response.message;
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls || [];

    // If no tools were called, the agent has reached its final answer!
    if (toolCalls.length === 0) {
      const initialLength = 1 + history.length;
      return {
        reply: assistantMessage.content || '(No response text generated)',
        steps,
        iterations: iteration,
        newMessages: messages.slice(initialLength),
      };
    }

    // Execute each tool requested by the model
    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolArgs = toolCall.function.arguments || {};
      const executor = toolExecutors.get(toolName);

      let result;
      if (!executor) {
        result = `Error: Tool "${toolName}" is not recognized.`;
      } else {
        try {
          console.log(`\n⚙️ [Agent Iteration ${iteration}] Running tool: ${toolName}`, toolArgs);
          result = await executor(toolArgs);
        } catch (err) {
          result = `Error executing ${toolName}: ${err.message}`;
        }
      }

      // Record step for user-facing audit trail
      steps.push({
        iteration,
        tool: toolName,
        args: toolArgs,
        result: typeof result === 'string' ? result.slice(0, 500) : result,
      });

      // Append tool result into working memory for the next loop
      messages.push({
        role: 'tool',
        name: toolName,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      });
    }
  }

  // If loop exhausted max iterations
  const initialLength = 1 + history.length;
  return {
    reply: `Agent reached the maximum limit of ${maxIterations} iterations without completing.`,
    steps,
    iterations: maxIterations,
    newMessages: messages.slice(initialLength),
    incomplete: true,
  };
}
