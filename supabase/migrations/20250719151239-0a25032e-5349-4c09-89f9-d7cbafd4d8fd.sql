-- Fix the check_ins table status constraint to include 'victory' and 'defeat'
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_status_check;
ALTER TABLE check_ins ADD CONSTRAINT check_ins_status_check CHECK (status IN ('victory', 'defeat', 'success', 'missed'));

-- Update RLS policies for check_ins to be more permissive for editing
DROP POLICY IF EXISTS "Users can update their own check-ins" ON check_ins;
CREATE POLICY "Users can update their own check-ins" ON check_ins
  FOR UPDATE USING (auth.uid() = user_id);

-- Update RLS policies for token_transactions  
DROP POLICY IF EXISTS "Users can insert their own token transactions" ON token_transactions;
CREATE POLICY "Users can insert their own token transactions" ON token_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure the handle_checkin_with_rls function exists and is correct
CREATE OR REPLACE FUNCTION public.handle_checkin_with_rls(
  p_user_id uuid, 
  p_date_local date, 
  p_status text, 
  p_tokens_awarded bigint, 
  p_is_edit boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    checkin_id uuid;
    existing_checkin_id uuid;
    current_profile profiles%ROWTYPE;
    new_streak integer;
    new_best_streak integer;
    token_balance_after bigint;
BEGIN
    -- Get current profile data
    SELECT * INTO current_profile FROM profiles WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Profile not found');
    END IF;

    -- Check for existing check-in
    SELECT id INTO existing_checkin_id 
    FROM check_ins 
    WHERE user_id = p_user_id AND date_local = p_date_local;

    -- Calculate new streak based on status
    IF p_status = 'victory' THEN
        -- If editing existing or new check-in
        IF existing_checkin_id IS NOT NULL AND p_is_edit THEN
            -- Keep current streak for edits to victory
            new_streak := current_profile.current_streak;
        ELSE
            -- For new victory check-ins, increment streak
            new_streak := current_profile.current_streak + 1;
        END IF;
    ELSE
        -- For defeat, reset streak to 0
        new_streak := 0;
    END IF;

    -- Calculate best streak
    new_best_streak := GREATEST(current_profile.best_streak, new_streak);

    -- Insert or update check-in
    IF existing_checkin_id IS NOT NULL AND p_is_edit THEN
        -- Update existing check-in
        UPDATE check_ins 
        SET status = p_status, 
            tokens_awarded = p_tokens_awarded,
            is_edited = true
        WHERE id = existing_checkin_id
        RETURNING id INTO checkin_id;
    ELSE
        -- Insert new check-in
        INSERT INTO check_ins (user_id, date_local, status, tokens_awarded, is_edited)
        VALUES (p_user_id, p_date_local, p_status, p_tokens_awarded, COALESCE(p_is_edit, false))
        RETURNING id INTO checkin_id;
    END IF;

    -- Update profile
    token_balance_after := current_profile.token_balance + p_tokens_awarded;
    
    UPDATE profiles 
    SET current_streak = new_streak,
        best_streak = new_best_streak,
        token_balance = token_balance_after,
        last_check_in_date = p_date_local,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log token transaction if tokens were awarded
    IF p_tokens_awarded > 0 THEN
        INSERT INTO token_transactions (user_id, type, amount, related_checkin_id)
        VALUES (p_user_id, 'checkin_reward', p_tokens_awarded, checkin_id);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'current_streak', new_streak,
        'best_streak', new_best_streak,
        'token_balance', token_balance_after,
        'tokens_awarded', p_tokens_awarded,
        'status', p_status,
        'has_checked_in_today', true
    );
END;
$function$;