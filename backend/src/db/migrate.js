const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate({ drop = false } = {}) {
  if (drop) {
    await pool.query(`
      DROP TABLE IF EXISTS ticket_events, escalations, tickets, technicians, users CASCADE;
      DROP SEQUENCE IF EXISTS ticket_number_seq;
    `);
    console.log('Dropped existing tables');
  }
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log('Schema is up to date');
}

module.exports = migrate;

if (require.main === module) {
  migrate({ drop: process.argv.includes('--drop') })
    .catch((e) => { console.error(e); process.exitCode = 1; })
    .finally(() => pool.end());
}
