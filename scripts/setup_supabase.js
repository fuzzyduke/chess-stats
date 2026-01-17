
const { Client } = require('pg');

// Configuration
const DB_PASSWORD = 'kb6OlDAde8Fy2sig'; // Provided by user in Step 2207
const CONNECTION_STRING = `postgres://postgres.usybnhokbkycfxuabusm:${DB_PASSWORD}@aws-1-ap-south-1.pooler.supabase.com:6543/postgres`;

const SQL_Schema = `
-- Create Table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    game_id text PRIMARY KEY,
    data jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Create Policy (Allow Public Access for Demo)
-- Dropping first to avoid errors on re-run
DROP POLICY IF EXISTS "Public Access" ON public.analysis_results;
CREATE POLICY "Public Access" ON public.analysis_results FOR ALL USING (true);
`;

async function main() {
    console.log(`Connecting to Supabase...`);

    const client = new Client({
        connectionString: CONNECTION_STRING,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log("Connected! Running SQL schema...");

        await client.query(SQL_Schema);

        console.log("✅ Table 'analysis_results' created successfully.");
        console.log("✅ RLS Enabled and Public Policy applied.");
    } catch (err) {
        console.error("❌ Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
}

main();
