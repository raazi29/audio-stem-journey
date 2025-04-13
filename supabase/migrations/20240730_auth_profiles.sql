-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if profiles table exists; if not, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE,
            preferences JSONB DEFAULT '{}'::JSONB
        );

        -- Add comment to table
        COMMENT ON TABLE public.profiles IS 'User profile information';
    ELSE
        -- Ensure all required columns exist
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'full_name') THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.profiles'::regclass AND attname = 'preferences') THEN
            ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}'::JSONB;
        END IF;
    END IF;
END
$$;

-- Check if user_activities table exists; if not, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activities') THEN
        CREATE TABLE public.user_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            activity_type TEXT NOT NULL,
            activity_details JSONB DEFAULT '{}'::JSONB,
            metadata JSONB DEFAULT '{}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ip_address TEXT
        );

        -- Add comment to table
        COMMENT ON TABLE public.user_activities IS 'Tracks user actions within the app';
    ELSE
        -- Ensure all required columns exist
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.user_activities'::regclass AND attname = 'metadata') THEN
            ALTER TABLE public.user_activities ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
        END IF;
    END IF;
END
$$;

-- Create or update Row Level Security (RLS) policies for profiles
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    
    -- Enable RLS on profiles
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create new policies
    CREATE POLICY "Users can read their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);
END
$$;

-- Create or update RLS policies for user_activities
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read their own activities" ON public.user_activities;
    
    -- Enable RLS on user_activities
    ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

    -- Create new policies
    CREATE POLICY "Users can read their own activities" 
    ON public.user_activities FOR SELECT 
    USING (auth.uid() = user_id);
END
$$;

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at)
    VALUES (new.id, new.email, new.created_at)
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created' 
        AND tgrelid = 'auth.users'::regclass
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$; 