import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../errors/ApiError.js';
import { runAgent } from '../agent/agent.service.js';
import { sessionStore } from '../agent/session.store.js';

export const run = asyncHandler(async (req, res) => {
  const { prompt, sessionId } = req.body ?? {};

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new ApiError(400, 'Please provide a non-empty "prompt" string in the request body.');
  }

  // 1. Fetch or create conversation session
  const session = sessionStore.getOrCreateSession(sessionId);

  // 2. Execute agent with session history
  const result = await runAgent(prompt.trim(), {
    history: session.history,
  });

  // 3. Save the new turn into session history
  if (result.newMessages) {
    sessionStore.appendHistory(session.id, result.newMessages);
  }

  // 4. Return results
  res.json({
    sessionId: session.id,
    reply: result.reply,
    steps: result.steps,
    iterations: result.iterations,
  });
});

export const resetSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const deleted = sessionStore.deleteSession(sessionId);

  res.json({
    success: true,
    message: deleted
      ? `Session "${sessionId}" successfully cleared.`
      : `Session "${sessionId}" was not found (may have already expired).`,
  });
});
