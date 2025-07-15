-- Fix missing columns and update check_ins table structure
ALTER TABLE check_ins DROP COLUMN IF EXISTS date;
ALTER TABLE check_ins DROP COLUMN IF EXISTS is_edited;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS date_local DATE DEFAULT CURRENT_DATE;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

-- Create function to get user token balance
CREATE OR REPLACE FUNCTION get_user_token_balance(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    balance BIGINT;
BEGIN
    SELECT token_balance INTO balance FROM profiles WHERE id = p_user_id;
    RETURN COALESCE(balance, 0);
END;
$$;

-- Create function to update token balance safely
CREATE OR REPLACE FUNCTION update_token_balance(p_user_id UUID, p_amount BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET token_balance = token_balance + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
END;
$$;