import 'dotenv/config';
import app          from './app.js';
import { connectDB } from './config/db.js';
import { env }       from './config/env.js';
import { logger }    from './utils/logger.js';

const PORT = env.PORT || 5000;

// ── Boot sequence ─────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to database first
    await connectDB();
    logger.info('[Server] Database connected ✓');

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`[Server] Running in ${env.NODE_ENV} mode on port ${PORT} ✓`);
      logger.info(`[Server] API ready at http://localhost:${PORT}/api`);
    });

    // ── Graceful shutdown ─────────────────────────────────────
    // On SIGTERM (e.g. from hosting platform like Railway/Render)
    // or SIGINT (Ctrl+C in terminal), close the server cleanly
    // so in-flight requests finish before the process exits.

    const shutdown = (signal) => {
      logger.info(`[Server] ${signal} received — shutting down gracefully...`);
      server.close(() => {
        logger.info('[Server] HTTP server closed.');
        process.exit(0);
      });

      // Force exit if shutdown takes longer than 10 seconds
      setTimeout(() => {
        logger.error('[Server] Forced shutdown after timeout.');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error(`[Server] Failed to start: ${err.message}`);
    process.exit(1);
  }
};

// ── Unhandled rejection / exception guards ────────────────────
// Catches async errors that slip through (e.g. a promise nobody awaited)
process.on('unhandledRejection', (reason) => {
  logger.error(`[Server] Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`[Server] Uncaught Exception: ${err.message}`);
  process.exit(1);
});

startServer();