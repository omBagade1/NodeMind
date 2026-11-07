import { asyncHandler } from '../middleware/asyncHandler.js';
import { ApiError } from '../errors/ApiError.js';
import { generateReply } from '../services/ai.service.js';

export const chat = asyncHandler(async (req, res) => {
  const { prompt } = req.body ?? {};

  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new ApiError(400, 'Please provide a non-empty "prompt" string in the request body.');
  }

  const reply = await generateReply(prompt.trim());
  res.json({ reply });
});
