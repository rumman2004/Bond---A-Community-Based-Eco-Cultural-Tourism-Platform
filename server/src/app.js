// ============================================================
// app.js
// Express application setup.
// server.js imports this and calls app.listen(). 
// ============================================================

import express      from 'express';
import cors         from 'cors';
import helmet       from 'helmet';
import morgan       from 'morgan';
import cookieParser from 'cookie-parser';
import compression  from 'compression';

import { corsOptions }  from './config/corsOptions.js';
import { env }          from './config/env.js';
import router           from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound }     from './middlewares/notFound.js';
import { apiLimiter }   from './middlewares/rateLimiter.js';
import { logger }       from './utils/logger.js';

const app = express();

// ── Security headers ──────────────────────────────────────────
// CORS must come before helmet so preflight OPTIONS responses
// always include the correct Access-Control-* headers.
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

// Helmet — disable CSP since this is a pure JSON REST API (no HTML pages).
app.use(helmet({
  contentSecurityPolicy: false,   // API servers don't serve HTML; CSP is irrelevant
  crossOriginEmbedderPolicy: false,
}));

// ── Global rate limiter ───────────────────────────────────────
app.use('/api', apiLimiter);

// ── Body parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Compression ───────────────────────────────────────────────
app.use(compression());

// ── HTTP logging ──────────────────────────────────────────────
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Health check ──────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Bond API is running 🚀' });
});

// ── API routes ────────────────────────────────────────────────
app.use('/api', router);

// ── 404 → error handler ───────────────────────────────────────
app.use(notFound);

// ── Global error handler (must be last, 4 args) ───────────────
app.use(errorHandler);

export default app;