-- Create table for incoming n8n messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'n8n',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading all messages (since this is for a public chat)
CREATE POLICY "Anyone can read chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

-- Create policy to allow inserting messages (for the edge function)
CREATE POLICY "Allow inserting chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Enable real-time
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;