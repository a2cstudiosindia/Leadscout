import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

dotenv.config({ path: join(root, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
}

const sql = readFileSync(
    join(root, 'supabase/migrations/005_central_hub_phase1.sql'),
    'utf8'
);

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('🚀 Applying Migration 005: Central Hub Phase 1...');
    await client.query(sql);
    console.log('✅ Migration 005 applied successfully!');

    const { rows } = await client.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);
    console.log('\n📋 Current database tables:');
    rows.forEach((r) => console.log(`   - ${r.table_name}`));
} catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
} finally {
    await client.end();
}
