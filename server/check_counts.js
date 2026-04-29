import { query } from './src/config/db.js';

async function check() {
  const p = await query("SELECT COUNT(*) FROM communities WHERE status = 'pending'");
  const r = await query("SELECT COUNT(*) FROM reports WHERE status = 'open'");
  const s = await query("SELECT COUNT(*) FROM users WHERE status IN ('suspended','banned')");
  const a = await query("SELECT COUNT(*) FROM communities");
  
  console.log('Pending Communities:', p.rows[0].count);
  console.log('Open Reports:', r.rows[0].count);
  console.log('Suspended Users:', s.rows[0].count);
  console.log('Total Communities:', a.rows[0].count);
  
  process.exit(0);
}

check();
