import dotenv from 'dotenv';
dotenv.config();

// ── JWT check ─────────────────────────────────────────────────
const hasJWT     = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
const hasRefresh = process.env.JWT_REFRESH_SECRET;
if (!hasJWT || !hasRefresh) {
  console.error('❌ Missing: JWT_SECRET (or JWT_ACCESS_SECRET) and JWT_REFRESH_SECRET');
  process.exit(1);
}

// ── DB check ──────────────────────────────────────────────────
const hasDBVars = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD;
const hasDBUrl  = process.env.DATABASE_URL;
if (!hasDBVars && !hasDBUrl) {
  console.error('❌ Missing DB config: set DB_HOST + DB_USER + DB_PASSWORD  or  DATABASE_URL');
  process.exit(1);
}

// ── Required app vars ─────────────────────────────────────────
const required = ['NODE_ENV', 'PORT', 'CLIENT_URL'];
const missing  = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing required env vars:\n  ' + missing.join('\n  '));
  process.exit(1);
}

export const env = {
  // App
  NODE_ENV:   process.env.NODE_ENV   || 'development',
  PORT:       parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database — individual vars preferred
  DB_HOST:     process.env.DB_HOST,
  DB_PORT:     parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME:     process.env.DB_NAME || 'postgres',
  DB_USER:     process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD?.replace(/^["']|["']$/g, ''), // strip accidental quotes
  DB_SSL:      process.env.DB_SSL,
  DATABASE_URL: process.env.DATABASE_URL, // fallback only

  // JWT
  JWT_SECRET:             process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET:     process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN         || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:    process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Email
  SMTP_HOST:  process.env.SMTP_HOST,
  SMTP_PORT:  parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER:  process.env.SMTP_USER,
  SMTP_PASS:  process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Bond <no-reply@bond.com>',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX:       parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Helpers
  isDev:  process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
};