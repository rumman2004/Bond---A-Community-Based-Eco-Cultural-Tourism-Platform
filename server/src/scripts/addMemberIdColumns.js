// ============================================================
// scripts/addMemberIdColumns.js
// One-off migration: add per-member ID detail columns to
// community_members (ID type/number + image-or-link proof).
//
// Usage:  node src/scripts/addMemberIdColumns.js
// ============================================================

import pool, { query } from '../config/db.js';

const SQL = `
  ALTER TABLE community_members
    ADD COLUMN IF NOT EXISTS id_type             TEXT,
    ADD COLUMN IF NOT EXISTS id_number           TEXT,
    ADD COLUMN IF NOT EXISTS id_image_url         TEXT,
    ADD COLUMN IF NOT EXISTS id_image_public_id   TEXT,
    ADD COLUMN IF NOT EXISTS id_link             TEXT;
`;

try {
  await query(SQL);
  const { rows } = await query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'community_members'
       AND column_name IN ('id_type','id_number','id_image_url','id_image_public_id','id_link')
     ORDER BY column_name`
  );
  console.log('✅ Migration applied. Member ID columns present:', rows.map((r) => r.column_name).join(', '));
} catch (err) {
  console.error('❌ Migration failed: ' + err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
