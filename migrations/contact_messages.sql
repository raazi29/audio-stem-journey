-- Create the contact_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.contact_messages IS 'Stores contact form messages from users';

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create an index on user_id for faster lookups of a user's messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON public.contact_messages(user_id);

-- Create an index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);

-- Create an index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at);

-- Create RLS policies
-- 1. Admin users can see all messages
CREATE POLICY "Admins can see all contact messages"
ON public.contact_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = auth.uid()
  )
);

-- 2. Admin users can update message status
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = auth.uid()
  )
);

-- 3. Users can submit new messages (anyone, even not authenticated)
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (true);

-- 4. Users can see their own messages if they are logged in
CREATE POLICY "Users can see their own contact messages"
ON public.contact_messages
FOR SELECT
USING (
  auth.uid() = user_id
); 