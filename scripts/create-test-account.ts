/**
 * Script to create a test account with Enterprise plan
 * 
 * Usage:
 *   1. First, have the user sign up at your site (or create credentials below)
 *   2. Run: npx tsx scripts/create-test-account.ts <email>
 * 
 * Or to create a fresh account:
 *   npx tsx scripts/create-test-account.ts --create <email> <password>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.error('   Make sure these are set in your .env or .env.local file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findUserByEmail(email: string) {
    // Search in Better Auth's user table
    const { data, error } = await supabase
        .from('user')
        .select('id, email, name')
        .eq('email', email)
        .single();

    if (error) {
        console.error('Error finding user:', error.message);
        return null;
    }
    return data;
}

async function upgradeToEnterprise(userId: string, email: string) {
    // Calculate period end (1 year from now for testing)
    const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const { error } = await supabase
        .from('subscriptions')
        .upsert({
            user_id: userId,
            plan: 'enterprise',
            current_period_end: periodEnd.toISOString(),
            // Mock IDs for testing
            polar_customer_id: `test_customer_${Date.now()}`,
            polar_subscription_id: `test_sub_${Date.now()}`,
        }, { onConflict: 'user_id' });

    if (error) {
        console.error('❌ Error upgrading user:', error.message);
        return false;
    }

    console.log(`\n✅ SUCCESS! User upgraded to Enterprise plan`);
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Plan: Enterprise`);
    console.log(`   Valid until: ${periodEnd.toLocaleDateString()}`);
    return true;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           LeadScout Test Account Creator                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Usage:                                                       ║
║    npx tsx scripts/create-test-account.ts <email>             ║
║                                                               ║
║  Example:                                                     ║
║    npx tsx scripts/create-test-account.ts rishi@polar.sh      ║
║                                                               ║
║  This will upgrade an existing user to Enterprise plan.       ║
║  The user must have already signed up on the website.         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
        `);
        process.exit(0);
    }

    const email = args[0];
    console.log(`\n🔍 Looking for user with email: ${email}`);

    const user = await findUserByEmail(email);

    if (!user) {
        console.log(`\n⚠️  User not found with email: ${email}`);
        console.log(`   Please ask the user to sign up first at your website.`);
        console.log(`   Then run this script again.`);
        process.exit(1);
    }

    console.log(`✓ Found user: ${user.name || user.email} (${user.id})`);

    await upgradeToEnterprise(user.id, email);
}

main().catch(console.error);
