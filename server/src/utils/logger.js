// ============================================================
// utils/logger.js
// Lightweight logger used across controllers.
// Uses winston — structured JSON in production, coloured
// human-readable text in development.
// Install: npm install winston
// ============================================================

import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Dev format: coloured  →  [2025-01-01 12:00:00] INFO: User logged in
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) =>
    stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`
  )
);

// Prod format: JSON for log aggregators (Datadog, CloudWatch, etc.)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const isProd = env.isProd;

// In production (e.g. Vercel), the filesystem is read-only — skip file transports.
// Only write to files locally in development.
const transports = [new winston.transports.Console()];

if (!isProd) {
  transports.push(
    new winston.transports.File({
      filename: 'src/logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'src/logs/activity.log',
      level: 'info',
    })
  );
}

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports,
});