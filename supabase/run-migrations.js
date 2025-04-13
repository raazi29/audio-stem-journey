import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current file and directory paths
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and/or key not found in environment variables.');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file.');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Path to migrations folder
const migrationsFolder = path.join(__dirname, 'migrations');

// Function to test database connection
async function testConnection() {
    try {
        // Try a more basic query to check connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error connecting to Supabase:', error.message);
            return false;
        }

        console.log('Successfully connected to Supabase.');
        return true;
    } catch (error) {
        console.error('Error testing connection:', error.message);
        return false;
    }
}

// Main function
async function main() {
    try {
        console.log('Testing connection to Supabase...');
        const connected = await testConnection();

        if (!connected) {
            console.error('Could not connect to Supabase. Check your credentials and try again.');
            process.exit(1);
        }

        // Check if migrations folder exists
        if (!fs.existsSync(migrationsFolder)) {
            console.error(`Migrations folder not found: ${migrationsFolder}`);
            process.exit(1);
        }

        // Get all SQL files in the migrations folder
        const migrationFiles = fs.readdirSync(migrationsFolder)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sort to ensure migrations run in order

        if (migrationFiles.length === 0) {
            console.log('No migration files found.');
            process.exit(0);
        }

        console.log(`Found ${migrationFiles.length} migration file(s).`);

        // Display migration files
        migrationFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });

        console.log('\nIMPORTANT: To run these migrations, please:');
        console.log('1. Log in to your Supabase dashboard at https://app.supabase.com');
        console.log(`2. Select your project with URL: ${supabaseUrl}`);
        console.log('3. Go to the SQL Editor');
        console.log('4. Copy and paste each migration file and execute them in order');

        const migrationPath = path.join(__dirname, 'migrations');
        console.log(`\nMigration files are located at: ${migrationPath}`);

        // Output the contents of each migration file
        migrationFiles.forEach((file, index) => {
            console.log(`\n----- MIGRATION ${index + 1}: ${file} -----`);
            const filePath = path.join(migrationsFolder, file);
            const content = fs.readFileSync(filePath, 'utf8');
            console.log(content);
            console.log(`----- END OF ${file} -----\n`);
        });

        console.log('After running these migrations, your Supabase database will be properly configured for authentication.');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run the main function
main();