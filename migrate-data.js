const { Client } = require('pg');

const OLD_DB = "postgresql://role_f57964b69:AjilAQCgAmFVSlRi9wqGaKsgBPEK5ZZV@db-f57964b69.db005.hosteddb.reai.io:5432/f57964b69?connect_timeout=15";
const NEW_DB = "postgresql://postgres.sijcopqowfbvupemhboc:HonwhC8nERzb0S1g@aws-0-us-east-1.pooler.supabase.com:5432/postgres";

async function main() {
  const src = new Client({ connectionString: OLD_DB });
  const dst = new Client({ connectionString: NEW_DB });
  await src.connect();
  await dst.connect();

  const tablesRes = await src.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '_prisma%'
  `);
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log('Tables found:', tables);

  await dst.query(`SET session_replication_role = 'replica';`);

  for (const table of tables) {
    const dataRes = await src.query(`SELECT * FROM "${table}"`);
    const rows = dataRes.rows;
    if (rows.length === 0) {
      console.log(`${table}: 0 rows, skipping`);
      continue;
    }
    const columns = Object.keys(rows[0]);
    const colList = columns.map(c => `"${c}"`).join(', ');
    let inserted = 0;
    for (const row of rows) {
      const values = columns.map(c => row[c]);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      try {
        await dst.query(
          `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        inserted++;
      } catch (e) {
        console.error(`Error inserting into ${table}:`, e.message);
      }
    }
    console.log(`${table}: ${inserted}/${rows.length} rows migrated`);
  }

  await dst.query(`SET session_replication_role = 'origin';`);

  await src.end();
  await dst.end();
  console.log('Migration complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
