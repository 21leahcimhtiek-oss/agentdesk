const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log('Running migration: ' + file);
    const { error } = await supabase.from('_migrations').select().limit(1);
    if (error && error.code === '42P01') {
      await supabase.rpc('exec_sql', { sql: 'CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, run_at TIMESTAMPTZ DEFAULT NOW())' });
    }
    const { data: already } = await supabase.from('_migrations').select('name').eq('name', file).single();
    if (already) { console.log('Skipping (already run): ' + file); continue; }
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      const { error: err } = await supabase.rpc('exec_sql', { sql: stmt });
      if (err) { console.error('Migration failed: ' + file, err); process.exit(1); }
    }
    await supabase.from('_migrations').insert({ name: file });
    console.log('Done: ' + file);
  }
}

migrate().catch(console.error);