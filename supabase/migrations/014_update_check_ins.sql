-- Add status column to check_ins table
ALTER TABLE public.check_ins ADD COLUMN status TEXT NOT NULL DEFAULT 'victory' CHECK (status IN ('victory', 'defeat'));

-- Add is_edited column to track manual edits
ALTER TABLE public.check_ins ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to allow editing own check-ins
CREATE POLICY "Users can update their own check-ins" ON public.check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index for faster streak calculations
CREATE INDEX idx_check_ins_user_date ON public.check_ins(user_id, date); 