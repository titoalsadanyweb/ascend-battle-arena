-- Create function to update token balance
CREATE OR REPLACE FUNCTION public.update_token_balance(p_user_id UUID, p_amount INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET token_balance = token_balance + p_amount
  WHERE id = p_user_id;
END;
$$; 