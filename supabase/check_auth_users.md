# How to Check User Authentication in Supabase

Follow these steps to check if user accounts are being created and stored correctly:

## 1. Run the Authentication Fix SQL

First, make sure you've run the `auth_quick_fix.sql` script in the Supabase SQL Editor to set up the database tables and triggers.

## 2. Check Auth Users

1. Log in to your Supabase dashboard at https://app.supabase.com
2. Select your project
3. Navigate to "Authentication" → "Users"
4. You should see a list of all registered users

## 3. Check Profiles Table

1. From your Supabase dashboard, go to "Table Editor"
2. Select the "profiles" table
3. Check if there are records corresponding to your users

## 4. Run SQL Queries

You can run these SQL queries in the SQL Editor to check both tables:

```sql
-- Check auth.users table
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

-- Check public.profiles table
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
```

## 5. Test User Registration

1. Open your app in a new private/incognito browser window
2. Sign up with a new email address
3. Check the Supabase tables again to confirm the user was created
4. Look for both an entry in `auth.users` and in `public.profiles`

## 6. Debugging Tips

If users aren't showing up:

1. Check browser console logs during signup/login
2. Ensure the SQL fix script ran successfully
3. Verify your Supabase connection details in `.env` are correct
4. Check for any errors in the Network tab of browser dev tools when signing up

## 7. Email Confirmation

By default, Supabase requires email confirmation. You can:

1. Go to Authentication → Settings → Email Auth
2. Disable "Enable email confirmations" if you want to skip this step
3. Or use the Supabase dashboard to manually confirm email addresses 