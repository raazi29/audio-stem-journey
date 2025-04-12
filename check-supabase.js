import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

// Check both Vite and React prefixes since the .env might use either
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Available' : 'Not available');
console.log('Supabase Key:', supabaseKey ? 'Available' : 'Not available');

if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    async function checkConnection() {
        try {
            const { data, error } = await supabase.from('app_versions').select('*').limit(1);

            if (error) {
                console.error('Error connecting to Supabase:', error.message);
                return false;
            }

            console.log('Successfully connected to Supabase!');
            console.log('Retrieved data:', data);
            return true;
        } catch (err) {
            console.error('Unexpected error:', err.message);
            return false;
        }
    }

    checkConnection();
} else {
    console.error('Missing Supabase credentials. Cannot connect.');
}