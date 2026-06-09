/**
 * Apply full LeadScout schema to a Supabase project.
 * Usage: node scripts/bootstrap-supabase.mjs
 * Requires DATABASE_URL in .env (direct Postgres connection string)
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

dotenv.config({ path: join(root, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || DATABASE_URL.includes('placeholder')) {
    console.error('❌ DATABASE_URL is not set in .env');
    console.error('   Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)');
    process.exit(1);
}

const sql = readFileSync(
    join(root, 'supabase/migrations/000_bootstrap_lead_scout.sql'),
    'utf8'
);

const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('📦 Applying LeadScout bootstrap schema...');
    await client.query(sql);
    console.log('✅ Schema applied successfully!');

    const { rows } = await client.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    `);
    console.log('\n📋 Tables created:');
    rows.forEach((r) => console.log(`   - ${r.table_name}`));
} catch (err) {
    console.error('❌ Bootstrap failed:', err.message);
    process.exit(1);
} finally {
    await client.end();
}
