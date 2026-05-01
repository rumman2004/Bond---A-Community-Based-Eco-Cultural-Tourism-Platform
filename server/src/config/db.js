import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const useSSL = env.DB_SSL === true || env.DB_SSL === 'true' || env.isProd;

// Always prefer individual DB_* vars over DATABASE_URL
const poolConfig = env.DB_HOST
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
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max:                     10,
  min:                     0,
  idleTimeoutMillis:       10_000,   // Release idle clients faster (Supabase kills them at ~30s)
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle:         false,
  // TCP keepalive — prevents Supabase/cloud providers from terminating idle connections
  keepAlive:               true,
  keepAliveInitialDelayMillis: 10_000,
});

pool.on('connect', () => {
  logger.info('🔌 New DB client connected');
});

pool.on('error', (err) => {
  // Log but don't exit — pool will recover on next query
  logger.error('Unexpected DB pool error: ' + err.message);
});

/**
 * Run a single query
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    logger.debug('Query OK (' + (Date.now() - start) + 'ms) rows=' + result.rowCount);
    return result;
  } catch (err) {
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