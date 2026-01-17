const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration (Reusing setup_supabase.js credentials)
const DB_PASSWORD = 'kb6OlDAde8Fy2sig';
const CONNECTION_STRING = `postgres://postgres.usybnhokbkycfxuabusm:${DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`;

async function main() {
    console.log("Connecting to Supabase...");
    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        const sqlPath = path.join(__dirname, 'migrate_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running migration...");
        await client.query(sql);

        console.log("✅ Schema migration complete: 'blunder_positions' & 'analysis_jobs' created.");
    } catch (err) {
        console.error("❌ Migration Error:", err.message);
    } finally {
        await client.end();
    }
}

main();
