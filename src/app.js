import express from 'express';
import chatRoutes from './routes/chat.routes.js';
import agentRoutes from './routes/agent.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(express.json());

app.use('/chat', chatRoutes);
app.use('/agent', agentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
