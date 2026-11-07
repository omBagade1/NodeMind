import { Ollama } from 'ollama';
import { config } from '../config/index.js';
import { ApiError } from '../errors/ApiError.js';

const { host, model, timeoutMs } = config.ollama;

function isTimeoutError(error) {
  return error?.name === 'AbortError' || error?.name === 'TimeoutError' || error?.code === 'ABORT_ERR';
}

function isConnectionError(error) {
  const code = error?.cause?.code ?? error?.code;
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'EHOSTUNREACH' ||
    error?.message?.includes('fetch failed')
  );
}

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

export async function generateReply(prompt) {
  try {
    const response = await ollama.chat({
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.message.content;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new ApiError(504, `The model did not respond within ${timeoutMs / 1000}s. Please try again.`, {
        cause: error,
      });
    }

    if (isConnectionError(error)) {
      throw new ApiError(503, 'The LLM service is unreachable. Make sure Ollama is running.', {
        cause: error,
      });
    }

    throw new ApiError(502, `The LLM service returned an error: ${error.message}`, { cause: error });
  }
}
