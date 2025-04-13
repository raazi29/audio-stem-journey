import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import dns from 'dns';
import { promisify } from 'util';

// For node-fetch to work in newer Node versions
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

// Load environment variables
dotenv.config();

const lookup = promisify(dns.lookup);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and/or key not found in environment variables.');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file.');
    process.exit(1);
}

// Function to extract domain from URL
function extractDomain(url) {
    try {
        const domain = new URL(url).hostname;
        return domain;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
}

// Function to test DNS resolution
async function testDNS(domain) {
    try {
        console.log(`Testing DNS resolution for ${domain}...`);
        const result = await lookup(domain);
        console.log(`DNS resolution successful: ${domain} resolves to ${result.address}`);
        return true;
    } catch (error) {
        console.error(`DNS resolution failed for ${domain}: ${error.message}`);
        return false;
    }
}

// Function to test direct HTTP connection
async function testHTTP(url) {
    try {
        console.log(`Testing HTTP connection to ${url}...`);
        const response = await fetch(url);
        console.log(`HTTP connection successful: Status ${response.status}`);
        return true;
    } catch (error) {
        console.error(`HTTP connection failed to ${url}: ${error.message}`);
        return false;
    }
}

// Function to test Supabase connection
async function testSupabaseConnection() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Supabase connection error:', error.message);
            return false;
        }

        console.log('Supabase connection successful!');
        return true;
    } catch (error) {
        console.error('Supabase connection error:', error.message);
        return false;
    }
}

// Function to test creating a user
async function testCreateUser() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';

    try {
        console.log(`Testing user creation with email: ${testEmail}`);
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.error('User creation error:', error.message);
            return false;
        }

        console.log('Test user created successfully!');
        return true;
    } catch (error) {
        console.error('User creation error:', error.message);
        return false;
    }
}

// Main function
async function main() {
    console.log('\n=== Supabase Connection Test ===\n');
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Supabase Key: ${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)}\n`);

    // Test DNS resolution
    const domain = extractDomain(supabaseUrl);
    if (domain) {
        const dnsSuccess = await testDNS(domain);
        if (!dnsSuccess) {
            console.log('\nTroubleshooting DNS issues:');
            console.log('1. Check your internet connection');
            console.log('2. Make sure your DNS settings are correct');
            console.log('3. Try using a different DNS server (like 8.8.8.8 or 1.1.1.1)');
        }
    }

    // Test HTTP connection
    const httpSuccess = await testHTTP(supabaseUrl);
    if (!httpSuccess) {
        console.log('\nTroubleshooting HTTP issues:');
        console.log('1. Check if your network blocks access to Supabase');
        console.log('2. Check if you have a firewall or proxy blocking the connection');
        console.log('3. Try from a different network if possible');
    }

    // Test Supabase connection
    const supabaseSuccess = await testSupabaseConnection();
    if (!supabaseSuccess) {
        console.log('\nTroubleshooting Supabase connection issues:');
        console.log('1. Verify your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct');
        console.log('2. Check if your Supabase project is active (not paused)');
        console.log('3. Ensure your project has the Auth service enabled');
    }

    // Test user creation only if previous tests succeeded
    if (httpSuccess && supabaseSuccess) {
        await testCreateUser();
    }

    console.log('\n=== Connection Test Summary ===');
    console.log(`DNS Resolution: ${domain ? (await testDNS(domain) ? '✅ Success' : '❌ Failed') : '⚠️ Skipped'}`);
    console.log(`HTTP Connection: ${httpSuccess ? '✅ Success' : '❌ Failed'}`);
    console.log(`Supabase Connection: ${supabaseSuccess ? '✅ Success' : '❌ Failed'}`);

    if (!httpSuccess || !supabaseSuccess) {
        console.log('\n=== Recommendations ===');
        console.log('1. Check your network connection');
        console.log('2. Verify your Supabase credentials in the .env file');
        console.log('3. Make sure your Supabase project is active');
        console.log('4. Check CORS settings in your Supabase dashboard');
        console.log('5. Try a different network or disable any VPN');
    } else {
        console.log('\nAll tests passed successfully! Your Supabase connection is working.');
    }
}

main();