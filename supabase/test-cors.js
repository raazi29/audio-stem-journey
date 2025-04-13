require('dotenv').config();
const fetch = require('node-fetch');

// Get Supabase URL and key from environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Missing Supabase URL or key in environment variables');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
    process.exit(1);
}

/**
 * Tests browser CORS configuration for Supabase
 */
async function testCORS() {
    console.log('=== CORS Test for Supabase ===');
    console.log(`Testing against URL: ${SUPABASE_URL}`);

    try {
        // Test 1: Simple preflight check
        const preflightResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'authorization,content-type,apikey'
            }
        });

        console.log('\n=== Preflight Response ===');
        console.log('Status:', preflightResponse.status, preflightResponse.statusText);
        console.log('Headers:');

        for (const [key, value] of preflightResponse.headers.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        // Check for critical CORS headers
        const allowOrigin = preflightResponse.headers.get('access-control-allow-origin');
        const allowMethods = preflightResponse.headers.get('access-control-allow-methods');
        const allowHeaders = preflightResponse.headers.get('access-control-allow-headers');

        console.log('\n=== CORS Analysis ===');
        if (allowOrigin) {
            console.log(`✅ Access-Control-Allow-Origin: ${allowOrigin}`);
            if (allowOrigin === '*' || allowOrigin.includes('localhost')) {
                console.log('   Origin is properly configured for local development');
            } else {
                console.log('⚠️ Warning: Your origin may not be in the allowed list');
            }
        } else {
            console.log('❌ Missing Access-Control-Allow-Origin header');
        }

        if (allowMethods) {
            console.log(`✅ Access-Control-Allow-Methods: ${allowMethods}`);
        } else {
            console.log('❌ Missing Access-Control-Allow-Methods header');
        }

        if (allowHeaders) {
            console.log(`✅ Access-Control-Allow-Headers: ${allowHeaders}`);
            const requiredHeaders = ['authorization', 'content-type', 'apikey'];
            const missingHeaders = requiredHeaders.filter(h =>
                !allowHeaders.toLowerCase().includes(h.toLowerCase()));

            if (missingHeaders.length > 0) {
                console.log(`⚠️ Warning: Some required headers may be missing: ${missingHeaders.join(', ')}`);
            }
        } else {
            console.log('❌ Missing Access-Control-Allow-Headers header');
        }

        // Test 2: Actual API request
        console.log('\n=== Testing Actual API Request ===');
        const apiResponse = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            }
        });

        console.log('API Response Status:', apiResponse.status, apiResponse.statusText);

        if (apiResponse.ok) {
            console.log('✅ API Request Successful');
            const data = await apiResponse.json();
            console.log('Response data available:', Object.keys(data).join(', '));
        } else {
            console.log('❌ API Request Failed');
            try {
                const errorData = await apiResponse.text();
                console.log('Error response:', errorData);
            } catch (e) {
                console.log('Could not read error response');
            }
        }

        // Final analysis
        console.log('\n=== Final Diagnosis ===');
        if (allowOrigin && allowMethods && allowHeaders && apiResponse.ok) {
            console.log('✅ CORS appears to be properly configured for Supabase');
            console.log('If you are still experiencing "Failed to fetch" errors in the browser, it may be due to:');
            console.log('1. Network issues (intermittent connection)');
            console.log('2. Ad blockers or privacy extensions blocking the requests');
            console.log('3. SSL certificate issues');
            console.log('4. Browser security policies');
        } else {
            console.log('⚠️ Potential CORS issues detected');
            console.log('Recommended actions:');

            if (!allowOrigin) {
                console.log('- Check if your project URL is allowed in Supabase Auth settings');
            }

            if (!apiResponse.ok) {
                console.log('- Verify your Supabase URL and API key are correct');
                console.log('- Check if your Supabase project is active and not in maintenance mode');
            }

            console.log('- Review Supabase Authentication settings in the dashboard');
            console.log('- Add your development URL to the allowed list (e.g., http://localhost:5173)');
        }
    } catch (error) {
        console.error('Error during CORS test:', error);
        console.log('\n⚠️ The test could not complete due to an error');
        console.log('This might indicate a network issue or that the Supabase URL is incorrect');
    }
}

// Run the test
testCORS();