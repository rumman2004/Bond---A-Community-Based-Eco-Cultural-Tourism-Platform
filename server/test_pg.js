import pg from 'pg';
import { env } from './src/config/env.js';

async function test() {
  const client = new pg.Client({
    connectionString: env.DATABASE_URL
  });
  await client.connect();
  try {
    const res = await client.query(`SELECT COALESCE($1::numeric, 1.0)`, [""]);
    console.log(res.rows);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

test();
