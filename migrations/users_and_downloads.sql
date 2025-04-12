-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url VARCHAR(255),
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_versions table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_name VARCHAR(50) NOT NULL,
  version_code INTEGER NOT NULL,
  release_notes TEXT,
  apk_url VARCHAR(255),
  is_latest BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create downloads table to track APK downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_version_id UUID REFERENCES app_versions(id),
  user_id UUID REFERENCES users(id) NULL,
  email VARCHAR(255) NULL,
  ip_address VARCHAR(50) DEFAULT 'anonymous',
  user_agent TEXT,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on downloads for faster querying
CREATE INDEX IF NOT EXISTS downloads_app_version_id_idx ON downloads(app_version_id);
CREATE INDEX IF NOT EXISTS downloads_user_id_idx ON downloads(user_id);
CREATE INDEX IF NOT EXISTS downloads_email_idx ON downloads(email);

-- Create function to get download count
CREATE OR REPLACE FUNCTION get_download_count(version_id UUID DEFAULT NULL)
RETURNS TABLE (version_id UUID, version_name VARCHAR, count BIGINT) AS $$
BEGIN
  IF version_id IS NULL THEN
    RETURN QUERY
    SELECT 
      av.id, 
      av.version_name, 
      COUNT(d.id)::BIGINT
    FROM 
      app_versions av
    LEFT JOIN 
      downloads d ON av.id = d.app_version_id
    GROUP BY 
      av.id, av.version_name
    ORDER BY 
      av.version_code DESC;
  ELSE
    RETURN QUERY
    SELECT 
      av.id, 
      av.version_name, 
      COUNT(d.id)::BIGINT
    FROM 
      app_versions av
    LEFT JOIN 
      downloads d ON av.id = d.app_version_id
    WHERE 
      av.id = version_id
    GROUP BY 
      av.id, av.version_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get total downloads
CREATE OR REPLACE FUNCTION get_total_downloads()
RETURNS BIGINT AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total FROM downloads;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Create realtime publication for downloads
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE downloads, app_versions, users; 