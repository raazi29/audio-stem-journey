-- Query to check if users exist in the auth schema
-- Run this in the Supabase SQL Editor to see if any users have been created

-- Check auth.users table (where Supabase stores user authentication data)
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    confirmed_at
FROM 
    auth.users
ORDER BY 
    created_at DESC;

-- Check public.profiles table (where we store additional user data)
SELECT 
    *
FROM 
    public.profiles
ORDER BY 
    created_at DESC;

-- Count of users in both tables
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM 
    auth.users
UNION ALL
SELECT 
    'public.profiles' as table_name,
    COUNT(*) as user_count
FROM 
    public.profiles; 