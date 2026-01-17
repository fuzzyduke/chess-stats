
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for debugging (same as in app)
const SUPABASE_URL = 'https://cbmtbopkspnzhzqkohbn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNibXRib3Brc3Buemh6cWtvaGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0OTY3NDEsImV4cCI6MjA1MjA3MjtoNDF9.L83-c21X-xW_6qUEp3C7N-3iFm5qJb3g2cQ8w6ZqV5o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
    console.log("Fetching blunders for eg0maniac...");
    const { data, error } = await supabase
        .from('blunder_positions')
        .select('game_url')
        .ilike('username', 'eg0maniac');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    if (data.length > 0) {
        console.log("Sample URLs:");
        // Show unique URLs
        const unique = [...new Set(data.map(d => d.game_url))];
        unique.slice(0, 10).forEach(u => console.log(` - ${u}`));
    }
}

checkData();
