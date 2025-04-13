-- Make sure the download tracking table exists with proper structure
-- This migration ensures the table allows for both authenticated and anonymous downloads

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First check if downloads table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downloads') THEN
        -- Create the downloads table
        CREATE TABLE public.downloads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            app_version TEXT,
            platform TEXT,
            device_info JSONB DEFAULT '{}'::JSONB,
            ip_address TEXT,
            is_synced BOOLEAN DEFAULT TRUE,
            metadata JSONB DEFAULT '{}'::JSONB
        );
        
        -- Add comment
        COMMENT ON TABLE public.downloads IS 'Tracks app downloads with user info if available';
    ELSE
        -- Table exists, check for required columns
        -- Add new columns if they don't exist to maintain backward compatibility
        
        -- Add platform column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                     WHERE attrelid = 'public.downloads'::regclass 
                     AND attname = 'platform' 
                     AND NOT attisdropped) THEN
            ALTER TABLE public.downloads ADD COLUMN platform TEXT;
        END IF;
        
        -- Add device_info column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                     WHERE attrelid = 'public.downloads'::regclass 
                     AND attname = 'device_info' 
                     AND NOT attisdropped) THEN
            ALTER TABLE public.downloads ADD COLUMN device_info JSONB DEFAULT '{}'::JSONB;
        END IF;
        
        -- Add is_synced column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                     WHERE attrelid = 'public.downloads'::regclass 
                     AND attname = 'is_synced' 
                     AND NOT attisdropped) THEN
            ALTER TABLE public.downloads ADD COLUMN is_synced BOOLEAN DEFAULT TRUE;
        END IF;
        
        -- Add metadata column if not exists
        IF NOT EXISTS (SELECT FROM pg_attribute 
                     WHERE attrelid = 'public.downloads'::regclass 
                     AND attname = 'metadata' 
                     AND NOT attisdropped) THEN
            ALTER TABLE public.downloads ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
        END IF;
    END IF;
END
$$;

-- Set up Row Level Security (RLS)
-- Allow anyone to insert, but only allow users to view their own downloads
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert downloads" ON public.downloads;
DROP POLICY IF EXISTS "Users can view own downloads" ON public.downloads;
DROP POLICY IF EXISTS "Admins can view all downloads" ON public.downloads;

-- Create new policies
CREATE POLICY "Anyone can insert downloads" 
ON public.downloads FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own downloads" 
ON public.downloads FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all downloads" 
ON public.downloads FOR SELECT 
TO authenticated
USING (
   EXISTS (
     SELECT 1 FROM auth.users
     WHERE auth.users.id = auth.uid()
     AND auth.users.email LIKE '%@admin.com'
   )
); 