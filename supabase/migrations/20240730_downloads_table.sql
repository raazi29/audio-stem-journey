-- Check if downloads table exists; if not, create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'downloads') THEN
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

        -- Add comment to table
        COMMENT ON TABLE public.downloads IS 'Tracks app downloads';
    ELSE
        -- Ensure all required columns exist
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.downloads'::regclass AND attname = 'is_synced') THEN
            ALTER TABLE public.downloads ADD COLUMN is_synced BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.downloads'::regclass AND attname = 'metadata') THEN
            ALTER TABLE public.downloads ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
        END IF;
    END IF;
END
$$;

-- Create or update Row Level Security (RLS) policies for downloads
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read their own downloads" ON public.downloads;
    DROP POLICY IF EXISTS "Anonymous users can insert downloads" ON public.downloads;
    
    -- Enable RLS on downloads
    ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

    -- Create new policies
    CREATE POLICY "Users can read their own downloads" 
    ON public.downloads FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "Anonymous users can insert downloads" 
    ON public.downloads FOR INSERT 
    WITH CHECK (true);
END
$$; 