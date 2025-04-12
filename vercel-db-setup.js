// Database setup script for Vercel deployment
// This can be run manually before deployment or as a build step

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: Missing Supabase credentials in environment variables');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
    try {
        console.log('Setting up database for Vercel deployment...');

        // Read SQL migration file
        const sqlPath = path.join(__dirname, 'migrations', 'users_and_downloads.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split SQL into statements to execute individually
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Execute each statement
        for (const statement of statements) {
            console.log(`Executing SQL statement: ${statement.substring(0, 50)}...`);

            const { error } = await supabase.rpc('exec_sql', {
                sql_query: statement + ';'
            });

            if (error) {
                console.warn(`Warning: Error executing statement: ${error.message}`);
                // Continue with other statements even if one fails
            }
        }

        console.log('Database setup completed successfully');

        // Verify tables exist
        const { data: tableData, error: tableError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (tableError) {
            console.warn('Warning: Could not verify users table exists');
        } else {
            console.log('Users table verified');
        }

        const { data: downloadsData, error: downloadsError } = await supabase
            .from('downloads')
            .select('id')
            .limit(1);

        if (downloadsError) {
            console.warn('Warning: Could not verify downloads table exists');
        } else {
            console.log('Downloads table verified');
        }

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();