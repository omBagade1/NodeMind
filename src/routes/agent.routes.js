import { Router } from 'express';
import { run, resetSession } from '../controllers/agent.controller.js';

const router = Router();

router.post('/', run);
router.delete('/:sessionId', resetSession);

export default router;
