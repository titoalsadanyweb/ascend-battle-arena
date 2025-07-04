-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own and ally posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own bets" ON public.bets;

-- Create new policies for viewing
CREATE POLICY "Users can view all posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can view all bets" ON public.bets
  FOR SELECT USING (true);

-- Add type column to posts for filtering
ALTER TABLE public.posts ADD COLUMN type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'milestone', 'achievement', 'support')); 