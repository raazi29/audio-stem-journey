// Setup Database Script
// Run this with Node.js to set up your Supabase database tables and functions
// Usage: node setup-database.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: Missing Supabase credentials. Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read and execute migration files
async function runMigrations() {
    console.log('Setting up database...');

    try {
        // Path to migrations folder
        const migrationsDir = path.join(__dirname, 'migrations');

        // Read all SQL files
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Execute in alphabetical order

        if (files.length === 0) {
            console.log('No migration files found.');
            return;
        }

        console.log(`Found ${files.length} migration files to execute:`);
        console.log(files.join('\n'));
        console.log('');

        // Execute each file
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`Executing ${file}...`);

            // Execute the SQL against Supabase
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

            if (error) {
                console.error(`Error executing ${file}:`, error);

                // Ask if user wants to continue
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise((resolve) => {
                    readline.question('Continue with remaining migrations? (y/n): ', resolve);
                });

                readline.close();

                if (answer.toLowerCase() !== 'y') {
                    console.log('Migration aborted.');
                    process.exit(1);
                }
            } else {
                console.log(`✓ ${file} executed successfully`);
            }
        }

        console.log('\nAll migrations executed successfully!');
        console.log('Your database is now set up for tracking APK downloads and user authentication.');

    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
}

// Run the migrations
runMigrations();