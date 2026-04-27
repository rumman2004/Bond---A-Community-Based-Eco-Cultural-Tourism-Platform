import { query, connectDB } from './src/config/db.js';

async function run() {
  await connectDB(1);
  const result = await query('SELECT * FROM users LIMIT 2');
  console.log('Users: ', result.rows);
  const count = await query('SELECT COUNT(*) FROM users');
  console.log('Count: ', count.rows[0]);
  process.exit(0);
}

run();
