import app from './app.js';
import { config } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`🚀 Server listening at http://localhost:${config.port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
