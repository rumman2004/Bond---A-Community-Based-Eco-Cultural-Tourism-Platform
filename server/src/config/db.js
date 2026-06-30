import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const useSSL = env.DB_SSL === true || env.DB_SSL === 'true' || env.isProd;

// In production (Vercel), always prefer DATABASE_URL (Supabase connection pooler).
// The direct DB hostname (DB_HOST) is not reachable from Vercel serverless functions.
const poolConfig = (!env.isProd && env.DB_HOST)
  ? {
      host:     env.DB_HOST,
      port:     Number(env.DB_PORT) || 5432,
      database: env.DB_NAME || 'postgres',
      user:     env.DB_USER,
      password: String(env.DB_PASSWORD),
      ssl:      useSSL ? { rejectUnauthorized: false } : false,
    }
  : {
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };

const pool = new Pool({
  ...poolConfig,
  // Vercel serverless: each invocation is short-lived, keep pool small
  max:                     env.isProd ? 1 : 10,
  min:                     0,
  idleTimeoutMillis:       env.isProd ? 0 : 5_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle:         true,
});

pool.on('connect', () => {
  logger.info('🔌 New DB client connected');
});

pool.on('error', (err) => {
  // Log but don't exit — pool will recover on next query
  logger.error('Unexpected DB pool error: ' + err.message);
});

/**
 * Returns true for errors caused by the server dropping the TCP connection
 * (idle timeout, network blip, provider restart, etc.)
 */
const isConnectionError = (err) =>
  err && (
    err.message?.includes('Connection terminated unexpectedly') ||
    err.message?.includes('connection terminated') ||
    err.message?.includes('Client has encountered a connection error') ||
    err.code === 'ECONNRESET' ||
    err.code === 'EPIPE'
  );

/**
 * Run a single query — retries once on stale-connection errors.
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    logger.debug('Query OK (' + (Date.now() - start) + 'ms) rows=' + result.rowCount);
    return result;
  } catch (err) {
    if (isConnectionError(err)) {
      logger.warn('Connection lost — retrying query once…');
      try {
        const result = await pool.query(text, params);
        logger.debug('Query OK (retry, ' + (Date.now() - start) + 'ms) rows=' + result.rowCount);
        return result;
      } catch (retryErr) {
        logger.error('Query retry failed: ' + retryErr.message + ' | SQL: ' + text);
        throw retryErr;
      }
    }
    logger.error('Query error: ' + err.message + ' | SQL: ' + text);
    throw err;
  }
};

/**
 * Get a pooled client for transactions.
 * Always release in a finally block.
 */
export const getClient = async () => {
  const client    = await pool.connect();
  const origQuery = client.query.bind(client);

  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const result = await origQuery(text, params);
      logger.debug('[txn] OK (' + (Date.now() - start) + 'ms) rows=' + result.rowCount);
      return result;
    } catch (err) {
      logger.error('[txn] error: ' + err.message);
      throw err;
    }
  };

  return client;
};

/**
 * Connect with retry — call once at server startup.
 */
export const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT current_database()');
      logger.info('✅ DB connected — database: "' + rows[0].current_database + '"');
      client.release();
      return;
    } catch (err) {
      logger.warn('⚠️  DB attempt ' + attempt + '/' + retries + ' failed: ' + err.message);
      if (attempt === retries) {
        logger.error('❌ Could not connect after ' + retries + ' retries. Exiting.');
        process.exit(1);
      }
      logger.info('   Retrying in ' + (delayMs / 1000) + 's…');
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
};

export default pool;